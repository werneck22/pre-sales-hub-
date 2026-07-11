import {
  AIRPORT_CATEGORIES,
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
  buildSizingOwners,
  makeValidation,
  productScope,
  risk,
} from "./data.js?v=20260711-3";
import {
  readiness,
} from "./readiness-rules.js?v=20260711-3";
import {
  recommendedNextAction,
} from "./render.js?v=20260711-3";

let mockDb = {
  opportunities: [
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
      implementation_start: "2026-11-02",
      go_live_date: "2027-09-30",
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
      implementation_start: "2027-01-11",
      go_live_date: "2027-12-15",
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
      implementation_start: "",
      go_live_date: "",
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
      implementation_start: "2027-02-01",
      go_live_date: "2027-11-30",
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
    productScope("opp-ams-01", "CUSS", "Sized", "Elena Rossi", "Validated", "Medium", "86 kiosks, existing peripheral assumptions to confirm."),
    productScope("opp-ams-01", "CUPPS", "Draft", "Elena Rossi", "In review", "Medium", "142 workstations across terminal migration waves."),
    productScope("opp-ams-01", "Standalone Biopod", "Draft", "Product owner", "In review", "High", "Privacy and airline participation model pending."),
    productScope("opp-ams-01", "Integrations & APIs", "Draft", "Integration SME", "In review", "High", "9 candidate API touchpoints identified."),
    productScope("opp-ams-01", "Support & Field Services", "Sized", "Support lead", "Validated", "Medium", "Three support zones assumed."),
    productScope("opp-sin-02", "CUSS", "Sized", "Priya Menon", "Validated", "Medium", "120 kiosks across departure halls."),
    productScope("opp-sin-02", "ABD", "Draft", "ABD product owner", "In review", "High", "44 bag drops; baggage interface dependencies open."),
    productScope("opp-sin-02", "Standalone Biopod", "Sized", "Product owner", "Validated", "Medium", "36 biopod touchpoints."),
    productScope("opp-sin-02", "DDS", "Validated", "Display SME", "Validated", "Low", "310 display endpoints."),
    productScope("opp-sin-02", "Support & Field Services", "Draft", "Support lead", "Blocked", "High", "Field coverage model not yet agreed."),
    productScope("opp-gru-03", "AODB", "Draft", "Camila Almeida", "In review", "High", "Core AODB scope depends on incumbent discovery."),
    productScope("opp-gru-03", "DDS", "Not started", "Display SME", "Pending", "Medium", "420 displays estimated from airport inventory."),
    productScope("opp-gru-03", "Integrations & APIs", "Not started", "Integration SME", "Pending", "High", "18 integrations assumed; catalogue pending."),
    productScope("opp-dfw-04", "CUPPS", "Sized", "Jordan Lee", "Validated", "Medium", "96 workstations across new gates."),
    productScope("opp-dfw-04", "CUSS", "Draft", "Jordan Lee", "In review", "Medium", "58 kiosks, airline branding assumptions open."),
    productScope("opp-dfw-04", "AODB", "Draft", "AODB SME", "In review", "Medium", "Operational data feed needed for concourse visibility."),
    productScope("opp-dfw-04", "Integrations & APIs", "Draft", "Integration SME", "Pending", "High", "12 candidate interfaces; airline ownership unclear."),
    productScope("opp-ams-01", "Seamless Journey Full", "Draft", "Product owner", "In review", "High", "Full self-service journey pending airline participation model."),
    productScope("opp-sin-02", "Baggage Reconciliation System", "Draft", "SBD product owner", "In review", "High", "BRS scope tied to bag drop interface dependencies."),
    productScope("opp-gru-03", "Seamless GT11 eGate - Non Biometric", "Not started", "Camila Almeida", "Pending", "Medium", "One door hardware count pending incumbent discovery."),
    productScope("opp-dfw-04", "Seamless GT11 eGate - Biopod", "Draft", "Jordan Lee", "In review", "High", "Biopod placement pending gate concourse survey."),
  ],
  stakeholderValidations: [
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
    risk("opp-ams-01", "Regulatory", "Biometric privacy requirements vary by terminal and airline.", "High", "Confirm privacy model with product and legal.", "Product", "Open"),
    risk("opp-sin-02", "Delivery", "Field service coverage assumptions not aligned with support model.", "High", "Baseline support zones and escalation model.", "Support", "Mitigating"),
    risk("opp-gru-03", "Technical", "Incumbent systems landscape is incomplete and may affect integration sizing.", "High", "Request interface catalogue before SRM.", "Solution Consulting", "Open"),
    risk("opp-dfw-04", "Governance", "Airline consortium decision rights are not yet confirmed.", "High", "Schedule stakeholder alignment workshop.", "Sales", "Open"),
    risk("opp-ams-01", "Exclusion", "Civil works and counter furniture are outside Amadeus scope.", "Low", "Keep exclusion visible in proposal assumptions.", "Sales", "Open"),
  ],
  assumptions: [
    assumption("opp-ams-01", "Existing CUPPS workstation footprint can be reused.", "Technical", "Medium", "Solution Consulting"),
    assumption("opp-sin-02", "Customer will provide airport network readiness evidence before SRM closure.", "Delivery", "Medium", "Delivery"),
    assumption("opp-gru-03", "Customer can provide interface catalogue within two weeks of kickoff.", "Technical", "High", "Sales"),
    assumption("opp-dfw-04", "Existing gate infrastructure can support the common use expansion.", "Technical", "Medium", "Solution Consulting"),
  ],
  decisions: [
    decision("opp-ams-01", "SRM", "Proceed to SME validation for biometrics and API scope.", "SRM Chair", "2026-06-03", "Product and legal validation required.", "Close privacy and API actions before BAB."),
    decision("opp-ams-01", "SRM", "Pricing model pending support volume confirmation.", "Pricing", "2026-06-10", "Support scope must be frozen.", "Confirm support volume by next SRM checkpoint."),
    decision("opp-sin-02", "BAB", "BAB can proceed after support coverage model is baselined.", "BAB Sponsor", "2026-06-04", "Support blocker resolved.", "Return with cost-to-serve summary."),
    decision("opp-gru-03", "BCM", "Continue discovery before bid recommendation.", "BCM Chair", "2026-06-01", "Customer interface catalogue needed.", "Schedule technical discovery."),
    decision("opp-dfw-04", "SRM", "Schedule stakeholder alignment workshop before final SRM slot.", "Sales", "2026-06-11", "Airline decision authority unclear.", "Confirm governance participants."),
  ],
  governanceItems: [
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
    airportProfile("opp-ams-01", "Amsterdam Airport Partner", 28000000, 230000, "EMEA"),
    airportProfile("opp-sin-02", "Changi Regional Ventures", 42000000, 260000, "APAC"),
    airportProfile("opp-gru-03", "Sao Paulo Airport Authority", 18000000, 160000, "LATAM"),
    airportProfile("opp-dfw-04", "DFW Airline Consortium", 36000000, 270000, "NORAM"),
  ],
  classificationRules: defaultClassificationRules(),
  sizingRules: buildDefaultSizingRules(),
  sizingEstimates: [],
  resourceOwners: buildResourceOwners(),
  sizingOwners: buildSizingOwners(),
  validationRequests: [],
  notifications: [],
};

const PERSISTED_STATE_KEY = "presalesHub.state.v2";
const LEGACY_STATE_KEYS = ["presalesHub.state.v1"];

function loadPersistedState() {
  try {
    for (const key of [PERSISTED_STATE_KEY, ...LEGACY_STATE_KEYS]) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.mockDb?.opportunities) && parsed.mockDb.opportunities.length) return parsed;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Reference data always comes fresh from the current build so new products,
// sizing rules, and owners show up even when an older localStorage snapshot is
// loaded (JSON.stringify also drops the Infinity bounds in classification
// rules, so persisted copies of them are unusable anyway).
function migrateMockDb(db) {
  db.classificationRules = defaultClassificationRules();
  db.sizingRules = buildDefaultSizingRules();
  db.resourceOwners = buildResourceOwners();
  // Merge the global owner registry: keep any owner names/emails the user
  // registered, add rows for new product+workstream scopes from this build.
  const seededOwners = buildSizingOwners();
  const existingOwners = new Map((Array.isArray(db.sizingOwners) ? db.sizingOwners : []).map((owner) => [owner.key, owner]));
  db.sizingOwners = seededOwners.map((seed) => {
    const saved = existingOwners.get(seed.key);
    return saved ? { ...seed, owner_name: saved.owner_name || seed.owner_name, owner_email: saved.owner_email || seed.owner_email } : seed;
  });
  [
    "opportunities",
    "productScopes",
    "stakeholderValidations",
    "risks",
    "assumptions",
    "decisions",
    "governanceItems",
    "airportProfiles",
    "sizingEstimates",
    "validationRequests",
    "notifications",
  ].forEach((collection) => {
    if (!Array.isArray(db[collection])) db[collection] = [];
  });
  // The guided demo and its "Estephan Airport Modernization" scenario were
  // removed; drop the seeded demo opportunity and everything scoped to it so
  // returning users no longer see it.
  const removedOpportunityIds = new Set(["opp-est-00"]);
  db.opportunities = db.opportunities.filter((item) => !removedOpportunityIds.has(item.id));
  [
    "productScopes",
    "stakeholderValidations",
    "risks",
    "assumptions",
    "decisions",
    "governanceItems",
    "airportProfiles",
    "sizingEstimates",
    "validationRequests",
    "notifications",
  ].forEach((collection) => {
    db[collection] = db[collection].filter(
      (item) => !removedOpportunityIds.has(item.opportunity_id) && !removedOpportunityIds.has(item.opportunityId),
    );
  });
  // Validation is one request per activity line (product + workstream), keyed
  // by sizing_estimate_id. Drop any product-level requests from the interim
  // build (no sizing_estimate_id); the per-line workflow is regenerated from
  // the persisted estimates on load, preserving owner decisions on the lines.
  if (db.validationRequests.some((request) => !request.sizing_estimate_id)) {
    db.validationRequests = db.validationRequests.filter((request) => request.sizing_estimate_id);
    db.notifications = db.notifications.filter((item) =>
      db.validationRequests.some((request) => request.id === item.validation_request_id),
    );
  }
  // Rename products in any persisted scopes/estimates so returning users pick
  // up the restructured catalog without needing a reset.
  const productRenames = {
    SBD: "ABD",
    Biometrics: "Standalone Biopod",
    "DDS/FIDS": "DDS",
    "Seamless GT 11 One Door Non Biometric Hardware": "Seamless GT11 eGate - Non Biometric",
    "Seamless GT 11 + Seamless Journey Platform Lite": "Seamless Journey Platform Lite",
    "Seamless GT 11 + Seamless Journey Platform": "Seamless Journey Full",
    "Seamless GT 11 + Biopod": "Seamless GT11 eGate - Biopod",
    "Integrations / APIs": "Integrations & APIs",
    "Support / Field Services": "Support & Field Services",
  };
  [db.productScopes, db.sizingEstimates].forEach((collection) => {
    collection.forEach((item) => {
      if (item.product_name && productRenames[item.product_name]) {
        item.product_name = productRenames[item.product_name];
      }
    });
  });
  db.opportunities.forEach((opportunity) => {
    opportunity.implementation_start ||= "";
    opportunity.go_live_date ||= "";
  });
  // Airport Insight moved from a Yes/No flag to a tier select; legacy "Yes"
  // maps to the lowest tier (Standard) for the owner to review.
  db.productScopes.forEach((scope) => {
    const insight = scope.sizing_inputs?.cupps_airport_insight;
    if (insight === 0 || insight === "0") scope.sizing_inputs.cupps_airport_insight = "None";
    else if (insight === 1 || insight === "1") scope.sizing_inputs.cupps_airport_insight = "Standard";
  });
  db.airportProfiles.forEach((profile) => {
    profile.airport_code ||= "";
    profile.airport_city ||= "";
    profile.airport_state ||= "";
    profile.airport_country ||= "";
    profile.traffic_source ||= "";
    profile.traffic_source_label ||= "";
    profile.traffic_source_year ||= "";
    profile.traffic_retrieved_at ||= "";
    profile.traffic_fetched_passengers ||= 0;
  });
  return db;
}

function persistState() {
  try {
    window.localStorage.setItem(PERSISTED_STATE_KEY, JSON.stringify({ mockDb, selectedId }));
    LEGACY_STATE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    // Storage unavailable (private browsing, quota) - the session keeps working in memory only.
  }
}

function clearPersistedState() {
  try {
    [PERSISTED_STATE_KEY, ...LEGACY_STATE_KEYS].forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    // Storage unavailable - nothing to clear.
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
// Sub-tab on the Resource Validation screen: product owner validation vs the
// internal function sign-off matrix (formerly the Stakeholders screen).
let validationTab = "owners";
// Owner registry tab: false = only products in the selected opportunity's
// scope; true = the full catalogue.
let registryShowAll = false;
// Activity-validation queue: which product groups are expanded (accordion) and
// the status filter. An empty open-set means "auto-open the selected line's
// product only" so a multi-product queue stays compact.
const validationOpenProducts = new Set();
let validationLineFilter = "all";
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
  searchResults: document.querySelector("#searchResults"),
  stageFilter: document.querySelector("#stageFilter"),
  sortReadinessBtn: document.querySelector("#sortReadinessBtn"),
  newOpportunityBtn: document.querySelector("#newOpportunityBtn"),
  resetDataBtn: document.querySelector("#resetDataBtn"),
  exportSizingCsvBtn: document.querySelector("#exportSizingCsvBtn"),
  printBusinessCaseBtn: document.querySelector("#printBusinessCaseBtn"),
  toastRegion: document.querySelector("#toastRegion"),
  executiveNextActions: document.querySelector("#executiveNextActions"),
  executiveAttentionList: document.querySelector("#executiveAttentionList"),
  topReadinessGaps: document.querySelector("#topReadinessGaps"),
  dashboardEmptyState: document.querySelector("#dashboardEmptyState"),
  opportunityList: document.querySelector("#opportunityList"),
  intakeForm: document.querySelector("#intakeForm"),
  intakeNarrativeSummary: document.querySelector("#intakeNarrativeSummary"),
  intakeAirportSummary: document.querySelector("#intakeAirportSummary"),
  generateSizingBtn: document.querySelector("#generateSizingBtn"),
  productScope: document.querySelector("#productScope"),
  airportProfileForm: document.querySelector("#airportProfileForm"),
  airportLookupBtn: document.querySelector("#airportLookupBtn"),
  airportLookupStatus: document.querySelector("#airportLookupStatus"),
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
  validationTabs: document.querySelector("#validationTabs"),
  validationOwnersPanel: document.querySelector("#validationOwnersPanel"),
  ownerRegistryPanel: document.querySelector("#ownerRegistryPanel"),
  ownerRegistryTable: document.querySelector("#ownerRegistryTable"),
  functionSignoffPanel: document.querySelector("#functionSignoffPanel"),
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
  metricPipeline: document.querySelector("#metricPipeline"),
  metricPipelineValue: document.querySelector("#metricPipelineValue"),
  metricAtRisk: document.querySelector("#metricAtRisk"),
  metricBlockers: document.querySelector("#metricBlockers"),
  metricReadiness: document.querySelector("#metricReadiness"),
  metricPendingSizing: document.querySelector("#metricPendingSizing"),
  metricOverdueValidations: document.querySelector("#metricOverdueValidations"),
  metricInitialMd: document.querySelector("#metricInitialMd"),
  metricValidatedMd: document.querySelector("#metricValidatedMd"),
  metricMdDelta: document.querySelector("#metricMdDelta"),
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
  const legacyRoutes = { "risk-log": "risks", validation: "validation", stakeholders: "validation", demo: "dashboard" };
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

  if (elements.routePreviousBtn) {
    elements.routePreviousBtn.hidden = !config.previous;
    elements.routePreviousBtn.dataset.route = config.previous || "";
    elements.routePreviousBtn.textContent = "Previous";
    elements.routePreviousBtn.title = config.previous ? `Previous: ${ROUTE_CONFIG[config.previous].title}` : "Previous";
  }
  if (elements.routeNextBtn) {
    elements.routeNextBtn.hidden = !config.next;
    elements.routeNextBtn.dataset.route = config.next || "";
    elements.routeNextBtn.textContent = "Next";
    elements.routeNextBtn.title = config.next ? `Next: ${ROUTE_CONFIG[config.next].title}` : "Next";
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
  migrateMockDb,
  persistState,
  clearPersistedState,
  selectedId,
  sortByReadiness,
  selectedValidationRequestId,
  estimateProductFilter,
  estimateStatusFilter,
  estimateExpansionOpportunityId,
  expandedEstimateProducts,
  selectedNotificationChannel,
  validationTab,
  registryShowAll,
  validationOpenProducts,
  validationLineFilter,
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
  setValidationTab,
  setRegistryShowAll,
  toggleValidationProduct,
  setValidationLineFilter,
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
function setValidationTab(value) {
  validationTab = ["signoff", "registry"].includes(value) ? value : "owners";
}
function setRegistryShowAll(value) {
  registryShowAll = Boolean(value);
}
function toggleValidationProduct(product) {
  if (validationOpenProducts.has(product)) validationOpenProducts.delete(product);
  else validationOpenProducts.add(product);
}
function setValidationLineFilter(value) {
  validationLineFilter = value;
}
function setActiveRoute(value) {
  activeRoute = value;
}
