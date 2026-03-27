import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, ComposedChart, Line, Area, AreaChart, Cell, Legend,
} from 'recharts';

const SVG_W = 1020, SVG_H = 580, NH = 54;

const CAT = {
  core:   { stroke: '#f59e0b', bg: '#1c120544', text: '#fbbf24', label: 'Golden Triangle' },
  tof:    { stroke: '#06b6d4', bg: '#04203044', text: '#67e8f9', label: 'Top of Funnel' },
  auto:   { stroke: '#1de2c4', bg: '#04201b44', text: '#a5f3e7', label: 'Automation Layer' },
  seller: { stroke: '#34d399', bg: '#04201844', text: '#6ee7b7', label: 'Seller Tools' },
  sales:  { stroke: '#60a5fa', bg: '#0f1f3d44', text: '#93c5fd', label: 'Quote-to-Cash' },
  cs:     { stroke: '#c084fc', bg: '#1a083044', text: '#d8b4fe', label: 'CS / Support' },
  collab: { stroke: '#494950', bg: '#18181b44', text: '#95959d', label: 'Collaboration' },
};
const PC: Record<number, string> = { 1: '#f59e0b', 2: '#60a5fa', 3: '#c084fc', 4: '#34d399' };
const SD: Record<string, string | undefined> = { bi: undefined, uni: undefined, append: '2 5', read: '1 7' };
const SL: Record<string, string> = { bi: '⇄ Bidirectional', uni: '→ Unidirectional', append: '+ Append-only', read: '◦ Read-only' };

const NODES = [
  { id:'sf',  name:'Salesforce',       sub:'OWNS: Acct · Opp · Stage · ACV · Close Date',       cat:'core',   x:490, y:330, w:172 },
  { id:'hs',  name:'HubSpot',          sub:'OWNS: Contact · Lead · MQL · Scheduling',         cat:'core',   x:218, y:158, w:158 },
  { id:'ns',  name:'NetSuite',         sub:'OWNS: Order · RevRec · Commission',                   cat:'core',   x:822, y:158, w:158 },
  { id:'vib', name:'Vibe Prospecting', sub:'OWNS: ICP lists · intent · acct signals',             cat:'tof',    x:300, y:62,  w:172 },
  { id:'lin', name:'LinkedIn SNav',    sub:'READ ONLY · context overlay in SFDC',                 cat:'tof',    x:520, y:62,  w:135 },
  { id:'n8n', name:'n8n',              sub:'SOLE MIDDLEWARE · PDL · Gong→Claude · all sync',    cat:'auto',   x:78,  y:162, w:148 },
  { id:'gon', name:'Gong',             sub:'OWNS: Call Intel · MEDDPICC via n8n+Claude',          cat:'seller', x:78,  y:310, w:120 },
  { id:'cpq', name:'DealHub CPQ',      sub:'OWNS: Quote · Pricing · Approvals',                   cat:'sales',  x:855, y:258, w:132 },
  { id:'pan', name:'PandaDoc / CLM',   sub:'OWNS: Contract execution',                            cat:'sales',  x:855, y:358, w:140 },
  { id:'vit', name:'Vitally',          sub:'OWNS: Health Score · Renewal Risk',                   cat:'cs',     x:258, y:452, w:128 },
  { id:'zen', name:'ZenDesk',          sub:'OWNS: Tickets · CSAT',                                cat:'cs',     x:462, y:512, w:115 },
  { id:'pen', name:'Pendo',            sub:'OWNS: Usage · DAU/MAU · Adoption',                    cat:'cs',     x:652, y:452, w:125 },
  { id:'snw', name:'Snowflake',        sub:'WAREHOUSE · dbt · Census reverse ETL',                cat:'cs',     x:680, y:330, w:138 },
  { id:'loo', name:'Loopio',           sub:'OWNS: RFP records',                                   cat:'collab', x:822, y:458, w:108 },
  { id:'slk', name:'Slack',            sub:'RECEIVES: Alerts only · no writes',                   cat:'collab', x:100, y:538, w:104 },
  { id:'gws', name:'Google WS',        sub:'OWNS: Email activity · Calendar',                     cat:'collab', x:278, y:538, w:128 },
];

const EDGES = [
  {id:'e1',  from:'hs',  to:'sf',  label:'MQL handoff · attribution',              objs:'Contact · Lead · Campaign',                sync:'bi',     phase:1},
  {id:'e2',  from:'sf',  to:'ns',  label:'Quote-to-cash · commissions',             objs:'Opportunity · Order · Commission',          sync:'bi',     phase:1},
  {id:'e3',  from:'vib', to:'hs',  label:'ICP list import · prospect records',     objs:'Contact · Company',                        sync:'uni',    phase:1},
  {id:'e4',  from:'vib', to:'sf',  label:'Account signals · firmographic enrich',  objs:'Account · Custom Signal Field',              sync:'uni',    phase:1},
  {id:'e5',  from:'hs',  to:'n8n', label:'New contact trigger → PDL lookup',       objs:'Contact (trigger event)',                   sync:'uni',    phase:1},
  {id:'e6',  from:'n8n', to:'hs',  label:'Enriched fields upsert-only',            objs:'Contact (enriched fields)',                 sync:'uni',    phase:1},
  {id:'e7',  from:'n8n', to:'sf',  label:'Outbound enrich · blank fields only',    objs:'Contact · Account (enrichment)',              sync:'uni',    phase:1},
  {id:'e8',  from:'sf',  to:'cpq', label:'Opp triggers quote creation',            objs:'Opportunity → Quote',                      sync:'uni',    phase:2},
  {id:'e9',  from:'cpq', to:'sf',  label:'Approved amount → Opp',                 objs:'Quote → Opportunity (Amount)',                sync:'uni',    phase:2},
  {id:'e10', from:'cpq', to:'ns',  label:'Signed → auto order creation',          objs:'Quote → Sales Order',                       sync:'uni',    phase:2},
  {id:'e11', from:'pan', to:'sf',  label:'Contract status sync',                   objs:'Contract → Opportunity (Status)',            sync:'bi',     phase:2},
  {id:'e12', from:'pan', to:'ns',  label:'Executed → RevRec schedule',            objs:'Contract → Revenue Schedule',                sync:'uni',    phase:2},
  {id:'e13', from:'pen', to:'sf',  label:'Usage · DAU/MAU → Account',             objs:'Product Event → Account (Usage Fields)',     sync:'uni',    phase:2},
  {id:'e14', from:'pen', to:'vit', label:'Usage → health score input',            objs:'Product Event → Health Metric',              sync:'uni',    phase:2},
  {id:'e15', from:'gon', to:'sf',  label:'Call intel · MEDDPICC via n8n+Claude',  objs:'Call → Opportunity (MEDDPICC Fields)',       sync:'uni',    phase:2},
  {id:'e16', from:'gon', to:'n8n', label:'Transcripts → Claude API → MEDDPICC', objs:'Call Transcript → Structured JSON',          sync:'uni',    phase:2},
  {id:'e17', from:'vit', to:'sf',  label:'Health scores · renewal flags',         objs:'Customer → Account (Health, Risk Flag)',    sync:'bi',     phase:3},
  {id:'e18', from:'zen', to:'sf',  label:'Ticket volume · CSAT → Account',        objs:'Ticket → Account (Volume, CSAT)',           sync:'uni',    phase:3},
  {id:'e19', from:'zen', to:'vit', label:'Support → health degradation',          objs:'Ticket → Health Metric',                    sync:'uni',    phase:3},
  {id:'e20', from:'loo', to:'sf',  label:'RFP → Opportunity linkage',             objs:'RFP Record → Opportunity',                  sync:'uni',    phase:3},
  {id:'e21', from:'sf',  to:'slk', label:'Deal alerts · stage changes',           objs:'Opportunity (notification only)',            sync:'uni',    phase:3},
  {id:'e22', from:'gws', to:'sf',  label:'Activity auto-log · cal sync',          objs:'Email · Calendar Event → Activity',          sync:'uni',    phase:3},
  {id:'e23', from:'lin', to:'sf',  label:'Context overlay (read only)',            objs:'Contact · Account (overlay widget)',        sync:'read',   phase:3},
  {id:'e24', from:'ns',  to:'sf',  label:'ARR · Invoice status (read)',           objs:'Subscription · Invoice → Account',          sync:'read',   phase:4},
  {id:'e25', from:'sf',  to:'snw', label:'Opp + Account → warehouse',            objs:'Opportunity · Account · Activity',            sync:'uni',    phase:4},
  {id:'e26', from:'ns',  to:'snw', label:'Financial data → warehouse',           objs:'Order · Invoice · Revenue Schedule',        sync:'uni',    phase:4},
  {id:'e27', from:'snw', to:'sf',  label:'Census reverse ETL → SFDC',            objs:'Computed Fields → Account · Opportunity',   sync:'uni',    phase:4},
];

const OWNERSHIP = [
  { cat:'Core Records', color:'#f59e0b', rows:[
    {field:'Contact record',            owner:'HubSpot',          readers:'SFDC, Vitally',            sync:'bi',     rule:'HubSpot wins on conflict. SFDC updates blank fields only.'},
    {field:'Lead source / attribution', owner:'HubSpot',          readers:'SFDC (read)',               sync:'uni',    rule:'Never overwrite from SFDC. One direction only.'},
    {field:'Account firmographics',     owner:'Salesforce',       readers:'HubSpot, Vitally, Gong',    sync:'bi',     rule:'SFDC wins. Enrichment tools update blank fields only. 30-day write-lock after rep edit.'},
    {field:'Opportunity data',          owner:'Salesforce',       readers:'NetSuite, CPQ, Snowflake',  sync:'uni',    rule:'Reps and SFDC workflows only. No write-back from downstream.'},
  ]},
  { cat:'Prospecting & Enrichment', color:'#06b6d4', rows:[
    {field:'ICP prospect lists',        owner:'Vibe Prospecting', readers:'HubSpot (import)',          sync:'uni',    rule:'Built via Explorium MCP co-pilot. Imported to HubSpot as new contacts. Dedup enforced at n8n before insert. No direct SFDC inserts.'},
    {field:'Account signals',           owner:'Vibe Prospecting', readers:'SFDC (signal field)',       sync:'uni',    rule:'Dedicated SFDC Account field. Not merged with rep-entered data.'},
    {field:'Inbound contact enrich',    owner:'PDL via n8n',      readers:'HubSpot (upsert)',          sync:'uni',    rule:'Trigger: new contact created in HubSpot. n8n fires PDL lookup. Upsert-only — blank fields only. Trigger guard prevents re-enrichment loops. Pay-per-match controls spend.'},
    {field:'Outbound contact enrich',   owner:'PDL via n8n',      readers:'HubSpot, SFDC',             sync:'uni',    rule:'Same n8n + PDL infrastructure as inbound. Upsert-only. Blank fields only. 30-day write-lock honored. No INSERT permissions.'},
  ]},
  { cat:'Financial Records', color:'#60a5fa', rows:[
    {field:'Quote / pricing',           owner:'DealHub CPQ',      readers:'SFDC (approved amt only)',  sync:'uni',    rule:'SFDC Opp triggers creation. CPQ owns all pricing logic.'},
    {field:'Order / subscription',      owner:'NetSuite',         readers:'SFDC (display only)',        sync:'read',   rule:'Auto-created on signing. SFDC displays but cannot write back.'},
    {field:'Revenue recognition',       owner:'NetSuite',         readers:'Finance only',              sync:'none',   rule:'No GTM write access. Read-only display in SFDC.'},
    {field:'Commission',                owner:'NetSuite',         readers:'SFDC (display)',             sync:'read',   rule:'Calculated in NetSuite. Rep dashboard in SFDC is read-only.'},
    {field:'Contract status',           owner:'PandaDoc/CLM',     readers:'SFDC, NetSuite',            sync:'uni',    rule:'Signed status → SFDC and triggers NetSuite order creation.'},
  ]},
  { cat:'Activity & Seller Automation', color:'#34d399', rows:[
    {field:'Call intelligence',         owner:'Gong',             readers:'SFDC (via n8n+Claude)',      sync:'uni',    rule:'Gong transcripts flow through n8n → Claude API → structured MEDDPICC fields written to SFDC Opp. Same n8n infrastructure as PDL enrichment — incremental build.'},
    {field:'Meeting / scheduling',      owner:'HubSpot',          readers:'SFDC (creates activity)',   sync:'uni',    rule:'HubSpot handles meeting scheduling natively. Every booked meeting auto-creates SFDC activity on Contact + Opp.'},
    {field:'Email activity',            owner:'Google WS',        readers:'SFDC',                      sync:'uni',    rule:'Auto-logged to SFDC only. Source email never modified. Simplified from dual-log.'},
    {field:'Buyer context',             owner:'LinkedIn SNav',    readers:'SFDC (overlay only)',       sync:'read',   rule:'Read-only overlay in SFDC. Never written into SFDC structured fields.'},
  ]},
  { cat:'CS, Support & Analytics', color:'#c084fc', rows:[
    {field:'Health score',              owner:'Vitally',          readers:'SFDC (Account, read)',      sync:'bi',     rule:'Vitally calculates from Pendo + ZenDesk. SFDC displays renewal risk flag.'},
    {field:'Product usage',             owner:'Pendo',            readers:'Vitally, SFDC',             sync:'uni',    rule:'Unidirectional only. No GTM team can modify product data.'},
    {field:'Support tickets',           owner:'ZenDesk',          readers:'Vitally, SFDC (Account)',   sync:'uni',    rule:'High-severity tickets auto-degrade Vitally health score.'},
    {field:'Warehouse analytics',       owner:'Snowflake',        readers:'SFDC (via Census)',          sync:'uni',    rule:'dbt transforms raw data from SFDC + NetSuite. Census reverse ETL pushes computed fields back to SFDC. Single source of truth for reporting.'},
    {field:'RFP records',               owner:'Loopio',           readers:'SFDC (linked to Opp)',      sync:'uni',    rule:'Linked to Opportunity. Win/loss tracked in both systems.'},
  ]},
];

const CONCURRENCY = [
  {rule:'Update Lock',           detail:"While System A writes to Record X, System B’s update for the same record is queued — not dropped. After A’s write completes, B’s update is evaluated field-by-field against the ownership matrix."},
  {rule:'Circular Detection',    detail:'Every update is tagged with an origin stamp by n8n. If an update arrives destined for the same system it originated from, it is discarded. Eliminates infinite loops in bidirectional syncs.'},
  {rule:'Conflict Queue',        detail:'Any update violating the ownership matrix routes to a RevOps review queue. Nothing fails silently. Conflicting systems, values, and timestamps are logged. Human resolves once; the rule is then codified.'},
  {rule:'Enrichment Write-Lock', detail:'After a SFDC or HubSpot field is updated by a rep or workflow, it is write-locked for 30 days. PDL/n8n and Vibe Prospecting cannot overwrite during that window.'},
  {rule:'No-Create Rule',        detail:'PDL/n8n and Vibe Prospecting are upsert-only at the middleware level — zero INSERT permissions enforced at n8n, not just tool config. New records flow through HubSpot (contacts) or SFDC (accounts/opps) only.'},
  {rule:'PDL Trigger Guard',     detail:'n8n fires PDL enrichment on HubSpot contact creation only — not on updates. Prevents re-enrichment loops and controls spend. Pay-per-match means a missed trigger is cheaper than a duplicate call.'},
];

const PHASES = [
  {num:1,color:'#f59e0b',weeks:'Weeks 1–4',title:'Foundation: Golden Triangle + Enrichment Automation',
   goal:'Establish SFDC ⇔ HubSpot ⇔ NetSuite as source of truth. Deploy Vibe Prospecting as outbound ICP list-build layer and PDL+n8n as inbound/outbound enrichment automation. Lock field ownership matrix and write-lock rules before any other tools are added.',
   integrations:[
     {tools:'HubSpot ⇔ Salesforce',method:'Native HubSpot-SFDC connector + n8n',detail:'Bidirectional sync with field ownership enforced at n8n. HubSpot owns Contact/Lead. SFDC owns Account/Opportunity. MQL→SQL handoff trigger defined. Objects synced: Contact, Lead, Campaign, Account.'},
     {tools:'Salesforce ⇔ NetSuite',method:'n8n middleware',detail:'Quote/Order sync with RevRec field mapping. Commission data flow for automated payouts. Objects synced: Opportunity, Order, Commission, Revenue Schedule.'},
     {tools:'Vibe Prospecting → HubSpot + SFDC',method:'Explorium MCP + n8n upsert-only',detail:'ICP lists built via Explorium (Claude MCP co-pilot workflow). Imported to HubSpot as new contacts — dedup enforced at n8n before insert. Account signals written to dedicated SFDC field. Objects synced: Contact, Company, Account.'},
     {tools:'PDL + n8n → HubSpot + SFDC',method:'n8n workflow + PDL API (pay-per-match)',detail:'Inbound: new contact created in HubSpot triggers n8n → PDL lookup → enriched fields upsert back. Outbound: same pipeline enriches SFDC contacts/accounts with blank-field-only writes. 30-day write-lock honored. Objects synced: Contact, Account.'},
   ],
   deliverables:['Field ownership matrix','GTM data dictionary','Dedup + write-lock rules in n8n','PDL+n8n enrichment live (inbound + outbound)','Baseline pipeline & attribution reports'],
  },
  {num:2,color:'#60a5fa',weeks:'Weeks 5–8',title:'Revenue Intelligence + Seller Automation',
   goal:'Eliminate manual data entry for reps. Wire Gong, DealHub CPQ, PandaDoc, and Pendo. After this phase reps should not be manually logging calls, meetings, or quotes.',
   integrations:[
     {tools:'Gong → n8n + Claude API → SFDC',method:'n8n workflow + Claude API + SFDC write',detail:'Gong call transcripts trigger n8n workflow. Claude API extracts structured MEDDPICC fields (Metrics, Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identify Pain, Champion). Writes to dedicated SFDC Opportunity fields. Objects synced: Call Transcript → Opportunity (MEDDPICC).'},
     {tools:'SFDC ⇔ DealHub CPQ ⇔ NetSuite',method:'DealHub native SFDC + n8n → NetSuite',detail:'SFDC Opportunity triggers quote in DealHub. Approved amount syncs back. On signing, webhook auto-creates NetSuite order. Objects synced: Opportunity, Quote, Sales Order.'},
     {tools:'PandaDoc / CLM ⇔ SFDC + NetSuite',method:'PandaDoc SFDC package + n8n',detail:'Opp triggers contract creation. Signed status syncs back to SFDC. Executed contract triggers RevRec in NetSuite. Objects synced: Contract, Opportunity, Revenue Schedule.'},
     {tools:'Pendo → Salesforce + Vitally',method:'Pendo native connectors',detail:'Feature adoption and DAU/MAU written to SFDC Account. Usage events feed Vitally health score. Objects synced: Product Event, Account, Health Metric.'},
   ],
   deliverables:['Zero manual activity logging for reps','Quote-to-cash fully automated','Health score v1 (Pendo→Vitally)','MEDDPICC auto-populated from Gong calls'],
  },
  {num:3,color:'#c084fc',weeks:'Weeks 9–12',title:'CS/Support 360° + Collaboration Layer',
   goal:'Complete the 360° customer view on every SFDC Account. Wire CS health, support load, and collaboration activity without reps touching a field.',
   integrations:[
     {tools:'Vitally ⇔ Salesforce',method:'Vitally native SFDC integration',detail:'Health scores and renewal risk flags surface on SFDC Account. SFDC Opp data flows into Vitally for CSM context. Objects synced: Customer, Account, Opportunity.'},
     {tools:'ZenDesk → Salesforce + Vitally',method:'ZenDesk SFDC + Vitally integrations',detail:'Ticket volume, CSAT, and escalations sync to SFDC Account. High-severity tickets auto-degrade Vitally health score. Objects synced: Ticket, Account, Health Metric.'},
     {tools:'Google Workspace → Salesforce',method:'SFDC Inbox / Activity Capture',detail:'Email activity and calendar events auto-logged to SFDC only. Simplified from dual-log. Objects synced: Email, Calendar Event → Activity.'},
     {tools:'Loopio → Salesforce',method:'Loopio SFDC package',detail:'RFP records linked to Opportunities. Win/loss tracked on RFP-influenced deals. Objects synced: RFP Record, Opportunity.'},
     {tools:'LinkedIn SNav → Salesforce',method:'LinkedIn SNav SFDC widget',detail:'Read-only overlay on SFDC Contact and Account pages. Objects: Contact, Account (read-only overlay).'},
     {tools:'Salesforce → Slack',method:'Salesforce for Slack app',detail:'Deal alerts, stage changes, renewal risk flags pushed to Slack. Receives only — zero write-back. Objects: Opportunity (notification payload).'},
   ],
   deliverables:['360° Account health in SFDC','Activity auto-capture fully operational','CS⇔Sales renewal feedback loop','RevOps weekly forecast cadence'],
  },
  {num:4,color:'#34d399',weeks:'Weeks 13–16+',title:'Warehouse Layer + PMI Playbook',
   goal:'Activate Snowflake + dbt + Census as the analytics warehouse. Surface NetSuite ARR read-only in SFDC. Build the M&A integration playbook for acquired company migrations. Audit full stack ROI.',
   integrations:[
     {tools:'Snowflake + dbt + Census',method:'ELT pipeline + reverse ETL',detail:'Snowflake warehouses SFDC + NetSuite data. dbt transforms raw tables into analytics models (pipeline velocity, cohort retention, forecast). Census reverse ETL pushes computed fields back to SFDC Account/Opportunity. Objects synced: all source objects → warehouse models → computed fields.'},
     {tools:'NetSuite → SFDC (ARR display)',method:'Read-only sync via n8n',detail:'ARR, invoice status, contract value displayed on SFDC Account as read-only fields. Finance retains NetSuite ownership. Objects synced: Subscription, Invoice → Account.'},
     {tools:'PMI Playbook',method:'Process design + documentation',detail:'Repeatable playbook for migrating acquired CRM instances. Covers data audit, dedup, field mapping, HubSpot re-engagement, NetSuite entity consolidation.'},
     {tools:'Global Architecture Review',method:'Audit + schema design',detail:'Multi-currency and multi-entity review. GDPR/CCPA audit across HubSpot, ZenDesk, Pendo. Consent management for international expansion.'},
   ],
   deliverables:['Snowflake warehouse live','Census reverse ETL to SFDC','ARR visible in SFDC (read-only)','PMI playbook v1','Stack ROI audit + renewal recs'],
  },
];

/* ═══════════════════════════════════════════════
   DASHBOARD MOCK DATA (~$15M ARR B2B SaaS)
   ═══════════════════════════════════════════════ */

const DASH_HERO = [
  { label: 'ARR',            value: '$15.2M', delta: '+18%', up: true,  sub: 'vs. $12.9M LY' },
  { label: 'Pipeline',       value: '$8.4M',  delta: '+12%', up: true,  sub: 'weighted · Q2 FY26' },
  { label: 'Win Rate',       value: '31%',    delta: '+3pp', up: true,  sub: 'vs. 28% trailing 4Q' },
  { label: 'NRR',            value: '112%',   delta: '-2pp', up: false, sub: 'target: 115%' },
  { label: 'Avg Deal Cycle', value: '68d',    delta: '-5d',  up: true,  sub: 'vs. 73d LQ' },
  { label: 'CSAT',           value: '4.3',    delta: '+0.2', up: true,  sub: 'ZenDesk · 30d rolling' },
];

const PIPELINE_BY_STAGE = [
  { stage: 'Discovery',  value: 2100000, count: 28 },
  { stage: 'Evaluation', value: 1950000, count: 19 },
  { stage: 'Proposal',   value: 1680000, count: 14 },
  { stage: 'Negotiation',value: 1420000, count: 9 },
  { stage: 'Commit',     value: 1250000, count: 7 },
];
const PIPE_COLORS = ['#60a5fa', '#60a5fa', '#f59e0b', '#f59e0b', '#34d399'];

const REVENUE_VS_TARGET = [
  { month: 'Oct', actual: 1180000, target: 1200000 },
  { month: 'Nov', actual: 1220000, target: 1250000 },
  { month: 'Dec', actual: 1340000, target: 1250000 },
  { month: 'Jan', actual: 1280000, target: 1300000 },
  { month: 'Feb', actual: 1350000, target: 1300000 },
  { month: 'Mar', actual: 1410000, target: 1350000 },
];

const FUNNEL_DATA = [
  { stage: 'MQLs',          value: 1840, fill: '#60a5fa' },
  { stage: 'SQLs',          value: 690,  fill: '#c084fc' },
  { stage: 'Opportunities', value: 310,  fill: '#f59e0b' },
  { stage: 'Proposals',     value: 142,  fill: '#f59e0b' },
  { stage: 'Closed Won',    value: 44,   fill: '#34d399' },
];

const HEALTH_DISTRIBUTION = [
  { band: 'Healthy (80–100)', count: 52, color: '#34d399' },
  { band: 'Monitor (60–79)',  count: 38, color: '#f59e0b' },
  { band: 'At Risk (40–59)', count: 22, color: '#f97316' },
  { band: 'Critical (<40)',       count: 8,  color: '#ef4444' },
];

const RENEWAL_PIPELINE = [
  { quarter: 'Q2 FY26', safe: 1850000, atRisk: 420000 },
  { quarter: 'Q3 FY26', safe: 2100000, atRisk: 380000 },
  { quarter: 'Q4 FY26', safe: 1620000, atRisk: 510000 },
  { quarter: 'Q1 FY27', safe: 1940000, atRisk: 290000 },
];

const ADOPTION_TREND = [
  { month: 'Oct', dau: 1820, mau: 4100 },
  { month: 'Nov', dau: 1950, mau: 4250 },
  { month: 'Dec', dau: 1780, mau: 4180 },
  { month: 'Jan', dau: 2040, mau: 4380 },
  { month: 'Feb', dau: 2180, mau: 4520 },
  { month: 'Mar', dau: 2290, mau: 4610 },
];

const SUPPORT_DATA = [
  { month: 'Oct', newTickets: 186, resolved: 178, csat: 4.1 },
  { month: 'Nov', newTickets: 201, resolved: 195, csat: 4.0 },
  { month: 'Dec', newTickets: 168, resolved: 172, csat: 4.2 },
  { month: 'Jan', newTickets: 224, resolved: 210, csat: 3.9 },
  { month: 'Feb', newTickets: 195, resolved: 202, csat: 4.3 },
  { month: 'Mar', newTickets: 178, resolved: 184, csat: 4.3 },
];

const CSM_WORKLOAD = [
  { csm: 'A. Martinez', accounts: 18, arr: 2800000, healthAvg: 78 },
  { csm: 'B. Chen',     accounts: 22, arr: 3100000, healthAvg: 72 },
  { csm: 'C. Patel',    accounts: 16, arr: 2400000, healthAvg: 84 },
  { csm: 'D. Wilson',   accounts: 20, arr: 2700000, healthAvg: 69 },
  { csm: 'E. Kim',      accounts: 15, arr: 2200000, healthAvg: 81 },
  { csm: 'Unassigned',  accounts: 9,  arr: 1200000, healthAvg: 54 },
];

const EXPANSION_SIGNALS = [
  { account: 'Meridian Health',   signal: 'Usage +42% MoM',           arr: 185000, score: 92 },
  { account: 'Apex Financial',    signal: 'Added 3 power users',      arr: 210000, score: 88 },
  { account: 'Coastal Logistics', signal: 'API calls 2x limit',       arr: 145000, score: 85 },
  { account: 'Northvale Corp',    signal: 'Requested enterprise SSO', arr: 98000,  score: 79 },
];

const DASH_TOOLTIP = { fontSize: 11, borderRadius: 8, border: '1px solid #313135', backgroundColor: '#18181b', color: '#afafb6' };
const DASH_AXIS = { fontSize: 10, fill: '#62626a' };
const DASH_GRID = '#313135';

function fmtCurrency(v: number) { return v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`; }
function fmtNum(v: number) { return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v); }

interface Node {
  id: string;
  name: string;
  sub: string;
  cat: string;
  x: number;
  y: number;
  w: number;
}

function getNode(id: string): Node | undefined {
  return NODES.find(n => n.id === id) as Node | undefined;
}

function edgePt(n: Node, other: Node) {
  const nw = (n.w || 128) / 2, nh = NH / 2, dx = other.x - n.x, dy = other.y - n.y;
  if (!dx && !dy) return { x: n.x, y: n.y };
  const sx = Math.abs(dx) > 0 ? nw / Math.abs(dx) : Infinity;
  const sy = Math.abs(dy) > 0 ? nh / Math.abs(dy) : Infinity;
  return { x: n.x + dx * Math.min(sx, sy), y: n.y + dy * Math.min(sx, sy) };
}

/* ── Tab button ── */
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="transition-colors duration-200 not-italic"
      style={{
        background: active ? '#1de2c4' : 'transparent',
        color: active ? '#111113' : '#95959d',
        border: `1px solid ${active ? '#1de2c4' : '#313135'}`,
        padding: '6px 16px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

/* ── Phase filter button ── */
function PhaseBtn({ active, color, onClick, children }: { active: boolean; color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="transition-colors duration-200 not-italic"
      style={{
        background: active ? color + '18' : 'transparent',
        color: active ? color : '#494950',
        border: `1px solid ${active ? color : '#313135'}`,
        padding: '4px 12px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

/* ── Sub-tab button (dashboard) ── */
function SubTabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="transition-colors duration-200 not-italic"
      style={{
        background: active ? '#1de2c418' : 'transparent',
        color: active ? '#1de2c4' : '#62626a',
        border: `1px solid ${active ? '#1de2c440' : 'transparent'}`,
        padding: '5px 14px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

/* ── Chart panel wrapper ── */
function ChartPanel({ title, span, children }: { title: string; span?: boolean; children: React.ReactNode }) {
  return (
    <div className={`not-italic ${span ? 'lg:col-span-2' : ''}`} style={{ background: '#18181b', border: '1px solid #313135', borderRadius: 8, padding: '16px 20px' }}>
      <h3 className="font-bold text-white mb-3 not-italic" style={{ fontSize: 14 }}>{title}</h3>
      <div style={{ height: 240 }}>{children}</div>
    </div>
  );
}

export default function GTMArchitecture() {
  const [tab, setTab] = useState('map');
  const [pf, setPf] = useState(0);
  const [hov, setHov] = useState<string | null>(null);
  const [openSec, setOpenSec] = useState<number | null>(null);
  const [dashSub, setDashSub] = useState<'sales' | 'accounts' | 'cs'>('sales');

  const ve = pf === 0 ? EDGES : EDGES.filter(e => e.phase <= pf);
  const ceIds = hov ? ve.filter(e => e.from === hov || e.to === hov).map(e => e.id) : [];
  const cnIds = ceIds.flatMap(id => { const e = EDGES.find(x => x.id === id); return e ? [e.from, e.to] : []; });

  return (
    <div className="not-italic" style={{ color: '#afafb6' }}>

      {/* ── Page header ── */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <p className="text-xs tracking-wide text-gray-400 mb-4 not-italic" style={{ letterSpacing: '0.1em' }}>
            GTM SYSTEMS ARCHITECTURE
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 not-italic" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Integration Map
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl not-italic" style={{ lineHeight: 1.75 }}>
            16 tools, 27 connections, field-level ownership, concurrency rules, and a 16-week phased rollout.
          </p>
        </div>
      </section>

      {/* ── Tab nav ── */}
      <div className="border-t border-b" style={{ borderColor: '#313135' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 py-4">
          <div className="flex gap-3 flex-wrap">
            {([['map', 'Map'], ['own', 'Ownership'], ['conc', 'Concurrency'], ['plan', 'Rollout'], ['dash', 'Dashboard']] as const).map(([t, l]) => (
              <TabBtn key={t} active={tab === t} onClick={() => setTab(t)}>{l}</TabBtn>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAP TAB ── */}
      {tab === 'map' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
            {/* Phase filter */}
            <div className="flex gap-3 mb-6 items-center flex-wrap">
              <span className="text-xs not-italic" style={{ color: '#494950', letterSpacing: '0.12em' }}>PHASE</span>
              {([[0, 'All', '#95959d'], [1, 'Ph 1', '#f59e0b'], [2, 'Ph 1–2', '#60a5fa'], [3, 'Ph 1–3', '#c084fc'], [4, 'All 4', '#34d399']] as const).map(([v, l, c]) => (
                <PhaseBtn key={v} active={pf === Number(v)} color={c} onClick={() => setPf(Number(v))}>{l}</PhaseBtn>
              ))}
              <span className="text-xs not-italic" style={{ color: '#494950', marginLeft: 8 }}>Hover a node to inspect</span>
            </div>

            {/* SVG map */}
            <div style={{ border: '1px solid #313135', borderRadius: 8, overflow: 'hidden', background: '#111113' }}>
              <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>
                <defs>
                  {[1, 2, 3, 4].map(p => (
                    <g key={p}>
                      <marker id={`ae${p}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0,0 0,6 8,3" fill={PC[p]} /></marker>
                      <marker id={`as${p}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto-start-reverse"><polygon points="0,0 0,6 8,3" fill={PC[p]} /></marker>
                    </g>
                  ))}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40,0L0,0 0,40" fill="none" stroke="#18181b" strokeWidth="0.5" /></pattern>
                  <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <rect width={SVG_W} height={SVG_H} fill="#111113" />
                <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

                {/* Zone labels */}
                <text x={490} y={22} textAnchor="middle" fill="#f59e0b" fontSize={8} fontFamily="inherit" opacity={0.3} letterSpacing="0.18em">{'◆'}  GOLDEN TRIANGLE  {'◆'}</text>
                <text x={330} y={40} textAnchor="middle" fill="#06b6d4" fontSize={7.5} fontFamily="inherit" opacity={0.35} letterSpacing="0.1em">TOP OF FUNNEL + ENRICHMENT</text>
                <text x={78} y={210} textAnchor="middle" fill="#34d399" fontSize={7} fontFamily="inherit" opacity={0.35}>SELLER TOOLS</text>
                <text x={940} y={215} textAnchor="middle" fill="#60a5fa" fontSize={7} fontFamily="inherit" opacity={0.35}>Q-to-C</text>
                <text x={490} y={572} textAnchor="middle" fill="#c084fc" fontSize={7.5} fontFamily="inherit" opacity={0.35} letterSpacing="0.1em">CS · SUPPORT · COLLAB</text>

                {/* Edges */}
                {ve.map(edge => {
                  const fn = getNode(edge.from), tn = getNode(edge.to);
                  if (!fn || !tn) return null;
                  const p1 = edgePt(fn, tn), p2 = edgePt(tn, fn);
                  const isAct = !hov || ceIds.includes(edge.id);
                  return (
                    <line key={edge.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                      stroke={PC[edge.phase]} strokeWidth={isAct && hov ? 2.2 : 1.4}
                      opacity={isAct ? (hov ? 1 : 0.5) : 0.04} strokeDasharray={SD[edge.sync]}
                      markerEnd={`url(#ae${edge.phase})`}
                      markerStart={edge.sync === 'bi' ? `url(#as${edge.phase})` : undefined}
                      filter={isAct && hov ? 'url(#glow)' : undefined}
                    />
                  );
                })}

                {/* Nodes */}
                {NODES.map(node => {
                  const w = node.w || 128, cat = CAT[node.cat as keyof typeof CAT];
                  const isHov = hov === node.id, isDim = hov !== null && !isHov && !cnIds.includes(node.id);
                  return (
                    <g key={node.id} opacity={isDim ? 0.1 : 1} onMouseEnter={() => setHov(node.id)} onMouseLeave={() => setHov(null)} style={{ cursor: 'default' }}>
                      {isHov && <rect x={node.x - w / 2 - 5} y={node.y - NH / 2 - 5} width={w + 10} height={NH + 10} rx={7} fill={cat.stroke} opacity={0.1} />}
                      <rect x={node.x - w / 2} y={node.y - NH / 2} width={w} height={NH} rx={4} fill={isHov ? cat.stroke + '22' : cat.bg} stroke={cat.stroke} strokeWidth={isHov ? 1.8 : 1} />
                      <text x={node.x} y={node.y - 8} textAnchor="middle" fill={cat.text} fontSize={10.5} fontWeight="700" fontFamily="inherit" letterSpacing="0.03em">{node.name}</text>
                      <text x={node.x} y={node.y + 9} textAnchor="middle" fill={cat.text} opacity={0.45} fontSize={6.5} fontFamily="inherit">
                        {node.sub.length > 42 ? node.sub.slice(0, 42) + '…' : node.sub}
                      </text>
                    </g>
                  );
                })}

                {/* Tooltip */}
                {hov && (() => {
                  const node = getNode(hov);
                  if (!node) return null;
                  const conn = ve.filter(e => e.from === hov || e.to === hov);
                  if (!conn.length) return null;
                  const ttW = 260, lH = 38, ttH = 22 + conn.length * lH + 6;
                  let ttX = node.x > SVG_W * 0.6 ? node.x - (node.w || 128) / 2 - ttW - 10 : node.x + (node.w || 128) / 2 + 10;
                  let ttY = Math.max(4, Math.min(node.y - ttH / 2, SVG_H - ttH - 4));
                  ttX = Math.max(4, Math.min(ttX, SVG_W - ttW - 4));
                  return (
                    <g>
                      <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={4} fill="#111113" stroke="#313135" strokeWidth={1} opacity={0.98} />
                      <text x={ttX + 8} y={ttY + 15} fill="#494950" fontSize={7.5} fontFamily="inherit" letterSpacing="0.1em">{conn.length} CONNECTION{conn.length > 1 ? 'S' : ''}</text>
                      {conn.map((e, i) => {
                        const other = getNode(e.from === hov ? e.to : e.from);
                        const arrow = e.sync === 'bi' ? '⇄' : e.from === hov ? '→' : '←';
                        return (
                          <g key={e.id}>
                            <text x={ttX + 8} y={ttY + 27 + i * lH} fill={PC[e.phase]} fontSize={10} fontWeight="700" fontFamily="inherit">{arrow} {other?.name}</text>
                            <text x={ttX + 8} y={ttY + 39 + i * lH} fill="#494950" fontSize={7} fontFamily="inherit">{SL[e.sync]} · Ph.{e.phase}</text>
                            <text x={ttX + 8} y={ttY + 49 + i * lH} fill="#62626a" fontSize={6.5} fontFamily="inherit">{e.objs}</text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 flex-wrap items-center text-xs not-italic" style={{ color: '#494950' }}>
              <span style={{ letterSpacing: '0.1em' }}>NODES</span>
              {Object.entries(CAT).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: v.stroke + '20', border: `1px solid ${v.stroke}` }} />
                  <span>{v.label}</span>
                </div>
              ))}
              <div style={{ width: 1, height: 12, background: '#313135' }} />
              {([['bi', '⇄ Bi'], ['uni', '→ Uni'], ['append', '+ Append'], ['read', '◦ Read']] as const).map(([t, l]) => (
                <div key={t} className="flex items-center gap-1.5">
                  <svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke="#494950" strokeWidth="1.5" strokeDasharray={SD[t]} /></svg>
                  <span>{l}</span>
                </div>
              ))}
              <div style={{ width: 1, height: 12, background: '#313135' }} />
              {[1, 2, 3, 4].map(p => (
                <div key={p} className="flex items-center gap-1.5">
                  <div style={{ width: 12, height: 2, background: PC[p] }} />
                  <span>Ph.{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── OWNERSHIP TAB ── */}
      {tab === 'own' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
            <h2 className="text-xl font-bold text-white mb-2 not-italic">Field Ownership Matrix</h2>
            <p className="text-sm mb-8 not-italic" style={{ color: '#62626a' }}>
              Who writes, who reads, and how conflicts resolve.
            </p>

            <div className="space-y-8">
              {OWNERSHIP.map((sec, si) => (
                <div key={si}>
                  <button
                    className="flex items-center gap-3 mb-3 cursor-pointer w-full text-left not-italic"
                    onClick={() => setOpenSec(openSec === si ? null : si)}
                    style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
                  >
                    <div style={{ width: 3, height: 16, background: sec.color, borderRadius: 2 }} />
                    <span className="font-bold not-italic" style={{ color: sec.color, fontSize: 15 }}>{sec.cat}</span>
                    <span className="ml-auto text-xs" style={{ color: '#494950' }}>{openSec === si ? '▲' : '▼'}</span>
                  </button>

                  {(openSec === si || openSec === null) && (
                    <div style={{ border: `1px solid ${sec.color}20`, borderRadius: 6, overflow: 'hidden' }}>
                      {/* Table header */}
                      <div className="hidden md:grid not-italic" style={{ gridTemplateColumns: '160px 150px 1fr 110px 1fr', background: '#18181b', borderBottom: `1px solid ${sec.color}18` }}>
                        {['Field', 'Owner', 'Readers', 'Sync', 'Conflict Rule'].map(h => (
                          <div key={h} className="text-xs not-italic" style={{ padding: '8px 12px', color: '#494950', letterSpacing: '0.08em', borderRight: '1px solid #313135' }}>{h.toUpperCase()}</div>
                        ))}
                      </div>
                      {/* Rows */}
                      {sec.rows.map((row, ri) => (
                        <div key={ri} className="grid not-italic" style={{
                          gridTemplateColumns: '160px 150px 1fr 110px 1fr',
                          borderBottom: ri < sec.rows.length - 1 ? '1px solid #18181b' : 'none',
                          background: ri % 2 === 0 ? 'transparent' : '#18181b',
                        }}>
                          <div className="font-semibold not-italic" style={{ padding: '10px 12px', fontSize: 13, color: '#afafb6', borderRight: '1px solid #313135' }}>{row.field}</div>
                          <div className="font-bold not-italic" style={{ padding: '10px 12px', fontSize: 13, color: sec.color, borderRight: '1px solid #313135' }}>{row.owner}</div>
                          <div className="not-italic" style={{ padding: '10px 12px', fontSize: 12, color: '#62626a', borderRight: '1px solid #313135', lineHeight: 1.65 }}>{row.readers}</div>
                          <div className="not-italic" style={{ padding: '10px 12px', fontSize: 12, borderRight: '1px solid #313135' }}>
                            <span style={{ color: row.sync === 'bi' ? '#f59e0b' : row.sync === 'append' ? '#34d399' : row.sync === 'read' ? '#494950' : row.sync === 'none' ? '#313135' : '#60a5fa' }}>
                              {SL[row.sync] || row.sync || '—'}
                            </span>
                          </div>
                          <div className="not-italic" style={{ padding: '10px 12px', fontSize: 12, color: '#62626a', lineHeight: 1.7 }}>{row.rule}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONCURRENCY TAB ── */}
      {tab === 'conc' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12" style={{ maxWidth: 860 }}>
            <h2 className="text-xl font-bold text-white mb-2 not-italic">Concurrency & Conflict Resolution</h2>
            <p className="text-sm mb-8 not-italic" style={{ color: '#62626a' }}>
              Rules enforced at the n8n middleware layer.
            </p>

            <div className="space-y-4">
              {CONCURRENCY.map((r, i) => (
                <div key={i} style={{ border: '1px solid #313135', borderLeft: '3px solid #1de2c4', borderRadius: '0 6px 6px 0', overflow: 'hidden' }}>
                  <div className="flex items-center gap-3 not-italic" style={{ background: '#1de2c408', padding: '10px 16px', borderBottom: '1px solid #313135' }}>
                    <span className="font-bold not-italic" style={{ color: '#1de2c4', fontSize: 11, letterSpacing: '0.12em' }}>RULE {String(i + 1).padStart(2, '0')}</span>
                    <span className="font-bold text-white not-italic" style={{ fontSize: 15 }}>{r.rule}</span>
                  </div>
                  <div className="not-italic" style={{ padding: '12px 16px', fontSize: 14, color: '#62626a', lineHeight: 1.85, background: '#18181b' }}>
                    {r.detail}
                  </div>
                </div>
              ))}
            </div>

            {/* Unified n8n middleware */}
            <div className="mt-8 not-italic" style={{ border: '1px solid #313135', borderRadius: 6, padding: '16px 20px', background: '#18181b' }}>
              <p className="text-xs font-bold mb-3 not-italic" style={{ color: '#494950', letterSpacing: '0.1em' }}>WHY ONE MIDDLEWARE (n8n)</p>
              <p className="not-italic" style={{ fontSize: 14, color: '#62626a', lineHeight: 1.85 }}>
                <span style={{ color: '#1de2c4' }}>n8n</span> handles everything: (1) PDL inbound + outbound enrichment (new contact → PDL lookup → upsert back), (2) Gong → Claude API → SFDC MEDDPICC write (call transcript → Claude extracts structured fields → writes to Opp), and (3) all cross-system CRM/ERP sync with field ownership enforcement, update locking, and conflict resolution. One middleware means one audit log, one set of error handling, one place to debug. No split failure modes between two different platforms.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── PLAN TAB ── */}
      {tab === 'plan' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12" style={{ maxWidth: 960 }}>
            <h2 className="text-xl font-bold text-white mb-2 not-italic">16-Week Rollout</h2>
            <p className="text-sm mb-8 not-italic" style={{ color: '#62626a' }}>
              16 tools, 27 connections, n8n as sole middleware, Snowflake warehouse.
            </p>

            <div className="space-y-6">
              {PHASES.map(ph => (
                <div key={ph.num} style={{ border: `1px solid ${ph.color}18`, borderLeft: `3px solid ${ph.color}`, borderRadius: '0 6px 6px 0', overflow: 'hidden' }}>
                  {/* Phase header */}
                  <div className="flex items-baseline gap-3 flex-wrap not-italic" style={{ background: ph.color + '0c', padding: '12px 16px', borderBottom: `1px solid ${ph.color}18` }}>
                    <span className="font-bold not-italic" style={{ color: ph.color, fontSize: 11, letterSpacing: '0.15em' }}>PHASE {ph.num}</span>
                    <span className="font-bold text-white not-italic" style={{ fontSize: 16 }}>{ph.title}</span>
                    <span className="ml-auto text-xs not-italic" style={{ color: '#494950' }}>{ph.weeks}</span>
                  </div>

                  {/* Goal */}
                  <div className="not-italic" style={{ padding: '10px 16px', borderBottom: `1px solid ${ph.color}10` }}>
                    <span className="text-xs not-italic" style={{ color: '#494950', letterSpacing: '0.08em' }}>GOAL </span>
                    <span className="not-italic" style={{ fontSize: 14, color: '#62626a', lineHeight: 1.75 }}>{ph.goal}</span>
                  </div>

                  {/* Integrations */}
                  <div style={{ padding: '12px 16px' }}>
                    {ph.integrations.map((intg, i) => (
                      <div key={i} style={{
                        marginBottom: i < ph.integrations.length - 1 ? 12 : 0,
                        paddingBottom: i < ph.integrations.length - 1 ? 12 : 0,
                        borderBottom: i < ph.integrations.length - 1 ? '1px solid #18181b' : 'none',
                      }}>
                        <div className="flex gap-3 items-baseline mb-1 flex-wrap not-italic">
                          <span className="font-bold not-italic" style={{ color: ph.color, fontSize: 14 }}>{intg.tools}</span>
                          <span className="text-xs not-italic" style={{ color: '#494950' }}>via {intg.method}</span>
                        </div>
                        <p className="not-italic" style={{ fontSize: 13, color: '#62626a', lineHeight: 1.8 }}>{intg.detail}</p>
                      </div>
                    ))}
                  </div>

                  {/* Deliverables */}
                  <div className="not-italic" style={{ background: '#18181b', padding: '10px 16px', borderTop: `1px solid ${ph.color}15` }}>
                    <p className="text-xs font-bold mb-3 not-italic" style={{ color: '#494950', letterSpacing: '0.1em' }}>DELIVERABLES</p>
                    <div className="flex flex-wrap gap-2">
                      {ph.deliverables.map((d, i) => (
                        <span key={i} className="not-italic" style={{
                          background: ph.color + '10',
                          border: `1px solid ${ph.color}28`,
                          borderRadius: 4,
                          padding: '4px 10px',
                          fontSize: 12,
                          color: ph.color,
                        }}>{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary stats */}
            <div className="mt-8 flex gap-8 flex-wrap items-start not-italic" style={{ border: '1px solid #313135', borderRadius: 6, padding: '16px 20px', background: '#18181b' }}>
              {[['16', 'tools integrated'], ['27', 'data connections'], ['16', 'weeks to full build'], ['1', 'enrichment layer\nPDL via n8n'], ['1', 'middleware\nn8n (sole)'], ['1', 'warehouse\nSnowflake + dbt']].map(([n, l]) => (
                <div key={l} className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-white not-italic" style={{ lineHeight: 1 }}>{n}</span>
                  <span className="text-xs not-italic" style={{ color: '#494950', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DASHBOARD TAB ── */}
      {tab === 'dash' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
            <h2 className="text-xl font-bold text-white mb-2 not-italic">Executive Dashboard</h2>
            <p className="text-sm mb-6 not-italic" style={{ color: '#62626a' }}>
              Sample data for a ~$15M ARR B2B SaaS company.
            </p>

            {/* Hero KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {DASH_HERO.map(kpi => (
                <div key={kpi.label} className="not-italic" style={{ background: '#18181b', border: '1px solid #313135', borderRadius: 8, padding: '14px 16px' }}>
                  <p className="not-italic" style={{ fontSize: 10, color: '#62626a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{kpi.label}</p>
                  <p className="font-bold text-white not-italic" style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>{kpi.value}</p>
                  <p className="not-italic" style={{ fontSize: 11, marginBottom: 2 }}>
                    <span style={{ color: kpi.up ? '#34d399' : '#ef4444' }}>{kpi.up ? '▲' : '▼'} {kpi.delta}</span>
                  </p>
                  <p className="not-italic" style={{ fontSize: 10, color: '#494950' }}>{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Sub-tab nav */}
            <div className="flex gap-2 mb-6">
              {([['sales', 'Sales'], ['accounts', 'Accounts'], ['cs', 'CS']] as const).map(([id, label]) => (
                <SubTabBtn key={id} active={dashSub === id} onClick={() => setDashSub(id)}>{label}</SubTabBtn>
              ))}
            </div>

            {/* ── SALES ── */}
            {dashSub === 'sales' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartPanel title="Pipeline by Stage" span>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PIPELINE_BY_STAGE} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={DASH_GRID} horizontal={false} />
                      <XAxis type="number" tick={DASH_AXIS} tickFormatter={fmtCurrency} />
                      <YAxis type="category" dataKey="stage" tick={DASH_AXIS} width={90} />
                      <RTooltip contentStyle={DASH_TOOLTIP} formatter={(v: number) => fmtCurrency(v)} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {PIPELINE_BY_STAGE.map((_, i) => <Cell key={i} fill={PIPE_COLORS[i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Revenue vs Target (Monthly)">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={REVENUE_VS_TARGET} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={DASH_GRID} />
                      <XAxis dataKey="month" tick={DASH_AXIS} />
                      <YAxis tick={DASH_AXIS} tickFormatter={fmtCurrency} />
                      <RTooltip contentStyle={DASH_TOOLTIP} formatter={(v: number) => fmtCurrency(v)} />
                      <Bar dataKey="actual" fill="#1de2c4" radius={[4, 4, 0, 0]} name="Actual" />
                      <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Funnel Conversion (Trailing 6 Months)">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={DASH_GRID} horizontal={false} />
                      <XAxis type="number" tick={DASH_AXIS} tickFormatter={fmtNum} />
                      <YAxis type="category" dataKey="stage" tick={DASH_AXIS} width={100} />
                      <RTooltip contentStyle={DASH_TOOLTIP} formatter={(v: number) => fmtNum(v)} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {FUNNEL_DATA.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>
              </div>
            )}

            {/* ── ACCOUNTS ── */}
            {dashSub === 'accounts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartPanel title="Health Score Distribution (120 Accounts)">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={HEALTH_DISTRIBUTION} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={DASH_GRID} horizontal={false} />
                      <XAxis type="number" tick={DASH_AXIS} />
                      <YAxis type="category" dataKey="band" tick={DASH_AXIS} width={130} />
                      <RTooltip contentStyle={DASH_TOOLTIP} formatter={(v: number) => `${v} accounts`} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {HEALTH_DISTRIBUTION.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Renewal Pipeline (ARR at Risk)">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={RENEWAL_PIPELINE} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={DASH_GRID} />
                      <XAxis dataKey="quarter" tick={DASH_AXIS} />
                      <YAxis tick={DASH_AXIS} tickFormatter={fmtCurrency} />
                      <RTooltip contentStyle={DASH_TOOLTIP} formatter={(v: number) => fmtCurrency(v)} />
                      <Legend wrapperStyle={{ fontSize: 11, color: '#62626a' }} />
                      <Bar dataKey="safe" stackId="a" fill="#34d399" name="Safe" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="atRisk" stackId="a" fill="#f59e0b" name="At Risk" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Product Adoption Trend (Pendo)" span>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ADOPTION_TREND} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={DASH_GRID} />
                      <XAxis dataKey="month" tick={DASH_AXIS} />
                      <YAxis tick={DASH_AXIS} tickFormatter={fmtNum} />
                      <RTooltip contentStyle={DASH_TOOLTIP} formatter={(v: number) => fmtNum(v)} />
                      <Legend wrapperStyle={{ fontSize: 11, color: '#62626a' }} />
                      <Area type="monotone" dataKey="mau" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} strokeWidth={2} name="MAU" />
                      <Area type="monotone" dataKey="dau" stroke="#c084fc" fill="#c084fc" fillOpacity={0.2} strokeWidth={2} name="DAU" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartPanel>
              </div>
            )}

            {/* ── CS ── */}
            {dashSub === 'cs' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartPanel title="Support Volume & CSAT (ZenDesk)">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={SUPPORT_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={DASH_GRID} />
                      <XAxis dataKey="month" tick={DASH_AXIS} />
                      <YAxis yAxisId="left" tick={DASH_AXIS} />
                      <YAxis yAxisId="right" orientation="right" tick={DASH_AXIS} domain={[3, 5]} />
                      <RTooltip contentStyle={DASH_TOOLTIP} />
                      <Legend wrapperStyle={{ fontSize: 11, color: '#62626a' }} />
                      <Bar yAxisId="left" dataKey="newTickets" fill="#60a5fa" name="New" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="left" dataKey="resolved" fill="#34d399" name="Resolved" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="csat" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} name="CSAT" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="CSM Workload (Account Coverage)">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CSM_WORKLOAD} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={DASH_GRID} horizontal={false} />
                      <XAxis type="number" tick={DASH_AXIS} />
                      <YAxis type="category" dataKey="csm" tick={DASH_AXIS} width={90} />
                      <RTooltip contentStyle={DASH_TOOLTIP} formatter={(v: number, name: string) => name === 'arr' ? fmtCurrency(v) : v} />
                      <Bar dataKey="accounts" fill="#c084fc" radius={[0, 4, 4, 0]} name="Accounts" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>

                {/* Expansion signals table */}
                <div className="lg:col-span-2 not-italic" style={{ background: '#18181b', border: '1px solid #313135', borderRadius: 8, padding: '16px 20px' }}>
                  <h3 className="font-bold text-white mb-3 not-italic" style={{ fontSize: 14 }}>Expansion Signals</h3>
                  <div style={{ overflow: 'hidden', borderRadius: 6, border: '1px solid #313135' }}>
                    <div className="hidden md:grid not-italic" style={{ gridTemplateColumns: '1fr 1fr 100px 80px', background: '#111113', borderBottom: '1px solid #313135' }}>
                      {['Account', 'Signal', 'ARR', 'Health'].map(h => (
                        <div key={h} className="not-italic" style={{ padding: '8px 12px', fontSize: 10, color: '#494950', letterSpacing: '0.08em' }}>{h.toUpperCase()}</div>
                      ))}
                    </div>
                    {EXPANSION_SIGNALS.map((row, i) => (
                      <div key={i} className="grid not-italic" style={{
                        gridTemplateColumns: '1fr 1fr 100px 80px',
                        borderBottom: i < EXPANSION_SIGNALS.length - 1 ? '1px solid #313135' : 'none',
                        background: i % 2 === 0 ? 'transparent' : '#111113',
                      }}>
                        <div className="font-semibold text-white not-italic" style={{ padding: '10px 12px', fontSize: 13 }}>{row.account}</div>
                        <div className="not-italic" style={{ padding: '10px 12px', fontSize: 12, color: '#1de2c4' }}>{row.signal}</div>
                        <div className="not-italic" style={{ padding: '10px 12px', fontSize: 12, color: '#afafb6' }}>{fmtCurrency(row.arr)}</div>
                        <div className="not-italic" style={{ padding: '10px 12px' }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: row.score >= 85 ? '#34d39918' : '#f59e0b18',
                            color: row.score >= 85 ? '#34d399' : '#f59e0b',
                          }}>{row.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <p className="mt-6 text-xs not-italic" style={{ color: '#494950' }}>
              SAMPLE DATA — Sources: Salesforce, HubSpot, Vitally, Pendo, ZenDesk, NetSuite, Snowflake
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
