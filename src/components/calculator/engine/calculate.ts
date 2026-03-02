import type {
  CalculatorInputs,
  CalculatorOutputs,
  CohortDefinition,
  CohortOutput,
  CohortQuarterlyData,
  QuarterlyOutput,
  SummaryMetrics,
  AccountState,
  ConversionRates,
  VelocityDistribution,
  BudgetConfig,
  AdvancedConfig,
  ASPScalingResult,
  UnitEconomicsMetrics,
  TrapWarning,
  UserOverrides,
} from './types';
import { CAMPAIGN_PROFILES, getQuarterLabel, UNIT_ECONOMICS_CONSTANTS, TRAP_THRESHOLDS } from './defaults';
import { interpolateASPScaling } from './asp-scaling';

/**
 * Pure calculation engine: CalculatorInputs → CalculatorOutputs
 * No side effects, no DOM, no React.
 */
export function calculate(inputs: CalculatorInputs): CalculatorOutputs {
  const { cohorts, budget, advanced, simulationQuarters, startYear, startQ, goals, userOverrides } = inputs;

  // ASP-linked scaling (PRD 4.11)
  const aspScaling = interpolateASPScaling(goals.averageSellingPrice);
  const effectiveSalesVelocity = userOverrides?.salesVelocityDays
    ? advanced.salesVelocityDays
    : aspScaling.salesVelocityDays;

  const cohortOutputs: CohortOutput[] = cohorts.map(cohort =>
    processCohort(cohort, budget, advanced, goals.averageSellingPrice, simulationQuarters, startYear, startQ, aspScaling, effectiveSalesVelocity)
  );

  const quarterly = aggregateQuarterly(cohortOutputs, simulationQuarters, startYear, startQ, budget);
  const summary = calculateSummary(quarterly, inputs, effectiveSalesVelocity);

  return { quarterly, cohorts: cohortOutputs, summary };
}

// --- Cohort Processing ---

function processCohort(
  cohort: CohortDefinition,
  budget: BudgetConfig,
  advanced: AdvancedConfig,
  asp: number,
  totalQuarters: number,
  startYear: number,
  startQ: number,
  aspScaling: ASPScalingResult,
  effectiveSalesVelocity: number,
): CohortOutput {
  const profile = CAMPAIGN_PROFILES[cohort.profileId];
  const rates = getEffectiveRates(cohort, profile.conversionRates, aspScaling);
  const velocity = getEffectiveVelocity(cohort, profile.velocityDistribution);
  const { quarterlyDropoutRate, maxVelocityImprovement } = advanced;
  const agencyRate = budget.inHouseCreative ? 0.12 : budget.agencyPercent;

  const totalPotentialLeads = cohort.totalAccounts * rates.accountToLead;

  // Arrays to track funnel stages per quarter
  const leadsPerQ: number[] = new Array(totalQuarters).fill(0);
  const mqlsPerQ: number[] = new Array(totalQuarters).fill(0);
  const oppsPerQ: number[] = new Array(totalQuarters).fill(0);
  const closedWonPerQ: number[] = new Array(totalQuarters).fill(0);

  // --- Step 1: Distribute leads via velocity curve (PRD 4.3, 4.5) ---
  // Leads(q) = Total Accounts × Account→Lead Rate × Velocity Weight
  const newWeights = velocity.new;
  for (let qOffset = 0; qOffset < 4; qOffset++) {
    const targetQ = cohort.startQuarter + 1 + qOffset; // Q+1 through Q+4 from start
    if (targetQ < totalQuarters) {
      leadsPerQ[targetQ] += totalPotentialLeads * newWeights[qOffset];
    }
  }

  // --- Step 2: Leads → MQLs (same quarter) ---
  for (let q = 0; q < totalQuarters; q++) {
    mqlsPerQ[q] = leadsPerQ[q] * rates.leadToMQL;
  }

  // --- Step 3: MQLs → Opportunities (next quarter) ---
  for (let q = 0; q < totalQuarters - 1; q++) {
    oppsPerQ[q + 1] += mqlsPerQ[q] * rates.mqlToOpp;
  }

  // --- Step 4: Opportunities → Closed Won (sales velocity delay, PRD 4.8) ---
  for (let q = 0; q < totalQuarters; q++) {
    if (oppsPerQ[q] <= 0) continue;

    const programQuarter = q - cohort.startQuarter;
    const velocity = getEffectiveSalesVelocity(
      effectiveSalesVelocity, maxVelocityImprovement, programQuarter
    );

    // Cross-quarter allocation (PRD 4.8.3)
    const quarterDelay = velocity / 90;
    const fullQuarters = Math.floor(quarterDelay);
    const fractionalSplit = quarterDelay - fullQuarters;
    const totalCloses = oppsPerQ[q] * rates.oppToClose;

    const earlyQ = q + fullQuarters;
    if (earlyQ < totalQuarters) {
      closedWonPerQ[earlyQ] += totalCloses * (1 - fractionalSplit);
    }
    const lateQ = q + fullQuarters + 1;
    if (lateQ < totalQuarters) {
      closedWonPerQ[lateQ] += totalCloses * fractionalSplit;
    }
  }

  // --- Step 5: Build quarterly data with account lifecycle + costs ---
  const quarterlyData: CohortQuarterlyData[] = [];
  let inProgressAccounts = 0;
  let pastLeadAccounts = 0;

  for (let q = 0; q < totalQuarters; q++) {
    const relativeQ = q - cohort.startQuarter;
    let accountState: AccountState;

    if (relativeQ < 0) {
      accountState = { newAccounts: 0, inProgressAccounts: 0, pastLeadAccounts: 0, droppedOut: 0, convertedToLead: 0, totalActive: 0 };
    } else if (relativeQ === 0) {
      // Cohort entry quarter: all accounts are new
      inProgressAccounts = 0;
      pastLeadAccounts = 0;
      accountState = {
        newAccounts: cohort.totalAccounts,
        inProgressAccounts: 0,
        pastLeadAccounts: 0,
        droppedOut: 0,
        convertedToLead: 0,
        totalActive: cohort.totalAccounts,
      };
    } else {
      // Subsequent quarters: apply cohort recycling (PRD 4.2.3)
      const priorActive = relativeQ === 1 ? cohort.totalAccounts : inProgressAccounts;
      const convertedThisQ = leadsPerQ[q];
      const afterConversion = Math.max(0, priorActive - convertedThisQ);
      const droppedThisQ = afterConversion * quarterlyDropoutRate;
      inProgressAccounts = Math.max(0, afterConversion - droppedThisQ);
      pastLeadAccounts += convertedThisQ;

      accountState = {
        newAccounts: 0,
        inProgressAccounts,
        pastLeadAccounts,
        droppedOut: droppedThisQ,
        convertedToLead: convertedThisQ,
        totalActive: inProgressAccounts + pastLeadAccounts,
      };
    }

    // Frequency targeting cost (PRD 4.7)
    const frequencyCost = relativeQ >= 0
      ? calcFrequencyCost(accountState, budget.frequencyConfig)
      : 0;

    // CPL cost (PRD 4.6.1 Layer 2)
    const cplCost = leadsPerQ[q] * budget.blendedCPL;

    // Agency cost (PRD 4.6.3)
    const totalMedia = frequencyCost + cplCost;
    const agencyCost = totalMedia * agencyRate;

    // Software cost per cohort: flat quarterly, but we'll handle dedup in aggregation
    // For cohort view, show proportional share (actual flat cost is in aggregate)
    const softwareCost = 0; // Attributed at aggregate level

    const totalCost = frequencyCost + cplCost + agencyCost + softwareCost;
    const revenue = closedWonPerQ[q] * asp;

    quarterlyData.push({
      quarter: q,
      quarterLabel: getQuarterLabel(q, startYear, startQ),
      accountState,
      leads: leadsPerQ[q],
      mqls: mqlsPerQ[q],
      opportunities: oppsPerQ[q],
      closedWon: closedWonPerQ[q],
      revenue,
      frequencyCost,
      cplCost,
      softwareCost,
      agencyCost,
      totalCost,
    });
  }

  return {
    cohortId: cohort.id,
    cohortName: cohort.name,
    profileId: cohort.profileId,
    quarterlyData,
    totals: {
      leads: sum(leadsPerQ),
      mqls: sum(mqlsPerQ),
      opportunities: sum(oppsPerQ),
      closedWon: sum(closedWonPerQ),
      revenue: quarterlyData.reduce((a, d) => a + d.revenue, 0),
      totalCost: quarterlyData.reduce((a, d) => a + d.totalCost, 0),
    },
  };
}

// --- Helpers ---

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

/** Apply ASP-scaled conversion rates with user override precedence (PRD 4.11.3, 4.11.7) */
function getEffectiveRates(
  cohort: CohortDefinition,
  profileRates: ConversionRates,
  aspScaling: ASPScalingResult,
): ConversionRates {
  // Apply ASP scaling to profile base rates — accountToLead is NOT scaled (PRD 4.11.3)
  const scaledRates: ConversionRates = {
    accountToLead: profileRates.accountToLead,
    leadToMQL: clamp(profileRates.leadToMQL * aspScaling.leadToMQLAdj, 0.20, 0.85),
    mqlToOpp: clamp(profileRates.mqlToOpp * aspScaling.mqlToOppAdj, 0.08, 0.50),
    oppToClose: clamp(profileRates.oppToClose * aspScaling.oppToCloseAdj, 0.05, 0.35),
  };

  // User overrides take precedence over ASP-scaled defaults
  return {
    accountToLead: cohort.conversionOverrides?.accountToLead ?? scaledRates.accountToLead,
    leadToMQL: cohort.conversionOverrides?.leadToMQL ?? scaledRates.leadToMQL,
    mqlToOpp: cohort.conversionOverrides?.mqlToOpp ?? scaledRates.mqlToOpp,
    oppToClose: cohort.conversionOverrides?.oppToClose ?? scaledRates.oppToClose,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getEffectiveVelocity(cohort: CohortDefinition, profileVelocity: VelocityDistribution): VelocityDistribution {
  if (!cohort.velocityOverrides) return profileVelocity;
  return {
    new: cohort.velocityOverrides.new ?? profileVelocity.new,
    maturing: cohort.velocityOverrides.maturing ?? profileVelocity.maturing,
    established: cohort.velocityOverrides.established ?? profileVelocity.established,
    mature: cohort.velocityOverrides.mature ?? profileVelocity.mature,
  };
}

/** Sales velocity improvement: 0% Q1, 10% Q2, 20% Q3, 30% Q4+ (PRD 4.8.2) */
function getEffectiveSalesVelocity(baseDays: number, maxImprovement: number, programQ: number): number {
  if (programQ <= 0) return baseDays;
  const step = maxImprovement / 3;
  const improvement = Math.min(programQ * step, maxImprovement);
  return baseDays * (1 - improvement);
}

/** Frequency targeting cost per quarter (PRD 4.7.1) */
function calcFrequencyCost(
  acct: AccountState,
  freq: { monthlyFrequency: number; costPerTouch: number; tierMultipliers: { new: number; inProgress: number; pastLead: number } },
): number {
  const { monthlyFrequency, costPerTouch, tierMultipliers } = freq;
  const m = 3; // months per quarter
  return (
    acct.newAccounts * tierMultipliers.new * monthlyFrequency * costPerTouch * m +
    acct.inProgressAccounts * tierMultipliers.inProgress * monthlyFrequency * costPerTouch * m +
    acct.pastLeadAccounts * tierMultipliers.pastLead * monthlyFrequency * costPerTouch * m
  );
}

// --- Aggregation ---

function aggregateQuarterly(
  cohortOutputs: CohortOutput[],
  totalQuarters: number,
  startYear: number,
  startQ: number,
  budget: BudgetConfig,
): QuarterlyOutput[] {
  const quarterly: QuarterlyOutput[] = [];
  let cumulativeRevenue = 0;
  let cumulativeCost = 0;

  for (let q = 0; q < totalQuarters; q++) {
    let leads = 0, mqls = 0, opportunities = 0, closedWon = 0, revenue = 0;
    let frequencyCost = 0, cplCost = 0, agencyCost = 0;

    for (const co of cohortOutputs) {
      const qd = co.quarterlyData[q];
      if (!qd) continue;
      leads += qd.leads;
      mqls += qd.mqls;
      opportunities += qd.opportunities;
      closedWon += qd.closedWon;
      revenue += qd.revenue;
      frequencyCost += qd.frequencyCost;
      cplCost += qd.cplCost;
      agencyCost += qd.agencyCost;
    }

    // Software is a flat quarterly cost (not per-cohort)
    const softwareCost = budget.softwareCostPerQuarter;
    const totalCost = frequencyCost + cplCost + agencyCost + softwareCost;
    cumulativeRevenue += revenue;
    cumulativeCost += totalCost;

    quarterly.push({
      quarter: q,
      quarterLabel: getQuarterLabel(q, startYear, startQ),
      leads, mqls, opportunities, closedWon, revenue, cumulativeRevenue,
      frequencyCost, cplCost, softwareCost, agencyCost, totalCost, cumulativeCost,
    });
  }

  return quarterly;
}

// --- Unit Economics (PRD 4.11.4) ---

function calculateUnitEconomics(
  asp: number,
  totalInvestment: number,
  totalClosedWon: number,
  totalRevenue: number,
): UnitEconomicsMetrics {
  const { grossMargin, annualChurnRate } = UNIT_ECONOMICS_CONSTANTS;
  const cac = totalClosedWon > 0 ? totalInvestment / totalClosedWon : 0;
  const ltv = asp * (1 / annualChurnRate) * grossMargin;
  const monthlyRevenuePerCustomer = asp / 12;
  const cacPaybackMonths = (monthlyRevenuePerCustomer * grossMargin) > 0
    ? cac / (monthlyRevenuePerCustomer * grossMargin)
    : Infinity;
  const newCacRatio = totalRevenue > 0 ? totalInvestment / totalRevenue : Infinity;
  const ltvCacRatio = cac > 0 ? ltv / cac : Infinity;

  return {
    ltvCacRatio: isFinite(ltvCacRatio) ? ltvCacRatio : 0,
    cacPaybackMonths: isFinite(cacPaybackMonths) ? cacPaybackMonths : 0,
    newCacRatio: isFinite(newCacRatio) ? newCacRatio : 0,
    ltv,
    cac,
    grossMargin,
    annualChurnRate,
  };
}

// --- Trap Detection (PRD 4.11.6) ---

function detectTraps(
  unitEconomics: UnitEconomicsMetrics,
  totalOpportunities: number,
  simulationQuarters: number,
): TrapWarning[] {
  const warnings: TrapWarning[] = [];

  // Trap 1: CAC ratio too good to be true
  if (unitEconomics.newCacRatio > 0 && unitEconomics.newCacRatio < TRAP_THRESHOLDS.tooGoodCAC) {
    warnings.push({
      id: 'too-good-cac',
      message: 'These assumptions imply faster returns than typical B2B sales cycles produce. Verify your conversion rates against actual pipeline data.',
      severity: 'warning',
    });
  }

  // Trap 2: Sales capacity exceeded
  const avgOppsPerQ = simulationQuarters > 0 ? totalOpportunities / simulationQuarters : 0;
  if (avgOppsPerQ > TRAP_THRESHOLDS.salesCapacityOppsPerQ) {
    warnings.push({
      id: 'sales-capacity',
      message: `Pipeline volume may exceed sales capacity. Your model generates ~${Math.round(avgOppsPerQ)} opportunities per quarter. Each AE can typically manage 10\u201315 active deals.`,
      severity: 'warning',
    });
  }

  // Trap 3: Overestimating LTV
  if (unitEconomics.ltvCacRatio > TRAP_THRESHOLDS.overestimatingLTV) {
    warnings.push({
      id: 'overestimating-ltv',
      message: `Your unit economics appear unusually strong (${unitEconomics.ltvCacRatio.toFixed(1)}:1 LTV:CAC). If annual churn increases from 12% to 20%, this ratio drops significantly. Stress-test your retention assumption.`,
      severity: 'warning',
    });
  }

  return warnings;
}

// --- Summary ---

function calculateSummary(quarterly: QuarterlyOutput[], inputs: CalculatorInputs, effectiveSalesVelocity: number): SummaryMetrics {
  const { goals, advanced, simulationQuarters } = inputs;

  const firstRevQ = quarterly.find(q => q.closedWon > 0.001);
  const totalInvestment = quarterly.reduce((a, q) => a + q.totalCost, 0);
  const totalRevenue = quarterly.reduce((a, q) => a + q.revenue, 0);
  const totalLeads = quarterly.reduce((a, q) => a + q.leads, 0);
  const totalClosedWon = quarterly.reduce((a, q) => a + q.closedWon, 0);
  const totalOpportunities = quarterly.reduce((a, q) => a + q.opportunities, 0);
  const totalFreqCost = quarterly.reduce((a, q) => a + q.frequencyCost, 0);
  const totalCPLCost = quarterly.reduce((a, q) => a + q.cplCost, 0);

  const crossoverQ = quarterly.find(q => q.cumulativeRevenue >= q.cumulativeCost);
  const lastQ = Math.max(0, quarterly.length - 1);
  const currentVelocity = getEffectiveSalesVelocity(effectiveSalesVelocity, advanced.maxVelocityImprovement, lastQ);

  const unitEconomics = calculateUnitEconomics(
    goals.averageSellingPrice,
    totalInvestment,
    totalClosedWon,
    totalRevenue,
  );

  const trapWarnings = detectTraps(unitEconomics, totalOpportunities, simulationQuarters);

  return {
    firstRevenueQuarter: firstRevQ ? firstRevQ.quarter : null,
    firstRevenueQuarterLabel: firstRevQ ? firstRevQ.quarterLabel : 'Beyond modeled range',
    firstRevenueAmount: firstRevQ ? firstRevQ.revenue : 0,
    totalInvestment,
    totalRevenue,
    trueCPL: totalLeads > 0 ? (totalFreqCost + totalCPLCost) / totalLeads : 0,
    totalLeads,
    totalClosedWon,
    roi: totalInvestment > 0 ? (totalRevenue - totalInvestment) / totalInvestment : 0,
    progressToGoal: goals.arrGoal > 0 ? totalRevenue / goals.arrGoal : 0,
    crossoverQuarter: crossoverQ ? crossoverQ.quarter : null,
    crossoverQuarterLabel: crossoverQ ? crossoverQ.quarterLabel : 'Beyond modeled range',
    currentSalesVelocity: currentVelocity,
    daysSavedVsBaseline: effectiveSalesVelocity - currentVelocity,
    frequencyToCPLRatio: totalCPLCost > 0 ? totalFreqCost / totalCPLCost : 0,
    effectiveCAC: totalClosedWon > 0 ? totalInvestment / totalClosedWon : 0,
    unitEconomics,
    trapWarnings,
  };
}
