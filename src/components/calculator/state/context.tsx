import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import type {
  CalculatorInputs,
  CalculatorOutputs,
  ValidationResult,
  CohortDefinition,
  GoalsConfig,
  BudgetConfig,
  AdvancedConfig,
  FrequencyConfig,
  CampaignProfileId,
  Scenario,
} from '../engine/types';
import { calculate } from '../engine/calculate';
import { validate } from '../engine/validate';
import { createDefaultInputs, CAMPAIGN_PROFILES } from '../engine/defaults';
import { interpolateASPScaling, getASPBandLabel } from '../engine/asp-scaling';
import { loadScenarios, saveScenarios } from './scenarios';

// --- State ---

export interface ASPNotification {
  bandLabel: string;
  timestamp: number;
  adjustedFields: string[];
  preservedFields: string[];
}

export interface CalculatorState {
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  validations: ValidationResult[];
  scenarios: Scenario[];
  activeScenarioId: string;
  ui: {
    activeTab: 'timeline' | 'budget' | 'cohorts' | 'data';
    expandedSections: string[];
    showCompare: boolean;
    showEmailCapture: boolean;
    compareScenarioIds: string[];
    isFirstVisit: boolean;
    aspNotification: ASPNotification | null;
  };
}

// --- Actions ---

type Action =
  | { type: 'SET_GOALS'; payload: Partial<GoalsConfig> }
  | { type: 'ASP_CHANGED'; newASP: number }
  | { type: 'DISMISS_ASP_NOTIFICATION' }
  | { type: 'SET_COHORT'; cohortId: string; payload: Partial<CohortDefinition> }
  | { type: 'ADD_COHORT' }
  | { type: 'REMOVE_COHORT'; cohortId: string }
  | { type: 'SET_COHORT_PROFILE'; cohortId: string; profileId: CampaignProfileId }
  | { type: 'SET_BUDGET'; payload: Partial<BudgetConfig> }
  | { type: 'SET_FREQUENCY'; payload: Partial<FrequencyConfig> }
  | { type: 'SET_ADVANCED'; payload: Partial<AdvancedConfig> }
  | { type: 'SET_SIMULATION_QUARTERS'; value: number }
  | { type: 'SET_TAB'; tab: CalculatorState['ui']['activeTab'] }
  | { type: 'TOGGLE_SECTION'; section: string }
  | { type: 'SAVE_SCENARIO'; name: string }
  | { type: 'LOAD_SCENARIO'; scenarioId: string }
  | { type: 'DELETE_SCENARIO'; scenarioId: string }
  | { type: 'RENAME_SCENARIO'; scenarioId: string; name: string }
  | { type: 'TOGGLE_COMPARE' }
  | { type: 'SET_COMPARE_SCENARIOS'; ids: string[] }
  | { type: 'SHOW_EMAIL_CAPTURE' }
  | { type: 'HIDE_EMAIL_CAPTURE' }
  | { type: 'DISMISS_FIRST_VISIT' };

// --- Reducer ---

function recalculate(inputs: CalculatorInputs): { outputs: CalculatorOutputs; validations: ValidationResult[] } {
  return { outputs: calculate(inputs), validations: validate(inputs) };
}

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'SET_GOALS': {
      const inputs = { ...state.inputs, goals: { ...state.inputs.goals, ...action.payload } };
      return { ...state, inputs, ...recalculate(inputs) };
    }

    case 'ASP_CHANGED': {
      const scaling = interpolateASPScaling(action.newASP);
      const goals = { ...state.inputs.goals, averageSellingPrice: action.newASP };
      let budget = { ...state.inputs.budget };
      let advanced = { ...state.inputs.advanced };
      const adjustedFields: string[] = [];
      const preservedFields: string[] = [];

      // Update CPL if not manually overridden
      if (!state.inputs.userOverrides?.blendedCPL) {
        budget = { ...budget, blendedCPL: scaling.suggestedCPL };
        adjustedFields.push('CPL');
      } else {
        preservedFields.push('CPL');
      }

      // Update sales velocity if not manually overridden
      if (!state.inputs.userOverrides?.salesVelocityDays) {
        advanced = { ...advanced, salesVelocityDays: scaling.salesVelocityDays };
        adjustedFields.push('Sales Velocity');
      } else {
        preservedFields.push('Sales Velocity');
      }

      adjustedFields.push('Conversion Rates');

      const inputs = { ...state.inputs, goals, budget, advanced };
      return {
        ...state,
        inputs,
        ...recalculate(inputs),
        ui: {
          ...state.ui,
          aspNotification: {
            bandLabel: scaling.bandLabel,
            timestamp: Date.now(),
            adjustedFields,
            preservedFields,
          },
        },
      };
    }

    case 'DISMISS_ASP_NOTIFICATION':
      return { ...state, ui: { ...state.ui, aspNotification: null } };

    case 'SET_COHORT': {
      const cohorts = state.inputs.cohorts.map(c =>
        c.id === action.cohortId ? { ...c, ...action.payload } : c
      );
      const inputs = { ...state.inputs, cohorts };
      return { ...state, inputs, ...recalculate(inputs) };
    }

    case 'ADD_COHORT': {
      if (state.inputs.cohorts.length >= 8) return state;
      const nextNum = state.inputs.cohorts.length + 1;
      const newCohort: CohortDefinition = {
        id: `cohort-${Date.now()}`,
        name: `Cohort ${nextNum}`,
        profileId: 'abm',
        totalAccounts: 564,
        startQuarter: state.inputs.cohorts.length, // stagger by 1 quarter
      };
      const inputs = { ...state.inputs, cohorts: [...state.inputs.cohorts, newCohort] };
      return { ...state, inputs, ...recalculate(inputs) };
    }

    case 'REMOVE_COHORT': {
      if (state.inputs.cohorts.length <= 1) return state;
      const cohorts = state.inputs.cohorts.filter(c => c.id !== action.cohortId);
      const inputs = { ...state.inputs, cohorts };
      return { ...state, inputs, ...recalculate(inputs) };
    }

    case 'SET_COHORT_PROFILE': {
      const profile = CAMPAIGN_PROFILES[action.profileId];
      const cohorts = state.inputs.cohorts.map(c =>
        c.id === action.cohortId
          ? { ...c, profileId: action.profileId, conversionOverrides: undefined, velocityOverrides: undefined }
          : c
      );
      const inputs = { ...state.inputs, cohorts };
      return { ...state, inputs, ...recalculate(inputs) };
    }

    case 'SET_BUDGET': {
      const userOverrides = { ...state.inputs.userOverrides };
      // Track manual CPL override
      if ('blendedCPL' in action.payload) {
        userOverrides.blendedCPL = true;
      }
      const inputs = {
        ...state.inputs,
        budget: { ...state.inputs.budget, ...action.payload },
        userOverrides,
      };
      return { ...state, inputs, ...recalculate(inputs) };
    }

    case 'SET_FREQUENCY': {
      const frequencyConfig = { ...state.inputs.budget.frequencyConfig, ...action.payload };
      const inputs = { ...state.inputs, budget: { ...state.inputs.budget, frequencyConfig } };
      return { ...state, inputs, ...recalculate(inputs) };
    }

    case 'SET_ADVANCED': {
      const userOverrides = { ...state.inputs.userOverrides };
      // Track manual sales velocity override
      if ('salesVelocityDays' in action.payload) {
        userOverrides.salesVelocityDays = true;
      }
      const inputs = {
        ...state.inputs,
        advanced: { ...state.inputs.advanced, ...action.payload },
        userOverrides,
      };
      return { ...state, inputs, ...recalculate(inputs) };
    }

    case 'SET_SIMULATION_QUARTERS': {
      const inputs = { ...state.inputs, simulationQuarters: action.value };
      return { ...state, inputs, ...recalculate(inputs) };
    }

    case 'SET_TAB':
      return { ...state, ui: { ...state.ui, activeTab: action.tab } };

    case 'TOGGLE_SECTION': {
      const expanded = state.ui.expandedSections.includes(action.section)
        ? state.ui.expandedSections.filter(s => s !== action.section)
        : [...state.ui.expandedSections, action.section];
      return { ...state, ui: { ...state.ui, expandedSections: expanded } };
    }

    case 'SAVE_SCENARIO': {
      const now = Date.now();
      const scenario: Scenario = {
        id: `scenario-${now}`,
        name: action.name,
        inputs: JSON.parse(JSON.stringify(state.inputs)),
        createdAt: now,
        updatedAt: now,
      };
      const scenarios = [...state.scenarios, scenario];
      saveScenarios(scenarios);
      return { ...state, scenarios, activeScenarioId: scenario.id };
    }

    case 'LOAD_SCENARIO': {
      const scenario = state.scenarios.find(s => s.id === action.scenarioId);
      if (!scenario) return state;
      const inputs = JSON.parse(JSON.stringify(scenario.inputs));
      // Ensure userOverrides exists for backwards compatibility with saved scenarios
      if (!inputs.userOverrides) inputs.userOverrides = {};
      return { ...state, inputs, ...recalculate(inputs), activeScenarioId: scenario.id };
    }

    case 'DELETE_SCENARIO': {
      const scenarios = state.scenarios.filter(s => s.id !== action.scenarioId);
      saveScenarios(scenarios);
      return { ...state, scenarios };
    }

    case 'RENAME_SCENARIO': {
      const scenarios = state.scenarios.map(s =>
        s.id === action.scenarioId ? { ...s, name: action.name, updatedAt: Date.now() } : s
      );
      saveScenarios(scenarios);
      return { ...state, scenarios };
    }

    case 'TOGGLE_COMPARE':
      return { ...state, ui: { ...state.ui, showCompare: !state.ui.showCompare } };

    case 'SET_COMPARE_SCENARIOS':
      return { ...state, ui: { ...state.ui, compareScenarioIds: action.ids } };

    case 'SHOW_EMAIL_CAPTURE':
      return { ...state, ui: { ...state.ui, showEmailCapture: true } };

    case 'HIDE_EMAIL_CAPTURE':
      return { ...state, ui: { ...state.ui, showEmailCapture: false } };

    case 'DISMISS_FIRST_VISIT':
      return { ...state, ui: { ...state.ui, isFirstVisit: false } };

    default:
      return state;
  }
}

// --- Context ---

interface CalculatorContextValue {
  state: CalculatorState;
  dispatch: React.Dispatch<Action>;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error('useCalculator must be used within CalculatorProvider');
  return ctx;
}

// --- Provider ---

function createInitialState(): CalculatorState {
  const inputs = createDefaultInputs();
  const scenarios = loadScenarios();

  let isFirstVisit = true;
  try {
    isFirstVisit = !localStorage.getItem('strategnik_calc_visited');
  } catch {}

  return {
    inputs,
    ...recalculate(inputs),
    scenarios,
    activeScenarioId: '',
    ui: {
      activeTab: 'timeline',
      expandedSections: ['goals'],
      showCompare: false,
      showEmailCapture: false,
      compareScenarioIds: [],
      isFirstVisit,
      aspNotification: null,
    },
  };
}

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
}
