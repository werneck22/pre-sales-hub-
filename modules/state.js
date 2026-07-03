import {
  AIRPORT_CATEGORIES,
  DEMO_OPPORTUNITY_ID,
  ROUTE_CONFIG,
  TARGET_ROUTE_MAP,
  airportProfile,
  assumption,
  buildDefaultSizingRules,
  buildResourceOwners,
  decision,
  defaultClassificationRules,
  isDocumented,
  makeGovernanceItems,
  makeValidation,
  productScope,
  risk,
} from "./data.js";
import {
  requestId,
} from "./sizing-engine.js";
import {
  readiness,
} from "./readiness-rules.js";
import {
  isDemoScenario,
  recommendedNextAction,
} from "./render.js";

let mockDb = {
  opportunities: [
    {
      id: "opp-est-00",
      name: "Estephan Airport Modernization",
      customer: "Estephan Airport",
      region: "EMEA",
      sales_owner: "Estephan Werneck",
      presales_owner: "Airport IT Pre-Sales",
      opportunity_stage: "Solutioning",
      estimated_value: 5400000,
      close_date: "2026-09-30",
      submission_deadline: "2026-07-15",
      strategic_importance: "Strategic",
      complexity: "Medium",
      current_governance_stage: "BAB",
      bcm_status: "Approved",
      srm_status: "Conditionally approved",
      bab_status: "In progress",
      strategic_rationale: "Modernize passenger processing, airport operations data and integration foundations with a traceable sizing baseline.",
      bid_no_bid_recommendation: "Bid",
      preliminary_architecture: "Common use and biometric services integrated with AODB and API layer for partner systems.",
      delivery_dependency: "Resource owner validation required for implementation, integration, onboarding and testing effort.",
      integration_assumptions: "Five initial integrations assumed for the MVP sizing scenario.",
      business_case_status: "In review",
      pricing_readiness_status: "Ready",
      executive_decision_required: "Confirm whether the validated sizing baseline can be used for the business case pack.",
      exceptions_approval_conditions: "SRM is conditional on the recorded implementation sequencing condition. BAB remains blocked until AODB PM effort is validated.",
      overall_readiness_score: 0,
    },
    {
      id: "opp-ams-01",
      name: "North Terminal Common Use Renewal",
      customer: "Amsterdam Airport Partner",
      region: "EMEA",
      sales_owner: "Marta Klein",
      presales_owner: "Elena Rossi",
      opportunity_stage: "Solutioning",
      estimated_value: 4200000,
      close_date: "2026-09-30",
      submission_deadline: "2026-07-22",
      strategic_importance: "High",
      complexity: "High",
      current_governance_stage: "SRM",
      bcm_status: "Approved",
      srm_status: "In progress",
      bab_status: "Not started",
      strategic_rationale: "Strategic renewal of common use estate with biometric readiness and smoother airline onboarding.",
      bid_no_bid_recommendation: "Bid",
      preliminary_architecture: "Phased common use migration with biometric service layer and API integration gateway.",
      delivery_dependency: "Terminal migration window and airport network readiness need confirmation before SRM closure.",
      integration_assumptions: "Airline DCS and identity-provider integrations use existing airport API gateway patterns.",
      business_case_status: "Draft",
      pricing_readiness_status: "In progress",
      executive_decision_required: "Confirm whether biometric rollout remains in the initial proposal scope.",
      exceptions_approval_conditions: "Privacy language and support sizing must be closed before BAB approval.",
      overall_readiness_score: 0,
    },
    {
      id: "opp-sin-02",
      name: "Self-Service Departure Transformation",
      customer: "Changi Regional Ventures",
      region: "APAC",
      sales_owner: "Daniel Tan",
      presales_owner: "Priya Menon",
      opportunity_stage: "Proposal",
      estimated_value: 6800000,
      close_date: "2026-10-18",
      submission_deadline: "2026-08-05",
      strategic_importance: "Strategic",
      complexity: "High",
      current_governance_stage: "BAB",
      bcm_status: "Approved",
      srm_status: "Approved",
      bab_status: "In progress",
      strategic_rationale: "Self-service transformation improves passenger throughput and supports airport automation strategy.",
      bid_no_bid_recommendation: "Bid",
      preliminary_architecture: "Integrated CUSS, SBD, biometrics, and display services with staged terminal deployment.",
      delivery_dependency: "Field coverage model and support zones require final agreement.",
      integration_assumptions: "Baggage, biometric, and display interfaces follow published airport interface catalogues.",
      business_case_status: "Validated",
      pricing_readiness_status: "Draft",
      executive_decision_required: "Approve commercial path subject to support coverage baseline.",
      exceptions_approval_conditions: "Support coverage exception must be documented in BAB pack.",
      overall_readiness_score: 0,
    },
    {
      id: "opp-gru-03",
      name: "Airport Operations Data Foundation",
      customer: "Sao Paulo Airport Authority",
      region: "LATAM",
      sales_owner: "Rafael Costa",
      presales_owner: "Camila Almeida",
      opportunity_stage: "Qualification",
      estimated_value: 3100000,
      close_date: "2026-09-10",
      submission_deadline: "2026-07-12",
      strategic_importance: "High",
      complexity: "Medium",
      current_governance_stage: "BCM",
      bcm_status: "In progress",
      srm_status: "Not started",
      bab_status: "Not started",
      strategic_rationale: "Data foundation positions Amadeus as the operational platform for future airport systems growth.",
      bid_no_bid_recommendation: "",
      preliminary_architecture: "",
      delivery_dependency: "Incumbent interface discovery needed before delivery model can be confirmed.",
      integration_assumptions: "Integration assumptions depend on the customer interface catalogue.",
      business_case_status: "Not documented",
      pricing_readiness_status: "Not documented",
      executive_decision_required: "",
      exceptions_approval_conditions: "",
      overall_readiness_score: 0,
    },
    {
      id: "opp-dfw-04",
      name: "Common Use Expansion Concourse E",
      customer: "DFW Airline Consortium",
      region: "NORAM",
      sales_owner: "Alex Morgan",
      presales_owner: "Jordan Lee",
      opportunity_stage: "Solutioning",
      estimated_value: 5000000,
      close_date: "2026-11-20",
      submission_deadline: "2026-09-15",
      strategic_importance: "Medium",
      complexity: "High",
      current_governance_stage: "SRM",
      bcm_status: "Approved",
      srm_status: "In progress",
      bab_status: "Not started",
      strategic_rationale: "Common use expansion improves concourse flexibility and supports irregular operations recovery.",
      bid_no_bid_recommendation: "Bid",
      preliminary_architecture: "Concourse extension of common use services with AODB feed and airline integration layer.",
      delivery_dependency: "",
      integration_assumptions: "Airline ownership of selected API touchpoints remains to be confirmed.",
      business_case_status: "Draft",
      pricing_readiness_status: "Not documented",
      executive_decision_required: "Confirm airline consortium approval path.",
      exceptions_approval_conditions: "",
      overall_readiness_score: 0,
    },
  ],
  productScopes: [
    productScope("opp-est-00", "CUPPS", "Sized", "CUPPS Product Owner", "Validated", "Medium", "CUPPS positions based on medium airport mock defaults."),
    productScope("opp-est-00", "CUSS", "Sized", "CUSS Product Owner", "Validated", "Medium", "Kiosk effort based on medium airport mock defaults."),
    productScope("opp-est-00", "Biometrics", "Sized", "Biometrics Product Owner", "Validated", "High", "Biometric touchpoints and API assumptions validated with conditions."),
    productScope("opp-est-00", "AODB", "Sized", "AODB Product Owner", "Validated", "Medium", "AODB baseline includes operational data and display feed assumptions."),
    productScope("opp-est-00", "Integrations / APIs", "Sized", "Integration Owner", "Validated", "High", "Five initial integrations assumed."),
    productScope("opp-ams-01", "CUSS", "Sized", "Elena Rossi", "Validated", "Medium", "86 kiosks, existing peripheral assumptions to confirm."),
    productScope("opp-ams-01", "CUPPS", "Draft", "Elena Rossi", "In review", "Medium", "142 workstations across terminal migration waves."),
    productScope("opp-ams-01", "Biometrics", "Draft", "Product owner", "In review", "High", "Privacy and airline participation model pending."),
    productScope("opp-ams-01", "Integrations / APIs", "Draft", "Integration SME", "In review", "High", "9 candidate API touchpoints identified."),
    productScope("opp-ams-01", "Support / Field Services", "Sized", "Support lead", "Validated", "Medium", "Three support zones assumed."),
    productScope("opp-sin-02", "CUSS", "Sized", "Priya Menon", "Validated", "Medium", "120 kiosks across departure halls."),
    productScope("opp-sin-02", "SBD", "Draft", "SBD product owner", "In review", "High", "44 bag drops; baggage interface dependencies open."),
    productScope("opp-sin-02", "Biometrics", "Sized", "Product owner", "Validated", "Medium", "36 biometric touchpoints."),
    productScope("opp-sin-02", "DDS/FIDS", "Validated", "Display SME", "Validated", "Low", "310 display endpoints."),
    productScope("opp-sin-02", "Support / Field Services", "Draft", "Support lead", "Blocked", "High", "Field coverage model not yet agreed."),
    productScope("opp-gru-03", "AODB", "Draft", "Camila Almeida", "In review", "High", "Core AODB scope depends on incumbent discovery."),
    productScope("opp-gru-03", "DDS/FIDS", "Not started", "Display SME", "Pending", "Medium", "420 displays estimated from airport inventory."),
    productScope("opp-gru-03", "Integrations / APIs", "Not started", "Integration SME", "Pending", "High", "18 integrations assumed; catalogue pending."),
    productScope("opp-dfw-04", "CUPPS", "Sized", "Jordan Lee", "Validated", "Medium", "96 workstations across new gates."),
    productScope("opp-dfw-04", "CUSS", "Draft", "Jordan Lee", "In review", "Medium", "58 kiosks, airline branding assumptions open."),
    productScope("opp-dfw-04", "AODB", "Draft", "AODB SME", "In review", "Medium", "Operational data feed needed for concourse visibility."),
    productScope("opp-dfw-04", "Integrations / APIs", "Draft", "Integration SME", "Pending", "High", "12 candidate interfaces; airline ownership unclear."),
    productScope("opp-est-00", "Amadeus Passenger Verification", "Sized", "Biometrics Product Owner", "Validated", "Medium", "Passenger verification baseline aligned with medium airport defaults."),
    productScope("opp-est-00", "Seamless GT 11 + Seamless Journey Platform Lite", "Sized", "Biometrics Product Owner", "Validated", "Medium", "Lite journey rollout scoped for the demo baseline terminal."),
    productScope("opp-ams-01", "Seamless GT 11 + Seamless Journey Platform", "Draft", "Product owner", "In review", "High", "Full self-service journey pending airline participation model."),
    productScope("opp-sin-02", "Baggage Reconciliation System", "Draft", "SBD product owner", "In review", "High", "BRS scope tied to bag drop interface dependencies."),
    productScope("opp-gru-03", "Seamless GT 11 One Door Non Biometric Hardware", "Not started", "Camila Almeida", "Pending", "Medium", "One door hardware count pending incumbent discovery."),
    productScope("opp-dfw-04", "Seamless GT 11 + Biopod", "Draft", "Jordan Lee", "In review", "High", "Biopod placement pending gate concourse survey."),
  ],
  stakeholderValidations: [
    makeValidation("opp-est-00", 0, { status: "Validated", due_date: "2026-06-24", comments: "Commercial context captured." }),
    makeValidation("opp-est-00", 1, { status: "Validated", due_date: "2026-06-25", comments: "Initial solution scope prepared." }),
    makeValidation("opp-est-00", 2, { status: "Validated", due_date: "2026-07-01", comments: "Product assumptions reviewed for the demo baseline." }),
    makeValidation("opp-est-00", 3, { status: "Validated", due_date: "2026-07-02", comments: "Delivery workstreams reviewed; AODB PM line remains open in the owner workflow." }),
    makeValidation("opp-est-00", 4, { status: "Validated", due_date: "2026-07-03", comments: "Pricing readiness captured against the current sizing baseline." }),
    makeValidation("opp-est-00", 5, { status: "Validated", due_date: "2026-07-04", comments: "Support readiness assumptions accepted." }),
    makeValidation("opp-est-00", 6, { status: "Validated", due_date: "2026-07-05", comments: "No special legal condition in mock scenario." }),
    makeValidation("opp-ams-01", 0, { status: "Validated", due_date: "2026-06-15", comments: "Commercial owner aligned." }),
    makeValidation("opp-ams-01", 1, { status: "Validated", due_date: "2026-06-18", comments: "Solution scope baseline ready." }),
    makeValidation("opp-ams-01", 2, { status: "In review", due_date: "2026-06-26", comments: "Biometrics assumptions under review." }),
    makeValidation("opp-ams-01", 3, { status: "Pending", due_date: "2026-07-01", comments: "Delivery sizing workshop pending." }),
    makeValidation("opp-ams-01", 4, { status: "Pending", due_date: "2026-07-03", comments: "Pricing awaits support volume." }),
    makeValidation("opp-ams-01", 5, { status: "Validated", due_date: "2026-06-24", comments: "Support model accepted." }),
    makeValidation("opp-ams-01", 6, { status: "Pending", due_date: "2026-07-08", comments: "Privacy language needed." }),
    makeValidation("opp-sin-02", 0, { status: "Validated", due_date: "2026-06-12" }),
    makeValidation("opp-sin-02", 1, { status: "Validated", due_date: "2026-06-14" }),
    makeValidation("opp-sin-02", 2, { status: "Validated", due_date: "2026-06-18" }),
    makeValidation("opp-sin-02", 3, { status: "Validated", due_date: "2026-06-21" }),
    makeValidation("opp-sin-02", 4, { status: "In review", due_date: "2026-07-02", comments: "Cost-to-serve update pending." }),
    makeValidation("opp-sin-02", 5, { status: "Blocked", due_date: "2026-07-01", comments: "Field coverage model not agreed." }),
    makeValidation("opp-sin-02", 6, { status: "In review", due_date: "2026-07-08" }),
    makeValidation("opp-gru-03", 0, { status: "Validated", due_date: "2026-06-20" }),
    makeValidation("opp-gru-03", 1, { status: "In review", due_date: "2026-06-28" }),
    makeValidation("opp-gru-03", 2, { status: "Pending", due_date: "2026-07-04" }),
    makeValidation("opp-gru-03", 3, { status: "Pending", due_date: "2026-07-06" }),
    makeValidation("opp-gru-03", 4, { status: "Pending", due_date: "2026-07-08" }),
    makeValidation("opp-gru-03", 5, { status: "Pending", due_date: "2026-07-10" }),
    makeValidation("opp-gru-03", 6, { status: "Pending", due_date: "2026-07-12" }),
    makeValidation("opp-dfw-04", 0, { status: "Validated", due_date: "2026-06-19" }),
    makeValidation("opp-dfw-04", 1, { status: "In review", due_date: "2026-06-27" }),
    makeValidation("opp-dfw-04", 2, { status: "In review", due_date: "2026-07-03" }),
    makeValidation("opp-dfw-04", 3, { status: "Pending", due_date: "2026-07-06" }),
    makeValidation("opp-dfw-04", 4, { status: "Pending", due_date: "2026-07-10" }),
    makeValidation("opp-dfw-04", 5, { status: "Pending", due_date: "2026-07-12" }),
    makeValidation("opp-dfw-04", 6, { status: "Pending", due_date: "2026-07-14" }),
  ],
  risks: [
    risk("opp-est-00", "Technical", "Biometric and API integration effort requires resource owner validation.", "Medium", "Use generated validation requests and capture owner comments.", "Solution Consulting", "Open"),
    risk("opp-ams-01", "Regulatory", "Biometric privacy requirements vary by terminal and airline.", "High", "Confirm privacy model with product and legal.", "Product", "Open"),
    risk("opp-sin-02", "Delivery", "Field service coverage assumptions not aligned with support model.", "High", "Baseline support zones and escalation model.", "Support", "Mitigating"),
    risk("opp-gru-03", "Technical", "Incumbent systems landscape is incomplete and may affect integration sizing.", "High", "Request interface catalogue before SRM.", "Solution Consulting", "Open"),
    risk("opp-dfw-04", "Governance", "Airline consortium decision rights are not yet confirmed.", "High", "Schedule stakeholder alignment workshop.", "Sales", "Open"),
    risk("opp-ams-01", "Exclusion", "Civil works and counter furniture are outside Amadeus scope.", "Low", "Keep exclusion visible in proposal assumptions.", "Sales", "Open"),
  ],
  assumptions: [
    assumption("opp-est-00", "Annual passengers are 6.5M and annual movements are 72,000 for mock categorization.", "Technical", "Medium", "Pre-sales"),
    assumption("opp-est-00", "Sizing uses configurable MVP default rules only, not confidential delivery formulas.", "Commercial", "High", "Pre-sales"),
    assumption("opp-est-00", "Five initial integrations are assumed for the demo scenario.", "Integration", "High", "Integration Owner"),
    assumption("opp-ams-01", "Existing CUPPS workstation footprint can be reused.", "Technical", "Medium", "Solution Consulting"),
    assumption("opp-sin-02", "Customer will provide airport network readiness evidence before SRM closure.", "Delivery", "Medium", "Delivery"),
    assumption("opp-gru-03", "Customer can provide interface catalogue within two weeks of kickoff.", "Technical", "High", "Sales"),
    assumption("opp-dfw-04", "Existing gate infrastructure can support the common use expansion.", "Technical", "Medium", "Solution Consulting"),
  ],
  decisions: [
    decision("opp-est-00", "SRM", "Proceed to BAB preparation with SRM conditions recorded.", "SRM Chair", "2026-06-17", "Implementation sequencing condition accepted; AODB PM sizing remains pending.", "Obtain final AODB PM validation, refresh final MD, and return for BAB decision."),
    decision("opp-ams-01", "SRM", "Proceed to SME validation for biometrics and API scope.", "SRM Chair", "2026-06-03", "Product and legal validation required.", "Close privacy and API actions before BAB."),
    decision("opp-ams-01", "SRM", "Pricing model pending support volume confirmation.", "Pricing", "2026-06-10", "Support scope must be frozen.", "Confirm support volume by next SRM checkpoint."),
    decision("opp-sin-02", "BAB", "BAB can proceed after support coverage model is baselined.", "BAB Sponsor", "2026-06-04", "Support blocker resolved.", "Return with cost-to-serve summary."),
    decision("opp-gru-03", "BCM", "Continue discovery before bid recommendation.", "BCM Chair", "2026-06-01", "Customer interface catalogue needed.", "Schedule technical discovery."),
    decision("opp-dfw-04", "SRM", "Schedule stakeholder alignment workshop before final SRM slot.", "Sales", "2026-06-11", "Airline decision authority unclear.", "Confirm governance participants."),
  ],
  governanceItems: [
    ...makeGovernanceItems("opp-est-00", "BCM", []),
    ...makeGovernanceItems("opp-est-00", "SRM", []),
    ...makeGovernanceItems("opp-est-00", "BAB", []),
    ...makeGovernanceItems("opp-ams-01", "BCM", [0, 1, 2, 3, 4]),
    ...makeGovernanceItems("opp-ams-01", "SRM", [0, 1, 3]),
    ...makeGovernanceItems("opp-ams-01", "BAB", [3]),
    ...makeGovernanceItems("opp-sin-02", "BCM", [0, 1, 2, 3, 4]),
    ...makeGovernanceItems("opp-sin-02", "SRM", [0, 1, 2, 3, 4]),
    ...makeGovernanceItems("opp-sin-02", "BAB", [0, 2, 4]),
    ...makeGovernanceItems("opp-gru-03", "BCM", [0, 1, 3]),
    ...makeGovernanceItems("opp-gru-03", "SRM", []),
    ...makeGovernanceItems("opp-gru-03", "BAB", []),
    ...makeGovernanceItems("opp-dfw-04", "BCM", [0, 1, 2, 3, 4]),
    ...makeGovernanceItems("opp-dfw-04", "SRM", [0, 2]),
    ...makeGovernanceItems("opp-dfw-04", "BAB", []),
  ],
  airportProfiles: [
    airportProfile("opp-est-00", "Estephan Airport", 6500000, 72000, "EMEA"),
    airportProfile("opp-ams-01", "Amsterdam Airport Partner", 28000000, 230000, "EMEA"),
    airportProfile("opp-sin-02", "Changi Regional Ventures", 42000000, 260000, "APAC"),
    airportProfile("opp-gru-03", "Sao Paulo Airport Authority", 18000000, 160000, "LATAM"),
    airportProfile("opp-dfw-04", "DFW Airline Consortium", 36000000, 270000, "NORAM"),
  ],
  classificationRules: defaultClassificationRules(),
  sizingRules: buildDefaultSizingRules(),
  sizingEstimates: [],
  resourceOwners: buildResourceOwners(),
  validationRequests: [],
  notifications: [],
};

const PERSISTED_STATE_KEY = "presalesHub.state.v1";

function loadPersistedState() {
  try {
    const raw = window.localStorage.getItem(PERSISTED_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.mockDb?.opportunities) || !parsed.mockDb.opportunities.length) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function persistState() {
  try {
    window.localStorage.setItem(PERSISTED_STATE_KEY, JSON.stringify({ mockDb, selectedId }));
  } catch (error) {
    // Storage unavailable (private browsing, quota) - the session keeps working in memory only.
  }
}

let selectedId = mockDb.opportunities[0].id;
let sortByReadiness = false;
let selectedValidationRequestId = "";
let estimateProductFilter = "all";
let estimateStatusFilter = "all";
let estimateExpansionOpportunityId = "";
const expandedEstimateProducts = new Set();
let selectedNotificationChannel = "Email";
let demoMode = true;
let demoPresenterStep = 0;
let activeRoute = "dashboard";
const elements = {
  dashboard: document.querySelector("#dashboard"),
  workspaceGrid: document.querySelector(".workspace-grid"),
  recordHeader: document.querySelector("[data-opportunity-context]"),
  pageEyebrow: document.querySelector("#pageEyebrow"),
  pageTitle: document.querySelector("#pageTitle"),
  routeContextBar: document.querySelector("#routeContextBar"),
  routeArea: document.querySelector("#routeArea"),
  routeBreadcrumb: document.querySelector("#routeBreadcrumb"),
  routeWorkflowNav: document.querySelector("#routeWorkflowNav"),
  routeRecommendation: document.querySelector("#routeRecommendation"),
  routeRecommendationText: document.querySelector("#routeRecommendationText"),
  routeRecommendationBtn: document.querySelector("#routeRecommendationBtn"),
  routePreviousBtn: document.querySelector("#routePreviousBtn"),
  routeNextBtn: document.querySelector("#routeNextBtn"),
  searchInput: document.querySelector("#searchInput"),
  stageFilter: document.querySelector("#stageFilter"),
  sortReadinessBtn: document.querySelector("#sortReadinessBtn"),
  newOpportunityBtn: document.querySelector("#newOpportunityBtn"),
  demoModeBtn: document.querySelector("#demoModeBtn"),
  toastRegion: document.querySelector("#toastRegion"),
  executiveNextActions: document.querySelector("#executiveNextActions"),
  executiveAttentionList: document.querySelector("#executiveAttentionList"),
  pendingValidationList: document.querySelector("#pendingValidationList"),
  overdueValidationList: document.querySelector("#overdueValidationList"),
  deadlineList: document.querySelector("#deadlineList"),
  functionBottlenecks: document.querySelector("#functionBottlenecks"),
  topReadinessGaps: document.querySelector("#topReadinessGaps"),
  forumReadinessBoard: document.querySelector("#forumReadinessBoard"),
  dashboardEmptyState: document.querySelector("#dashboardEmptyState"),
  opportunityList: document.querySelector("#opportunityList"),
  intakeForm: document.querySelector("#intakeForm"),
  intakeNarrativeSummary: document.querySelector("#intakeNarrativeSummary"),
  productScope: document.querySelector("#productScope"),
  airportProfileForm: document.querySelector("#airportProfileForm"),
  categoryBadge: document.querySelector("#categoryBadge"),
  classificationRules: document.querySelector("#classificationRules"),
  runSizingBtn: document.querySelector("#runSizingBtn"),
  sizingSummary: document.querySelector("#sizingSummary"),
  estimateProductFilter: document.querySelector("#estimateProductFilter"),
  estimateStatusFilter: document.querySelector("#estimateStatusFilter"),
  estimateResultCount: document.querySelector("#estimateResultCount"),
  sizingEstimateTable: document.querySelector("#sizingEstimateTable"),
  validationRequestList: document.querySelector("#validationRequestList"),
  notificationPreview: document.querySelector("#notificationPreview"),
  resourceOwnerRegistry: document.querySelector("#resourceOwnerRegistry"),
  governanceChecklist: document.querySelector("#governanceChecklist"),
  readinessBreakdown: document.querySelector("#readinessBreakdown"),
  validationMatrix: document.querySelector("#validationMatrix"),
  riskForm: document.querySelector("#riskForm"),
  riskList: document.querySelector("#riskList"),
  assumptionForm: document.querySelector("#assumptionForm"),
  assumptionList: document.querySelector("#assumptionList"),
  decisionForm: document.querySelector("#decisionForm"),
  decisionList: document.querySelector("#decisionList"),
  businessCasePack: document.querySelector("#businessCasePack"),
  copyBusinessCaseBtn: document.querySelector("#copyBusinessCaseBtn"),
  productCount: document.querySelector("#productCount"),
  checklistScore: document.querySelector("#checklistScore"),
  recordCustomer: document.querySelector("#recordCustomer"),
  recordName: document.querySelector("#recordName"),
  stageBadge: document.querySelector("#stageBadge"),
  readinessBadge: document.querySelector("#readinessBadge"),
  forumBadge: document.querySelector("#forumBadge"),
  journeyProgressBadge: document.querySelector("#journeyProgressBadge"),
  journeyPanel: document.querySelector("#journeyPanel"),
  journeyEyebrow: document.querySelector("#journeyEyebrow"),
  journeyTitle: document.querySelector("#journeyTitle"),
  journeyStepper: document.querySelector("#journeyStepper"),
  presenterNotes: document.querySelector("#presenterNotes"),
  nextActionPanel: document.querySelector("#nextActionPanel"),
  metricPipeline: document.querySelector("#metricPipeline"),
  metricBlockers: document.querySelector("#metricBlockers"),
  metricReadiness: document.querySelector("#metricReadiness"),
  metricGovernance: document.querySelector("#metricGovernance"),
  metricPendingSizing: document.querySelector("#metricPendingSizing"),
  metricOverdueValidations: document.querySelector("#metricOverdueValidations"),
  metricInitialMd: document.querySelector("#metricInitialMd"),
  metricValidatedMd: document.querySelector("#metricValidatedMd"),
  metricMdDelta: document.querySelector("#metricMdDelta"),
  metricSrmSizingBlock: document.querySelector("#metricSrmSizingBlock"),
  metricBabSizingBlock: document.querySelector("#metricBabSizingBlock"),
  bcmCount: document.querySelector("#bcmCount"),
  srmCount: document.querySelector("#srmCount"),
  babCount: document.querySelector("#babCount"),
  blockerList: document.querySelector("#blockerList"),
};
function selectedOpportunity() {
  return mockDb.opportunities.find((opportunity) => opportunity.id === selectedId) || mockDb.opportunities[0];
}

function byOpportunity(collection, opportunityId = selectedId) {
  return collection.filter((item) => item.opportunity_id === opportunityId);
}

function productScopesFor(opportunityId = selectedId) {
  return byOpportunity(mockDb.productScopes, opportunityId);
}
function showToast(message, tone = "success") {
  if (!elements.toastRegion || !message) return;
  const toast = document.createElement("div");
  toast.className = `toast ${tone}`;
  toast.textContent = message;
  elements.toastRegion.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}
function routeFromHash(hash = window.location.hash) {
  const raw = String(hash || "")
    .replace(/^#\/?/, "")
    .split("?")[0]
    .replace(/^\/+|\/+$/g, "");
  const legacyRoutes = { "risk-log": "risks", validation: "validation" };
  const route = legacyRoutes[raw] || raw;
  return ROUTE_CONFIG[route] ? route : "dashboard";
}

function routeForTarget(target) {
  if (!target) return activeRoute;
  if (TARGET_ROUTE_MAP[target]) return TARGET_ROUTE_MAP[target];
  const normalized = String(target).replace(/^#\/?/, "");
  return ROUTE_CONFIG[normalized] ? normalized : activeRoute;
}

function updateRouteChrome(route) {
  const config = ROUTE_CONFIG[route] || ROUTE_CONFIG.dashboard;
  const isDashboard = route === "dashboard";
  const opportunity = selectedOpportunity();

  if (elements.pageEyebrow) elements.pageEyebrow.textContent = config.area;
  if (elements.pageTitle) elements.pageTitle.textContent = config.title;
  if (elements.routeArea) elements.routeArea.textContent = isDashboard ? "Portfolio" : opportunity.name;
  if (elements.routeBreadcrumb) elements.routeBreadcrumb.textContent = config.title;
  if (elements.routeContextBar) elements.routeContextBar.hidden = isDashboard;
  if (elements.routeWorkflowNav) elements.routeWorkflowNav.hidden = isDashboard;
  if (elements.routeRecommendation) elements.routeRecommendation.hidden = isDashboard;
  if (elements.demoModeBtn && isDemoScenario(opportunity)) {
    elements.demoModeBtn.textContent = route === "demo" ? "Exit guided demo" : "Open guided demo";
    elements.demoModeBtn.classList.add("active");
  }

  if (elements.routePreviousBtn) {
    elements.routePreviousBtn.hidden = !config.previous;
    elements.routePreviousBtn.dataset.route = config.previous || "";
    elements.routePreviousBtn.textContent = config.previous ? `Previous: ${ROUTE_CONFIG[config.previous].title}` : "Previous";
  }
  if (elements.routeNextBtn) {
    elements.routeNextBtn.hidden = !config.next;
    elements.routeNextBtn.dataset.route = config.next || "";
    elements.routeNextBtn.textContent = config.next ? `Next: ${ROUTE_CONFIG[config.next].title}` : "Next";
  }

  document.querySelectorAll("[data-route-link]").forEach((link) => {
    const selected = link.dataset.routeLink === route;
    link.classList.toggle("active", selected);
    if (selected) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  document.querySelectorAll("[data-workflow-route]").forEach((link) => {
    const selected = link.dataset.workflowRoute === route;
    link.classList.toggle("active", selected);
    if (selected) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  });

  if (!isDashboard && elements.routeRecommendationText && elements.routeRecommendationBtn) {
    const recommendation = recommendedNextAction(opportunity);
    elements.routeRecommendationText.textContent = recommendation.title;
    elements.routeRecommendationBtn.textContent = recommendation.cta;
    elements.routeRecommendationBtn.dataset.journeyAction = recommendation.action;
    elements.routeRecommendationBtn.dataset.journeyTarget = recommendation.target;
  }
}

function applyRoute(route = routeFromHash(), { scroll = true } = {}) {
  activeRoute = ROUTE_CONFIG[route] ? route : "dashboard";
  document.body.dataset.activeRoute = activeRoute;
  const isDashboard = activeRoute === "dashboard";

  document.querySelectorAll("[data-route-screen]").forEach((screen) => {
    const routes = String(screen.dataset.routeScreen || "").split(/\s+/).filter(Boolean);
    screen.hidden = !routes.includes(activeRoute);
  });
  document.querySelectorAll("[data-route-view]").forEach((view) => {
    const routes = String(view.dataset.routeView || "").split(/\s+/).filter(Boolean);
    view.hidden = !routes.includes(activeRoute);
  });

  if (elements.workspaceGrid) elements.workspaceGrid.hidden = isDashboard;
  if (elements.recordHeader) elements.recordHeader.hidden = isDashboard;
  updateRouteChrome(activeRoute);
  document.title = `${ROUTE_CONFIG[activeRoute].title} | Airport IT Pre-Sales Readiness Hub`;
  if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
}

function navigateToRoute(route, options = {}) {
  const nextRoute = ROUTE_CONFIG[route] ? route : "dashboard";
  const nextHash = `#/${nextRoute}`;
  if (window.location.hash !== nextHash) {
    const method = options.replace ? "replaceState" : "pushState";
    window.history[method](null, "", nextHash);
  }
  applyRoute(nextRoute, { scroll: options.scroll !== false });
}

function scrollToSection(selector) {
  navigateToRoute(routeForTarget(selector));
}
function validationsFor(opportunityId = selectedId) {
  return byOpportunity(mockDb.stakeholderValidations, opportunityId);
}

function risksFor(opportunityId = selectedId) {
  return byOpportunity(mockDb.risks, opportunityId);
}

function assumptionsFor(opportunityId = selectedId) {
  return byOpportunity(mockDb.assumptions, opportunityId);
}

function decisionsFor(opportunityId = selectedId) {
  return byOpportunity(mockDb.decisions, opportunityId).sort((a, b) => b.date.localeCompare(a.date));
}

function airportProfileFor(opportunityId = selectedId) {
  let profile = mockDb.airportProfiles.find((item) => item.opportunity_id === opportunityId);
  if (!profile) {
    const opportunity = mockDb.opportunities.find((item) => item.id === opportunityId) || selectedOpportunity();
    profile = airportProfile(opportunityId, opportunity.customer, 0, 0, opportunity.region);
    mockDb.airportProfiles.push(profile);
  }
  return profile;
}

function sizingEstimatesFor(opportunityId = selectedId) {
  return byOpportunity(mockDb.sizingEstimates, opportunityId);
}

function validationRequestsFor(opportunityId = selectedId) {
  return byOpportunity(mockDb.validationRequests, opportunityId);
}

function notificationForRequest(requestId) {
  return mockDb.notifications.find((item) => item.validation_request_id === requestId);
}

function governanceItemsFor(opportunityId = selectedId, forum) {
  const items = byOpportunity(mockDb.governanceItems, opportunityId);
  return forum ? items.filter((item) => item.forum === forum) : items;
}
function categoryIndex(category) {
  return AIRPORT_CATEGORIES.indexOf(category);
}

function categoryForMetric(value, minField, maxField) {
  const numericValue = Number(value) || 0;
  const match = mockDb.classificationRules.find(
    (rule) => rule.active && numericValue >= rule[minField] && numericValue < rule[maxField],
  );
  return match?.category || "Extra Large";
}

function classifyAirport(profile) {
  if (profile.categorization_override && isDocumented(profile.override_reason)) {
    profile.airport_category = profile.categorization_override;
    profile.categorization_method = "Manual override";
    return profile.airport_category;
  }

  const passengerCategory = categoryForMetric(profile.annual_passengers, "passenger_min", "passenger_max");
  const movementCategory = categoryForMetric(profile.annual_movements, "movement_min", "movement_max");
  profile.airport_category =
    categoryIndex(passengerCategory) >= categoryIndex(movementCategory) ? passengerCategory : movementCategory;
  profile.categorization_method = "Default rules";
  return profile.airport_category;
}
function filteredOpportunities() {
  if (demoMode && selectedId === DEMO_OPPORTUNITY_ID) {
    const demoOpportunity = mockDb.opportunities.find((opportunity) => opportunity.id === DEMO_OPPORTUNITY_ID);
    return demoOpportunity ? [demoOpportunity] : [];
  }
  const query = elements.searchInput.value.trim().toLowerCase();
  const forum = elements.stageFilter.value;
  const result = mockDb.opportunities.filter((opportunity) => {
    const products = productScopesFor(opportunity.id).map((item) => item.product_name);
    const stakeholders = validationsFor(opportunity.id).map((item) => `${item.function} ${item.stakeholder_name}`);
    const matchesForum = forum === "all" || opportunity.current_governance_stage === forum;
    const haystack = [
      opportunity.id,
      opportunity.name,
      opportunity.customer,
      opportunity.region,
      opportunity.sales_owner,
      opportunity.presales_owner,
      opportunity.opportunity_stage,
      opportunity.current_governance_stage,
      opportunity.strategic_importance,
      opportunity.complexity,
      opportunity.strategic_rationale,
      opportunity.bid_no_bid_recommendation,
      opportunity.preliminary_architecture,
      opportunity.delivery_dependency,
      opportunity.integration_assumptions,
      opportunity.business_case_status,
      opportunity.pricing_readiness_status,
      opportunity.executive_decision_required,
      opportunity.exceptions_approval_conditions,
      ...products,
      ...stakeholders,
    ]
      .join(" ")
      .toLowerCase();
    return matchesForum && haystack.includes(query);
  });

  if (sortByReadiness) {
    result.sort((a, b) => readiness(a) - readiness(b));
  }

  return result;
}

export {
  mockDb,
  PERSISTED_STATE_KEY,
  loadPersistedState,
  persistState,
  selectedId,
  sortByReadiness,
  selectedValidationRequestId,
  estimateProductFilter,
  estimateStatusFilter,
  estimateExpansionOpportunityId,
  expandedEstimateProducts,
  selectedNotificationChannel,
  demoMode,
  demoPresenterStep,
  activeRoute,
  elements,
  selectedOpportunity,
  byOpportunity,
  productScopesFor,
  showToast,
  routeFromHash,
  routeForTarget,
  updateRouteChrome,
  applyRoute,
  navigateToRoute,
  scrollToSection,
  validationsFor,
  risksFor,
  assumptionsFor,
  decisionsFor,
  airportProfileFor,
  sizingEstimatesFor,
  validationRequestsFor,
  notificationForRequest,
  governanceItemsFor,
  categoryIndex,
  categoryForMetric,
  classifyAirport,
  filteredOpportunities,
  setMockDb,
  setSelectedId,
  setSortByReadiness,
  setSelectedValidationRequestId,
  setEstimateProductFilter,
  setEstimateStatusFilter,
  setEstimateExpansionOpportunityId,
  setSelectedNotificationChannel,
  setDemoMode,
  setDemoPresenterStep,
  setActiveRoute,
};

// Setters exist because these are mutable module-level bindings: ES modules
// only allow the owning module to reassign them, so other modules call these
// instead of assigning the imported name directly.
function setMockDb(value) {
  mockDb = value;
}
function setSelectedId(value) {
  selectedId = value;
}
function setSortByReadiness(value) {
  sortByReadiness = value;
}
function setSelectedValidationRequestId(value) {
  selectedValidationRequestId = value;
}
function setEstimateProductFilter(value) {
  estimateProductFilter = value;
}
function setEstimateStatusFilter(value) {
  estimateStatusFilter = value;
}
function setEstimateExpansionOpportunityId(value) {
  estimateExpansionOpportunityId = value;
}
function setSelectedNotificationChannel(value) {
  selectedNotificationChannel = value;
}
function setDemoMode(value) {
  demoMode = value;
}
function setDemoPresenterStep(value) {
  demoPresenterStep = value;
}
function setActiveRoute(value) {
  activeRoute = value;
}
