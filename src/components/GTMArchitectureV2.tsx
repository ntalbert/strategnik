import { useState } from "react";

const SVG_W = 1040, SVG_H = 600, NH = 46;
const LY = { ph4: 58, ph3: 152, ph2: 258, busT: 338, busB: 384, ph1: 468 };

const CAT: Record<string, { stroke: string; bg: string; text: string; label: string }> = {
  core:     { stroke: '#f59e0b', bg: '#1c120544', text: '#fbbf24', label: 'Golden Triangle' },
  tof:      { stroke: '#06b6d4', bg: '#04203044', text: '#67e8f9', label: 'Top of Funnel' },
  auto:     { stroke: '#22d3ee', bg: '#04203044', text: '#a5f3fc', label: 'Automation' },
  seller:   { stroke: '#34d399', bg: '#04201844', text: '#6ee7b7', label: 'Seller Tools' },
  sales:    { stroke: '#60a5fa', bg: '#0f1f3d44', text: '#93c5fd', label: 'Quote-to-Cash' },
  cs:       { stroke: '#c084fc', bg: '#1a083044', text: '#d8b4fe', label: 'CS / Support' },
  collab:   { stroke: '#494950', bg: '#18181b44', text: '#95959d', label: 'Collaboration' },
  ai:       { stroke: '#f0abfc', bg: '#2a083044', text: '#f5d0fe', label: 'AI Decisioning' },
  defer:    { stroke: '#334155', bg: '#18181b22', text: '#475569', label: 'Deferred' },
  validate: { stroke: '#fb923c', bg: '#1c120544', text: '#fdba74', label: 'Validate' },
};
const PC: Record<number, string> = { 1: '#f59e0b', 2: '#60a5fa', 3: '#c084fc', 4: '#334155' };
const SD: Record<string, string | undefined> = { bi: undefined, uni: undefined, append: '2 5', read: '1 7' };
const SL: Record<string, string> = { bi: '⇄ Bidirectional', uni: '→ Unidirectional', append: '+ Append-only', read: '◦ Read-only' };
const VIA_COLOR: Record<string, string> = { Syncari: '#f59e0b', Celigo: '#60a5fa', n8n: '#22d3ee', DIRECT: '#494950' };
const VIA_SHORT: Record<string, string> = { Syncari: 'SYN', Celigo: 'CEL', n8n: 'n8n', DIRECT: '→' };

const NODES = [
  { id:'vib', name:'Vibe Prospecting',  cat:'tof',      x:138, y:LY.ph1, w:168, sub:'OWNS: ICP lists · account signals (Explorium)', phase:1 },
  { id:'n8n', name:'PDL + n8n',         cat:'auto',     x:340, y:LY.ph1, w:130, sub:'INBOUND ENRICH · pay-per-match · trigger guard', phase:1 },
  { id:'hs',  name:'HubSpot',           cat:'core',     x:546, y:LY.ph1, w:158, sub:'OWNS: Contact · Lead · MQL · Comms Sequences', phase:1 },
  { id:'sf',  name:'Salesforce',        cat:'core',     x:738, y:LY.ph1, w:172, sub:'OWNS: Acct · Opp · Stage · ACV · Close Date', phase:1 },
  { id:'ns',  name:'NetSuite',          cat:'core',     x:934, y:LY.ph1, w:152, sub:'OWNS: Order · RevRec · Commission', phase:1 },
  { id:'gon', name:'Gong',              cat:'seller',   x:80,  y:LY.ph2, w:118, sub:'OWNS: Call Intel · APPEND Activity to SFDC', phase:2 },
  { id:'llm', name:'Claude · MEDDPICC', cat:'ai',  x:226, y:LY.ph2, w:152, sub:'Transcript → extract MEDDPICC → SFDC Opp', phase:2 },
  { id:'chi', name:'Chili Piper',       cat:'seller',   x:390, y:LY.ph2, w:122, sub:'OWNS: Scheduling · creates SFDC Activity/Event', phase:2 },
  { id:'pen', name:'Pendo',             cat:'cs',       x:528, y:LY.ph2, w:116, sub:'OWNS: Usage · DAU/MAU · Adoption', phase:2 },
  { id:'cpq', name:'DealHub CPQ',       cat:'sales',    x:720, y:LY.ph2, w:130, sub:'OWNS: Quote · Pricing · Approvals', phase:2 },
  { id:'pan', name:'PandaDoc / CLM',    cat:'sales',    x:908, y:LY.ph2, w:138, sub:'OWNS: Contract execution', phase:2 },
  { id:'vit', name:'Vitally',           cat:'cs',       x:88,  y:LY.ph3, w:124, sub:'OWNS: Health Score · Renewal Risk', phase:3 },
  { id:'zen', name:'ZenDesk',           cat:'validate', x:252, y:LY.ph3, w:136, sub:'VALIDATE: replace w/ HubSpot Service Hub?', phase:3 },
  { id:'lin', name:'LinkedIn SNav',     cat:'validate', x:504, y:LY.ph3, w:140, sub:'VALIDATE: audit per-seat usage before renewal', phase:3 },
  { id:'slk', name:'Slack',             cat:'collab',   x:700, y:LY.ph3, w:104, sub:'RECEIVES: Opportunity + health alerts only', phase:3 },
  { id:'gws', name:'Google WS',         cat:'collab',   x:898, y:LY.ph3, w:124, sub:'OWNS: Email Activity · Calendar Events', phase:3 },
  { id:'cla', name:'Clari',             cat:'defer',    x:190, y:LY.ph4, w:160, sub:'DEFERRED — activate when AE team > 20 reps', phase:4 },
];

const EDGES = [
  { id:'e1',   from:'hs',  to:'sf',  sync:'bi',     phase:1, via:'Syncari' },
  { id:'e2',   from:'sf',  to:'ns',  sync:'bi',     phase:1, via:'Celigo' },
  { id:'e5',   from:'vib', to:'hs',  sync:'uni',    phase:1, via:'Syncari' },
  { id:'e6',   from:'vib', to:'sf',  sync:'uni',    phase:1, via:'Syncari' },
  { id:'e7',   from:'hs',  to:'n8n', sync:'uni',    phase:1, via:'n8n' },
  { id:'e8',   from:'n8n', to:'hs',  sync:'uni',    phase:1, via:'n8n' },
  { id:'e9',   from:'gon', to:'sf',  sync:'append', phase:2, via:'DIRECT' },
  { id:'egai', from:'gon', to:'llm', sync:'uni',    phase:2, via:'n8n' },
  { id:'eai',  from:'llm', to:'sf',  sync:'uni',    phase:2, via:'n8n' },
  { id:'e10',  from:'chi', to:'sf',  sync:'uni',    phase:2, via:'DIRECT' },
  { id:'e13',  from:'pen', to:'sf',  sync:'uni',    phase:2, via:'DIRECT' },
  { id:'e14',  from:'pen', to:'vit', sync:'uni',    phase:2, via:'DIRECT' },
  { id:'e15',  from:'sf',  to:'cpq', sync:'uni',    phase:2, via:'DIRECT' },
  { id:'e16',  from:'cpq', to:'sf',  sync:'uni',    phase:2, via:'DIRECT' },
  { id:'e17',  from:'cpq', to:'ns',  sync:'uni',    phase:2, via:'Celigo' },
  { id:'e18',  from:'pan', to:'sf',  sync:'bi',     phase:2, via:'DIRECT' },
  { id:'e19',  from:'pan', to:'ns',  sync:'uni',    phase:2, via:'Celigo' },
  { id:'e20',  from:'vit', to:'sf',  sync:'bi',     phase:3, via:'DIRECT' },
  { id:'e21',  from:'zen', to:'sf',  sync:'uni',    phase:3, via:'DIRECT' },
  { id:'e22',  from:'zen', to:'vit', sync:'uni',    phase:3, via:'DIRECT' },
  { id:'e24',  from:'lin', to:'sf',  sync:'read',   phase:3, via:'DIRECT' },
  { id:'e25',  from:'sf',  to:'slk', sync:'uni',    phase:3, via:'n8n' },
  { id:'e26',  from:'gws', to:'hs',  sync:'bi',     phase:3, via:'DIRECT' },
  { id:'e27',  from:'gws', to:'sf',  sync:'uni',    phase:3, via:'DIRECT' },
  { id:'e31',  from:'vit', to:'hs',  sync:'uni',    phase:3, via:'Syncari' },
  { id:'e28',  from:'sf',  to:'cla', sync:'uni',    phase:4, deferred:true, via:'DIRECT' },
  { id:'e29',  from:'gon', to:'cla', sync:'uni',    phase:4, deferred:true, via:'DIRECT' },
  { id:'e30',  from:'ns',  to:'sf',  sync:'read',   phase:4, deferred:true, via:'Celigo' },
];

const SFDC_OBJ: Record<string, string> = {
  e1:'Contact · Lead', e2:'Opportunity', e5:'Contact', e6:'Account',
  e7:'Contact (trigger)', e8:'Contact', e9:'Activity [Task]',
  egai:'Transcript (webhook)', eai:'Opportunity [MEDDPICC]',
  e10:'Activity [Event]', e13:'Account [Usage__c]', e14:'Account [Health input]',
  e15:'Opportunity', e16:'Opportunity', e17:'Order', e18:'Opportunity',
  e19:'Order · RevRec', e20:'Account [Health__c]', e21:'Account [Support__c] · Case',
  e22:'Account [Health__c]', e24:'Contact · Account (overlay)',
  e25:'Opportunity [Stage alerts]', e26:'Contact [Email]', e27:'Activity [Task]',
  e31:'Contact [lifecycle trigger]', e30:'Account [ARR__c]',
};
const SFDC_SHORT: Record<string, string> = {
  e1:'[Ctct·Lead]', e2:'[Opp]', e5:'[Ctct]', e6:'[Acct]',
  e7:'[Ctct]', e8:'[Ctct]', e9:'[Act]', egai:'[Transcript]', eai:'[Opp·MEDDPICC]',
  e10:'[Event]', e13:'[Acct]', e14:'[Acct]', e15:'[Opp]', e16:'[Opp]', e17:'[Order]',
  e18:'[Opp]', e19:'[Order]', e20:'[Acct]', e21:'[Acct·Case]', e22:'[Acct]',
  e24:'[Ctct·Acct]', e25:'[Opp]', e26:'[Ctct]', e27:'[Act]', e31:'[Ctct]', e30:'[Acct]',
};

const OWNERSHIP = [
  { cat:'Core Records', color:'#f59e0b', rows:[
    {field:'Contact record',            sfdcObj:'Contact',       owner:'HubSpot',     sync:'bi',     rule:'HubSpot wins. Syncari enforces. SFDC blank-field only.'},
    {field:'Lead / MQL',                sfdcObj:'Lead',          owner:'HubSpot',     sync:'uni',    rule:'HubSpot owns through MQL gate. SFDC converts on SQL.'},
    {field:'Account firmographics',     sfdcObj:'Account',       owner:'Salesforce',  sync:'bi',     rule:'SFDC wins. Enrichment upsert-only. 30-day lock after rep edit.'},
    {field:'Opportunity',               sfdcObj:'Opportunity',   owner:'Salesforce',  sync:'uni',    rule:'Reps + SFDC workflows only. No downstream write-back.'},
  ]},
  { cat:'AI-Assisted MEDDPICC', color:'#f0abfc', rows:[
    {field:'Metrics',                   sfdcObj:'Metrics__c [Opp]',           owner:'Claude + Rep', sync:'uni', rule:'AI writes ≥80% confidence. Below → Activity Note for rep.'},
    {field:'Economic Buyer',            sfdcObj:'Economic_Buyer__c [Opp]',    owner:'Claude + Rep', sync:'uni', rule:'AI writes ≥85%. Highest threshold — wrong EB kills deals.'},
    {field:'Decision Criteria/Process', sfdcObj:'Decision_* [Opp]',           owner:'Claude + Rep', sync:'uni', rule:'AI writes ≥75%. Structured format enforced by n8n.'},
    {field:'Identify Pain / Champion',  sfdcObj:'Pain__c Champion__c [Opp]',  owner:'Claude + Rep', sync:'uni', rule:'≥85% and ≥80% respectively.'},
    {field:'Paper Process / Competition',sfdcObj:'Paper__c Comp__c [Opp]',    owner:'Claude + Rep', sync:'uni', rule:'≥72% and ≥78% respectively.'},
    {field:'MEDDPICC Score',            sfdcObj:'MEDDPICC_Score__c [Opp]',    owner:'n8n (calc)',   sync:'uni', rule:'% of 8 fields populated. Slack alert if <40% at Stage 3+.'},
  ]},
  { cat:'Enrichment', color:'#06b6d4', rows:[
    {field:'ICP prospect lists',        sfdcObj:'Contact (import)', owner:'Vibe Prospecting', sync:'uni', rule:'Explorium MCP → HubSpot Contact. Dedup at Syncari.'},
    {field:'Account signals',           sfdcObj:'Account [custom]', owner:'Vibe Prospecting', sync:'uni', rule:'Dedicated SFDC field. Not merged with rep data.'},
    {field:'Inbound contact enrich',    sfdcObj:'Contact',          owner:'PDL via n8n',      sync:'uni', rule:'Trigger: new HubSpot Contact. PDL upsert, blank fields only.'},
  ]},
  { cat:'Activity + Revenue', color:'#34d399', rows:[
    {field:'Call intel',                sfdcObj:'Activity [Task]',         owner:'Gong',           sync:'append', rule:'Append-only to SFDC Activity Timeline.'},
    {field:'MEDDPICC write',            sfdcObj:'Opportunity [custom]',    owner:'Claude via n8n', sync:'uni',    rule:'Confidence gate. Above → write. Below → Activity Note.'},
    {field:'Scheduling',                sfdcObj:'Activity [Event]',        owner:'Chili Piper',    sync:'uni',    rule:'Every meeting auto-creates SFDC Activity (Event).'},
    {field:'Quote / pricing',           sfdcObj:'Opportunity [Amount]',    owner:'DealHub CPQ',    sync:'uni',    rule:'SFDC Opp triggers CPQ. Approved amount back only.'},
    {field:'Contract',                  sfdcObj:'Opportunity [Stage]',     owner:'PandaDoc',       sync:'uni',    rule:'Signed → SFDC Stage → Celigo → NetSuite Order.'},
    {field:'Email activity',            sfdcObj:'Activity [Task]',         owner:'Google WS',      sync:'bi',     rule:'HubSpot gets engagement. SFDC gets Activity Task.'},
  ]},
  { cat:'CS + Financial', color:'#c084fc', rows:[
    {field:'Health score',              sfdcObj:'Account [Health__c]',   owner:'Vitally',              sync:'bi',   rule:'Vitally calculates. SFDC displays. HubSpot gets trigger.'},
    {field:'Renewal risk',              sfdcObj:'Account [Renewal__c]',  owner:'Vitally→HubSpot', sync:'uni',  rule:'Risk flag → HubSpot Contact → renewal sequence.'},
    {field:'Product usage',             sfdcObj:'Account [Usage__c]',    owner:'Pendo',                sync:'uni',  rule:'Unidirectional. No GTM write to product data.'},
    {field:'Support tickets',           sfdcObj:'Account [Support__c]',  owner:'ZenDesk*',             sync:'uni',  rule:'*Validate vs HubSpot Service Hub. High-sev → Vitally degradation.'},
    {field:'ARR display',              sfdcObj:'Account [ARR__c]',      owner:'NetSuite',             sync:'read', rule:'Read-only via Celigo. Finance owns in NetSuite.'},
  ]},
];

const AUDIT_ITEMS = [
  { tool:'Apollo.io',          status:'CUT',      color:'#ef4444', icon:'✕', save:'$5–15k / yr',
    reason:'Redundant with Vibe Prospecting + PDL',
    overlap:'ICP list building covered by Vibe Prospecting. Inbound enrichment covered by PDL via n8n. Running Apollo + Vibe + PDL = paying 3× for significantly overlapping data.',
    keepIf:'Reps are actively running outbound sequences through Apollo (not just enrichment). If sequences move to HubSpot Workflows, Apollo is dead weight entirely. Evaluate: migrate sequences to HubSpot and cut Apollo.' },
  { tool:'Vector',             status:'CUT',      color:'#ef4444', icon:'✕', save:'$15–30k / yr',
    reason:'Redundant intent signal layer',
    overlap:'Apollo mid-tier includes intent signals. LinkedIn SNav provides engagement signals. HubSpot tracks behavioral intent natively. Three overlapping intent signal sources with no differentiated data coverage for Crisp’s CPG/retail ICP.',
    keepIf:'You can demonstrate Vector surfaces intent signals that Apollo and LinkedIn are missing AND those signals convert to pipeline. At scale, Bombora or G2 intent would be the right upgrade — not Vector.' },
  { tool:'Clari',              status:'DEFERRED', color:'#f59e0b', icon:'⏸', save:'$20–40k / yr',
    reason:'Premature at current scale',
    overlap:'Gong Forecast is included in Gong license. SFDC Einstein Forecasting is included in Enterprise. Clari earns its keep when VP Sales manages 20+ AEs and needs automated roll-up and deal inspection AI.',
    keepIf:'AE team exceeds 20 reps AND Gong Forecast proves insufficient for CRO commit accuracy.' },
  { tool:'Loopio',             status:'DEFERRED', color:'#f59e0b', icon:'⏸', save:'$15–25k / yr',
    reason:'Premature unless RFP volume is high',
    overlap:'Justified at 20+ complex RFPs/year with a team reusing content. Below that, PandaDoc template library + Google Drive covers 90% of the use case at zero incremental cost.',
    keepIf:'Crisp actively pursues enterprise retail (Walmart, Kroger, Target) that issues formal vendor RFPs. At that volume, Loopio pays for itself. Not before.' },
  { tool:'ZenDesk',            status:'VALIDATE', color:'#fb923c', icon:'⚠', save:'$12–25k / yr',
    reason:'Potential HubSpot Service Hub overlap',
    overlap:'HubSpot Professional and Enterprise tiers include Service Hub — ticketing, CSAT surveys, SLA management. Before renewing ZenDesk, validate exactly which CS workflows live there that HubSpot cannot replicate.',
    keepIf:'Does CS have complex support workflows (multi-channel routing, large KB, complex SLAs) that HubSpot Service Hub cannot match? If support volume is low and CS primarily works in Vitally, ZenDesk cost is not justified.' },
  { tool:'LinkedIn SNav',      status:'VALIDATE', color:'#fb923c', icon:'⚠', save:'$5–6k per unused seat / yr',
    reason:'High per-seat cost; validate active usage',
    overlap:'At $80–100/seat/month = $5–6k/rep/year, SNav is a meaningful line item. Value is real only if reps are actively using the SFDC overlay, InMail, and relationship mapping features.',
    keepIf:'Pull LinkedIn’s usage report. Cut seats for any rep with fewer than 10 logins per month. Non-users are pure waste.' },
];

const MEDDPICC_FIELDS = [
  { letter:'M', field:'Metrics',            sfdcField:'Metrics__c',           threshold:80, logic:'Quantifiable ROI, time savings, cost reduction numbers from transcript' },
  { letter:'E', field:'Economic Buyer',     sfdcField:'Economic_Buyer__c',    threshold:85, logic:'Name + title of budget authority. Highest threshold — wrong EB tanks deals.' },
  { letter:'D', field:'Decision Criteria',  sfdcField:'Decision_Criteria__c', threshold:75, logic:'Evaluation factors: security, integration, price, support, compliance' },
  { letter:'D', field:'Decision Process',   sfdcField:'Decision_Process__c',  threshold:75, logic:'Approval chain, committee, procurement steps described on call' },
  { letter:'P', field:'Paper Process',      sfdcField:'Paper_Process__c',     threshold:72, logic:'Procurement timelines, security review, legal sign-off requirements' },
  { letter:'I', field:'Identify Pain',      sfdcField:'Identify_Pain__c',     threshold:85, logic:'Specific problem language: manual work, errors, lost revenue, risk' },
  { letter:'C', field:'Champion',           sfdcField:'Champion__c',          threshold:80, logic:'Advocate language: "I\'m pushing this internally", sponsorship signals' },
  { letter:'C', field:'Competition',        sfdcField:'Competition__c',       threshold:78, logic:'Competitor names, "also evaluating", pricing comparison language' },
];

const MIDDLEWARE_TOOLS = [
  { name:'Syncari', role:'HubSpot ⇔ Salesforce sync + field ownership', cost:'~$12–18k / yr', color:'#f59e0b',
    why:'Purpose-built for the HubSpot⇔SFDC field ownership problem. Syncari Synapse gives you visual field ownership enforcement, conflict resolution, and dedup as the core product. Workato can do this but you build and maintain the logic as custom recipes. Syncari ships it.',
    handles:['Visual field ownership pipeline — configure, not code','Native conflict resolution + audit log','Dedup enforced before any insert','MQL→SQL handoff, attribution sync, contact/account ownership split'] },
  { name:'Celigo', role:'Salesforce ⇔ NetSuite (ERP integration)', cost:'~$8–12k / yr', color:'#60a5fa',
    why:'Purpose-built NetSuite integrator. Multi-entity, multi-currency, RevRec field mapping, and commission data flow are core competencies. A general iPaaS handling NetSuite requires constant recipe maintenance as schema evolves.',
    handles:['SFDC Opportunity → NetSuite Order on signing','RevRec schedule creation from PandaDoc executed contract','Commission data flow to SFDC Account (read-only display)','Multi-currency and multi-entity schema out of the box'] },
  { name:'n8n', role:'Custom webhook workflows + AI pipeline', cost:'~$600–1.5k / yr', color:'#22d3ee',
    why:'Already deployed for PDL enrichment. The Gong → Claude API → SFDC MEDDPICC pipeline is a webhook receiver, two API calls, and a conditional SFDC write — exactly what n8n handles. Same team, same infrastructure, zero new platform overhead.',
    handles:['PDL inbound enrichment trigger (existing)','Gong call-end webhook → Claude API prompt → SFDC MEDDPICC field writes','MEDDPICC_Score__c calculation + Slack alert dispatch','Any custom API integration not covered by Syncari/Celigo'] },
  { name:'HubSpot Workflows', role:'Comms execution layer', cost:'Included in existing tier', color:'#34d399',
    why:'HubSpot stops being a contact DB and becomes the outbound communication engine. Health drops in Vitally → data flows to HubSpot Contact → HubSpot Workflow fires CS sequence. This is not a new platform — it is an activation of what’s already paid for.',
    handles:['CS health drop → outreach sequence (triggered by Vitally)','Renewal risk flag → renewal sequence (triggered by Vitally Renewal__c)','New customer onboarding drip (triggered by Opp Closed Won)','MQL → SDR alert (triggered by HubSpot Lead Score)','Re-engagement campaigns (triggered by usage drop from Pendo)'] },
];

interface Node { id: string; name: string; sub: string; cat: string; x: number; y: number; w: number; phase: number; }
function getNode(id: string) { return NODES.find(n => n.id === id); }
function edgePt(n: Node, other: Node) {
  const nw = n.w / 2, nh = NH / 2, dx = other.x - n.x, dy = other.y - n.y;
  if (!dx && !dy) return { x: n.x, y: n.y };
  const sx = Math.abs(dx) > 0 ? nw / Math.abs(dx) : Infinity;
  const sy = Math.abs(dy) > 0 ? nh / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  return { x: n.x + dx * s, y: n.y + dy * s };
}

function TabBtn({ active, onClick, color, children }: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  const bg = color || '#1de2c4';
  return (
    <button onClick={onClick} className="transition-colors duration-200 not-italic" style={{
      background: active ? bg : 'transparent', color: active ? '#111113' : '#95959d',
      border: `1px solid ${active ? bg : '#313135'}`, padding: '6px 16px', borderRadius: 6,
      fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

function PhaseBtn({ active, color, onClick, children }: { active: boolean; color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="transition-colors duration-200 not-italic" style={{
      background: active ? color + '22' : 'transparent', color: active ? color : '#494950',
      border: `1px solid ${active ? color : '#313135'}`, padding: '4px 12px', borderRadius: 4,
      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

export default function GTMArchitectureV2() {
  const [tab, setTab] = useState('map');
  const [pf, setPf] = useState(0);
  const [hov, setHov] = useState<string | null>(null);
  const [openSec, setOpenSec] = useState<number | null>(null);
  const [openAudit, setOpenAudit] = useState<number | null>(null);

  const ve = pf === 0 ? EDGES : EDGES.filter(e => e.phase <= pf);
  const ceIds = hov ? ve.filter(e => e.from === hov || e.to === hov).map(e => e.id) : [];
  const cnIds = ceIds.flatMap(id => { const e = EDGES.find(x => x.id === id); return e ? [e.from, e.to] : []; });

  const isAI = (id: string) => id === 'egai' || id === 'eai';

  return (
    <div className="not-italic" style={{ color: '#afafb6' }}>

      {/* Page header */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          <p className="text-xs tracking-wide text-gray-400 mb-4 not-italic" style={{ letterSpacing: '0.1em' }}>
            GTM SYSTEMS ARCHITECTURE {'·'} OPTION 2
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 not-italic" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Middleware-First Architecture
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl not-italic" style={{ lineHeight: 1.75 }}>
            17 tools, 28 connections. Syncari + Celigo + n8n middleware stack with Claude AI MEDDPICC extraction.
          </p>
        </div>
      </section>

      {/* Tab nav */}
      <div className="border-t border-b" style={{ borderColor: '#313135' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 py-4">
          <div className="flex gap-3 flex-wrap">
            <TabBtn active={tab === 'map'} onClick={() => setTab('map')}>Map</TabBtn>
            <TabBtn active={tab === 'own'} onClick={() => setTab('own')}>Ownership</TabBtn>
            <TabBtn active={tab === 'med'} onClick={() => setTab('med')}>MEDDPICC</TabBtn>
            <TabBtn active={tab === 'mid'} onClick={() => setTab('mid')}>Middleware</TabBtn>
            <TabBtn active={tab === 'audit'} onClick={() => setTab('audit')} color="#ef4444">Audit (Optional)</TabBtn>
          </div>
        </div>
      </div>

      {/* ── MAP TAB ── */}
      {tab === 'map' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">

            {/* Savings banner */}
            <div className="mb-6 flex items-center gap-4 flex-wrap not-italic" style={{ background: '#ef444408', border: '1px solid #ef444422', borderRadius: 8, padding: '10px 16px' }}>
              <span className="font-bold not-italic" style={{ color: '#ef4444', fontSize: 13 }}>STACK AUDIT: 5 tools eliminated or deferred</span>
              <div className="flex gap-2 flex-wrap">
                {['Apollo.io','Vector'].map(t => <span key={t} className="not-italic" style={{ background:'#ef444415', border:'1px solid #ef444430', borderRadius:4, padding:'2px 8px', fontSize:11, color:'#ef4444' }}>{t}</span>)}
                {['Clari','Loopio'].map(t => <span key={t} className="not-italic" style={{ background:'#f59e0b15', border:'1px solid #f59e0b30', borderRadius:4, padding:'2px 8px', fontSize:11, color:'#f59e0b' }}>{t}</span>)}
                {['ZenDesk*','SNav*'].map(t => <span key={t} className="not-italic" style={{ background:'#fb923c15', border:'1px solid #fb923c30', borderRadius:4, padding:'2px 8px', fontSize:11, color:'#fb923c' }}>{t}</span>)}
              </div>
              <span className="ml-auto font-bold not-italic" style={{ color: '#34d399', fontSize: 13 }}>$67{'–'}135k / yr identified</span>
            </div>

            {/* Phase filter */}
            <div className="flex gap-3 mb-6 items-center flex-wrap">
              <span className="text-xs not-italic" style={{ color: '#494950', letterSpacing: '0.12em' }}>PHASE</span>
              {([[0,'All','#95959d'],[1,'Ph.1 Foundation','#f59e0b'],[2,'+ Ph.2 AI/Rev','#60a5fa'],[3,'+ Ph.3 CS','#c084fc']] as const).map(([v,l,c]) => (
                <PhaseBtn key={v} active={pf===Number(v)} color={c} onClick={() => setPf(Number(v))}>{l}</PhaseBtn>
              ))}
              <span className="text-xs not-italic" style={{ color:'#494950', marginLeft:8 }}>Hover a node to inspect</span>
            </div>

            {/* SVG map */}
            <div style={{ border:'1px solid #313135', borderRadius:8, overflow:'hidden', background:'#111113' }}>
              <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display:'block' }}>
                <defs>
                  {[1,2,3,4].map(p => (
                    <g key={p}>
                      <marker id={`ae${p}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0,0 0,6 8,3" fill={PC[p]} /></marker>
                      <marker id={`as${p}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto-start-reverse"><polygon points="0,0 0,6 8,3" fill={PC[p]} /></marker>
                    </g>
                  ))}
                  <marker id="aeAI" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0,0 0,6 8,3" fill="#f0abfc" /></marker>
                  {/* Middleware routing arrow markers */}
                  {Object.entries(VIA_COLOR).filter(([k]) => k !== 'DIRECT').map(([k, c]) => (
                    <g key={`via${k}`}>
                      <marker id={`aeV${k}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0,0 0,6 8,3" fill={c} /></marker>
                      <marker id={`asV${k}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto-start-reverse"><polygon points="0,0 0,6 8,3" fill={c} /></marker>
                    </g>
                  ))}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40,0L0,0 0,40" fill="none" stroke="#18181b" strokeWidth="0.5" /></pattern>
                  <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  <filter id="aiGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <rect width={SVG_W} height={SVG_H} fill="#111113" />
                <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

                {/* Zone band fills */}
                <rect x={0} y={0} width={SVG_W} height={LY.ph3 - 26} fill="#c084fc" opacity={0.012} />
                <rect x={0} y={LY.ph3 - 26} width={SVG_W} height={LY.ph2 - LY.ph3 + 26} fill="#60a5fa" opacity={0.012} />
                <rect x={0} y={LY.busB} width={SVG_W} height={SVG_H - LY.busB} fill="#f59e0b" opacity={0.04} />
                <rect x={0} y={LY.busB} width={5} height={SVG_H - LY.busB} fill="#f59e0b" opacity={0.55} />

                {/* Middleware bus */}
                <rect x={30} y={LY.busT} width={SVG_W - 60} height={LY.busB - LY.busT} rx={4} fill="#22d3ee07" stroke="#22d3ee" strokeWidth={0.7} strokeDasharray="12 4" />
                <text x={SVG_W / 2} y={LY.busT + 15} textAnchor="middle" fill="#22d3ee" fontSize={8} fontFamily="inherit" opacity={0.7} letterSpacing="0.06em">SYNCARI (HubSpot{'⇔'}SFDC) {'·'} CELIGO (SFDC{'⇔'}NetSuite) {'·'} n8n (custom workflows)</text>
                <text x={SVG_W / 2} y={LY.busT + 27} textAnchor="middle" fill="#22d3ee" fontSize={6.5} fontFamily="inherit" opacity={0.28}>FIELD OWNERSHIP RULES {'·'} DEDUP {'·'} CIRCULAR DETECTION {'·'} UPDATE LOCK {'·'} AUDIT LOG</text>
                <text x={SVG_W / 2} y={LY.busT + 39} textAnchor="middle" fill="#22d3ee" fontSize={5.5} fontFamily="inherit" opacity={0.18}>n8n handles: PDL enrichment + Gong{'→'}Claude MEDDPICC + MEDDPICC_Score calc + Slack alerts</text>

                {/* LOAD-BEARING FOUNDATION label */}
                <text x={SVG_W / 2} y={LY.ph1 - 36} textAnchor="middle" fill="#f59e0b" fontSize={8.5} fontFamily="inherit" opacity={0.5} letterSpacing="0.18em">{'◆'}  LOAD-BEARING FOUNDATION  {'◆'}  PHASE 1</text>
                <rect x={80} y={LY.ph1 - 26} width={SVG_W - 160} height={14} rx={3} fill="#f59e0b08" stroke="#f59e0b" strokeWidth={0.5} strokeDasharray="4 4" opacity={0.4} />
                <text x={SVG_W / 2} y={LY.ph1 - 17} textAnchor="middle" fill="#f59e0b" fontSize={6} fontFamily="inherit" opacity={0.4}>{'⚠'}  Build Syncari field ownership matrix + rules before connecting any satellite tools.</text>

                {/* DEFERRED zone label */}
                <text x={190} y={LY.ph4 + 38} textAnchor="middle" fill="#334155" fontSize={7.5} fontFamily="inherit" opacity={0.5}>{'⏸'}  DEFERRED {'—'} add when team scale justifies cost</text>

                {/* Golden Triangle callout */}
                <text x={738} y={LY.ph1 - 46} textAnchor="middle" fill="#f59e0b" fontSize={7} fontFamily="inherit" opacity={0.45} letterSpacing="0.12em">{'◆'}  GOLDEN TRIANGLE  {'◆'}</text>

                {/* HubSpot comms label */}
                <text x={546} y={LY.ph1 + NH / 2 + 12} textAnchor="middle" fill="#f59e0b" fontSize={6} fontFamily="inherit" opacity={0.4} letterSpacing="0.08em">COMMS EXECUTION LAYER</text>

                {/* AI Decisioning label */}
                <text x={226} y={LY.ph2 - NH / 2 - 10} textAnchor="middle" fill="#f0abfc" fontSize={6.5} fontFamily="inherit" opacity={0.5} letterSpacing="0.08em">AI DECISIONING LAYER</text>

                {/* Inbound enrich loop */}
                <rect x={14} y={LY.ph1 - 72} width={156} height={34} rx={3} fill="#22d3ee03" stroke="#22d3ee" strokeWidth={0.5} strokeDasharray="4 4" opacity={0.5} />
                <text x={92} y={LY.ph1 - 60} textAnchor="middle" fill="#22d3ee" fontSize={6} fontFamily="inherit" opacity={0.45} letterSpacing="0.08em">INBOUND ENRICH LOOP</text>
                <text x={92} y={LY.ph1 - 48} textAnchor="middle" fill="#22d3ee" fontSize={5.5} fontFamily="inherit" opacity={0.25}>HubSpot {'→'} n8n {'→'} PDL {'→'} HubSpot</text>

                {/* Phase right-rail labels */}
                <rect x={SVG_W - 12} y={LY.ph2 - 40} width={12} height={80} fill="#60a5fa" opacity={0.15} rx={2} />
                <text x={SVG_W - 6} y={LY.ph2 + 20} textAnchor="middle" fill="#60a5fa" fontSize={6} fontFamily="inherit" opacity={0.5} transform={`rotate(-90,${SVG_W - 6},${LY.ph2 + 20})`}>PH.2 REV INTEL + AI</text>
                <rect x={SVG_W - 12} y={LY.ph3 - 35} width={12} height={70} fill="#c084fc" opacity={0.12} rx={2} />
                <text x={SVG_W - 6} y={LY.ph3 + 15} textAnchor="middle" fill="#c084fc" fontSize={6} fontFamily="inherit" opacity={0.5} transform={`rotate(-90,${SVG_W - 6},${LY.ph3 + 15})`}>PH.3 CS + COLLAB</text>

                {/* Edges */}
                {ve.map(edge => {
                  const fn = getNode(edge.from), tn = getNode(edge.to);
                  if (!fn || !tn) return null;
                  const p1 = edgePt(fn as Node, tn as Node), p2 = edgePt(tn as Node, fn as Node);
                  const isActive = !hov || ceIds.includes(edge.id);
                  const def = (edge as any).deferred;
                  const ai = isAI(edge.id);
                  const via = edge.via;
                  const isDirect = via === 'DIRECT';
                  const eColor = def ? '#334155' : ai ? '#f0abfc' : via && !isDirect ? VIA_COLOR[via] || PC[edge.phase] : PC[edge.phase];
                  const sw = isActive && hov ? 2.2 : ai ? 1.8 : def ? 0.8 : isDirect ? 1 : 1.5;
                  const op = def ? 0.2 : isActive ? (hov ? 0.95 : 0.42) : 0.04;
                  const dash = def ? '4 6' : ai ? '6 3' : isDirect ? '3 4' : SD[edge.sync];
                  return (
                    <g key={edge.id}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                        stroke={eColor} strokeWidth={sw} opacity={op} strokeDasharray={dash}
                        markerEnd={def ? undefined : ai ? 'url(#aeAI)' : via && !isDirect && VIA_COLOR[via] ? `url(#aeV${via})` : `url(#ae${edge.phase})`}
                        markerStart={edge.sync === 'bi' && !def ? (via && !isDirect && VIA_COLOR[via] ? `url(#asV${via})` : `url(#as${edge.phase})`) : undefined}
                        filter={isActive && hov ? (ai ? 'url(#aiGlow)' : 'url(#glow)') : undefined}
                      />
                      {/* Edge midpoint label: SFDC object + routing */}
                      {!hov && Math.abs(p2.y - p1.y) > 28 && SFDC_SHORT[edge.id] && (
                        <g>
                          <text x={(p1.x + p2.x) / 2 + 4} y={(p1.y + p2.y) / 2 - 3} fill={eColor} fontSize={5.5} fontFamily="inherit" opacity={0.36}>{SFDC_SHORT[edge.id]}</text>
                          {via && !isDirect && (
                            <text x={(p1.x + p2.x) / 2 + 4} y={(p1.y + p2.y) / 2 + 5} fill={VIA_COLOR[via] || '#494950'} fontSize={5} fontFamily="inherit" opacity={0.5} fontWeight="700">{VIA_SHORT[via]}</text>
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {NODES.map(node => {
                  const w = node.w, cat = CAT[node.cat];
                  const isHov = hov === node.id;
                  const isDim = hov !== null && !isHov && !cnIds.includes(node.id);
                  const isDeferred = node.cat === 'defer';
                  const isValidate = node.cat === 'validate';
                  const phaseDim = pf > 0 && node.phase > pf;
                  const nodeOp = isDim ? 0.06 : phaseDim ? 0.1 : isDeferred ? 0.35 : 1;
                  const borderDash = isDeferred ? '5 4' : node.cat === 'ai' ? '5 3' : isValidate ? '8 3' : undefined;
                  return (
                    <g key={node.id} opacity={nodeOp} onMouseEnter={() => setHov(node.id)} onMouseLeave={() => setHov(null)} style={{ cursor:'default' }}>
                      {/* AI ambient glow */}
                      {node.cat === 'ai' && <rect x={node.x - w/2 - 8} y={node.y - NH/2 - 8} width={w + 16} height={NH + 16} rx={8} fill="#f0abfc" opacity={0.08} filter="url(#aiGlow)" />}
                      {/* Validate ambient */}
                      {isValidate && <rect x={node.x - w/2 - 4} y={node.y - NH/2 - 4} width={w + 8} height={NH + 8} rx={6} fill="#fb923c" opacity={0.06} />}
                      {/* Hover glow */}
                      {isHov && <rect x={node.x - w/2 - 6} y={node.y - NH/2 - 6} width={w + 12} height={NH + 12} rx={7} fill={cat.stroke} opacity={0.12} />}
                      {/* Node rect */}
                      <rect x={node.x - w/2} y={node.y - NH/2} width={w} height={NH} rx={4}
                        fill={isHov ? cat.stroke + '28' : cat.bg} stroke={cat.stroke}
                        strokeWidth={isHov ? 2 : (node.cat === 'ai' || isValidate) ? 1.5 : 1}
                        strokeDasharray={borderDash} />
                      {/* Ownership strip */}
                      <rect x={node.x - w/2 + 1} y={node.y + NH/2 - 11} width={w - 2} height={10} rx={2} fill={cat.stroke} opacity={0.1} />
                      {/* Name */}
                      <text x={node.x} y={node.y - 8} textAnchor="middle" fill={cat.text} fontSize={10.5} fontWeight="700" fontFamily="inherit" letterSpacing="0.03em">{node.name}</text>
                      {/* Sub */}
                      <text x={node.x} y={node.y + 8} textAnchor="middle" fill={cat.text} opacity={0.42} fontSize={6} fontFamily="inherit">
                        {node.sub.length > 44 ? node.sub.slice(0, 44) + '…' : node.sub}
                      </text>
                    </g>
                  );
                })}

                {/* Tooltip */}
                {hov && (() => {
                  const node = getNode(hov);
                  if (!node) return null;
                  const cat = CAT[node.cat];
                  const conn = ve.filter(e => e.from === hov || e.to === hov);
                  if (!conn.length) return null;
                  const ttW = 268, lH = 44, footer = (node.cat === 'validate' || node.cat === 'defer') ? 18 : 0;
                  const ttH = 28 + conn.length * lH + 14 + footer;
                  let ttX = node.x > SVG_W * 0.55 ? node.x - node.w/2 - ttW - 10 : node.x + node.w/2 + 10;
                  let ttY = Math.max(4, Math.min(node.y - ttH/2, SVG_H - ttH - 4));
                  ttX = Math.max(4, Math.min(ttX, SVG_W - ttW - 4));
                  return (
                    <g>
                      <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={4} fill="#111113" stroke={cat.stroke} strokeWidth={1} opacity={0.98} />
                      <text x={ttX + 8} y={ttY + 15} fill="#494950" fontSize={7.5} fontFamily="inherit" letterSpacing="0.1em">{conn.length} CONNECTION{conn.length > 1 ? 'S' : ''}</text>
                      {conn.map((e, i) => {
                        const other = getNode(e.from === hov ? e.to : e.from);
                        const arrow = e.sync === 'bi' ? '⇄' : e.from === hov ? '→' : '←';
                        const ec = isAI(e.id) ? '#f0abfc' : PC[e.phase];
                        const via = e.via;
                        const vc = via ? VIA_COLOR[via] || '#494950' : '#494950';
                        return (
                          <g key={e.id}>
                            <text x={ttX + 8} y={ttY + 28 + i * lH} fill={ec} fontSize={11} fontWeight="700" fontFamily="inherit">{arrow} {other?.name}</text>
                            <text x={ttX + 8} y={ttY + 40 + i * lH} fill="#494950" fontSize={7} fontFamily="inherit">{SL[e.sync]} {'·'} Phase {e.phase}</text>
                            <text x={ttX + 8} y={ttY + 50 + i * lH} fill="#62626a" fontSize={6.5} fontFamily="inherit">SFDC: {SFDC_OBJ[e.id] || ''}</text>
                            <text x={ttX + 8} y={ttY + 60 + i * lH} fill={vc} fontSize={6.5} fontWeight="700" fontFamily="inherit">VIA: {via === 'DIRECT' ? 'Native / Direct connector' : via || 'unknown'}</text>
                          </g>
                        );
                      })}
                      {node.cat === 'validate' && <text x={ttX + 8} y={ttY + ttH - 6} fill="#fb923c" fontSize={6.5} fontFamily="inherit">{'⚠'} Validate before renewal {'—'} see AUDIT tab</text>}
                      {node.cat === 'defer' && <text x={ttX + 8} y={ttY + ttH - 6} fill="#334155" fontSize={6.5} fontFamily="inherit">{'⏸'} Not contracted {'—'} see AUDIT tab for conditions</text>}
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 flex-wrap items-center text-xs not-italic" style={{ color:'#494950' }}>
              <span style={{ letterSpacing:'0.1em' }}>NODES</span>
              {Object.entries(CAT).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div style={{ width:8, height:8, borderRadius:2, background:v.stroke+'20', border:`1px solid ${v.stroke}` }} />
                  <span>{v.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 flex-wrap items-center text-xs not-italic" style={{ color:'#494950' }}>
              <span style={{ letterSpacing:'0.1em' }}>ROUTING</span>
              {([['Syncari','#f59e0b','solid'],['Celigo','#60a5fa','solid'],['n8n','#22d3ee','solid'],['Direct','#494950','dashed']] as const).map(([name, color, style]) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div style={{ width:16, height:0, borderTop:`2px ${style} ${color}` }} />
                  <span style={{ color }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── AUDIT TAB ── */}
      {tab === 'audit' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
            <h2 className="text-xl font-bold text-white mb-2 not-italic">Stack Audit</h2>
            <p className="text-sm mb-6 not-italic" style={{ color:'#62626a' }}>2 cut, 2 deferred, 2 validate. Reasoning and estimated savings.</p>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label:'CUT — remove from stack', color:'#ef4444', tools:['Apollo.io','Vector'], save:'$20–45k / yr' },
                { label:'DEFER — add at scale milestone', color:'#f59e0b', tools:['Clari','Loopio'], save:'$35–65k / yr' },
                { label:'VALIDATE — before next renewal', color:'#fb923c', tools:['ZenDesk','LinkedIn SNav'], save:'$12–25k+ / yr' },
              ].map(c => (
                <div key={c.label} className="not-italic" style={{ background:'#18181b', borderTop:`3px solid ${c.color}`, borderRadius:'0 0 6px 6px', padding:'14px 16px', border:`1px solid #313135`, borderTopColor:c.color }}>
                  <p className="font-bold not-italic" style={{ color:c.color, fontSize:11, letterSpacing:'0.08em', marginBottom:8 }}>{c.label}</p>
                  <p className="font-bold text-white not-italic" style={{ fontSize:14, marginBottom:4 }}>{c.tools.join(', ')}</p>
                  <p className="not-italic" style={{ fontSize:12, color:c.color }}>{c.save}</p>
                </div>
              ))}
            </div>

            {/* Audit items */}
            <div className="space-y-3">
              {AUDIT_ITEMS.map((item, i) => (
                <div key={i} style={{ border:'1px solid #313135', borderRadius:6, overflow:'hidden' }}>
                  <button className="w-full flex items-center gap-3 not-italic" onClick={() => setOpenAudit(openAudit === i ? null : i)}
                    style={{ background:'#18181b', padding:'12px 16px', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
                    <span style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:item.color+'18', color:item.color, fontSize:11, fontWeight:700 }}>{item.icon}</span>
                    <span className="font-bold not-italic" style={{ color:item.color, fontSize:14 }}>{item.tool}</span>
                    <span className="not-italic" style={{ fontSize:8, color:item.color, background:item.color+'15', padding:'2px 6px', borderRadius:3 }}>{item.status}</span>
                    <span className="not-italic" style={{ fontSize:12, color:'#62626a', flex:1 }}>{item.reason}</span>
                    <span className="font-bold not-italic" style={{ fontSize:13, color:'#34d399' }}>{item.save}</span>
                    <span style={{ color:'#494950', fontSize:12 }}>{openAudit === i ? '▲' : '▼'}</span>
                  </button>
                  {openAudit === i && (
                    <div style={{ padding:'12px 16px', borderTop:'1px solid #313135' }}>
                      <p className="text-xs font-bold mb-2 not-italic" style={{ color:'#494950', letterSpacing:'0.08em' }}>OVERLAP / REDUNDANCY</p>
                      <p className="mb-4 not-italic" style={{ fontSize:13, color:'#62626a', lineHeight:1.8 }}>{item.overlap}</p>
                      <p className="text-xs font-bold mb-2 not-italic" style={{ color:'#494950', letterSpacing:'0.08em' }}>{item.status === 'CUT' ? 'ONLY KEEP IF' : item.status === 'DEFERRED' ? 'RE-EVALUATE WHEN' : 'VALIDATE'}</p>
                      <p className="not-italic" style={{ fontSize:13, color:'#62626a', lineHeight:1.8 }}>{item.keepIf}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Savings summary */}
            <div className="mt-8 flex gap-8 flex-wrap items-start not-italic" style={{ border:'1px solid #313135', borderRadius:6, padding:'20px 24px', background:'#18181b' }}>
              <div>
                <p className="text-xs font-bold mb-2 not-italic" style={{ color:'#494950', letterSpacing:'0.08em' }}>IDENTIFIED ANNUAL SAVINGS</p>
                <p className="font-bold not-italic" style={{ fontSize:28, color:'#34d399', lineHeight:1 }}>$67{'–'}135k / yr</p>
                <p className="text-xs not-italic" style={{ color:'#494950', marginTop:4 }}>conservative {'→'} aggressive scenario</p>
              </div>
              <div style={{ width:1, height:60, background:'#313135', alignSelf:'center' }} />
              <div style={{ flex:1 }}>
                <p className="text-xs font-bold mb-3 not-italic" style={{ color:'#494950', letterSpacing:'0.08em' }}>WHAT REMAINS: 15 ACTIVE TOOLS {'—'} EACH WITH A DISTINCT, NON-OVERLAPPING FUNCTION</p>
                <div className="flex flex-wrap gap-2">
                  {['HubSpot','Salesforce','NetSuite','Gong','Claude·MEDDPICC (n8n)','Chili Piper','Pendo','DealHub CPQ','PandaDoc','Vitally','Slack','Google WS','Vibe + PDL/n8n','Syncari','Celigo'].map(t => (
                    <span key={t} className="not-italic" style={{ background:'#34d39910', border:'1px solid #34d39933', borderRadius:4, padding:'2px 8px', fontSize:11, color:'#34d399' }}>{t}</span>
                  ))}
                  {['ZenDesk*','SNav*'].map(t => (
                    <span key={t} className="not-italic" style={{ background:'#fb923c10', border:'1px solid #fb923c33', borderRadius:4, padding:'2px 8px', fontSize:11, color:'#fb923c' }}>{t}</span>
                  ))}
                </div>
                <p className="text-xs mt-2 not-italic" style={{ color:'#494950' }}>* pending validation {'—'} may consolidate further</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── OWNERSHIP TAB ── */}
      {tab === 'own' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
            <h2 className="text-xl font-bold text-white mb-2 not-italic">Field Ownership Matrix</h2>
            <p className="text-sm mb-8 not-italic" style={{ color:'#62626a' }}>Who writes, who reads, SFDC object targets, and how conflicts resolve.</p>

            <div className="space-y-8">
              {OWNERSHIP.map((sec, si) => (
                <div key={si}>
                  <button className="flex items-center gap-3 mb-3 cursor-pointer w-full text-left not-italic"
                    onClick={() => setOpenSec(openSec === si ? null : si)}
                    style={{ background:'none', border:'none', padding:0, fontFamily:'inherit' }}>
                    <div style={{ width:3, height:16, background:sec.color, borderRadius:2 }} />
                    <span className="font-bold not-italic" style={{ color:sec.color, fontSize:15 }}>{sec.cat}</span>
                    <span className="ml-auto text-xs" style={{ color:'#494950' }}>{openSec === si ? '▲' : '▼'}</span>
                  </button>

                  {(openSec === si || openSec === null) && (
                    <div style={{ border:`1px solid ${sec.color}20`, borderRadius:6, overflow:'hidden' }}>
                      <div className="hidden md:grid not-italic" style={{ gridTemplateColumns:'148px 155px 140px 100px 1fr', background:'#18181b', borderBottom:`1px solid ${sec.color}18` }}>
                        {['Field','SFDC Object','Owner','Sync','Write / Conflict Rule'].map(h => (
                          <div key={h} className="text-xs not-italic" style={{ padding:'8px 12px', color:'#494950', letterSpacing:'0.08em', borderRight:'1px solid #313135' }}>{h.toUpperCase()}</div>
                        ))}
                      </div>
                      {sec.rows.map((row, ri) => (
                        <div key={ri} className="grid not-italic" style={{
                          gridTemplateColumns:'148px 155px 140px 100px 1fr',
                          borderBottom: ri < sec.rows.length - 1 ? '1px solid #18181b' : 'none',
                          background: ri % 2 === 0 ? 'transparent' : '#18181b',
                        }}>
                          <div className="font-semibold not-italic" style={{ padding:'10px 12px', fontSize:13, color:'#afafb6', borderRight:'1px solid #313135' }}>{row.field}</div>
                          <div className="not-italic" style={{ padding:'10px 12px', fontSize:12, color:'#62626a', borderRight:'1px solid #313135', fontFamily:'monospace' }}>{row.sfdcObj}</div>
                          <div className="font-bold not-italic" style={{ padding:'10px 12px', fontSize:13, color:sec.color, borderRight:'1px solid #313135' }}>{row.owner}</div>
                          <div className="not-italic" style={{ padding:'10px 12px', fontSize:12, borderRight:'1px solid #313135' }}>
                            <span style={{ color: row.sync === 'bi' ? '#f59e0b' : row.sync === 'append' ? '#34d399' : row.sync === 'read' ? '#494950' : '#60a5fa' }}>
                              {SL[row.sync] || row.sync || '—'}
                            </span>
                          </div>
                          <div className="not-italic" style={{ padding:'10px 12px', fontSize:12, color:'#62626a', lineHeight:1.7 }}>{row.rule}</div>
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

      {/* ── MEDDPICC TAB ── */}
      {tab === 'med' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12" style={{ maxWidth:960 }}>
            <h2 className="text-xl font-bold text-white mb-2 not-italic">MEDDPICC AI Extraction Pipeline</h2>
            <p className="text-sm mb-8 not-italic" style={{ color:'#62626a' }}>Gong {'→'} n8n {'→'} Claude API {'→'} SFDC Opportunity custom fields.</p>

            {/* Pipeline flow */}
            <div className="flex flex-wrap items-center gap-2 mb-8 not-italic" style={{ overflowX:'auto' }}>
              {[
                { name:'Gong', sub:'Call ends', color:'#34d399' },
                { name:'n8n', sub:'Webhook trigger', color:'#22d3ee' },
                { name:'Gong API', sub:'Full transcript', color:'#34d399' },
                { name:'SFDC Read', sub:'Current Opp state', color:'#f59e0b' },
                { name:'Claude API', sub:'Extract + score', color:'#f0abfc' },
                { name:'n8n Gate', sub:'Confidence?', color:'#22d3ee' },
                { name:'SFDC Write', sub:'Custom fields', color:'#f59e0b' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="not-italic" style={{ border:`1px solid ${step.color}44`, background:`${step.color}11`, borderRadius:6, padding:'8px 12px', minWidth:72, textAlign:'center' }}>
                    <p className="font-bold not-italic" style={{ fontSize:11, color:step.color }}>{step.name}</p>
                    <p className="not-italic" style={{ fontSize:9, color:'#62626a' }}>{step.sub}</p>
                  </div>
                  {i < 6 && <span style={{ color:'#313135', fontSize:16 }}>{'→'}</span>}
                </div>
              ))}
            </div>

            {/* Decision cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="not-italic" style={{ border:'1px solid #34d39930', borderLeft:'3px solid #34d399', borderRadius:'0 6px 6px 0', padding:'14px 16px', background:'#18181b' }}>
                <p className="font-bold mb-2 not-italic" style={{ color:'#34d399', fontSize:12, letterSpacing:'0.08em' }}>HIGH CONFIDENCE {'≥'} THRESHOLD {'→'} AUTO-WRITE</p>
                <p className="not-italic" style={{ fontSize:13, color:'#62626a', lineHeight:1.8 }}>Claude writes directly to SFDC Opportunity MEDDPICC custom field. Tagged AI_GENERATED in metadata. Call ID + timestamp stored for audit. Rep override locks field 30 days.</p>
              </div>
              <div className="not-italic" style={{ border:'1px solid #f59e0b30', borderLeft:'3px solid #f59e0b', borderRadius:'0 6px 6px 0', padding:'14px 16px', background:'#18181b' }}>
                <p className="font-bold mb-2 not-italic" style={{ color:'#f59e0b', fontSize:12, letterSpacing:'0.08em' }}>BELOW THRESHOLD {'→'} REP REVIEW QUEUE</p>
                <p className="not-italic" style={{ fontSize:13, color:'#62626a', lineHeight:1.8 }}>n8n creates SFDC Activity Note on the Opportunity: extracted value + confidence score + source quote. Rep reviews and confirms. Confirmed value writes as REP_CONFIRMED.</p>
              </div>
            </div>

            {/* Extraction table */}
            <div style={{ border:'1px solid #f0abfc20', borderRadius:6, overflow:'hidden' }}>
              <div className="hidden md:grid not-italic" style={{ gridTemplateColumns:'28px 120px 175px 75px 1fr', background:'#18181b', borderBottom:'1px solid #f0abfc18' }}>
                {['','Field','SFDC Field [Opp]','Threshold','Extraction Logic'].map(h => (
                  <div key={h} className="text-xs not-italic" style={{ padding:'8px 12px', color:'#494950', letterSpacing:'0.08em', borderRight:'1px solid #313135' }}>{h.toUpperCase()}</div>
                ))}
              </div>
              {MEDDPICC_FIELDS.map((f, i) => {
                const thColor = f.threshold >= 85 ? '#34d399' : f.threshold >= 80 ? '#f59e0b' : '#60a5fa';
                return (
                  <div key={i} className="grid not-italic" style={{
                    gridTemplateColumns:'28px 120px 175px 75px 1fr',
                    borderBottom: i < MEDDPICC_FIELDS.length - 1 ? '1px solid #18181b' : 'none',
                    background: i % 2 === 0 ? 'transparent' : '#18181b',
                  }}>
                    <div className="font-bold not-italic" style={{ padding:'10px 12px', fontSize:14, color:'#f0abfc', textAlign:'center', borderRight:'1px solid #313135' }}>{f.letter}</div>
                    <div className="font-semibold not-italic" style={{ padding:'10px 12px', fontSize:13, color:'#afafb6', borderRight:'1px solid #313135' }}>{f.field}</div>
                    <div className="not-italic" style={{ padding:'10px 12px', fontSize:11, color:'#62626a', fontFamily:'monospace', borderRight:'1px solid #313135' }}>{f.sfdcField}</div>
                    <div className="font-bold not-italic" style={{ padding:'10px 12px', fontSize:13, color:thColor, textAlign:'center', borderRight:'1px solid #313135' }}>{f.threshold}%</div>
                    <div className="not-italic" style={{ padding:'10px 12px', fontSize:12, color:'#62626a', lineHeight:1.7 }}>{f.logic}</div>
                  </div>
                );
              })}
            </div>

            {/* MEDDPICC_Score callout */}
            <div className="mt-6 not-italic" style={{ border:'1px solid #f0abfc20', borderLeft:'3px solid #f0abfc', borderRadius:'0 6px 6px 0', padding:'14px 16px', background:'#18181b' }}>
              <p className="font-bold mb-2 not-italic" style={{ color:'#f0abfc', fontSize:12, letterSpacing:'0.08em' }}>MEDDPICC_Score__c {'—'} COMPLETENESS TRIGGER</p>
              <p className="not-italic" style={{ fontSize:13, color:'#62626a', lineHeight:1.8 }}>n8n recalculates MEDDPICC_Score__c after each call as % of 8 fields populated. Writes to Opportunity. Triggers Slack alert to AE manager when score {'<'}40% at Stage 3+. Gong Forecast reads this field. Reps see it in SFDC sidebar {'—'} replacing the need for Clari at current scale.</p>
            </div>
          </div>
        </section>
      )}

      {/* ── MIDDLEWARE TAB ── */}
      {tab === 'mid' && (
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12" style={{ maxWidth:960 }}>
            <h2 className="text-xl font-bold text-white mb-2 not-italic">Middleware Stack Rationale</h2>
            <p className="text-sm mb-8 not-italic" style={{ color:'#62626a' }}>Why Syncari + Celigo + n8n + HubSpot Workflows instead of a single general iPaaS.</p>

            <div className="space-y-4">
              {MIDDLEWARE_TOOLS.map((tool, i) => (
                <div key={i} style={{ border:'1px solid #313135', borderLeft:`3px solid ${tool.color}`, borderRadius:'0 6px 6px 0', overflow:'hidden' }}>
                  <div className="flex items-baseline gap-3 flex-wrap not-italic" style={{ background:`${tool.color}08`, padding:'12px 16px', borderBottom:'1px solid #313135' }}>
                    <span className="font-bold not-italic" style={{ color:tool.color, fontSize:15 }}>{tool.name}</span>
                    <span className="not-italic" style={{ fontSize:12, color:'#62626a' }}>{tool.role}</span>
                    <span className="ml-auto font-bold not-italic" style={{ fontSize:12, color:'#494950' }}>{tool.cost}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-italic" style={{ padding:'14px 16px' }}>
                    <div>
                      <p className="text-xs font-bold mb-2 not-italic" style={{ color:'#494950', letterSpacing:'0.08em' }}>WHY THIS TOOL</p>
                      <p className="not-italic" style={{ fontSize:13, color:'#62626a', lineHeight:1.8 }}>{tool.why}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-2 not-italic" style={{ color:'#494950', letterSpacing:'0.08em' }}>WHAT IT HANDLES</p>
                      <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                        {tool.handles.map((h, j) => (
                          <li key={j} className="not-italic" style={{ fontSize:12, color:'#62626a', lineHeight:1.8, paddingLeft:12, position:'relative' }}>
                            <span style={{ position:'absolute', left:0, color:tool.color }}>{'•'}</span>{h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer stats */}
            <div className="mt-8 flex gap-8 flex-wrap items-start not-italic" style={{ border:'1px solid #313135', borderRadius:6, padding:'16px 20px', background:'#18181b' }}>
              {[
                ['~$21–32k','total middleware cost / yr', '#afafb6'],
                ['4','purpose-fit tools', '#afafb6'],
                ['0','general iPaaS recipes to maintain', '#ef4444'],
                ['0','point-to-point connectors', '#ef4444'],
              ].map(([n, l, c]) => (
                <div key={l} className="flex flex-col gap-1">
                  <span className="text-2xl font-bold not-italic" style={{ lineHeight:1, color:c }}>{n}</span>
                  <span className="text-xs not-italic" style={{ color:'#494950', lineHeight:1.5 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
