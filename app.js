const PRODUCT_NAMES = [
  "CUSS",
  "CUPPS",
  "SBD",
  "Biometrics",
  "AODB",
  "DDS/FIDS",
  "Integrations / APIs",
  "Support / Field Services",
];

const GOVERNANCE_FORUMS = ["BCM", "SRM", "BAB"];
const VALIDATION_STATUSES = ["Pending", "In review", "Validated", "Blocked"];
const GOVERNANCE_STATUSES = ["Not started", "In progress", "Ready", "Conditionally approved", "Approved", "Blocked"];
const SIZING_STATUSES = ["Not started", "Draft", "Sized", "Validated"];
const SCOPE_STATUSES = ["In scope", "Optional", "Deferred"];
const RISK_LEVELS = ["Low", "Medium", "High"];
const AIRPORT_CATEGORIES = ["Small", "Medium", "Large", "Extra Large"];
const COMPLEXITY_LEVELS = ["Low", "Medium", "High", "Very High"];
const VALIDATION_REQUEST_STATUSES = [
  "Not Started",
  "Pending Validation",
  "Approved",
  "Approved with Conditions",
  "Needs Adjustment",
  "More Information Requested",
  "Rejected",
  "Overdue",
];
const WORKSTREAMS = [
  "Implementation",
  "R&D",
  "Project Management",
  "Airline Onboarding",
  "Integrations",
  "Testing & Cutover",
  "Training",
  "Support Readiness",
  "Field Services",
];

const DASHBOARD_TODAY = "2026-06-17";
const DEMO_OPPORTUNITY_ID = "opp-est-00";
const DEMO_SCENARIO_NAME = "Estephan Airport Modernization - From Intake to BAB Readiness";

const HELP_TEXT = {
  airportCategorization:
    "Airport category is derived from annual passengers and aircraft movements. If the two measures differ, the larger category is used.",
  productScope:
    "Product scope defines which sizing rules, workstreams, resource owners, and validations are included in the opportunity baseline.",
  automatedSizing:
    "Initial MDs are generated from configurable mock rules based on airport category, product scope, complexity, risk, and product drivers. Validation is required before governance use.",
  mdEstimates:
    "MD means man-day. Initial MD is the generated baseline, adjusted MD records an owner change, and final MD is available after approval.",
  complexity:
    "Complexity adjusts the mock sizing baseline for solution and delivery difficulty. Use the level that best reflects the known opportunity conditions.",
  confidence:
    "Confidence indicates how reliable the initial estimate is based on the available scope, assumptions, complexity, and risk inputs.",
  resourceValidation:
    "Requests are routed by product, workstream, and region. Owner responses create the traceable evidence used by SRM and BAB readiness.",
  notificationPreview:
    "Generate simulated Email or Teams validation requests for the selected resource owner. The MVP records the trigger locally and does not send external messages.",
  srmReadiness:
    "SRM readiness indicates whether validated technical and delivery inputs are sufficient to proceed to solution review.",
  babReadiness:
    "BAB readiness indicates whether SRM, validated effort, business case inputs, risks, and executive decisions are sufficiently prepared for approval.",
  decisionLog:
    "The decision log preserves forum outcomes, owners, conditions, and next steps as governance evidence.",
  manualOverrides:
    "Manual overrides require justification to preserve traceability. The original rule calculation remains visible for comparison.",
  businessCasePack:
    "The business case pack consolidates the validated sizing baseline, scope, assumptions, open risks, approval conditions, and decisions into one read-only summary, with a historical benchmark comparison for similar airports.",
};

const ROUTE_CONFIG = {
  dashboard: { area: "Portfolio", title: "Executive Dashboard", previous: "", next: "intake" },
  intake: { area: "Opportunity", title: "Opportunity Intake", previous: "dashboard", next: "scope" },
  scope: { area: "Opportunity", title: "Product Scope", previous: "intake", next: "sizing" },
  sizing: { area: "Opportunity", title: "Automated Sizing", previous: "scope", next: "validation" },
  validation: { area: "Validation", title: "Resource Validation", previous: "sizing", next: "governance" },
  governance: { area: "Governance", title: "Readiness", previous: "validation", next: "stakeholders" },
  stakeholders: { area: "Validation", title: "Stakeholder Matrix", previous: "governance", next: "risks" },
  risks: { area: "Governance", title: "Risks & Assumptions", previous: "stakeholders", next: "decisions" },
  decisions: { area: "Governance", title: "Decision Log", previous: "risks", next: "businessCase" },
  businessCase: { area: "Governance", title: "Business Case Pack", previous: "decisions", next: "dashboard" },
  demo: { area: "Presentation", title: "Guided Demo Scenario", previous: "dashboard", next: "" },
};

const TARGET_ROUTE_MAP = {
  "#dashboard": "dashboard",
  "#intake": "intake",
  "#scope": "scope",
  "#sizing": "sizing",
  "#resource-validation": "validation",
  "#governance": "governance",
  "#validation": "stakeholders",
  "#stakeholders": "stakeholders",
  "#risk-log": "risks",
  "#decisions": "decisions",
  "#business-case": "businessCase",
  "#businessCase": "businessCase",
  ".journey-panel": "demo",
  ".workspace-grid": "intake",
};

const productRuleCodes = {
  CUSS: "CUSS",
  CUPPS: "CUPPS",
  SBD: "SBD",
  Biometrics: "BIO",
  AODB: "AODB",
  "DDS/FIDS": "DDS",
  "Integrations / APIs": "API",
  "Support / Field Services": "SUP",
};

const workstreamRuleCodes = {
  Implementation: "IMP",
  "R&D": "RD",
  "Project Management": "PM",
  "Airline Onboarding": "ONB",
  Integrations: "INT",
  "Testing & Cutover": "TST",
  Training: "TRN",
  "Support Readiness": "SUP",
  "Field Services": "FLD",
};

const categoryRuleCodes = {
  Small: "SML",
  Medium: "MED",
  Large: "LRG",
  "Extra Large": "XL",
};

const complexityRuleCodes = {
  Low: "LOW",
  Medium: "MED",
  High: "HIGH",
  "Very High": "VHIGH",
};

const complexityMultipliers = {
  Low: 0.85,
  Medium: 1,
  High: 1.25,
  "Very High": 1.55,
};

const riskMultipliers = {
  Low: 0.95,
  Medium: 1,
  High: 1.15,
};

const productWorkstreamBase = {
  CUSS: {
    Implementation: 18,
    "R&D": 8,
    "Project Management": 7,
    "Airline Onboarding": 8,
    "Testing & Cutover": 7,
    Training: 4,
    "Support Readiness": 5,
  },
  CUPPS: {
    Implementation: 25,
    "R&D": 10,
    "Project Management": 9,
    "Airline Onboarding": 10,
    Integrations: 8,
    "Testing & Cutover": 8,
    Training: 5,
    "Support Readiness": 5,
  },
  SBD: {
    Implementation: 20,
    "R&D": 10,
    "Project Management": 8,
    Integrations: 12,
    "Testing & Cutover": 9,
    Training: 5,
    "Support Readiness": 6,
    "Field Services": 10,
  },
  Biometrics: {
    Implementation: 16,
    "R&D": 20,
    "Project Management": 8,
    Integrations: 18,
    "Testing & Cutover": 10,
    Training: 4,
    "Support Readiness": 7,
  },
  AODB: {
    Implementation: 18,
    "R&D": 14,
    "Project Management": 12,
    Integrations: 18,
    "Testing & Cutover": 10,
    Training: 6,
    "Support Readiness": 6,
  },
  "DDS/FIDS": {
    Implementation: 14,
    "Project Management": 6,
    Integrations: 8,
    "Testing & Cutover": 6,
    Training: 4,
    "Support Readiness": 4,
    "Field Services": 8,
  },
  "Integrations / APIs": {
    Implementation: 8,
    "R&D": 12,
    "Project Management": 6,
    Integrations: 18,
    "Testing & Cutover": 8,
    "Support Readiness": 4,
  },
  "Support / Field Services": {
    "Project Management": 5,
    "Support Readiness": 12,
    "Field Services": 16,
    Training: 4,
  },
};

const productSizingDrivers = {
  CUPPS: [
    {
      key: "cupps_positions",
      label: "CUPPS positions",
      unit: "positions",
      defaults: { Small: 10, Medium: 24, Large: 64, "Extra Large": 120 },
      weight: 0.3,
    },
    {
      key: "check_in_counters",
      label: "Check-in counters",
      unit: "counters",
      defaults: { Small: 16, Medium: 42, Large: 110, "Extra Large": 180 },
      weight: 0.25,
    },
    {
      key: "gates",
      label: "Boarding gates",
      unit: "gates",
      defaults: { Small: 6, Medium: 18, Large: 52, "Extra Large": 85 },
      weight: 0.2,
    },
  ],
  CUSS: [
    {
      key: "cuss_kiosks",
      label: "CUSS kiosks",
      unit: "kiosks",
      defaults: { Small: 8, Medium: 38, Large: 86, "Extra Large": 140 },
      weight: 0.35,
    },
  ],
  SBD: [
    {
      key: "sbd_units",
      label: "SBD units",
      unit: "bag drops",
      defaults: { Small: 4, Medium: 14, Large: 36, "Extra Large": 64 },
      weight: 0.45,
    },
  ],
  Biometrics: [
    {
      key: "biometric_positions",
      label: "Biometric positions",
      unit: "positions",
      defaults: { Small: 6, Medium: 16, Large: 36, "Extra Large": 70 },
      weight: 0.4,
    },
  ],
  AODB: [
    {
      key: "operational_interfaces",
      label: "Operational interfaces",
      unit: "interfaces",
      defaults: { Small: 4, Medium: 8, Large: 14, "Extra Large": 22 },
      weight: 0.35,
    },
    {
      key: "operational_domains",
      label: "Operational domains",
      unit: "domains",
      defaults: { Small: 2, Medium: 4, Large: 6, "Extra Large": 9 },
      weight: 0.2,
    },
  ],
  "DDS/FIDS": [
    {
      key: "display_endpoints",
      label: "Display endpoints",
      unit: "screens",
      defaults: { Small: 60, Medium: 180, Large: 360, "Extra Large": 650 },
      weight: 0.35,
    },
    {
      key: "display_feeds",
      label: "Display data feeds",
      unit: "feeds",
      defaults: { Small: 2, Medium: 4, Large: 7, "Extra Large": 12 },
      weight: 0.18,
    },
  ],
  "Integrations / APIs": [
    {
      key: "integration_count",
      label: "Integrations/APIs",
      unit: "interfaces",
      defaults: { Small: 3, Medium: 5, Large: 10, "Extra Large": 18 },
      weight: 0.45,
    },
  ],
  "Support / Field Services": [
    {
      key: "support_sites",
      label: "Support sites",
      unit: "sites",
      defaults: { Small: 1, Medium: 1, Large: 2, "Extra Large": 3 },
      weight: 0.2,
    },
    {
      key: "coverage_days",
      label: "On-site readiness days",
      unit: "days",
      defaults: { Small: 5, Medium: 10, Large: 18, "Extra Large": 28 },
      weight: 0.25,
    },
  ],
};

const governanceTemplates = {
  BCM: [
    "Intake completeness",
    "Sales owner assigned",
    "Pre-sales owner assigned",
    "Submission deadline known",
    "Product scope defined",
    "Strategic rationale documented",
    "Bid/no-bid recommendation documented",
  ],
  SRM: [
    "Airport category calculated",
    "Product scope completed",
    "Initial sizing generated",
    "Technical assumptions documented",
    "Product owners identified",
    "Implementation validations completed or conditionally approved",
    "R&D validations completed or conditionally approved",
    "Integration risks documented",
    "Critical blockers resolved",
  ],
  BAB: [
    "SRM ready or ready with conditions",
    "Final validated MD available",
    "Business case input complete",
    "Pricing readiness status captured",
    "Key risks and mitigations documented",
    "Delivery effort validated",
    "Executive decision requested",
    "Exceptions documented",
    "Decision log updated",
  ],
};

const stakeholderTemplates = [
  { function: "Sales", stakeholder_name: "Regional sales lead" },
  { function: "Solution Consulting", stakeholder_name: "Airport IT solution consultant" },
  { function: "Product", stakeholder_name: "Product owner" },
  { function: "Delivery", stakeholder_name: "Delivery lead" },
  { function: "Pricing", stakeholder_name: "Commercial finance" },
  { function: "Support", stakeholder_name: "Support readiness lead" },
  { function: "Legal", stakeholder_name: "Contract counsel" },
];

function makeValidation(opportunityId, index, overrides = {}) {
  const template = stakeholderTemplates[index];
  return {
    id: `val-${opportunityId}-${index + 1}`,
    opportunity_id: opportunityId,
    function: template.function,
    stakeholder_name: template.stakeholder_name,
    required: true,
    status: "Pending",
    due_date: "2026-07-10",
    comments: "",
    ...overrides,
  };
}

function makeGovernanceItems(opportunityId, forum, completedIndexes = []) {
  return governanceTemplates[forum].map((label, index) => ({
    id: `gov-${opportunityId}-${forum.toLowerCase()}-${index + 1}`,
    opportunity_id: opportunityId,
    forum,
    label,
    complete: completedIndexes.includes(index),
  }));
}

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

function airportProfile(opportunityId, airportName, annualPassengers, annualMovements, region) {
  return {
    id: `ap-${opportunityId}`,
    opportunity_id: opportunityId,
    airport_name: airportName,
    annual_passengers: annualPassengers,
    annual_movements: annualMovements,
    region,
    airport_category: "",
    categorization_method: "Default rules",
    categorization_override: "",
    override_reason: "",
  };
}

function defaultClassificationRules() {
  return [
    {
      id: "class-small",
      category: "Small",
      passenger_min: 0,
      passenger_max: 2000000,
      movement_min: 0,
      movement_max: 25000,
      active: true,
    },
    {
      id: "class-medium",
      category: "Medium",
      passenger_min: 2000000,
      passenger_max: 10000000,
      movement_min: 25000,
      movement_max: 100000,
      active: true,
    },
    {
      id: "class-large",
      category: "Large",
      passenger_min: 10000000,
      passenger_max: 30000000,
      movement_min: 100000,
      movement_max: 250000,
      active: true,
    },
    {
      id: "class-extra-large",
      category: "Extra Large",
      passenger_min: 30000000,
      passenger_max: Infinity,
      movement_min: 250000,
      movement_max: Infinity,
      active: true,
    },
  ];
}

function sizingRule(productName, airportCategory, workstream, defaultMd, assumptions) {
  const ruleCode = sizingRuleCode(productName, airportCategory, workstream);
  return {
    id: `rule-${slug(productName)}-${slug(airportCategory)}-${slug(workstream)}`,
    rule_code: ruleCode,
    product_name: productName,
    airport_category: airportCategory,
    complexity_factor: 1,
    workstream,
    base_md: defaultMd,
    default_md: defaultMd,
    min_md: Math.max(1, Math.round(defaultMd * 0.65)),
    max_md: Math.max(2, Math.round(defaultMd * 1.8)),
    description: sizingRuleDescription(productName, airportCategory, workstream),
    assumptions,
    active: true,
  };
}

function buildDefaultSizingRules() {
  const categoryFactor = {
    Small: 0.6,
    Medium: 1,
    Large: 1.6,
    "Extra Large": 2.25,
  };

  return Object.entries(productWorkstreamBase).flatMap(([productName, workstreams]) =>
    AIRPORT_CATEGORIES.flatMap((category) =>
      Object.entries(workstreams).map(([workstream, baseMd]) =>
        sizingRule(
          productName,
          category,
          workstream,
          Math.round(baseMd * categoryFactor[category]),
          `${productName} ${workstream} mock baseline for ${category} airport category.`,
        ),
      ),
    ),
  );
}

function resourceOwner(id, name, ownerFunction, email, productScopeValue, region, workstream, backupOwner) {
  return {
    id,
    name,
    function: ownerFunction,
    email,
    product_scope: productScopeValue,
    region,
    workstream,
    backup_owner: backupOwner,
    active: true,
  };
}

function buildResourceOwners() {
  const rows = [
    ["Implementation", "Implementation Owner", "implementation.owner@example.com"],
    ["R&D", "R&D Owner", "rd.owner@example.com"],
    ["Project Management", "PM Owner", "pm.owner@example.com"],
    ["Airline Onboarding", "Airline Onboarding Owner", "airline.onboarding@example.com"],
    ["Integrations", "Integration Owner", "integration.owner@example.com"],
    ["Testing & Cutover", "Testing Owner", "testing.owner@example.com"],
    ["Training", "Training Owner", "training.owner@example.com"],
    ["Support Readiness", "Support Readiness Owner", "support.readiness@example.com"],
    ["Field Services", "Field Services Owner", "field.services@example.com"],
  ];

  const owners = rows.map(([workstream, name, email]) =>
    resourceOwner(`owner-global-${slug(workstream)}`, name, workstream, email, "Any", "Global", workstream, "Backup Resource Owner"),
  );

  owners.push(
    resourceOwner("owner-biometrics-rd-emea", "Biometrics R&D Owner", "R&D", "biometrics.rd@example.com", "Biometrics", "EMEA", "R&D", "R&D Owner"),
    resourceOwner("owner-aodb-pm-emea", "AODB PM Owner", "Project Management", "aodb.pm@example.com", "AODB", "EMEA", "Project Management", "PM Owner"),
    resourceOwner("owner-cupps-implementation-emea", "CUPPS Implementation Owner", "Implementation", "cupps.implementation@example.com", "CUPPS", "EMEA", "Implementation", "Implementation Owner"),
    resourceOwner("owner-cuss-onboarding-emea", "CUSS Airline Onboarding Owner", "Airline Onboarding", "cuss.onboarding@example.com", "CUSS", "EMEA", "Airline Onboarding", "Airline Onboarding Owner"),
    resourceOwner("owner-integration-emea", "EMEA Integration Owner", "Integrations", "emea.integration@example.com", "Integrations / APIs", "EMEA", "Integrations", "Integration Owner"),
  );

  return owners;
}

function productScope(opportunityId, productName, sizingStatus, owner, validationStatus, riskLevel, comments, sizingInputs = {}) {
  return {
    id: `ps-${opportunityId}-${slug(productName)}`,
    opportunity_id: opportunityId,
    product_name: productName,
    scope_status: "In scope",
    sizing_status: sizingStatus,
    owner,
    owner_email: defaultOwnerEmail(owner),
    validation_status: validationStatus,
    risk_level: riskLevel,
    comments,
    sizing_inputs: { ...sizingInputs },
  };
}

function risk(opportunityId, category, description, severity, mitigation, owner, status) {
  return {
    id: `risk-${opportunityId}-${Math.random().toString(36).slice(2, 8)}`,
    opportunity_id: opportunityId,
    category,
    description,
    severity,
    mitigation,
    owner,
    status,
  };
}

function assumption(opportunityId, description, category, impact, owner) {
  return {
    id: `asm-${opportunityId}-${Math.random().toString(36).slice(2, 8)}`,
    opportunity_id: opportunityId,
    description,
    category,
    impact,
    owner,
  };
}

function decision(opportunityId, forum, decisionText, decisionOwner, date, conditions, nextSteps) {
  return {
    id: `dec-${opportunityId}-${Math.random().toString(36).slice(2, 8)}`,
    opportunity_id: opportunityId,
    forum,
    decision: decisionText,
    decision_owner: decisionOwner,
    date,
    conditions,
    next_steps: nextSteps,
  };
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function defaultOwnerEmail(owner) {
  return `${slug(owner || "resource-owner").replaceAll("-", ".")}@example.com`;
}

function sizingRuleCode(productName, airportCategory, workstream, complexity = "") {
  return [
    productRuleCodes[productName] || slug(productName).toUpperCase(),
    workstreamRuleCodes[workstream] || slug(workstream).toUpperCase(),
    categoryRuleCodes[airportCategory] || slug(airportCategory).toUpperCase(),
    complexity ? complexityRuleCodes[complexity] || slug(complexity).toUpperCase() : "",
  ]
    .filter(Boolean)
    .join("-");
}

function sizingRuleDescription(productName, airportCategory, workstream) {
  return `Mock configurable rule for ${productName} ${workstream} at ${airportCategory} airports before complexity, risk, and product-driver adjustments.`;
}

function driversForProduct(productName) {
  return productSizingDrivers[productName] || [];
}

function driverDefault(driver, airportCategory = "Medium") {
  return driver.defaults?.[airportCategory] ?? driver.defaults?.Medium ?? 0;
}

function defaultSizingInputs(productName, airportCategory = "Medium") {
  return Object.fromEntries(driversForProduct(productName).map((driver) => [driver.key, driverDefault(driver, airportCategory)]));
}

function ensureScopeSizingInputs(scope, airportCategory = "Medium") {
  if (!scope) return;
  if (!scope.owner_email) scope.owner_email = defaultOwnerEmail(scope.owner);
  if (!scope.sizing_inputs) scope.sizing_inputs = {};
  driversForProduct(scope.product_name).forEach((driver) => {
    if (scope.sizing_inputs[driver.key] === undefined || scope.sizing_inputs[driver.key] === "") {
      scope.sizing_inputs[driver.key] = driverDefault(driver, airportCategory);
    }
  });
}

function driverDetailsForScope(scope, airportCategory = "Medium") {
  ensureScopeSizingInputs(scope, airportCategory);
  return driversForProduct(scope.product_name).map((driver) => {
    const defaultValue = driverDefault(driver, airportCategory);
    const value = Number(scope.sizing_inputs?.[driver.key] || 0);
    return {
      ...driver,
      defaultValue,
      value,
      ratio: defaultValue ? value / defaultValue : 1,
    };
  });
}

function sizingDriverFactor(scope, airportCategory = "Medium") {
  const drivers = driverDetailsForScope(scope, airportCategory);
  if (!drivers.length) return 1;
  const impact = drivers.reduce((sum, driver) => sum + (driver.ratio - 1) * driver.weight, 0);
  return clamp(1 + impact, 0.7, 1.9);
}

function driverSummary(scope, airportCategory = "Medium") {
  const drivers = driverDetailsForScope(scope, airportCategory);
  if (!drivers.length) return "No product-specific drivers configured";
  return drivers.map((driver) => `${driver.label}: ${formatNumber(driver.value)} ${driver.unit}`).join(" | ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function helpTooltip(key, label) {
  return `<button type="button" class="help-tooltip" data-help-key="${escapeHtml(key)}" data-help-label="${escapeHtml(
    label,
  )}"><span aria-hidden="true">i</span></button>`;
}

function helpTerm(key, label) {
  return `<span class="term-help" tabindex="0" data-help-key="${escapeHtml(key)}" data-help-label="${escapeHtml(label)}">${escapeHtml(
    label,
  )}</span>`;
}

function hydrateHelpTooltips(root = document) {
  root.querySelectorAll("[data-help-key]").forEach((trigger) => {
    const helpText = HELP_TEXT[trigger.dataset.helpKey];
    if (!helpText) return;
    const label = trigger.dataset.helpLabel || "Help";
    trigger.dataset.tooltip = helpText;
    trigger.setAttribute("aria-label", `${label}: ${helpText}`);
    trigger.setAttribute("title", helpText);
  });
}

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

function forumStatusField(forum) {
  return `${forum.toLowerCase()}_status`;
}

function currentForumStatus(opportunity) {
  return opportunity[forumStatusField(opportunity.current_governance_stage)];
}

function isDocumented(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized !== "" && normalized !== "not documented" && normalized !== "none";
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

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function dateDaysBefore(dateValue, days) {
  const date = new Date(`${dateValue || "2026-07-15"}T00:00:00`);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateValue, baseDate = DASHBOARD_TODAY) {
  const target = new Date(`${dateValue || baseDate}T00:00:00`);
  const base = new Date(`${baseDate}T00:00:00`);
  return Math.round((target - base) / 86400000);
}

function formatShortDate(dateValue) {
  if (!dateValue) return "-";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${dateValue}T00:00:00`));
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function confidenceFor(opportunity, scope) {
  if (opportunity.complexity === "Very High" || scope.risk_level === "High") return "Medium";
  if (opportunity.complexity === "High") return "Medium";
  return "High";
}

function resolveResourceOwner(productName, workstream, region) {
  return (
    mockDb.resourceOwners.find(
      (owner) =>
        owner.active &&
        owner.product_scope === productName &&
        owner.workstream === workstream &&
        (owner.region === region || owner.region === "Global"),
    ) ||
    mockDb.resourceOwners.find((owner) => owner.active && owner.product_scope === "Any" && owner.workstream === workstream) ||
    mockDb.resourceOwners.find((owner) => owner.active && owner.workstream === workstream) ||
    mockDb.resourceOwners[0]
  );
}

function ownerName(ownerId) {
  return mockDb.resourceOwners.find((owner) => owner.id === ownerId)?.name || "Unassigned owner";
}

function ownerEmail(ownerId) {
  return mockDb.resourceOwners.find((owner) => owner.id === ownerId)?.email || "owner@example.com";
}

function requestContextFor(request, opportunityOverride = null) {
  const estimate = mockDb.sizingEstimates.find((item) => item.id === request.sizing_estimate_id);
  if (!estimate) return null;
  const opportunity = opportunityOverride || mockDb.opportunities.find((item) => item.id === request.opportunity_id);
  if (!opportunity) return null;
  const owner = mockDb.resourceOwners.find((item) => item.id === request.resource_owner_id);
  const dueIn = daysUntil(request.due_date);
  const effectiveStatus = effectiveRequestStatus(request, dueIn);
  return {
    opportunity,
    request,
    estimate,
    owner,
    dueIn,
    effectiveStatus,
  };
}

function validationRequestContexts(opportunities) {
  const visibleIds = new Set(opportunities.map((opportunity) => opportunity.id));
  return mockDb.validationRequests
    .filter((request) => visibleIds.has(request.opportunity_id))
    .map((request) => requestContextFor(request, opportunities.find((opportunity) => opportunity.id === request.opportunity_id)))
    .filter(Boolean);
}

function defaultValidationRequestId(opportunityId) {
  const opportunity = mockDb.opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return "";
  const contexts = validationRequestContexts([opportunity]);
  return (
    contexts
      .filter((context) => context.request.status !== "Approved")
      .sort((a, b) => requestPriorityScore(b) - requestPriorityScore(a) || a.dueIn - b.dueIn)[0]?.request.id ||
    contexts[0]?.request.id ||
    ""
  );
}

function ownerActionStatuses() {
  return ["Not Started", "Pending Validation", "Needs Adjustment", "More Information Requested", "Overdue"];
}

function effectiveRequestStatus(request, dueIn = daysUntil(request.due_date)) {
  if (["Approved", "Approved with Conditions", "Rejected"].includes(request.status)) return request.status;
  if (request.status === "Overdue" || dueIn < 0) return "Overdue";
  return request.status;
}

function requestNeedsOwnerAction(context) {
  return ownerActionStatuses().includes(context.effectiveStatus);
}

function requestIsOverdue(context) {
  return context.effectiveStatus === "Overdue";
}

function requestActionLabel(context) {
  if (context.effectiveStatus === "Rejected") return "Escalate rejection";
  if (context.effectiveStatus === "Needs Adjustment") return "Owner adjustment required";
  if (requestIsOverdue(context)) return "Overdue owner validation";
  if (context.effectiveStatus === "More Information Requested") return "More information requested";
  if (context.effectiveStatus === "Approved with Conditions") return "Review approval conditions";
  if (context.effectiveStatus === "Approved") return "Approved";
  return "Awaiting owner validation";
}

function requestPriorityScore(context) {
  const statusScore = {
    Rejected: 90,
    Overdue: 80,
    "Needs Adjustment": 65,
    "More Information Requested": 55,
    "Pending Validation": 45,
    "Not Started": 35,
    "Approved with Conditions": 25,
    Approved: 0,
  }[context.effectiveStatus] || 20;
  const dueScore = context.dueIn < 0 ? Math.min(30, Math.abs(context.dueIn) * 4) : context.dueIn <= 7 ? 12 : context.dueIn <= 14 ? 6 : 0;
  const riskScore = context.estimate.confidence_level === "Medium" ? 6 : 0;
  const workstreamScore = ["Implementation", "R&D", "Integrations", "Testing & Cutover", "Field Services"].includes(context.estimate.workstream)
    ? 8
    : 3;
  const mdScore = Math.min(12, Math.round(Number(context.estimate.initial_md || 0) / 10));
  return statusScore + dueScore + riskScore + workstreamScore + mdScore;
}

function requestPriorityLabel(score) {
  if (score >= 95) return "Critical";
  if (score >= 70) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

function requestGovernanceImpact(context) {
  const technicalWorkstreams = ["Implementation", "R&D", "Integrations", "Testing & Cutover", "Field Services"];
  if (["Rejected", "Overdue"].includes(context.effectiveStatus) && technicalWorkstreams.includes(context.estimate.workstream)) return "Blocks SRM/BAB";
  if (requestNeedsOwnerAction(context) && technicalWorkstreams.includes(context.estimate.workstream)) return "SRM dependency";
  if (requestNeedsOwnerAction(context)) return "BAB dependency";
  if (context.effectiveStatus === "Approved with Conditions") return "Conditional";
  return "Tracked";
}

function estimateId(opportunityId, productName, workstream) {
  return `se-${opportunityId}-${slug(productName)}-${slug(workstream)}`;
}

function requestId(estimateIdValue) {
  return `vr-${estimateIdValue.replace(/^se-/, "")}`;
}

function finalMdForEstimate(estimate) {
  if (["Approved", "Approved with Conditions"].includes(estimate.status)) {
    return Number(estimate.adjusted_md || estimate.initial_md);
  }
  return Number(estimate.final_validated_md || 0);
}

function dashboardMdForEstimate(estimate) {
  const finalMd = finalMdForEstimate(estimate);
  return Number(finalMd || estimate.adjusted_md || estimate.initial_md || 0);
}

function formatFactor(value) {
  return `${Number(value || 1).toFixed(2)}x`;
}

function applyEstimateInitialMd(estimate) {
  const manualMd = Number(estimate.manual_override_md || 0);
  const hasJustification = isDocumented(estimate.manual_override_reason);
  if (manualMd > 0 && hasJustification) {
    estimate.initial_md = manualMd;
    estimate.initial_md_source = "Manual override";
    estimate.manual_override_pending = false;
  } else {
    estimate.initial_md = Number(estimate.calculated_md || estimate.initial_md || 0);
    estimate.initial_md_source = "Rule calculation";
    estimate.manual_override_pending = manualMd > 0 && !hasJustification;
  }

  if (["Approved", "Approved with Conditions"].includes(estimate.status)) {
    estimate.final_validated_md = finalMdForEstimate(estimate);
  }
}

function sizingRuleForEstimate(estimate) {
  return mockDb.sizingRules.find((rule) => rule.id === estimate.sizing_rule_id);
}

function estimateWhyText(estimate) {
  const driverText = estimate.sizing_driver_summary || "no product-specific driver was configured";
  const appliedRule = estimate.applied_rule_code || sizingRuleCode(estimate.product_name, estimate.airport_category, estimate.workstream, estimate.complexity);
  const source = estimate.initial_md_source === "Manual override" ? " The final initial MD reflects a justified manual override." : "";
  return `${estimate.product_name} ${estimate.workstream} was estimated at ${estimate.initial_md} MD because the airport is ${estimate.airport_category}, ${driverText}, opportunity complexity is ${estimate.complexity}, product risk is ${estimate.risk_level || "Medium"}, and mock rule ${appliedRule} was applied.${source}`;
}

function buildNotificationBody(opportunity, profile, estimate, owner) {
  return `Hi ${owner.name},

A new pre-sales sizing validation is required for the ${opportunity.name} opportunity.

Product: ${estimate.product_name}
Workstream: ${estimate.workstream}
Initial estimated effort: ${estimate.initial_md} MD
Airport category: ${estimate.airport_category}
Annual passengers: ${formatNumber(profile.annual_passengers)}
Annual movements: ${formatNumber(profile.annual_movements)}
Submission deadline: ${opportunity.submission_deadline}
Assumptions: ${estimate.assumptions_used}
Sizing drivers: ${estimate.sizing_driver_summary || "No product-specific drivers configured"}

Please validate whether this sizing is acceptable, requires adjustment, or should be escalated.

Link to opportunity: [MVP link]

Regards,
Pre-Sales Readiness Hub`;
}

function buildTeamsNotificationBody(opportunity, profile, estimate, owner, dueDate) {
  return `Validation required

${owner.name}, your review is required for an Airport IT pre-sales sizing estimate.

Opportunity: ${opportunity.name}
Airport: ${profile.airport_name} (${estimate.airport_category})
Product: ${estimate.product_name}
Workstream: ${estimate.workstream}
Initial estimate: ${estimate.initial_md} MD
Complexity: ${estimate.complexity}
Validation due: ${dueDate}

Review the assumptions, approve the estimate, adjust the MD, or request more information.

Open opportunity: [MVP link]`;
}

function notificationChannelState(notification, channel) {
  notification.channel_states ||= {};
  notification.channel_states[channel] ||= {
    status: "Draft",
    last_triggered_at: "",
    trigger_count: 0,
  };
  notification.activity ||= [];
  return notification.channel_states[channel];
}

function formatNotificationTimestamp(value) {
  if (!value) return "Not triggered";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function triggerMockNotification(requestId, channel) {
  if (!["Email", "Teams"].includes(channel)) {
    return { ok: false, message: "Select Email or Teams before generating the notification.", tone: "warning" };
  }
  const request = mockDb.validationRequests.find((item) => item.id === requestId);
  const notification = request ? notificationForRequest(request.id) : null;
  const estimate = request ? mockDb.sizingEstimates.find((item) => item.id === request.sizing_estimate_id) : null;
  const owner = request ? mockDb.resourceOwners.find((item) => item.id === request.resource_owner_id) : null;
  if (!request || !notification || !estimate || !owner) {
    return { ok: false, message: "Select a validation request before generating a notification.", tone: "warning" };
  }

  const timestamp = new Date().toISOString();
  const state = notificationChannelState(notification, channel);
  state.status = "Triggered (simulation)";
  state.last_triggered_at = timestamp;
  state.trigger_count += 1;
  notification.status = "Simulation generated";
  notification.sent_date = timestamp.slice(0, 10);
  request.sent_date = timestamp.slice(0, 10);
  notification.activity.unshift({
    id: `activity-${request.id}-${channel.toLowerCase()}-${Date.now()}`,
    channel,
    recipient: notification.recipient,
    status: "Simulation generated",
    created_at: timestamp,
  });
  notification.activity = notification.activity.slice(0, 8);
  selectedNotificationChannel = channel;

  return {
    ok: true,
    message: `${channel} validation request generated for ${owner.name}. No external message was sent.`,
    tone: "success",
  };
}

function runMockNotificationTrigger(button) {
  const result = triggerMockNotification(button.dataset.requestId, button.dataset.notificationTrigger);
  if (result.ok) {
    renderValidationRequests(selectedOpportunity());
    renderNotificationPreview();
  }
  showToast(result.message, result.tone);
}

function upsertValidationWorkflow(opportunity, profile, estimate, owner) {
  const requestKey = requestId(estimate.id);
  let request = mockDb.validationRequests.find((item) => item.id === requestKey);
  if (!request) {
    request = {
      id: requestKey,
      opportunity_id: opportunity.id,
      sizing_estimate_id: estimate.id,
      resource_owner_id: owner.id,
      request_type: "Sizing Validation",
      status: estimate.status,
      due_date: dateDaysBefore(opportunity.submission_deadline, 7),
      sent_date: "",
      response_date: "",
      comments: "",
      adjustment_reason: "",
      escalation_required: false,
    };
    mockDb.validationRequests.push(request);
  } else {
    request.resource_owner_id = owner.id;
    request.status = estimate.status;
  }

  let notification = notificationForRequest(request.id);
  const subject = `Validation Required - ${profile.airport_name} - ${estimate.product_name} ${estimate.workstream} Sizing`;
  const body = buildNotificationBody(opportunity, profile, estimate, owner);
  const recipient = estimate.owner_email || owner.email;
  if (!notification) {
    notification = {
      id: `notif-${request.id}`,
      validation_request_id: request.id,
      recipient,
      subject,
      body,
      teams_title: `Validation required - ${estimate.product_name} ${estimate.workstream}`,
      teams_body: buildTeamsNotificationBody(opportunity, profile, estimate, owner, request.due_date),
      status: "Draft",
      created_date: "2026-06-17",
      sent_date: "",
      channel_states: {},
      activity: [],
    };
    mockDb.notifications.push(notification);
  } else {
    notification.recipient = recipient;
    notification.subject = subject;
    notification.body = body;
    notification.teams_title = `Validation required - ${estimate.product_name} ${estimate.workstream}`;
    notification.teams_body = buildTeamsNotificationBody(opportunity, profile, estimate, owner, request.due_date);
  }

  notificationChannelState(notification, "Email");
  notificationChannelState(notification, "Teams");

  if (!selectedValidationRequestId) {
    selectedValidationRequestId = request.id;
  }
}

function generateSizingForOpportunity(opportunityId, options = {}) {
  const preserveExisting = options.preserveExisting !== false;
  const opportunity = mockDb.opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return;

  const profile = airportProfileFor(opportunityId);
  const category = classifyAirport(profile);
  const scopes = productScopesFor(opportunityId);
  const activeEstimateIds = [];

  scopes.forEach((scope) => {
    ensureScopeSizingInputs(scope, category);
    const workstreams = Object.keys(productWorkstreamBase[scope.product_name] || {});
    workstreams.forEach((workstream) => {
      const rule = mockDb.sizingRules.find(
        (item) =>
          item.active &&
          item.product_name === scope.product_name &&
          item.airport_category === category &&
          item.workstream === workstream,
      );
      if (!rule) return;

      const id = estimateId(opportunityId, scope.product_name, workstream);
      activeEstimateIds.push(id);
      const owner = resolveResourceOwner(scope.product_name, workstream, opportunity.region);
      const driverFactor = sizingDriverFactor(scope, category);
      const driversUsed = driverSummary(scope, category);
      const resolvedOwnerEmail = scope.owner_email || owner.email;
      const complexityMultiplier = complexityMultipliers[opportunity.complexity] || 1;
      const riskMultiplier = riskMultipliers[scope.risk_level] || 1;
      const mockAdjustmentFactor = Number((complexityMultiplier * riskMultiplier * driverFactor).toFixed(3));
      const calculatedMd = clamp(
        Math.round(
          rule.default_md *
            complexityMultiplier *
            riskMultiplier *
            driverFactor,
        ),
        rule.min_md,
        rule.max_md,
      );
      const appliedRuleCode = sizingRuleCode(scope.product_name, category, workstream, opportunity.complexity);
      let estimate = mockDb.sizingEstimates.find((item) => item.id === id);
      if (!estimate || !preserveExisting) {
        estimate = {
          id,
          opportunity_id: opportunityId,
          product_name: scope.product_name,
          workstream,
          airport_category: category,
          complexity: opportunity.complexity,
          risk_level: scope.risk_level,
          initial_md: calculatedMd,
          adjusted_md: "",
          final_validated_md: "",
          sizing_rule_id: rule.id,
          default_rule_code: rule.rule_code,
          applied_rule_code: appliedRuleCode,
          rule_description: rule.description,
          base_md: rule.base_md || rule.default_md,
          calculated_md: calculatedMd,
          complexity_multiplier: complexityMultiplier,
          risk_multiplier: riskMultiplier,
          mock_adjustment_factor: mockAdjustmentFactor,
          manual_override_md: "",
          manual_override_reason: "",
          manual_override_pending: false,
          initial_md_source: "Rule calculation",
          assumptions_used: rule.assumptions,
          sizing_driver_summary: driversUsed,
          sizing_driver_factor: driverFactor,
          confidence_level: confidenceFor(opportunity, scope),
          status: "Pending Validation",
          owner_id: owner.id,
          owner_email: resolvedOwnerEmail,
        };
        mockDb.sizingEstimates = mockDb.sizingEstimates.filter((item) => item.id !== id);
        mockDb.sizingEstimates.push(estimate);
      } else {
        estimate.airport_category = category;
        estimate.complexity = opportunity.complexity;
        estimate.risk_level = scope.risk_level;
        estimate.sizing_rule_id = rule.id;
        estimate.default_rule_code = rule.rule_code;
        estimate.applied_rule_code = appliedRuleCode;
        estimate.rule_description = rule.description;
        estimate.base_md = rule.base_md || rule.default_md;
        estimate.calculated_md = calculatedMd;
        estimate.complexity_multiplier = complexityMultiplier;
        estimate.risk_multiplier = riskMultiplier;
        estimate.mock_adjustment_factor = mockAdjustmentFactor;
        estimate.assumptions_used = rule.assumptions;
        estimate.sizing_driver_summary = driversUsed;
        estimate.sizing_driver_factor = driverFactor;
        estimate.confidence_level = confidenceFor(opportunity, scope);
        estimate.owner_id = owner.id;
        estimate.owner_email = estimate.owner_email || resolvedOwnerEmail;
      }

      applyEstimateInitialMd(estimate);

      upsertValidationWorkflow(opportunity, profile, estimate, owner);
    });
  });

  mockDb.sizingEstimates = mockDb.sizingEstimates.filter(
    (item) => item.opportunity_id !== opportunityId || activeEstimateIds.includes(item.id),
  );
  mockDb.validationRequests = mockDb.validationRequests.filter(
    (item) => item.opportunity_id !== opportunityId || activeEstimateIds.includes(item.sizing_estimate_id),
  );
  mockDb.notifications = mockDb.notifications.filter((item) =>
    mockDb.validationRequests.some((request) => request.id === item.validation_request_id),
  );
}

function applyDemoValidationOverrides() {
  sizingEstimatesFor("opp-est-00").forEach((estimate) => {
    let status = "Approved";
    let adjustedMd = "";
    let reason = "Approved against the generated mock sizing baseline.";

    if (estimate.product_name === "CUPPS" && estimate.workstream === "Implementation") {
      status = "Approved with Conditions";
      reason = "Approved subject to phased terminal sequencing and confirmed installation windows.";
    }

    if (estimate.product_name === "CUSS" && estimate.workstream === "Airline Onboarding") {
      status = "Approved with Conditions";
      adjustedMd = Number(estimate.initial_md || 0) + 4;
      reason = "Airline onboarding increased by 4 MD to cover two additional carrier readiness workshops.";
    }

    if (estimate.product_name === "AODB" && estimate.workstream === "Project Management") {
      status = "Pending Validation";
      reason = "Final AODB project-management effort is the remaining BAB sizing blocker.";
    }

    estimate.status = status;
    estimate.adjusted_md = adjustedMd;
    estimate.final_validated_md = ["Approved", "Approved with Conditions"].includes(status)
      ? Number(adjustedMd || estimate.initial_md)
      : "";

    const request = mockDb.validationRequests.find((item) => item.sizing_estimate_id === estimate.id);
    if (!request) return;
    request.status = status;
    request.adjustment_reason = status === "Approved" ? "" : reason;
    request.comments = reason;
    request.response_date = ["Approved", "Approved with Conditions"].includes(status) ? "2026-06-17" : "";
    request.escalation_required = false;

    if (estimate.product_name === "AODB" && estimate.workstream === "Project Management") {
      const notification = notificationForRequest(request.id);
      if (notification && !notification.activity?.length) {
        const teamsState = notificationChannelState(notification, "Teams");
        teamsState.status = "Triggered (simulation)";
        teamsState.last_triggered_at = "2026-06-17T14:30:00.000Z";
        teamsState.trigger_count = 1;
        notification.activity.unshift({
          id: `activity-${request.id}-teams-demo`,
          channel: "Teams",
          recipient: notification.recipient,
          status: "Simulation generated",
          created_at: teamsState.last_triggered_at,
        });
      }
    }
  });

  [
    {
      opportunity: "opp-gru-03",
      product: "AODB",
      workstream: "Integrations",
      dueDate: "2026-06-14",
      reason: "Interface catalogue is still missing for the AODB integration baseline.",
    },
    {
      opportunity: "opp-dfw-04",
      product: "Integrations / APIs",
      workstream: "R&D",
      dueDate: "2026-06-13",
      reason: "Airline API ownership must be confirmed before SRM can close.",
    },
  ].forEach((update) => {
    const estimate = mockDb.sizingEstimates.find(
      (item) =>
        item.opportunity_id === update.opportunity &&
        item.product_name === update.product &&
        item.workstream === update.workstream,
    );
    if (!estimate) return;
    estimate.status = "Overdue";
    estimate.final_validated_md = "";
    const request = mockDb.validationRequests.find((item) => item.sizing_estimate_id === estimate.id);
    if (request) {
      request.status = "Overdue";
      request.due_date = update.dueDate;
      request.comments = update.reason;
      request.escalation_required = true;
    }
  });
}

function initializeSizingEngine() {
  mockDb.airportProfiles.forEach((profile) => classifyAirport(profile));
  mockDb.opportunities.forEach((opportunity) => generateSizingForOpportunity(opportunity.id));
  applyDemoValidationOverrides();
}

function totalsForOpportunity(opportunityId) {
  const estimates = sizingEstimatesFor(opportunityId);
  const initial = estimates.reduce((sum, estimate) => sum + Number(estimate.initial_md || 0), 0);
  const validated = estimates.reduce((sum, estimate) => sum + finalMdForEstimate(estimate), 0);
  return {
    initial,
    validated,
    delta: validated - initial,
    pending: estimates.filter((estimate) => ownerActionStatuses().includes(estimate.status)).length,
    overdue: estimates.filter((estimate) => estimate.status === "Overdue").length,
    rejected: estimates.filter((estimate) => estimate.status === "Rejected").length,
    conditional: estimates.filter((estimate) => estimate.status === "Approved with Conditions").length,
  };
}

function dashboardTotalsForOpportunity(opportunityId) {
  const estimates = sizingEstimatesFor(opportunityId);
  const initial = estimates.reduce((sum, estimate) => sum + Number(estimate.initial_md || 0), 0);
  const validated = estimates.reduce((sum, estimate) => sum + dashboardMdForEstimate(estimate), 0);
  return {
    initial,
    validated,
    delta: validated - initial,
  };
}

function sizingReadinessImpact(opportunity, forum) {
  const estimates = sizingEstimatesFor(opportunity.id);
  const technicalWorkstreams = ["Implementation", "R&D", "Integrations", "Testing & Cutover", "Field Services"];
  const contexts = validationRequestContexts([opportunity]);
  const criticalContexts = contexts.filter(
    (context) => technicalWorkstreams.includes(context.estimate.workstream) || context.estimate.risk_level === "High",
  );
  const relevant = forum === "SRM" ? criticalContexts : contexts;
  const pendingStatuses = ["Not Started", "Pending Validation", "Needs Adjustment", "More Information Requested", "Overdue"];
  const rejectedCritical = criticalContexts.some((context) => context.effectiveStatus === "Rejected");
  const overdueCritical = criticalContexts.some((context) => context.effectiveStatus === "Overdue");
  const rejectedRelevant = relevant.some((context) => context.effectiveStatus === "Rejected");
  const overdueRelevant = relevant.some((context) => context.effectiveStatus === "Overdue");
  const conditional = relevant.some((context) => context.effectiveStatus === "Approved with Conditions");
  const pendingCritical = criticalContexts.some((context) => pendingStatuses.includes(context.effectiveStatus));
  const pendingFinalSizing = contexts.some((context) => pendingStatuses.includes(context.effectiveStatus));

  if (!estimates.length || !contexts.length) return "Pending Validation";
  if (rejectedCritical || (forum === "BAB" && rejectedRelevant)) return "Not Ready";
  if (overdueCritical || (forum === "BAB" && overdueRelevant)) return "Not Ready";
  if (forum === "SRM" && pendingCritical) return "Pending Validation";
  if (forum === "BAB" && pendingFinalSizing) return "Pending Validation";
  if (conditional) return "Ready with Conditions";
  return "Ready";
}

function functionValidation(opportunity, functionName) {
  return validationsFor(opportunity.id).find((item) => item.function === functionName);
}

function hasRiskCategory(opportunity, category) {
  return risksFor(opportunity.id).some((item) => item.category === category);
}

function hasAssumptionCategory(opportunity, category) {
  return assumptionsFor(opportunity.id).some((item) => item.category === category);
}

function estimateValidationStatus(opportunity, estimate) {
  const context = validationRequestContexts([opportunity]).find((item) => item.estimate.id === estimate.id);
  return context?.effectiveStatus || estimate.status || "Not Started";
}

function workstreamValidationEvidence(opportunity, workstream) {
  const estimates = sizingEstimatesFor(opportunity.id).filter((estimate) => estimate.workstream === workstream);
  const statuses = estimates.map((estimate) => estimateValidationStatus(opportunity, estimate));
  const approvedStatuses = ["Approved", "Approved with Conditions"];
  const complete = estimates.length === 0 || statuses.every((status) => approvedStatuses.includes(status));
  const conditional = statuses.some((status) => status === "Approved with Conditions");
  const rejected = statuses.filter((status) => status === "Rejected").length;
  const overdue = statuses.filter((status) => status === "Overdue").length;
  const pending = statuses.filter((status) => !approvedStatuses.includes(status) && status !== "Rejected" && status !== "Overdue").length;

  return {
    complete,
    conditional,
    rejected,
    overdue,
    pending,
    total: estimates.length,
    evidence: estimates.length
      ? `${statuses.filter((status) => approvedStatuses.includes(status)).length}/${estimates.length} ${workstream} sizing validations approved or conditional`
      : `No ${workstream} effort is required for the selected product scope`,
  };
}

function deliveryEffortEvidence(opportunity) {
  const deliveryWorkstreams = [
    "Implementation",
    "Project Management",
    "Airline Onboarding",
    "Integrations",
    "Testing & Cutover",
    "Training",
    "Support Readiness",
    "Field Services",
  ];
  const estimates = sizingEstimatesFor(opportunity.id).filter((estimate) => deliveryWorkstreams.includes(estimate.workstream));
  const statuses = estimates.map((estimate) => estimateValidationStatus(opportunity, estimate));
  const approvedStatuses = ["Approved", "Approved with Conditions"];
  const approved = statuses.filter((status) => approvedStatuses.includes(status)).length;

  return {
    complete: estimates.length > 0 && approved === estimates.length,
    conditional: statuses.some((status) => status === "Approved with Conditions"),
    total: estimates.length,
    approved,
    evidence: estimates.length ? `${approved}/${estimates.length} delivery sizing lines approved or conditional` : "No delivery sizing lines generated",
  };
}

function ruleResult(key, label, complete, evidence, action, options = {}) {
  return {
    key,
    label,
    complete: Boolean(complete),
    evidence,
    action,
    blocking: Boolean(options.blocking && !complete),
    conditional: Boolean(options.conditional),
  };
}

function readinessRuleResults(opportunity, forum) {
  const scopes = productScopesFor(opportunity.id);
  const risks = risksFor(opportunity.id);
  const profile = airportProfileFor(opportunity.id);
  const estimates = sizingEstimatesFor(opportunity.id);
  const implementationValidation = workstreamValidationEvidence(opportunity, "Implementation");
  const rdValidation = workstreamValidationEvidence(opportunity, "R&D");
  const deliveryValidation = deliveryEffortEvidence(opportunity);
  const criticalBlockers = openBlockersFor(opportunity);
  const contexts = validationRequestContexts([opportunity]);
  const finalSizingLines = estimates.filter(
    (estimate) =>
      ["Approved", "Approved with Conditions"].includes(estimateValidationStatus(opportunity, estimate)) && finalMdForEstimate(estimate) > 0,
  );
  const integrationExposure =
    scopes.some((scope) => scope.product_name === "Integrations / APIs") || estimates.some((estimate) => estimate.workstream === "Integrations");
  const integrationRisks = risks.filter((riskItem) =>
    `${riskItem.category} ${riskItem.description}`.toLowerCase().match(/integration|interface|api/),
  );
  const intakeFields = [
    opportunity.name,
    opportunity.customer,
    opportunity.region,
    opportunity.opportunity_stage,
    profile.airport_name,
  ];
  const intakeComplete = intakeFields.every(isDocumented);
  const productScopeComplete = scopes.length > 0 && scopes.every((scope) => scope.scope_status === "In scope");
  const allProductsSized =
    scopes.length > 0 &&
    scopes.every((scope) => estimates.some((estimate) => estimate.product_name === scope.product_name && Number(estimate.initial_md) > 0));
  const ownersIdentified =
    scopes.length > 0 &&
    scopes.every((scope) => isDocumented(scope.owner) && isDocumented(scope.owner_email)) &&
    estimates.every(
      (estimate) => mockDb.resourceOwners.some((owner) => owner.id === estimate.owner_id && owner.active) && isDocumented(estimate.owner_email),
    );
  const technicalAssumptions = assumptionsFor(opportunity.id).filter((item) => ["Technical", "Integration", "Delivery"].includes(item.category));
  const risksWithMitigation = risks.filter((riskItem) => isDocumented(riskItem.mitigation));
  const srmDetail = forum === "BAB" ? forumReadinessDetail(opportunity, "SRM") : null;
  const businessCaseComplete = ["In review", "Validated", "Ready"].includes(opportunity.business_case_status);
  const decisionEntries = decisionsFor(opportunity.id);

  const rules = {
    BCM: [
      ruleResult("intake", "Intake completeness", intakeComplete, `${intakeFields.filter(isDocumented).length}/${intakeFields.length} core intake fields captured`, "Complete the opportunity name, customer, airport, region, and stage in Intake."),
      ruleResult("sales-owner", "Sales owner assigned", isDocumented(opportunity.sales_owner) && opportunity.sales_owner !== "Sales owner", isDocumented(opportunity.sales_owner) ? opportunity.sales_owner : "No sales owner assigned", "Assign the accountable sales owner in Intake."),
      ruleResult("presales-owner", "Pre-sales owner assigned", isDocumented(opportunity.presales_owner) && opportunity.presales_owner !== "Pre-sales owner", isDocumented(opportunity.presales_owner) ? opportunity.presales_owner : "No pre-sales owner assigned", "Assign the pre-sales lead in Intake."),
      ruleResult("deadline", "Submission deadline known", isDocumented(opportunity.submission_deadline), isDocumented(opportunity.submission_deadline) ? `Submission deadline ${formatShortDate(opportunity.submission_deadline)}` : "No submission deadline captured", "Capture the customer submission deadline."),
      ruleResult("scope", "Product scope defined", scopes.length > 0, scopes.length ? pluralize(scopes.length, "product") + " selected" : "No products selected", "Select at least one in-scope product."),
      ruleResult("rationale", "Strategic rationale documented", isDocumented(opportunity.strategic_rationale), isDocumented(opportunity.strategic_rationale) ? "Strategic rationale is documented" : "Strategic rationale is missing", "Document the strategic reason to bid."),
      ruleResult("recommendation", "Bid/no-bid recommendation documented", isDocumented(opportunity.bid_no_bid_recommendation), isDocumented(opportunity.bid_no_bid_recommendation) ? `Recommendation: ${opportunity.bid_no_bid_recommendation}` : "No bid/no-bid recommendation", "Record Bid, No-bid, Hold, or Escalate."),
    ],
    SRM: [
      ruleResult("airport-category", "Airport category calculated", AIRPORT_CATEGORIES.includes(profile.airport_category), profile.airport_category ? `${profile.airport_category} via ${profile.categorization_method}` : "Airport category not calculated", "Enter annual passengers and movements, then calculate the airport category.", { blocking: true }),
      ruleResult("scope-complete", "Product scope completed", productScopeComplete, productScopeComplete ? `${scopes.length} in-scope products confirmed` : scopes.length ? "One or more products are optional or deferred" : "No product scope exists", "Confirm all products included in the sizing baseline.", { blocking: true }),
      ruleResult("initial-sizing", "Initial sizing generated", allProductsSized, allProductsSized ? `${estimates.length} sizing lines generated across ${scopes.length} products` : "One or more scoped products have no generated sizing", "Generate initial sizing for every scoped product.", { blocking: true }),
      ruleResult("technical-assumptions", "Technical assumptions documented", technicalAssumptions.length > 0 && (isDocumented(opportunity.preliminary_architecture) || isDocumented(opportunity.integration_assumptions)), `${technicalAssumptions.length} technical, integration, or delivery assumptions; architecture/assumptions ${isDocumented(opportunity.preliminary_architecture) || isDocumented(opportunity.integration_assumptions) ? "captured" : "missing"}`, "Document the architecture and the technical assumptions used for sizing."),
      ruleResult("product-owners", "Product owners identified", ownersIdentified, ownersIdentified ? `Owners and emails identified for ${scopes.length} products and ${estimates.length} sizing lines` : "One or more product or workstream owners are missing", "Assign product owners and resource-owner emails.", { blocking: true }),
      ruleResult("implementation-validation", "Implementation validations completed or conditionally approved", implementationValidation.complete, implementationValidation.evidence, "Resolve every pending, overdue, adjusted, or rejected Implementation validation.", { blocking: true, conditional: implementationValidation.conditional }),
      ruleResult("rd-validation", "R&D validations completed or conditionally approved", rdValidation.complete, rdValidation.evidence, "Resolve every pending, overdue, adjusted, or rejected R&D validation.", { blocking: true, conditional: rdValidation.conditional }),
      ruleResult("integration-risks", "Integration risks documented", !integrationExposure || integrationRisks.length > 0, integrationExposure ? `${integrationRisks.length} integration or interface risks documented` : "No integration workstream in the selected scope", "Add the material integration and interface risks with owners and mitigations."),
      ruleResult("critical-blockers", "Critical blockers resolved", criticalBlockers.length === 0, criticalBlockers.length ? `${criticalBlockers.length} critical blockers remain open` : "No critical blockers detected", "Resolve or formally close the critical blocker list before SRM.", { blocking: true }),
    ],
    BAB: [
      ruleResult("srm-ready", "SRM ready or ready with conditions", ["Ready", "Ready with Conditions"].includes(srmDetail?.status), srmDetail ? `SRM is ${srmDetail.status} at ${srmDetail.score}%` : "SRM readiness unavailable", "Close the SRM missing items and hard blockers before BAB.", { blocking: true, conditional: srmDetail?.status === "Ready with Conditions" }),
      ruleResult("final-md", "Final validated MD available", estimates.length > 0 && finalSizingLines.length === estimates.length, estimates.length ? `${finalSizingLines.length}/${estimates.length} sizing lines have final validated MD` : "No sizing lines generated", "Complete owner validation for every sizing line so final MD is available.", { blocking: true, conditional: contexts.some((context) => context.effectiveStatus === "Approved with Conditions") }),
      ruleResult("business-case", "Business case input complete", businessCaseComplete, `Business case status: ${opportunity.business_case_status || "Not documented"}`, "Move the business case input to In review or Validated.", { blocking: true }),
      ruleResult("pricing", "Pricing readiness status captured", isDocumented(opportunity.pricing_readiness_status), `Pricing readiness: ${opportunity.pricing_readiness_status || "Not documented"}`, "Capture the current pricing readiness status."),
      ruleResult("risk-mitigation", "Key risks and mitigations documented", risks.length > 0 && risksWithMitigation.length === risks.length, risks.length ? `${risksWithMitigation.length}/${risks.length} risks include mitigation` : "No risks documented", "Document key risks, owners, and mitigation actions."),
      ruleResult("delivery-effort", "Delivery effort validated", deliveryValidation.complete, deliveryValidation.evidence, "Complete or conditionally approve all delivery workstream sizing validations.", { blocking: true, conditional: deliveryValidation.conditional }),
      ruleResult("executive-decision", "Executive decision requested", isDocumented(opportunity.executive_decision_required), isDocumented(opportunity.executive_decision_required) ? "Executive decision request is documented" : "Executive decision request is missing", "State the exact decision required from BAB."),
      ruleResult("exceptions", "Exceptions documented", isDocumented(opportunity.exceptions_approval_conditions), isDocumented(opportunity.exceptions_approval_conditions) ? "Exceptions or approval conditions are documented" : "No exception statement recorded", "Document exceptions, approval conditions, or explicitly state that none apply."),
      ruleResult("decision-log", "Decision log updated", decisionEntries.length > 0, decisionEntries.length ? `${decisionEntries.length} governance decision entries recorded; latest ${formatShortDate(decisionEntries[0].date)}` : "No governance decision recorded", "Add the latest forum decision, conditions, and next steps."),
    ],
  };

  return rules[forum] || [];
}

function allReadinessRules(opportunity) {
  return GOVERNANCE_FORUMS.flatMap((forum) => readinessRuleResults(opportunity, forum));
}

function statusClass(status) {
  return String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function statusOptions(options, selectedValue) {
  return options.map((option) => `<option ${option === selectedValue ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function checklistTotal(opportunity) {
  return allReadinessRules(opportunity).length;
}

function checklistComplete(opportunity) {
  return allReadinessRules(opportunity).filter((item) => item.complete).length;
}

function validationScore(status) {
  if (status === "Validated" || status === "Approved" || status === "Ready") return 1;
  if (status === "Conditionally approved" || status === "Approved with Conditions") return 0.85;
  if (status === "Sized") return 0.75;
  if (status === "In review" || status === "In progress" || status === "Pending Validation") return 0.55;
  if (status === "Draft") return 0.45;
  if (status === "Needs Adjustment" || status === "More Information Requested") return 0.35;
  if (status === "Pending" || status === "Not started" || status === "Not Started") return 0.2;
  if (status === "Blocked" || status === "Rejected" || status === "Overdue") return 0;
  return 0.3;
}

function forumReadinessDetail(opportunity, forum) {
  const items = readinessRuleResults(opportunity, forum);
  const complete = items.filter((item) => item.complete).length;
  const total = items.length;
  const checklistPercent = total ? Math.round((complete / total) * 100) : 0;
  const manualStatus = opportunity[forumStatusField(forum)];
  const sizingImpact = forum === "BCM" ? "Ready" : sizingReadinessImpact(opportunity, forum);
  const ruleBlockers = items.filter((item) => item.blocking).map((item) => item.label);
  const blockers = [...ruleBlockers];

  if (manualStatus === "Blocked") blockers.push(`${forum} governance status is blocked`);
  if (forum !== "BCM" && sizingImpact === "Not Ready") blockers.push(`${forum} sizing validation is rejected or overdue`);
  if (forum === "SRM" && sizingImpact === "Pending Validation" && !ruleBlockers.length) {
    blockers.push("Critical technical sizing validations are still pending");
  }
  if (forum === "BAB" && sizingImpact === "Pending Validation" && !ruleBlockers.includes("Final validated MD available")) {
    blockers.push("Final sizing validation is still pending");
  }

  const conditions = items.filter((item) => item.conditional).map((item) => item.label);
  if (manualStatus === "Conditionally approved") conditions.push(`${forum} is conditionally approved`);
  if (sizingImpact === "Ready with Conditions") conditions.push(`${forum} sizing includes conditional approval`);
  const uniqueBlockers = [...new Set(blockers)];
  const uniqueConditions = [...new Set(conditions)];
  const missingItems = items.filter((item) => !item.complete);
  let status = "Not Ready";

  if (uniqueBlockers.length) {
    status = "Not Ready";
  } else if (checklistPercent === 100 && uniqueConditions.length) {
    status = "Ready with Conditions";
  } else if (checklistPercent === 100) {
    status = "Ready";
  } else if (checklistPercent >= 50) {
    status = "Partially Ready";
  }

  const recommendedActions = [
    ...uniqueBlockers.map((blocker) => `Resolve blocker: ${blocker}.`),
    ...missingItems.map((item) => item.action),
    ...uniqueConditions.map((condition) => `Confirm and record condition: ${condition}.`),
  ].filter((action, index, actions) => action && actions.indexOf(action) === index);

  return {
    forum,
    items,
    complete,
    total,
    checklistPercent,
    score: checklistPercent,
    status,
    sizingImpact,
    blockers: uniqueBlockers,
    conditions: uniqueConditions,
    missing: missingItems.map((item) => item.label),
    recommendedActions,
  };
}

function openBlockersFor(opportunity) {
  const blockers = [];
  GOVERNANCE_FORUMS.forEach((forum) => {
    if (opportunity[forumStatusField(forum)] === "Blocked") blockers.push(`${forum} status blocked`);
  });
  risksFor(opportunity.id)
    .filter((item) => item.severity === "High" && item.status !== "Closed")
    .forEach((riskItem) => blockers.push(`High risk: ${riskItem.description}`));
  validationsFor(opportunity.id)
    .filter((item) => item.required && item.status === "Blocked")
    .forEach((validation) => blockers.push(`Stakeholder blocked: ${validation.function}`));
  productScopesFor(opportunity.id)
    .filter((item) => item.validation_status === "Blocked")
    .forEach((scope) => blockers.push(`Product blocked: ${scope.product_name}`));
  sizingEstimatesFor(opportunity.id)
    .filter((item) => ["Rejected", "Overdue"].includes(item.status))
    .forEach((estimate) => blockers.push(`Sizing ${estimate.status.toLowerCase()}: ${estimate.product_name} ${estimate.workstream}`));
  validationRequestContexts([opportunity])
    .filter(
      (context) =>
        ["Rejected", "Overdue"].includes(context.effectiveStatus) && !["Rejected", "Overdue"].includes(context.estimate.status),
    )
    .forEach((context) =>
      blockers.push(`Owner validation ${context.effectiveStatus.toLowerCase()}: ${context.estimate.product_name} ${context.estimate.workstream}`),
    );
  return blockers;
}

function productValidationReadiness(opportunity) {
  const scopes = productScopesFor(opportunity.id);
  const estimates = sizingEstimatesFor(opportunity.id);
  const scopeScores = scopes.map((scope) => (validationScore(scope.validation_status) + validationScore(scope.sizing_status)) / 2);
  const contexts = validationRequestContexts([opportunity]);
  const estimateScores = estimates.map((estimate) => {
    const context = contexts.find((item) => item.estimate.id === estimate.id);
    return validationScore(context?.effectiveStatus || estimate.status);
  });
  const scores = [...scopeScores, ...estimateScores];
  const score = scores.length ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 100) : 0;
  const pending = contexts.filter(requestNeedsOwnerAction).length;
  const overdue = contexts.filter(requestIsOverdue).length;
  const needsAdjustment = contexts.filter((context) => context.effectiveStatus === "Needs Adjustment").length;
  const rejected = contexts.filter((context) => context.effectiveStatus === "Rejected").length;
  const approved = contexts.filter((context) => ["Approved", "Approved with Conditions"].includes(context.effectiveStatus)).length;
  return {
    score,
    pending,
    overdue,
    needsAdjustment,
    rejected,
    approved,
    total: estimates.length,
    summary: `${approved}/${estimates.length || 0} approved, ${pending} owner actions, ${overdue} overdue, ${rejected} rejected`,
  };
}

function stakeholderValidationReadiness(opportunity) {
  const required = validationsFor(opportunity.id).filter((item) => item.required);
  const missing = required.filter((item) => item.status !== "Validated");
  const blocked = required.filter((item) => item.status === "Blocked");
  const score = required.length
    ? Math.round((required.reduce((sum, item) => sum + validationScore(item.status), 0) / required.length) * 100)
    : 100;
  return {
    score,
    missing,
    blocked,
    summary: `${missing.length} of ${required.length} required validations not complete, ${blocked.length} blocked`,
  };
}

function riskReadiness(opportunity) {
  const openRisks = risksFor(opportunity.id).filter((item) => item.status !== "Closed");
  const high = openRisks.filter((item) => item.severity === "High").length;
  const medium = openRisks.filter((item) => item.severity === "Medium").length;
  const low = openRisks.filter((item) => item.severity === "Low").length;
  const score = clamp(100 - high * 25 - medium * 12 - low * 5, 0, 100);
  return {
    score,
    high,
    medium,
    low,
    summary: `${high} high, ${medium} medium, ${low} low open risks`,
  };
}

function blockerReadiness(opportunity) {
  const blockers = openBlockersFor(opportunity);
  return {
    score: clamp(100 - blockers.length * 35, 0, 100),
    blockers,
    summary: `${blockers.length} open blockers`,
  };
}

function readinessBreakdown(opportunity) {
  const forumDetails = Object.fromEntries(GOVERNANCE_FORUMS.map((forum) => [forum, forumReadinessDetail(opportunity, forum)]));
  const product = productValidationReadiness(opportunity);
  const stakeholders = stakeholderValidationReadiness(opportunity);
  const risks = riskReadiness(opportunity);
  const blockers = blockerReadiness(opportunity);
  const components = [
    { key: "BCM", label: "BCM readiness", score: forumDetails.BCM.score, weight: 15, detail: `${forumDetails.BCM.complete}/${forumDetails.BCM.total} rules complete` },
    { key: "SRM", label: "SRM readiness", score: forumDetails.SRM.score, weight: 20, detail: `${forumDetails.SRM.complete}/${forumDetails.SRM.total} rules complete` },
    { key: "BAB", label: "BAB readiness", score: forumDetails.BAB.score, weight: 20, detail: `${forumDetails.BAB.complete}/${forumDetails.BAB.total} rules complete` },
    { key: "product", label: "Product validation", score: product.score, weight: 15, detail: product.summary },
    { key: "stakeholders", label: "Stakeholder validation", score: stakeholders.score, weight: 15, detail: stakeholders.summary },
    { key: "risks", label: "Risk severity", score: risks.score, weight: 10, detail: risks.summary },
    { key: "blockers", label: "Open blockers", score: blockers.score, weight: 5, detail: blockers.summary },
  ].map((component) => ({
    ...component,
    points: Number(((component.score / 100) * component.weight).toFixed(1)),
  }));
  const baseScore = Number(components.reduce((sum, component) => sum + component.points, 0).toFixed(1));
  const caps = [
    ...(blockers.blockers.length ? [{ label: "Open blocker present", cap: 74, reason: blockers.summary }] : []),
    ...(product.rejected ? [{ label: "Rejected sizing validation", cap: 60, reason: `${product.rejected} rejected owner validation` }] : []),
    ...(product.overdue ? [{ label: "Overdue sizing validation", cap: 65, reason: `${product.overdue} overdue owner validation` }] : []),
    ...(stakeholders.blocked.length ? [{ label: "Blocked stakeholder validation", cap: 70, reason: `${stakeholders.blocked.length} blocked stakeholder validation` }] : []),
    ...(risks.high ? [{ label: "High-severity risk open", cap: 85, reason: `${risks.high} high risk open` }] : []),
  ];
  const cap = caps.length ? Math.min(...caps.map((item) => item.cap)) : 100;
  const score = clamp(Math.round(Math.min(baseScore, cap)), 0, 100);
  const status =
    product.rejected > 0 || product.overdue > 0 || blockers.blockers.length > 0
      ? "Not Ready"
      : score >= 90
        ? "Ready"
        : score >= 75
          ? "Ready with Conditions"
          : score >= 45
            ? "Partially Ready"
            : "Not Ready";

  return {
    score,
    baseScore,
    cap,
    caps,
    status,
    forumDetails,
    components,
    product,
    stakeholders,
    risks,
    blockers,
  };
}

function readiness(opportunity) {
  const breakdown = readinessBreakdown(opportunity);
  opportunity.overall_readiness_score = breakdown.score;
  return breakdown.score;
}

function severityWeight(severity) {
  return { Critical: 4, High: 3, Medium: 2, Low: 1 }[severity] || 1;
}

function readinessGapAction(source, label) {
  if (source === "Owner validation") return "Chase owner response or record an adjustment/condition.";
  if (source === "Stakeholder") return "Confirm stakeholder decision or explicitly flag the validation gap.";
  if (source === "Risk") return "Document mitigation, owner, and residual impact.";
  if (source === "BCM") return "Complete bid/no-bid evidence before BCM closure.";
  if (source === "SRM") return "Close technical evidence before SRM review.";
  if (source === "BAB") return "Close business case, pricing, delivery, and executive conditions.";
  return label;
}

function readinessGapsForOpportunity(opportunity) {
  const gaps = [];

  GOVERNANCE_FORUMS.forEach((forum) => {
    const detail = forumReadinessDetail(opportunity, forum);
    const blockedRuleLabels = new Set(detail.items.filter((item) => item.blocking).map((item) => item.label));
    detail.blockers.forEach((blocker) => {
      const rule = detail.items.find((item) => item.label === blocker);
      gaps.push({
        opportunity,
        source: forum,
        severity: "Critical",
        label: blocker,
        detail: `${detail.status} - ${detail.complete}/${detail.total} checklist items complete`,
        action: rule?.action || readinessGapAction(forum, blocker),
        priority: 95 - detail.score,
      });
    });
    detail.missing.forEach((label) => {
      if (blockedRuleLabels.has(label)) return;
      const rule = detail.items.find((item) => item.label === label);
      const currentStageWeight = forum === opportunity.current_governance_stage ? 16 : 0;
      const severity = forum === "BAB" && opportunity.current_governance_stage !== "BCM" ? "High" : forum === "SRM" ? "High" : "Medium";
      gaps.push({
        opportunity,
        source: forum,
        severity,
        label,
        detail: `${detail.complete}/${detail.total} ${forum} checklist items complete`,
        action: rule?.action || readinessGapAction(forum, label),
        priority: 55 + currentStageWeight + (100 - detail.checklistPercent) / 4,
      });
    });
  });

  validationRequestContexts([opportunity]).forEach((context) => {
    if (["Approved"].includes(context.effectiveStatus)) return;
    const priority = requestPriorityScore(context);
    const severity =
      context.effectiveStatus === "Rejected" || requestIsOverdue(context)
        ? "Critical"
        : context.effectiveStatus === "Needs Adjustment"
          ? "High"
          : context.effectiveStatus === "Approved with Conditions"
            ? "Medium"
            : "Medium";
    gaps.push({
      opportunity,
      source: "Owner validation",
      severity,
      label: `${context.estimate.product_name} ${context.estimate.workstream}: ${requestActionLabel(context)}`,
      detail: `${context.owner?.name || ownerName(context.estimate.owner_id)} - ${requestGovernanceImpact(context)} - ${formatNumber(
        context.estimate.initial_md,
      )} MD - ${formatShortDate(context.request.due_date)}`,
      action: readinessGapAction("Owner validation"),
      priority,
    });
  });

  stakeholdersValidationRows(opportunity).forEach((validation) => {
    if (!validation.required || validation.status === "Validated") return;
    gaps.push({
      opportunity,
      source: "Stakeholder",
      severity: validation.status === "Blocked" ? "High" : "Medium",
      label: `${validation.function}: ${validation.status}`,
      detail: `${validation.stakeholder_name} - due ${formatShortDate(validation.due_date)}`,
      action: readinessGapAction("Stakeholder"),
      priority: validation.status === "Blocked" ? 75 : 45,
    });
  });

  risksFor(opportunity.id)
    .filter((riskItem) => riskItem.status !== "Closed")
    .forEach((riskItem) => {
      gaps.push({
        opportunity,
        source: "Risk",
        severity: riskItem.severity === "High" ? "High" : riskItem.severity,
        label: riskItem.description,
        detail: `${riskItem.category} - ${riskItem.owner} - ${riskItem.status}`,
        action: readinessGapAction("Risk"),
        priority: riskItem.severity === "High" ? 80 : riskItem.severity === "Medium" ? 50 : 25,
      });
    });

  return gaps.sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity) || b.priority - a.priority);
}

function stakeholdersValidationRows(opportunity) {
  return validationsFor(opportunity.id);
}

function portfolioReadinessGaps(opportunities, limit = 8) {
  return opportunities
    .flatMap((opportunity) => readinessGapsForOpportunity(opportunity))
    .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity) || b.priority - a.priority)
    .slice(0, limit);
}

function hasBlocker(opportunity) {
  return (
    openBlockersFor(opportunity).length > 0 ||
    forumReadinessDetail(opportunity, opportunity.current_governance_stage).blockers.length > 0
  );
}

function forumReadinessLabel(opportunity) {
  return forumReadinessDetail(opportunity, opportunity.current_governance_stage).status;
}

function forumReady(opportunity) {
  return ["Ready", "Ready with Conditions"].includes(forumReadinessLabel(opportunity));
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

function renderExecutiveDashboard() {
  const visible = filteredOpportunities();
  const blockers = visible.filter(hasBlocker);
  const ready = visible.filter(forumReady);
  const readyForumStatuses = ["Ready", "Ready with Conditions"];
  const requestContexts = validationRequestContexts(visible);
  const pendingRequests = requestContexts.filter(requestNeedsOwnerAction);
  const overdueRequests = requestContexts.filter(requestIsOverdue);
  const notReadyForSrm = visible.filter(
    (opportunity) =>
      !readyForumStatuses.includes(forumReadinessDetail(opportunity, "SRM").status) ||
      !readyForumStatuses.includes(sizingReadinessImpact(opportunity, "SRM")),
  );
  const notReadyForBab = visible.filter(
    (opportunity) =>
      !readyForumStatuses.includes(forumReadinessDetail(opportunity, "BAB").status) ||
      !readyForumStatuses.includes(sizingReadinessImpact(opportunity, "BAB")),
  );
  const totals = visible.reduce(
    (summary, opportunity) => {
      const opportunityTotals = dashboardTotalsForOpportunity(opportunity.id);
      summary.initial += opportunityTotals.initial;
      summary.validated += opportunityTotals.validated;
      return summary;
    },
    { initial: 0, validated: 0 },
  );
  const averageReadiness = visible.length
    ? Math.round(visible.reduce((sum, opportunity) => sum + readiness(opportunity), 0) / visible.length)
    : 0;

  if (elements.metricPipeline) elements.metricPipeline.textContent = visible.length;
  if (elements.metricBlockers) elements.metricBlockers.textContent = `${pluralize(blockers.length, "blocker")}`;
  if (elements.metricReadiness) elements.metricReadiness.textContent = `${averageReadiness}%`;
  if (elements.metricGovernance) elements.metricGovernance.textContent = `${ready.length} current forum ready`;
  if (elements.metricPendingSizing) elements.metricPendingSizing.textContent = pendingRequests.length;
  if (elements.metricOverdueValidations) elements.metricOverdueValidations.textContent = overdueRequests.length;
  if (elements.metricInitialMd) elements.metricInitialMd.textContent = formatNumber(totals.initial);
  if (elements.metricValidatedMd) elements.metricValidatedMd.textContent = formatNumber(totals.validated);
  if (elements.metricMdDelta) {
    const delta = totals.validated - totals.initial;
    elements.metricMdDelta.textContent = `${delta > 0 ? "+" : ""}${formatNumber(delta)}`;
  }
  if (elements.metricSrmSizingBlock) elements.metricSrmSizingBlock.textContent = notReadyForSrm.length;
  if (elements.metricBabSizingBlock) elements.metricBabSizingBlock.textContent = notReadyForBab.length;
  if (elements.bcmCount) elements.bcmCount.textContent = visible.filter((opportunity) => opportunity.current_governance_stage === "BCM").length;
  if (elements.srmCount) elements.srmCount.textContent = visible.filter((opportunity) => opportunity.current_governance_stage === "SRM").length;
  if (elements.babCount) elements.babCount.textContent = visible.filter((opportunity) => opportunity.current_governance_stage === "BAB").length;

  if (elements.executiveNextActions) {
    const prioritized = visible
      .map((opportunity) => ({
        opportunity,
        action: recommendedNextAction(opportunity),
        pending: validationRequestsFor(opportunity.id).filter((request) => actionableValidationStatuses().includes(request.status)).length,
        blockers: openBlockersFor(opportunity).length,
        score: readiness(opportunity),
      }))
      .sort((a, b) => b.blockers - a.blockers || b.pending - a.pending || a.score - b.score)
      .slice(0, 3);

    elements.executiveNextActions.innerHTML = prioritized.length
      ? prioritized
          .map(
            (item) => `
        <button type="button" class="executive-action-card" data-id="${escapeHtml(item.opportunity.id)}">
          <span>${escapeHtml(item.opportunity.current_governance_stage)} - ${readiness(item.opportunity)}% ready</span>
          <strong>${escapeHtml(item.opportunity.name)}</strong>
          <small>${escapeHtml(item.action.title)} - ${item.pending} pending validations</small>
        </button>
      `,
          )
          .join("")
      : "";
  }

  if (elements.dashboardEmptyState) {
    elements.dashboardEmptyState.innerHTML = visible.length
      ? ""
      : `<div class="empty-state guided-empty">
          <strong>No opportunities match the current filters.</strong>
          <p>Clear the filter or create a new mock opportunity to walk through intake, sizing, validation, and readiness.</p>
          <button type="button" class="primary-button" data-action="create-opportunity">Create demo opportunity</button>
        </div>`;
  }

  const emptyDashboard = (message) => `<div class="empty-state dashboard-empty-row">${escapeHtml(message)}</div>`;
  const requestRow = (context) => {
    const dueLabel = context.dueIn < 0 ? `${Math.abs(context.dueIn)}d overdue` : `Due in ${context.dueIn}d`;
    const priority = requestPriorityLabel(requestPriorityScore(context));
    return `
      <button type="button" class="dashboard-row validation-row priority-${statusClass(priority)}" data-id="${escapeHtml(context.opportunity.id)}" data-request-id="${escapeHtml(
        context.request.id,
      )}">
        <span class="dashboard-row-main">
            <strong>${escapeHtml(requestActionLabel(context))}</strong>
          <small>${escapeHtml(context.estimate.product_name)} - ${escapeHtml(context.estimate.workstream)} - ${escapeHtml(
            context.owner?.email || ownerEmail(context.estimate.owner_id),
          )}</small>
        </span>
        <span class="status-pill ${statusClass(context.effectiveStatus)}">${escapeHtml(context.effectiveStatus)}</span>
        <span class="row-metric">${escapeHtml(priority)} - ${escapeHtml(requestGovernanceImpact(context))}</span>
        <small class="row-date">${escapeHtml(formatShortDate(context.request.due_date))} - ${escapeHtml(dueLabel)}</small>
      </button>`;
  };

  if (elements.executiveAttentionList) {
    const attentionItems = visible
      .map((opportunity) => {
        const opportunityTotals = dashboardTotalsForOpportunity(opportunity.id);
        const opportunityBlockers = openBlockersFor(opportunity);
        const opportunityPending = pendingRequests.filter((context) => context.opportunity.id === opportunity.id).length;
        const opportunityOverdue = overdueRequests.filter((context) => context.opportunity.id === opportunity.id).length;
        const srmReady = readyForumStatuses.includes(forumReadinessDetail(opportunity, "SRM").status);
        const babReady = readyForumStatuses.includes(forumReadinessDetail(opportunity, "BAB").status);
        const deadlineIn = daysUntil(opportunity.submission_deadline);
        const score = readiness(opportunity);
        const reasons = [];

        if (opportunityBlockers.length) reasons.push(pluralize(opportunityBlockers.length, "blocker"));
        if (!srmReady) reasons.push("SRM not ready");
        if (!babReady) reasons.push("BAB not ready");
        if (opportunityOverdue) reasons.push(pluralize(opportunityOverdue, "overdue validation"));
        if (opportunityPending) reasons.push(pluralize(opportunityPending, "pending validation"));
        if (deadlineIn <= 21) reasons.push(`deadline in ${deadlineIn}d`);
        if (!reasons.length && score < 70) reasons.push("readiness below target");

        return {
          opportunity,
          reasons,
          score,
          deadlineIn,
          opportunityPending,
          opportunityOverdue,
          opportunityTotals,
          priority:
            opportunityBlockers.length * 8 +
            opportunityOverdue * 6 +
            (!srmReady ? 4 : 0) +
            (!babReady ? 3 : 0) +
            (deadlineIn <= 14 ? 4 : deadlineIn <= 21 ? 2 : 0) +
            Math.max(0, 70 - score) / 10,
        };
      })
      .filter((item) => item.reasons.length)
      .sort((a, b) => b.priority - a.priority || a.deadlineIn - b.deadlineIn)
      .slice(0, 5);

    elements.executiveAttentionList.innerHTML = attentionItems.length
      ? attentionItems
          .map(
            (item) => `
        <button type="button" class="dashboard-row attention-row" data-id="${escapeHtml(item.opportunity.id)}">
          <span class="dashboard-row-main">
            <strong>${escapeHtml(item.opportunity.name)}</strong>
            <small>${escapeHtml(item.opportunity.customer)} - ${escapeHtml(item.opportunity.current_governance_stage)} - ${
              item.score
            }% ready</small>
          </span>
          <span class="row-reason">${escapeHtml(item.reasons.slice(0, 3).join(" / "))}</span>
          <span class="row-metric">${item.opportunityPending} pending</span>
          <span class="row-metric">${item.opportunityTotals.delta > 0 ? "+" : ""}${formatNumber(item.opportunityTotals.delta)} MD</span>
        </button>`,
          )
          .join("")
      : emptyDashboard("No executive attention items in the current filter.");
  }

  if (elements.pendingValidationList) {
    elements.pendingValidationList.innerHTML = pendingRequests
      .filter((context) => context.effectiveStatus !== "Overdue")
      .sort((a, b) => requestPriorityScore(b) - requestPriorityScore(a) || a.dueIn - b.dueIn)
      .slice(0, 6)
      .map(requestRow)
      .join("") || emptyDashboard("No pending owner validations.");
  }

  if (elements.overdueValidationList) {
    elements.overdueValidationList.innerHTML = overdueRequests
      .sort((a, b) => requestPriorityScore(b) - requestPriorityScore(a) || a.dueIn - b.dueIn)
      .slice(0, 6)
      .map(requestRow)
      .join("") || emptyDashboard("No overdue validations.");
  }

  if (elements.deadlineList) {
    elements.deadlineList.innerHTML = visible
      .slice()
      .sort((a, b) => daysUntil(a.submission_deadline) - daysUntil(b.submission_deadline))
      .slice(0, 5)
      .map((opportunity) => {
        const score = readiness(opportunity);
        const deadlineIn = daysUntil(opportunity.submission_deadline);
        return `
          <button type="button" class="dashboard-row deadline-row" data-id="${escapeHtml(opportunity.id)}">
            <span class="dashboard-row-main">
              <strong>${escapeHtml(opportunity.customer)}</strong>
              <small>${escapeHtml(opportunity.name)} - ${score}% ready</small>
            </span>
            <span class="row-date">${escapeHtml(formatShortDate(opportunity.submission_deadline))}</span>
            <span class="row-metric">${deadlineIn}d</span>
          </button>`;
      })
      .join("") || emptyDashboard("No upcoming submission deadlines.");
  }

  if (elements.functionBottlenecks) {
    const bottlenecks = new Map();
    const addBottleneck = (name, options = {}) => {
      if (!name) return;
      const row =
        bottlenecks.get(name) || {
          name,
          count: 0,
          overdue: 0,
          rejected: 0,
          needsAdjustment: 0,
          pending: 0,
          conditional: 0,
          blocked: 0,
          md: 0,
          score: 0,
          opportunities: new Set(),
        };
      row.count += 1;
      row.md += Number(options.md || 0);
      row.score += Number(options.score || 1);
      if (options.overdue) row.overdue += 1;
      if (options.rejected) row.rejected += 1;
      if (options.needsAdjustment) row.needsAdjustment += 1;
      if (options.pending) row.pending += 1;
      if (options.conditional) row.conditional += 1;
      if (options.blocked) row.blocked += 1;
      if (options.opportunityId) row.opportunities.add(options.opportunityId);
      bottlenecks.set(name, row);
    };

    requestContexts
      .filter((context) => requestNeedsOwnerAction(context) || ["Rejected", "Approved with Conditions"].includes(context.effectiveStatus))
      .forEach((context) =>
        addBottleneck(context.owner?.function || context.estimate.workstream, {
          overdue: requestIsOverdue(context),
          rejected: context.effectiveStatus === "Rejected",
          needsAdjustment: context.effectiveStatus === "Needs Adjustment",
          pending: requestNeedsOwnerAction(context),
          conditional: context.effectiveStatus === "Approved with Conditions",
          md: context.estimate.initial_md,
          score: Math.max(1, Math.round(requestPriorityScore(context) / 15)),
          opportunityId: context.opportunity.id,
        }),
      );
    visible.forEach((opportunity) => {
      validationsFor(opportunity.id)
        .filter((validation) => validation.required && validation.status !== "Validated")
        .forEach((validation) =>
          addBottleneck(validation.function, {
            blocked: validation.status === "Blocked",
            score: validation.status === "Blocked" ? 8 : 3,
            opportunityId: opportunity.id,
          }),
        );
    });

    const rows = Array.from(bottlenecks.values())
      .map((row) => ({ ...row, opportunityCount: row.opportunities.size }))
      .sort((a, b) => b.score - a.score || b.overdue - a.overdue || b.md - a.md)
      .slice(0, 7);
    const maxScore = Math.max(1, ...rows.map((row) => row.score));
    elements.functionBottlenecks.innerHTML = rows.length
      ? rows
          .map(
            (row, index) => {
              const critical = row.overdue || row.rejected || row.blocked;
              const attention = !critical && (row.needsAdjustment || row.pending || row.conditional);
              const label = critical
                ? "Escalate"
                : row.needsAdjustment
                  ? "Adjustment"
                  : row.pending
                    ? "Owner action"
                    : row.conditional
                      ? "Condition"
                      : "Review";
              const detail = [
                row.overdue ? `${row.overdue} overdue` : "",
                row.rejected ? `${row.rejected} rejected` : "",
                row.needsAdjustment ? `${row.needsAdjustment} adjustment` : "",
                row.blocked ? `${row.blocked} blocked` : "",
                row.pending ? `${row.pending} pending` : "",
                row.conditional ? `${row.conditional} conditional` : "",
              ]
                .filter(Boolean)
                .join(" / ");
              return `
        <div class="bottleneck-row ${critical ? "critical" : attention ? "attention" : ""}">
          <span class="bottleneck-rank" aria-hidden="true">${index + 1}</span>
          <span class="bottleneck-copy">
            <strong>${escapeHtml(row.name)}</strong>
            <small>${pluralize(row.count, "action")} across ${pluralize(row.opportunityCount, "opportunity", "opportunities")}${row.md ? ` - ${formatNumber(row.md)} MD exposed` : ""}${detail ? ` - ${escapeHtml(detail)}` : ""}</small>
          </span>
          <span class="status-pill ${critical ? "critical" : attention ? "attention" : "pending"}">${escapeHtml(label)}</span>
          <div class="bottleneck-bar" aria-label="Relative operational pressure"><span style="width: ${(row.score / maxScore) * 100}%"></span></div>
        </div>`;
            },
          )
          .join("")
      : emptyDashboard("No function bottlenecks in the current filter.");
  }

  if (elements.topReadinessGaps) {
    const topGaps = portfolioReadinessGaps(visible, 7);
    elements.topReadinessGaps.innerHTML = topGaps.length
      ? topGaps
          .map(
            (gap, index) => `
        <button type="button" class="readiness-driver-row severity-${statusClass(gap.severity)}" data-id="${escapeHtml(gap.opportunity.id)}">
          <span class="readiness-driver-rank" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <span class="readiness-driver-copy">
            <strong>${escapeHtml(gap.label)}</strong>
            <small>${escapeHtml(gap.opportunity.name)} - ${escapeHtml(gap.source)} - ${escapeHtml(gap.detail)}</small>
            <span class="readiness-driver-action">Next: ${escapeHtml(gap.action)}</span>
          </span>
          <span class="status-pill ${statusClass(gap.severity)}">${escapeHtml(gap.severity)}</span>
        </button>`,
          )
          .join("")
      : emptyDashboard("No material readiness gaps in the current filter.");
  }

  if (elements.forumReadinessBoard) {
    elements.forumReadinessBoard.innerHTML = GOVERNANCE_FORUMS.map((forum) => {
      const details = visible.map((opportunity) => forumReadinessDetail(opportunity, forum));
      const average = details.length ? Math.round(details.reduce((sum, detail) => sum + detail.score, 0) / details.length) : 0;
      const readyCount = details.filter((detail) => detail.status === "Ready").length;
      const conditionalCount = details.filter((detail) => detail.status === "Ready with Conditions").length;
      const partialCount = details.filter((detail) => detail.status === "Partially Ready").length;
      const notReadyCount = details.filter((detail) => detail.status === "Not Ready").length;

      return `
        <div class="forum-readiness-card">
          <div class="forum-card-head">
            <strong>${escapeHtml(forum)}</strong>
            <span>${average}%</span>
          </div>
          <span class="progress-track" aria-hidden="true"><span style="width: ${average}%"></span></span>
          <div class="forum-status-grid">
            <span><b>${readyCount}</b> Ready</span>
            <span><b>${conditionalCount}</b> Conditional</span>
            <span><b>${partialCount}</b> Partial</span>
            <span><b>${notReadyCount}</b> Not ready</span>
          </div>
        </div>`;
    }).join("");
  }

  if (elements.blockerList) {
    elements.blockerList.innerHTML = blockers.length
      ? blockers
          .slice(0, 4)
          .map((opportunity) => {
            const blocker =
              risksFor(opportunity.id).find((item) => item.severity === "High" && item.status !== "Closed") ||
              validationsFor(opportunity.id).find((item) => item.status === "Blocked");
            return `<li><button type="button" data-id="${escapeHtml(opportunity.id)}"><strong>${escapeHtml(
              opportunity.customer,
            )}</strong><span>${escapeHtml(blocker?.description || blocker?.comments || "Validation blocked")}</span></button></li>`;
          })
          .join("")
      : '<li class="empty-state">No critical blockers in the current filter.</li>';
  }
}

function renderOpportunityList() {
  const visible = filteredOpportunities();
  elements.opportunityList.innerHTML = "";

  visible.forEach((opportunity) => {
    const score = readiness(opportunity);
    const scopes = productScopesFor(opportunity.id);
    const readinessLabel = forumReadinessLabel(opportunity);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `opportunity-card ${opportunity.id === selectedId ? "selected" : ""}`;
    card.dataset.id = opportunity.id;
    card.innerHTML = `
      <span class="card-topline">
        <strong>${escapeHtml(opportunity.name)}</strong>
        <span class="stage-mini">${escapeHtml(opportunity.current_governance_stage)}</span>
      </span>
      <span class="customer-line">${escapeHtml(opportunity.customer)} - ${escapeHtml(opportunity.region)} - ${escapeHtml(
      opportunity.presales_owner,
    )}</span>
      <span class="progress-track" aria-hidden="true"><span style="width: ${score}%"></span></span>
      <span class="card-meta">
        <span>${score}% ready</span>
        <span>${scopes.length} products</span>
        <span>${formatCurrency(opportunity.estimated_value)}</span>
        <span>${escapeHtml(readinessLabel)}</span>
      </span>
    `;
    elements.opportunityList.appendChild(card);
  });

  if (!visible.length) {
    elements.opportunityList.innerHTML = `
      <div class="empty-state guided-empty">
        <strong>No opportunities match the current filters.</strong>
        <p>Clear the search/filter or create a new mock opportunity to start the guided journey.</p>
        <button type="button" class="primary-button" data-action="create-opportunity">Create demo opportunity</button>
      </div>
    `;
  }
}

function fillIntakeForm(opportunity) {
  const form = elements.intakeForm;
  Object.entries(opportunity).forEach(([key, value]) => {
    if (form.elements[key]) {
      form.elements[key].value = value;
    }
  });
}

function shortText(value, fallback = "Not captured") {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return text.length > 96 ? `${text.slice(0, 93)}...` : text;
}

function renderIntakeNarrativeSummary(opportunity) {
  if (!elements.intakeNarrativeSummary) return;
  const items = [
    { label: "Strategic rationale", value: opportunity.strategic_rationale },
    { label: "Architecture", value: opportunity.preliminary_architecture },
    { label: "Delivery dependency", value: opportunity.delivery_dependency },
    { label: "Integration assumptions", value: opportunity.integration_assumptions },
    { label: "Executive decision", value: opportunity.executive_decision_required },
    { label: "Approval conditions", value: opportunity.exceptions_approval_conditions },
  ];
  const documented = items.filter((item) => isDocumented(item.value)).length;

  elements.intakeNarrativeSummary.innerHTML = `
    <div class="narrative-score">
      <span>${documented}/${items.length}</span>
      <label>Governance narrative ready</label>
    </div>
    <div class="narrative-cards">
      ${items
        .map(
          (item) => `
        <article class="narrative-card ${isDocumented(item.value) ? "ready" : "missing"}">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${isDocumented(item.value) ? "Captured" : "Missing"}</span>
          </div>
          <p>${escapeHtml(shortText(item.value))}</p>
        </article>
      `,
        )
        .join("")}
    </div>
  `;
}

function renderRecordHeader(opportunity) {
  const breakdown = readinessBreakdown(opportunity);
  const score = breakdown.score;
  elements.recordCustomer.textContent = `${opportunity.customer} - ${opportunity.sales_owner} / ${opportunity.presales_owner}`;
  elements.recordName.textContent = opportunity.name;
  elements.stageBadge.textContent = `${opportunity.current_governance_stage}: ${currentForumStatus(opportunity)}`;
  elements.stageBadge.className = `status-pill ${statusClass(currentForumStatus(opportunity))}`;
  elements.readinessBadge.textContent = `${score}% readiness`;
  elements.readinessBadge.className = `status-pill ${statusClass(breakdown.status)}`;
  const readinessLabel = forumReadinessLabel(opportunity);
  elements.forumBadge.textContent = readinessLabel;
  elements.forumBadge.className = `status-pill ${statusClass(readinessLabel)}`;
}

function airportProfileComplete(profile) {
  return isDocumented(profile.airport_name) && Number(profile.annual_passengers) > 0 && Number(profile.annual_movements) > 0;
}

function actionableValidationStatuses() {
  return ["Not Started", "Pending Validation", "Needs Adjustment", "More Information Requested", "Overdue"];
}

function recommendedNextAction(opportunity) {
  const profile = airportProfileFor(opportunity.id);
  const scopes = productScopesFor(opportunity.id);
  const estimates = sizingEstimatesFor(opportunity.id);
  const requests = validationRequestsFor(opportunity.id);
  const notifications = requests.map((request) => notificationForRequest(request.id)).filter(Boolean);
  const pendingRequests = requests.filter((request) => actionableValidationStatuses().includes(request.status));
  const breakdown = readinessBreakdown(opportunity);
  const gaps = [
    ...Object.values(breakdown.forumDetails).flatMap((detail) => detail.missing.map((label) => `${detail.forum}: ${label}`)),
    ...breakdown.stakeholders.missing.map((item) => `Stakeholder: ${item.function}`),
    ...breakdown.blockers.blockers,
  ];

  if (!airportProfileComplete(profile)) {
    return {
      title: "Complete the airport profile",
      body: "Enter airport name, annual passengers, and annual movements so the portal can classify the airport.",
      cta: "Open airport profile",
      target: "#sizing",
      action: "scroll",
      meta: "Step 2 of the demo journey",
    };
  }
  if (!scopes.length) {
    return {
      title: "Select products in scope",
      body: "Choose CUSS, CUPPS, SBD, Biometrics, AODB, DDS/FIDS, Integrations, or Support to start sizing.",
      cta: "Open product scope",
      target: "#scope",
      action: "scroll",
      meta: "Step 4 of the demo journey",
    };
  }
  if (!estimates.length || !requests.length || !notifications.length) {
    return {
      title: "Generate sizing and owner requests",
      body: "Run automated sizing to create product/workstream MD lines, identify owners, and draft validation emails.",
      cta: "Run automated sizing",
      target: "#sizing",
      action: "run-sizing",
      meta: `${scopes.length} products ready for mock sizing`,
    };
  }
  if (pendingRequests.length) {
    return {
      title: "Review pending owner validations",
      body: "Resource owners must approve, reject, or adjust sizing before SRM and BAB readiness can improve.",
      cta: "Open validation workflow",
      target: "#resource-validation",
      action: "scroll",
      meta: `${pendingRequests.length} owner actions pending`,
    };
  }
  if (gaps.length) {
    return {
      title: "Resolve readiness gaps",
      body: gaps[0],
      cta: "Review readiness gaps",
      target: "#governance",
      action: "scroll",
      meta: `${gaps.length} gaps affect SRM/BAB readiness`,
    };
  }
  if (!decisionsFor(opportunity.id).length) {
    return {
      title: "Log the governance decision",
      body: "Record SRM/BAB decision, approval conditions, and next steps for the business case trail.",
      cta: "Open decision log",
      target: "#decisions",
      action: "scroll",
      meta: "Final demo step",
    };
  }
  return {
    title: "Ready for executive review",
    body: "The opportunity has sizing, validation evidence, readiness scoring, and decision history for the demo flow.",
    cta: "Open executive dashboard",
    target: "#dashboard",
    action: "scroll",
    meta: `${breakdown.score}% overall readiness`,
  };
}

function journeySteps(opportunity) {
  const profile = airportProfileFor(opportunity.id);
  const scopes = productScopesFor(opportunity.id);
  const estimates = sizingEstimatesFor(opportunity.id);
  const requests = validationRequestsFor(opportunity.id);
  const notifications = requests.map((request) => notificationForRequest(request.id)).filter(Boolean);
  const ownerActionCaptured = requests.length > 0 && requests.every((request) => !actionableValidationStatuses().includes(request.status));
  const breakdown = readinessBreakdown(opportunity);

  return [
    { label: "Create opportunity", complete: Boolean(opportunity.id), target: "#intake" },
    { label: "Enter airport profile", complete: airportProfileComplete(profile), target: "#sizing" },
    { label: "Classify airport", complete: airportProfileComplete(profile) && isDocumented(profile.airport_category), target: "#sizing" },
    { label: "Select product scope", complete: scopes.length > 0, target: "#scope" },
    { label: "Generate sizing lines", complete: estimates.length > 0, target: "#sizing" },
    { label: "Identify owners", complete: estimates.length > 0 && estimates.every((estimate) => estimate.owner_id && estimate.owner_email), target: "#resource-validation" },
    { label: "Create requests", complete: requests.length > 0, target: "#resource-validation" },
    { label: "Preview notifications", complete: notifications.length > 0, target: "#resource-validation" },
    { label: "Capture owner action", complete: ownerActionCaptured, target: "#resource-validation" },
    {
      label: "Recalculate SRM/BAB",
      complete: estimates.length > 0 && (breakdown.forumDetails.SRM.score > 0 || breakdown.forumDetails.BAB.score > 0),
      target: "#governance",
    },
    { label: "Show next actions", complete: Boolean(recommendedNextAction(opportunity)), target: ".journey-panel" },
    { label: "Update executive view", complete: true, target: "#dashboard" },
  ];
}

function isDemoScenario(opportunity) {
  return demoMode && opportunity.id === DEMO_OPPORTUNITY_ID;
}

function demoScenarioSteps(opportunity) {
  const profile = airportProfileFor(opportunity.id);
  const scopes = productScopesFor(opportunity.id);
  const estimates = sizingEstimatesFor(opportunity.id);
  const requests = validationRequestsFor(opportunity.id);
  const notifications = requests.map((request) => notificationForRequest(request.id)).filter(Boolean);
  const notificationEvents = notifications.flatMap((notification) => notification.activity || []);
  const expectedProducts = ["CUPPS", "CUSS", "Biometrics", "AODB", "Integrations / APIs"];
  const productsAligned = scopes.length === expectedProducts.length && expectedProducts.every((product) => scopes.some((scope) => scope.product_name === product));
  const ownersIdentified = estimates.length > 0 && estimates.every((estimate) => estimate.owner_id && isDocumented(estimate.owner_email));
  const adjustedEstimate = estimates.find((estimate) => Number(estimate.adjusted_md || 0) > Number(estimate.initial_md || 0));
  const adjustedRequest = adjustedEstimate
    ? requests.find((request) => request.sizing_estimate_id === adjustedEstimate.id && isDocumented(request.adjustment_reason))
    : null;
  const pendingContexts = validationRequestContexts([opportunity]).filter(requestNeedsOwnerAction);
  const breakdown = readinessBreakdown(opportunity);
  const initialMd = estimates.reduce((sum, estimate) => sum + Number(estimate.initial_md || 0), 0);
  const decisions = decisionsFor(opportunity.id);
  const latestDecision = decisions[0];

  return [
    {
      label: "Intake complete",
      target: "#intake",
      complete: breakdown.forumDetails.BCM.score === 100,
      evidence: `BCM intake ${breakdown.forumDetails.BCM.score}% complete; owners and 15 July deadline captured.`,
      note: "Start with the commercial context. Emphasize that Salesforce remains the system of record while this workspace organizes operational readiness evidence.",
    },
    {
      label: "Airport classified",
      target: "#sizing",
      complete: profile.airport_category === "Medium" && Number(profile.annual_passengers) === 6500000 && Number(profile.annual_movements) === 72000,
      evidence: `${formatNumber(profile.annual_passengers)} passengers and ${formatNumber(profile.annual_movements)} movements produce a ${profile.airport_category} category.`,
      note: "Show that the larger passenger or movement category is applied and that the thresholds are configurable mock settings.",
    },
    {
      label: "Scope confirmed",
      target: "#scope",
      complete: productsAligned,
      evidence: `${scopes.length} products: ${scopes.map((scope) => scope.product_name).join(", ")}.`,
      note: "Connect product selection to product-specific drivers such as CUPPS positions, CUSS kiosks, biometric positions, AODB interfaces, and API counts.",
    },
    {
      label: "Sizing generated",
      target: "#sizing",
      complete: estimates.length > 0 && initialMd > 0,
      evidence: `${estimates.length} product/workstream estimates generated for an initial total of ${formatNumber(initialMd)} MD.`,
      note: "Open one estimate and use Why this estimate? to explain the rule, base MD, complexity, risk, and product-driver factors.",
    },
    {
      label: "Owners identified",
      target: "#resource-validation",
      complete: ownersIdentified,
      evidence: `${estimates.filter((estimate) => estimate.owner_id && estimate.owner_email).length}/${estimates.length} sizing lines have an owner and email.`,
      note: "Explain that routing uses product, workstream, and region, with editable owner emails for the prototype.",
    },
    {
      label: "Requests created",
      target: "#resource-validation",
      complete: requests.length === estimates.length && requests.length > 0,
      evidence: `${requests.length} validation requests created from ${estimates.length} sizing lines.`,
      note: "Show the owner workflow lanes and point out that approvals, conditions, adjustments, and pending work are traceable by request.",
    },
    {
      label: "Notifications triggered",
      target: "#resource-validation",
      complete: notifications.length === requests.length && notifications.length > 0 && notificationEvents.length > 0,
      evidence: `${notifications.length} Email/Teams drafts generated and ${notificationEvents.length} simulated trigger recorded; nothing was sent externally.`,
      note: "Select the pending AODB PM request, switch between Email and Teams, generate a local trigger, and show the notification audit entry.",
    },
    {
      label: "MD adjusted",
      target: "#resource-validation",
      complete: Boolean(adjustedEstimate && adjustedRequest),
      evidence: adjustedEstimate
        ? `${adjustedEstimate.product_name} ${adjustedEstimate.workstream} increased from ${adjustedEstimate.initial_md} to ${adjustedEstimate.adjusted_md} MD with justification.`
        : "No justified upward adjustment found.",
      note: "Use the CUSS Airline Onboarding line to demonstrate why an owner adjustment changes MD while preserving the original generated baseline.",
    },
    {
      label: "Readiness recalculated",
      target: "#governance",
      complete: breakdown.forumDetails.SRM.status === "Ready with Conditions" && breakdown.forumDetails.BAB.status === "Not Ready",
      evidence: `SRM is ${breakdown.forumDetails.SRM.status}; BAB is ${breakdown.forumDetails.BAB.status}; ${pendingContexts.length} owner validation remains open.`,
      note: "Explain the distinction: critical technical evidence is sufficient for SRM with conditions, but BAB cannot be ready until every final validated MD is available.",
    },
    {
      label: "Dashboard updated",
      target: "#dashboard",
      complete: opportunity.overall_readiness_score > 0 && pendingContexts.length === 1,
      evidence: `${opportunity.overall_readiness_score}% overall readiness, ${pendingContexts.length} pending validation, and the MD delta visible on the executive dashboard.`,
      note: "Return to the executive dashboard and show how the one remaining owner action appears in leadership attention, pending validations, and readiness metrics.",
    },
    {
      label: "Next steps logged",
      target: "#decisions",
      complete: Boolean(latestDecision && isDocumented(latestDecision.next_steps)),
      evidence: latestDecision
        ? `${latestDecision.forum} decision logged by ${latestDecision.decision_owner}: ${latestDecision.next_steps}`
        : "No governance decision has been logged.",
      note: "Close with the decision trail: proceed to BAB preparation, validate AODB PM effort, refresh final MD, and return for the executive decision.",
    },
  ];
}

function renderDemoScenarioGuide(opportunity) {
  const steps = demoScenarioSteps(opportunity);
  demoPresenterStep = clamp(demoPresenterStep, 0, steps.length - 1);
  const currentStep = steps[demoPresenterStep];
  const readyEvidence = steps.filter((step) => step.complete).length;

  elements.journeyPanel?.classList.add("demo-mode");
  if (elements.journeyEyebrow) elements.journeyEyebrow.textContent = "Guided presenter mode";
  if (elements.journeyTitle) elements.journeyTitle.textContent = DEMO_SCENARIO_NAME;
  if (elements.journeyProgressBadge) elements.journeyProgressBadge.textContent = `Step ${demoPresenterStep + 1} of ${steps.length}`;
  if (elements.demoModeBtn) {
    elements.demoModeBtn.textContent = activeRoute === "demo" ? "Exit guided demo" : "Open guided demo";
    elements.demoModeBtn.classList.add("active");
  }

  elements.journeyStepper.innerHTML = steps
    .map((step, index) => {
      const state = index < demoPresenterStep ? "complete" : index === demoPresenterStep ? "current" : "pending";
      return `
        <button type="button" class="journey-step ${state} ${step.complete ? "evidence-ready" : "evidence-attention"}" data-action="demo-step" data-demo-step="${index}" data-target="${escapeHtml(step.target)}">
          <span>${index + 1}</span>
          <div>
            <strong>${escapeHtml(step.label)}</strong>
            <em>${step.complete ? "Evidence ready" : "Attention"}</em>
          </div>
        </button>
      `;
    })
    .join("");

  if (elements.presenterNotes) {
    elements.presenterNotes.hidden = false;
    elements.presenterNotes.innerHTML = `
      <div class="presenter-note-copy">
        <span class="log-type">Presenter note - step ${demoPresenterStep + 1}</span>
        <strong>${escapeHtml(currentStep.label)}</strong>
        <p>${escapeHtml(currentStep.note)}</p>
        <div class="presenter-evidence ${currentStep.complete ? "ready" : "attention"}">
          <span>Live evidence</span>
          <p>${escapeHtml(currentStep.evidence)}</p>
        </div>
      </div>
      <div class="presenter-controls">
        <button type="button" class="secondary-button" data-action="demo-step" data-demo-step="${demoPresenterStep - 1}" data-target="${escapeHtml(
          steps[Math.max(0, demoPresenterStep - 1)].target,
        )}" ${demoPresenterStep === 0 ? "disabled" : ""}>Previous</button>
        <button type="button" class="secondary-button" data-action="scroll" data-target="${escapeHtml(currentStep.target)}">Show this step</button>
        <button type="button" class="primary-button" data-action="demo-step" data-demo-step="${demoPresenterStep + 1}" data-target="${escapeHtml(
          steps[Math.min(steps.length - 1, demoPresenterStep + 1)].target,
        )}" ${demoPresenterStep === steps.length - 1 ? "disabled" : ""}>Next step</button>
      </div>
      <small class="presenter-progress">${readyEvidence}/${steps.length} scenario evidence checks ready</small>
    `;
  }

  if (elements.nextActionPanel) elements.nextActionPanel.hidden = true;
}

function renderJourneyGuide(opportunity) {
  if (!elements.journeyStepper || !elements.nextActionPanel) return;
  if (isDemoScenario(opportunity)) {
    renderDemoScenarioGuide(opportunity);
    return;
  }

  elements.journeyPanel?.classList.remove("demo-mode");
  if (elements.journeyEyebrow) elements.journeyEyebrow.textContent = "Demo journey";
  if (elements.journeyTitle) elements.journeyTitle.textContent = "From intake to validated SRM/BAB readiness";
  if (elements.presenterNotes) {
    elements.presenterNotes.hidden = true;
    elements.presenterNotes.innerHTML = "";
  }
  elements.nextActionPanel.hidden = false;
  if (elements.demoModeBtn) {
    elements.demoModeBtn.textContent = "Start guided demo";
    elements.demoModeBtn.classList.remove("active");
  }
  const steps = journeySteps(opportunity);
  const currentIndex = steps.findIndex((step) => !step.complete);
  const completed = currentIndex === -1 ? steps.length : currentIndex;
  if (elements.journeyProgressBadge) {
    elements.journeyProgressBadge.textContent = `${completed} of ${steps.length} steps`;
  }

  elements.journeyStepper.innerHTML = steps
    .map((step, index) => {
      const state = index < completed ? "complete" : index === currentIndex ? "current" : "pending";
      return `
        <button type="button" class="journey-step ${state}" data-action="scroll" data-target="${escapeHtml(step.target)}">
          <span>${index + 1}</span>
          <strong>${escapeHtml(step.label)}</strong>
        </button>
      `;
    })
    .join("");

  const nextAction = recommendedNextAction(opportunity);
  const blockers = openBlockersFor(opportunity).slice(0, 3);
  const pendingRequests = validationRequestsFor(opportunity.id).filter((request) => actionableValidationStatuses().includes(request.status));
  elements.nextActionPanel.innerHTML = `
    <div class="next-action-copy">
      <span class="log-type">Recommended next action</span>
      <strong>${escapeHtml(nextAction.title)}</strong>
      <p>${escapeHtml(nextAction.body)}</p>
      <div class="next-action-meta">
        <span>${escapeHtml(nextAction.meta)}</span>
        <span>${pendingRequests.length} pending validations</span>
        <span>${blockers.length} visible blockers</span>
      </div>
    </div>
    <div class="next-action-buttons">
      <button type="button" class="primary-button" data-action="${escapeHtml(nextAction.action)}" data-target="${escapeHtml(nextAction.target)}">
        ${escapeHtml(nextAction.cta)}
      </button>
      <button type="button" class="secondary-button" data-action="scroll" data-target="#governance">Review readiness</button>
    </div>
  `;
}

function renderScopeDriverControls(scope, airportCategory, selected) {
  const drivers = selected ? driverDetailsForScope(scope, airportCategory) : driversForProduct(scope.product_name);
  if (!selected || !drivers.length) return "";

  return `
    <div class="scope-driver-panel">
      <div class="scope-driver-title">
        <strong>Sizing drivers</strong>
        <span>${escapeHtml(scope.product_name)}</span>
      </div>
      <div class="scope-driver-grid">
        ${drivers
          .map(
            (driver) => `
          <label>
            ${escapeHtml(driver.label)}
            <input
              type="number"
              min="0"
              step="1"
              data-scope-product="${escapeHtml(scope.product_name)}"
              data-driver="${escapeHtml(driver.key)}"
              value="${escapeHtml(driver.value)}"
            />
            <small>${escapeHtml(driver.unit)}; default ${formatNumber(driver.defaultValue)} for ${escapeHtml(airportCategory)}</small>
          </label>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderProductScope(opportunity) {
  const scopes = productScopesFor(opportunity.id);
  const profile = airportProfileFor(opportunity.id);
  const airportCategory = classifyAirport(profile);
  elements.productScope.innerHTML = "";
  elements.productCount.textContent = `${scopes.length} products`;

  if (!scopes.length) {
    elements.productScope.innerHTML = `
      <div class="guided-empty product-onboarding-card span-2">
        <strong>No products selected.</strong>
        <p>The MVP will create product/workstream sizing lines, identify resource owners, and generate validation requests after products are selected.</p>
        <button type="button" class="secondary-button" data-action="focus-first-product" data-target="#scope">Select the first product</button>
      </div>
    `;
  }

  PRODUCT_NAMES.forEach((productName) => {
    const scope = scopes.find((item) => item.product_name === productName);
    const selected = Boolean(scope);
    if (scope) ensureScopeSizingInputs(scope, airportCategory);
    const displayScope = scope || {
      product_name: productName,
      scope_status: "In scope",
      sizing_status: "Not started",
      owner: "",
      owner_email: "",
      validation_status: "Pending",
      risk_level: "Low",
      comments: "",
      sizing_inputs: defaultSizingInputs(productName, airportCategory),
    };
    const productCard = document.createElement("div");
    productCard.className = `product-card ${selected ? "included" : ""}`;
    productCard.innerHTML = `
      <label class="product-toggle">
        <input type="checkbox" data-product="${escapeHtml(productName)}" ${selected ? "checked" : ""} />
        <span>
          <strong>${escapeHtml(productName)}</strong>
          <small>${selected ? escapeHtml(displayScope.scope_status) : "Out of scope"}</small>
        </span>
      </label>
      <div class="scope-fields" aria-label="${escapeHtml(productName)} product scope">
        <label>
          Scope
          <select data-scope-product="${escapeHtml(productName)}" data-field="scope_status" ${selected ? "" : "disabled"}>
            ${statusOptions(SCOPE_STATUSES, displayScope.scope_status)}
          </select>
        </label>
        <label>
          Sizing
          <select data-scope-product="${escapeHtml(productName)}" data-field="sizing_status" ${selected ? "" : "disabled"}>
            ${statusOptions(SIZING_STATUSES, displayScope.sizing_status)}
          </select>
        </label>
        <label>
          Validation
          <select data-scope-product="${escapeHtml(productName)}" data-field="validation_status" ${selected ? "" : "disabled"}>
            ${statusOptions(VALIDATION_STATUSES, displayScope.validation_status)}
          </select>
        </label>
        <label>
          Owner
          <input type="text" data-scope-product="${escapeHtml(productName)}" data-field="owner" value="${escapeHtml(displayScope.owner)}" ${
      selected ? "" : "disabled"
    } />
        </label>
        <label>
          Owner email
          <input type="email" data-scope-product="${escapeHtml(productName)}" data-field="owner_email" value="${escapeHtml(displayScope.owner_email)}" ${
      selected ? "" : "disabled"
    } />
        </label>
        <label>
          Risk level
          <select data-scope-product="${escapeHtml(productName)}" data-field="risk_level" ${selected ? "" : "disabled"}>
            ${statusOptions(RISK_LEVELS, displayScope.risk_level)}
          </select>
        </label>
        <label class="scope-comment">
          Comments
          <input type="text" data-scope-product="${escapeHtml(productName)}" data-field="comments" value="${escapeHtml(displayScope.comments)}" ${
      selected ? "" : "disabled"
    } />
        </label>
      </div>
      ${renderScopeDriverControls(displayScope, airportCategory, selected)}
    `;
    elements.productScope.appendChild(productCard);
  });
}

function renderAirportProfile(opportunity) {
  if (!elements.airportProfileForm) return;
  const profile = airportProfileFor(opportunity.id);
  classifyAirport(profile);
  const form = elements.airportProfileForm;
  form.airport_name.value = profile.airport_name;
  form.annual_passengers.value = profile.annual_passengers;
  form.annual_movements.value = profile.annual_movements;
  form.region.value = profile.region;
  form.categorization_override.value = profile.categorization_override;
  form.override_reason.value = profile.override_reason;
  elements.categoryBadge.textContent = `${profile.airport_category} - ${profile.categorization_method}`;
}

function renderClassificationRules() {
  if (!elements.classificationRules) return;
  elements.classificationRules.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Annual passengers</th>
          <th>Annual movements</th>
          <th>Active</th>
        </tr>
      </thead>
      <tbody>
        ${mockDb.classificationRules
          .map(
            (rule) => `
          <tr>
            <th scope="row">${escapeHtml(rule.category)}</th>
            <td>${formatNumber(rule.passenger_min)} - ${rule.passenger_max === Infinity ? "+" : formatNumber(rule.passenger_max)}</td>
            <td>${formatNumber(rule.movement_min)} - ${rule.movement_max === Infinity ? "+" : formatNumber(rule.movement_max)}</td>
            <td>${rule.active ? "Yes" : "No"}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderSizingSummary(opportunity) {
  if (!elements.sizingSummary) return;
  const totals = totalsForOpportunity(opportunity.id);
  const profile = airportProfileFor(opportunity.id);
  const requests = validationRequestsFor(opportunity.id);
  const estimates = sizingEstimatesFor(opportunity.id);
  const scopes = productScopesFor(opportunity.id);
  const approved = estimates.filter((estimate) => ["Approved", "Approved with Conditions"].includes(estimate.status)).length;
  const flowSteps = [
    { label: "Airport classified", value: profile.airport_category, state: profile.airport_category ? "ready" : "attention" },
    { label: "Scope selected", value: `${scopes.length} products`, state: scopes.length ? "ready" : "attention" },
    { label: "Sizing generated", value: `${estimates.length} estimates`, state: estimates.length ? "ready" : "attention" },
    {
      label: "Owners routed",
      value: `${requests.length} requests`,
      state: requests.length && requests.every((request) => isDocumented(ownerEmail(request.resource_owner_id))) ? "ready" : "attention",
    },
    {
      label: "Validation",
      value: `${approved}/${estimates.length || 0} approved`,
      state: totals.pending ? "attention" : "ready",
    },
    {
      label: "Governance",
      value: `SRM ${sizingReadinessImpact(opportunity, "SRM")}`,
      state: sizingReadinessImpact(opportunity, "SRM") === "Ready" ? "ready" : "attention",
    },
  ];

  elements.sizingSummary.innerHTML = `
    <div class="process-flow span-all" aria-label="Automated validation process flow">
      ${flowSteps
        .map(
          (step, index) => `
        <div class="flow-step ${step.state}">
          <span>${index + 1}</span>
          <div>
            <strong>${escapeHtml(step.label)}</strong>
            <small>${escapeHtml(step.value)}</small>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="metric compact-metric">
      <span>${totals.initial}</span>
      <label class="metric-label-with-help">Initial MD ${helpTooltip("mdEstimates", "MD estimates")}</label>
    </div>
    <div class="metric compact-metric">
      <span>${totals.validated}</span>
      <label>Validated MD</label>
    </div>
    <div class="metric compact-metric ${totals.delta ? "alert" : ""}">
      <span>${totals.delta}</span>
      <label>MD delta</label>
    </div>
    <div class="metric compact-metric alert">
      <span>${totals.pending}</span>
      <label>Pending validations</label>
    </div>
    <div class="metric compact-metric">
      <span>${requests.length}</span>
      <label>Requests generated</label>
    </div>
  `;
}

function filteredSizingEstimates(opportunity) {
  return sizingEstimatesFor(opportunity.id).filter((estimate) => {
    const matchesProduct = estimateProductFilter === "all" || estimate.product_name === estimateProductFilter;
    const matchesStatus = estimateStatusFilter === "all" || estimate.status === estimateStatusFilter;
    return matchesProduct && matchesStatus;
  });
}

function renderEstimateFilters(opportunity) {
  const estimates = sizingEstimatesFor(opportunity.id);
  if (!elements.estimateProductFilter || !elements.estimateStatusFilter) return;

  const products = [...new Set(estimates.map((estimate) => estimate.product_name))];
  if (estimateProductFilter !== "all" && !products.includes(estimateProductFilter)) {
    estimateProductFilter = "all";
  }

  elements.estimateProductFilter.innerHTML = [
    '<option value="all">All products</option>',
    ...products.map((product) => `<option value="${escapeHtml(product)}">${escapeHtml(product)}</option>`),
  ].join("");
  elements.estimateProductFilter.value = estimateProductFilter;

  elements.estimateStatusFilter.innerHTML = [
    '<option value="all">All statuses</option>',
    ...VALIDATION_REQUEST_STATUSES.map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`),
  ].join("");
  elements.estimateStatusFilter.value = estimateStatusFilter;
}

function renderSizingEstimates(opportunity) {
  if (!elements.sizingEstimateTable) return;
  const estimates = sizingEstimatesFor(opportunity.id);
  renderEstimateFilters(opportunity);

  if (!estimates.length) {
    if (elements.estimateResultCount) elements.estimateResultCount.textContent = "0 estimates";
    elements.sizingEstimateTable.innerHTML = `
      <div class="empty-state guided-empty">
        <strong>No sizing generated.</strong>
        <p>Run automated sizing to create initial MD lines by product and workstream, route owners, and generate validation requests.</p>
        <button type="button" class="primary-button" data-action="${productScopesFor(opportunity.id).length ? "run-sizing" : "focus-first-product"}" data-target="${
          productScopesFor(opportunity.id).length ? "#sizing" : "#scope"
        }">${productScopesFor(opportunity.id).length ? "Generate sizing lines" : "Select products first"}</button>
      </div>
    `;
    return;
  }

  const visibleEstimates = filteredSizingEstimates(opportunity);
  if (elements.estimateResultCount) {
    elements.estimateResultCount.textContent = `${visibleEstimates.length} of ${estimates.length} estimates`;
  }

  if (!visibleEstimates.length) {
    elements.sizingEstimateTable.innerHTML = `
      <div class="empty-state guided-empty">
        <strong>No estimates match the selected filters.</strong>
        <p>Clear the product or status filter to return to the full sizing list.</p>
      </div>
    `;
    return;
  }

  const actionStatuses = new Set(["Not Started", "Pending Validation", "Needs Adjustment", "More Information Requested", "Rejected", "Overdue"]);
  const groupedEstimates = new Map();
  visibleEstimates.forEach((estimate) => {
    if (!groupedEstimates.has(estimate.product_name)) groupedEstimates.set(estimate.product_name, []);
    groupedEstimates.get(estimate.product_name).push(estimate);
  });

  if (estimateExpansionOpportunityId !== opportunity.id) {
    estimateExpansionOpportunityId = opportunity.id;
    expandedEstimateProducts.clear();
    const firstException = estimates.find((estimate) => actionStatuses.has(estimate.status));
    expandedEstimateProducts.add(firstException?.product_name || estimates[0]?.product_name);
  }

  elements.sizingEstimateTable.innerHTML = `
    <div class="estimate-board">
      ${Array.from(groupedEstimates.entries())
        .map(([productName, productEstimates]) => {
          const initialTotal = productEstimates.reduce((sum, estimate) => sum + Number(estimate.initial_md || 0), 0);
          const validatedTotal = productEstimates.reduce((sum, estimate) => sum + Number(finalMdForEstimate(estimate) || 0), 0);
          const exceptions = productEstimates.filter((estimate) => actionStatuses.has(estimate.status)).length;
          const conditional = productEstimates.filter((estimate) => estimate.status === "Approved with Conditions").length;
          const approved = productEstimates.filter((estimate) => estimate.status === "Approved").length;
          const groupOpen = estimateProductFilter !== "all" || estimateStatusFilter !== "all" || expandedEstimateProducts.has(productName);
          const groupStatus = exceptions ? `${exceptions} owner action${exceptions === 1 ? "" : "s"}` : conditional ? `${conditional} conditional` : "Validated";
          const groupTone = exceptions ? "attention" : conditional ? "ready-with-conditions" : "ready";
          return `
        <details class="estimate-product-group ${groupTone}" data-estimate-product-group="${escapeHtml(productName)}" ${groupOpen ? "open" : ""}>
          <summary class="estimate-product-summary">
            <span class="estimate-product-title">
              <strong>${escapeHtml(productName)}</strong>
              <small>${pluralize(productEstimates.length, "workstream")} - ${escapeHtml(productEstimates[0].airport_category)} airport - ${escapeHtml(productEstimates[0].complexity)} complexity</small>
            </span>
            <span class="estimate-product-metric"><strong>${formatNumber(initialTotal)}</strong><small>Initial MD</small></span>
            <span class="estimate-product-metric"><strong>${formatNumber(validatedTotal)}</strong><small>Validated MD</small></span>
            <span class="estimate-product-progress"><strong>${approved + conditional}/${productEstimates.length}</strong><small>Validated lines</small></span>
            <span class="status-pill ${groupTone}">${escapeHtml(groupStatus)}</span>
          </summary>
          <div class="estimate-product-body">
            <div class="estimate-list-header" aria-hidden="true">
              <span>Workstream and rule</span>
              <span>Initial</span>
              <span>Adjusted</span>
              <span>Final</span>
              <span>Resource owner</span>
              <span>Validation status</span>
            </div>
            ${productEstimates
              .map((estimate) => {
                const finalMd = finalMdForEstimate(estimate);
                const rule = sizingRuleForEstimate(estimate) || {};
                const appliedRule =
                  estimate.applied_rule_code ||
                  sizingRuleCode(estimate.product_name, estimate.airport_category, estimate.workstream, estimate.complexity);
                const defaultRule = estimate.default_rule_code || rule.rule_code || appliedRule;
                const driverFactor = estimate.sizing_driver_factor
                  ? `${Math.round(estimate.sizing_driver_factor * 100)}% driver factor`
                  : "100% driver factor";
                const overridePending = estimate.manual_override_pending ? "Manual override needs justification before it is applied." : "";
                const rowTone = ["Rejected", "Overdue"].includes(estimate.status)
                  ? "critical"
                  : actionStatuses.has(estimate.status) || estimate.status === "Approved with Conditions"
                    ? "attention"
                    : "ready";
                return `
            <article class="estimate-row ${rowTone}" data-estimate-card="${escapeHtml(estimate.id)}">
              <div class="estimate-row-primary">
                <strong>${escapeHtml(estimate.workstream)}</strong>
                <small>${escapeHtml(defaultRule)}</small>
                <span>${escapeHtml(estimate.airport_category)} airport - ${escapeHtml(estimate.complexity)} complexity - ${escapeHtml(estimate.confidence_level)} confidence</span>
              </div>
              <div class="estimate-md-readout">
                <span class="estimate-mobile-label">Initial MD</span>
                <strong>${formatNumber(estimate.initial_md)}</strong>
              </div>
              <label class="estimate-adjusted-field">
                <span class="estimate-mobile-label">Adjusted MD</span>
                <input class="matrix-input md-input" type="number" min="0" aria-label="Adjusted MD for ${escapeHtml(
                  estimate.product_name,
                )} ${escapeHtml(estimate.workstream)}" data-estimate-id="${escapeHtml(estimate.id)}" data-field="adjusted_md" value="${escapeHtml(
                  estimate.adjusted_md,
                )}" />
              </label>
              <div class="estimate-md-readout final">
                <span class="estimate-mobile-label">Final MD</span>
                <strong>${finalMd || "-"}</strong>
              </div>
              <div class="estimate-row-owner">
                <span class="estimate-mobile-label">Resource owner</span>
                <strong>${escapeHtml(ownerName(estimate.owner_id))}</strong>
                <small>${escapeHtml(estimate.owner_email || ownerEmail(estimate.owner_id))}</small>
              </div>
              <label class="estimate-status-field">
                <span class="estimate-mobile-label">Validation status</span>
                <select class="status-select compact-status" data-estimate-id="${escapeHtml(estimate.id)}" data-field="status">
                  ${statusOptions(VALIDATION_REQUEST_STATUSES, estimate.status)}
                </select>
              </label>

              <details class="estimate-row-detail">
                <summary>Why this estimate?</summary>
                <div class="estimate-detail-content">
                  <div class="estimate-detail-lead">
                    <p>${escapeHtml(estimateWhyText(estimate))}</p>
                    <span class="meta-chip">${escapeHtml(driverFactor)}</span>
                  </div>
                  <div class="estimate-detail-context">
                    <section>
                      <span>Sizing drivers</span>
                      <p>${escapeHtml(estimate.sizing_driver_summary || "No product-specific drivers configured")}</p>
                    </section>
                    <section>
                      <span>Assumptions used</span>
                      <p>${escapeHtml(estimate.assumptions_used)}</p>
                    </section>
                  </div>
                  <div class="rule-breakdown-grid">
                    <div><span>Rule ID</span><strong>${escapeHtml(appliedRule)}</strong></div>
                    <div><span>Rule description</span><strong>${escapeHtml(
                      estimate.rule_description || rule.description || "Mock configurable sizing rule.",
                    )}</strong></div>
                    <div><span>Base MD</span><strong>${formatNumber(estimate.base_md || rule.base_md || rule.default_md || 0)}</strong></div>
                    <div><span>Complexity multiplier</span><strong>${escapeHtml(formatFactor(estimate.complexity_multiplier))}</strong></div>
                    <div><span>Risk adjustment</span><strong>${escapeHtml(formatFactor(estimate.risk_multiplier))}</strong></div>
                    <div><span>Product driver factor</span><strong>${escapeHtml(formatFactor(estimate.sizing_driver_factor))}</strong></div>
                    <div><span>Mock adjustment factor</span><strong>${escapeHtml(formatFactor(estimate.mock_adjustment_factor))}</strong></div>
                    <div><span>Rule-calculated MD</span><strong>${formatNumber(estimate.calculated_md || estimate.initial_md)}</strong></div>
                    <div><span>Final initial MD</span><strong>${formatNumber(estimate.initial_md)}</strong></div>
                  </div>
                  <label class="estimate-owner-editor">
                    Owner email
                    <input class="matrix-input" type="email" data-estimate-id="${escapeHtml(estimate.id)}" data-field="owner_email" value="${escapeHtml(
                      estimate.owner_email || ownerEmail(estimate.owner_id),
                    )}" />
                  </label>
                  <div class="manual-override-panel ${overridePending ? "attention" : ""}">
                    <div>
                      <strong>${helpTerm("manualOverrides", "Manual override")}</strong>
                      <small>Enter a revised initial MD only when the generated baseline is not appropriate. Justification is mandatory.</small>
                    </div>
                    <label>
                      Override initial MD
                      <input class="matrix-input md-input" type="number" min="0" data-estimate-id="${escapeHtml(
                        estimate.id,
                      )}" data-field="manual_override_md" value="${escapeHtml(estimate.manual_override_md || "")}" />
                    </label>
                    <label>
                      Override justification
                      <textarea class="matrix-input override-reason" data-estimate-id="${escapeHtml(
                        estimate.id,
                      )}" data-field="manual_override_reason" placeholder="Required if override MD is entered">${escapeHtml(
                        estimate.manual_override_reason || "",
                      )}</textarea>
                    </label>
                    ${overridePending ? `<small class="override-warning">${escapeHtml(overridePending)}</small>` : ""}
                  </div>
                </div>
              </details>
            </article>`;
              })
              .join("")}
          </div>
        </details>`;
        })
        .join("")}
    </div>
  `;
}

function renderValidationRequests(opportunity) {
  if (!elements.validationRequestList) return;
  const requests = validationRequestsFor(opportunity.id);
  if (!requests.length) {
    elements.validationRequestList.innerHTML = `
      <div class="empty-state guided-empty">
        <strong>No validations created.</strong>
        <p>Run sizing to create owner-specific validation requests and simulated email drafts.</p>
        <button type="button" class="primary-button" data-action="${productScopesFor(opportunity.id).length ? "run-sizing" : "focus-first-product"}" data-target="${
          productScopesFor(opportunity.id).length ? "#sizing" : "#scope"
        }">${productScopesFor(opportunity.id).length ? "Create validation requests" : "Select products first"}</button>
      </div>
    `;
    return;
  }

  if (!requests.some((request) => request.id === selectedValidationRequestId)) {
    selectedValidationRequestId = defaultValidationRequestId(opportunity.id);
  }

  const contexts = requests.map((request) => requestContextFor(request, opportunity)).filter(Boolean);
  const lanes = [
    { title: "Requires action", subtitle: "Waiting, rework, or escalation", statuses: ["Overdue", "Rejected", "Needs Adjustment", "More Information Requested", "Pending Validation", "Not Started"], tone: "attention" },
    { title: "Conditional", subtitle: "Accepted with open conditions", statuses: ["Approved with Conditions"], tone: "warning" },
    { title: "Completed", subtitle: "Final owner decisions", statuses: ["Approved"], tone: "ready" },
  ];
  const selectedRequest = requests.find((request) => request.id === selectedValidationRequestId);
  const selectedContext = selectedRequest ? requestContextFor(selectedRequest, opportunity) : null;
  const selectedEstimate = selectedContext?.estimate || null;
  const selectedOwner = selectedContext?.owner || null;
  const selectedNotification = selectedRequest ? notificationForRequest(selectedRequest.id) : null;
  const emailNotificationState = selectedNotification ? notificationChannelState(selectedNotification, "Email") : null;
  const teamsNotificationState = selectedNotification ? notificationChannelState(selectedNotification, "Teams") : null;
  const pendingCount = contexts.filter(requestNeedsOwnerAction).length;
  const overdueCount = contexts.filter(requestIsOverdue).length;
  const approvedCount = contexts.filter((context) => ["Approved", "Approved with Conditions"].includes(context.effectiveStatus)).length;
  const exceptionCount = contexts.filter((context) => ["Needs Adjustment", "Rejected", "Overdue"].includes(context.effectiveStatus)).length;
  const mdWaiting = contexts
    .filter((context) => requestNeedsOwnerAction(context) || context.effectiveStatus === "Rejected")
    .reduce((sum, context) => sum + Number(context.estimate.initial_md || 0), 0);
  const finalCount = contexts.filter((context) => Number(finalMdForEstimate(context.estimate) || 0) > 0).length;
  const finalMd = contexts.reduce((sum, context) => sum + Number(finalMdForEstimate(context.estimate) || 0), 0);
  const unresolvedCount = Math.max(0, requests.length - approvedCount);
  const routesComplete = contexts.every((context) => context.owner && isDocumented(context.estimate.owner_email || context.owner.email));
  const validationComplete = pendingCount === 0 && exceptionCount === 0;
  const closeComplete = finalCount === requests.length && validationComplete;
  const currentStage = !contexts.length ? "Prepare" : !routesComplete ? "Route" : !validationComplete ? "Validate" : "Close";
  const validationStages = [
    { name: "Prepare", detail: `${contexts.length} sizing lines`, complete: contexts.length > 0 },
    { name: "Route", detail: routesComplete ? "All owners assigned" : "Owner assignment required", complete: routesComplete },
    { name: "Validate", detail: validationComplete ? "All responses resolved" : `${pendingCount + exceptionCount} owner actions`, complete: validationComplete },
    { name: "Close", detail: `${finalCount}/${requests.length} final MD`, complete: closeComplete },
  ];
  const stageGuidance = {
    Prepare: "Generate the sizing baseline before creating owner requests.",
    Route: "Resolve missing owners or email addresses before triggering validation.",
    Validate: `Chase ${pendingCount} pending response${pendingCount === 1 ? "" : "s"} and resolve ${exceptionCount} exception${exceptionCount === 1 ? "" : "s"}.`,
    Close: "Confirm the final MD baseline and carry any conditions into BAB preparation.",
  };
  const ownerPackages = new Map();
  contexts.forEach((context) => {
    const key = context.owner?.id || `unassigned-${context.estimate.product_name}-${context.estimate.workstream}`;
    const item = ownerPackages.get(key) || {
      owner: context.owner,
      contexts: [],
      md: 0,
      dueIn: context.dueIn,
      overdue: 0,
      pending: 0,
      conditional: 0,
      exceptions: 0,
    };
    item.contexts.push(context);
    item.md += Number(context.estimate.initial_md || 0);
    item.dueIn = Math.min(item.dueIn, context.dueIn);
    if (context.effectiveStatus === "Overdue") item.overdue += 1;
    if (requestNeedsOwnerAction(context)) item.pending += 1;
    if (context.effectiveStatus === "Approved with Conditions") item.conditional += 1;
    if (["Needs Adjustment", "Rejected", "Overdue", "More Information Requested"].includes(context.effectiveStatus)) item.exceptions += 1;
    ownerPackages.set(key, item);
  });
  const packageRows = Array.from(ownerPackages.values())
    .map((item) => ({
      ...item,
      primary: item.contexts.slice().sort((a, b) => requestPriorityScore(b) - requestPriorityScore(a) || a.dueIn - b.dueIn)[0],
    }))
    .sort((a, b) => b.overdue - a.overdue || b.exceptions - a.exceptions || b.pending - a.pending || b.md - a.md);

  elements.validationRequestList.innerHTML = `
    <section class="validation-stage-strip" aria-label="Validation workflow stages">
      ${validationStages
        .map(
          (stage, index) => `
        <div class="validation-stage ${stage.complete ? "complete" : stage.name === currentStage ? "current" : "pending"}">
          <span>${index + 1}</span>
          <div><strong>${stage.name}</strong><small>${escapeHtml(stage.detail)}</small></div>
          <em>${stage.complete ? "Complete" : stage.name === currentStage ? "Current" : "Next"}</em>
        </div>`,
        )
        .join("")}
    </section>

    <section class="validation-stage-callout ${closeComplete ? "complete" : "attention"}">
      <div>
        <span class="log-type">Current workflow step</span>
        <strong>${escapeHtml(currentStage)}</strong>
        <p>${escapeHtml(stageGuidance[currentStage])}</p>
      </div>
      <div class="validation-close-metric">
        <strong>${unresolvedCount}</strong>
        <span>responses remaining</span>
      </div>
      <div class="validation-close-metric">
        <strong>${formatNumber(mdWaiting)}</strong>
        <span>MD awaiting owner</span>
      </div>
    </section>

    <div class="validation-command-bar">
      <div>
        <span>${requests.length}</span>
        <label>Total requests</label>
      </div>
      <div class="${pendingCount ? "attention" : ""}">
        <span>${pendingCount}</span>
        <label>Owner action</label>
      </div>
      <div class="${exceptionCount ? "attention" : ""}">
        <span>${exceptionCount}</span>
        <label>Exceptions</label>
      </div>
      <div class="${overdueCount ? "attention" : ""}">
        <span>${overdueCount}</span>
        <label>Overdue</label>
      </div>
      <div class="${mdWaiting ? "attention" : ""}">
        <span>${formatNumber(mdWaiting)}</span>
        <label>MD awaiting owner</label>
      </div>
      <div>
        <span>${approvedCount}</span>
        <label>Approved / conditional</label>
      </div>
    </div>

    <section class="owner-package-board">
      <div class="owner-package-heading">
        <div><span class="log-type">Validation plan</span><strong>Owner packages</strong><small>One consolidated owner view with line-level decisions preserved.</small></div>
        <span class="section-count">${packageRows.length} owners</span>
      </div>
      <div class="owner-package-grid">
        ${packageRows
          .map((item) => {
            const status = item.overdue ? "Escalate" : item.exceptions ? "Exception" : item.pending ? "Requires action" : item.conditional ? "Conditional" : "Completed";
            const tone = item.overdue || item.exceptions ? "critical" : item.pending || item.conditional ? "attention" : "ready";
            return `
          <button type="button" class="owner-package ${tone}" data-request-id="${escapeHtml(item.primary.request.id)}">
            <span class="owner-package-main"><strong>${escapeHtml(item.owner?.name || "Owner not assigned")}</strong><small>${pluralize(item.contexts.length, "sizing line")} - ${formatNumber(item.md)} MD - ${item.dueIn < 0 ? `${Math.abs(item.dueIn)}d overdue` : `due in ${item.dueIn}d`}</small></span>
            <span class="status-pill ${statusClass(tone)}">${escapeHtml(status)}</span>
          </button>`;
          })
          .join("")}
      </div>
    </section>

    <div class="validation-queue-heading">
      <div><span class="log-type">Line-level queue</span><strong>Validation decisions</strong></div>
      <small>Select a line to review assumptions, notify the owner, and record the response.</small>
    </div>

    <div class="validation-workflow-board">
      ${lanes
        .map((lane) => {
          const laneContexts = contexts
            .filter((context) => lane.statuses.includes(context.effectiveStatus))
            .sort((a, b) => requestPriorityScore(b) - requestPriorityScore(a) || a.dueIn - b.dueIn);
          return `
        <section class="validation-lane ${lane.tone}">
          <div class="lane-heading">
            <div><strong>${escapeHtml(lane.title)}</strong><small>${escapeHtml(lane.subtitle)}</small></div>
            <span>${laneContexts.length}</span>
          </div>
          <div class="lane-items">
            ${
              laneContexts.length
                ? laneContexts
                    .slice(0, 8)
                    .map((context) => {
                      const priority = requestPriorityLabel(requestPriorityScore(context));
                      return `
              <button type="button" class="request-mini priority-${statusClass(priority)} ${
                        context.request.id === selectedValidationRequestId ? "selected" : ""
                      }" data-request-id="${escapeHtml(
                        context.request.id,
                      )}">
                <span class="request-product">${escapeHtml(priority)} - ${escapeHtml(context.estimate.product_name)}</span>
                <strong>${escapeHtml(context.estimate.workstream)}</strong>
                <small>${escapeHtml(context.owner?.name || "Owner")} - ${escapeHtml(requestGovernanceImpact(context))}</small>
                <small>${escapeHtml(formatShortDate(context.request.due_date))} - ${context.dueIn < 0 ? `${Math.abs(context.dueIn)}d overdue` : `due in ${context.dueIn}d`} - ${formatNumber(
                        context.estimate.initial_md,
                      )} MD</small>
              </button>
            `;
                    })
                    .join("")
                : '<div class="lane-empty">No items</div>'
            }
            ${laneContexts.length > 8 ? `<span class="lane-more">+${laneContexts.length - 8} more</span>` : ""}
          </div>
        </section>
      `;
        })
        .join("")}
    </div>

    <aside class="request-detail-card">
      <div>
        <span class="log-type">Selected validation task</span>
        <strong>${escapeHtml(selectedEstimate?.product_name || "Estimate")} - ${escapeHtml(selectedEstimate?.workstream || "Workstream")}</strong>
        <small>${escapeHtml(selectedOwner?.name || "Owner")} - ${escapeHtml(selectedEstimate?.owner_email || selectedOwner?.email || "owner@example.com")}</small>
      </div>
      <div class="selected-request-summary">
        <strong>${escapeHtml(selectedContext ? requestActionLabel(selectedContext) : "Select a request")}</strong>
        <span>${escapeHtml(selectedContext ? requestGovernanceImpact(selectedContext) : "No request selected")}</span>
      </div>
      <div class="validation-readiness-impact ${selectedContext && requestNeedsOwnerAction(selectedContext) ? "attention" : "calm"}">
        <span>Readiness impact</span>
        <strong>${escapeHtml(selectedContext ? requestGovernanceImpact(selectedContext) : "No validation selected")}</strong>
        <small>${escapeHtml(
          selectedContext && requestNeedsOwnerAction(selectedContext)
            ? `Completing this ${formatNumber(selectedEstimate?.initial_md || 0)} MD validation is required before the final sizing baseline can close.`
            : "The owner decision is reflected in SRM/BAB readiness and the validated MD baseline.",
        )}</small>
      </div>
      <div class="request-detail-grid">
        <div>
          <span>${escapeHtml(selectedContext?.effectiveStatus || "Pending")}</span>
          <label>Effective status</label>
        </div>
        <div>
          <span>${escapeHtml(selectedRequest ? `${formatShortDate(selectedRequest.due_date)} (${selectedContext?.dueIn ?? "-"}d)` : "-")}</span>
          <label>Due date</label>
        </div>
        <div>
          <span>${selectedEstimate?.initial_md ?? "-"}</span>
          <label>Initial MD</label>
        </div>
        <div>
          <span>${selectedEstimate ? dashboardMdForEstimate(selectedEstimate) : "-"}</span>
          <label>Current MD</label>
        </div>
        <div>
          <span>${selectedEstimate?.adjusted_md || "-"}</span>
          <label>Adjusted MD</label>
        </div>
        <div>
          <span>${selectedContext ? requestPriorityLabel(requestPriorityScore(selectedContext)) : "-"}</span>
          <label>Priority</label>
        </div>
      </div>
      <section class="notification-trigger-panel" aria-label="Resource owner notification trigger">
        <div class="notification-trigger-copy">
          <span class="log-type">Simulation only</span>
          <strong>Notify resource owner</strong>
          <small>Generate the validation request through Email or Teams and record the action locally. No external message is sent.</small>
        </div>
        <div class="notification-trigger-actions">
          <button type="button" class="primary-button" data-notification-trigger="Email" data-request-id="${escapeHtml(selectedRequest?.id || "")}" ${selectedRequest ? "" : "disabled"}>
            Simulate email trigger
          </button>
          <button type="button" class="secondary-button" data-notification-trigger="Teams" data-request-id="${escapeHtml(selectedRequest?.id || "")}" ${selectedRequest ? "" : "disabled"}>
            Simulate Teams trigger
          </button>
        </div>
        <div class="notification-channel-status" aria-label="Notification channel status">
          <span><strong>Email</strong><small>${escapeHtml(emailNotificationState?.status || "Draft")} - ${escapeHtml(
            formatNotificationTimestamp(emailNotificationState?.last_triggered_at),
          )}</small></span>
          <span><strong>Teams</strong><small>${escapeHtml(teamsNotificationState?.status || "Draft")} - ${escapeHtml(
            formatNotificationTimestamp(teamsNotificationState?.last_triggered_at),
          )}</small></span>
        </div>
      </section>
      <div class="owner-action-panel" data-request-action-panel="${escapeHtml(selectedRequest?.id || "")}">
        <div>
          <strong class="fact-label-with-help">Resource owner action ${helpTooltip("resourceValidation", "Resource owner validation")}</strong>
          <small>Review the assumptions and MD baseline, then approve, condition, adjust, reject, or request more information.</small>
        </div>
        <label>
          Adjusted MD
          <input
            class="matrix-input md-input"
            type="number"
            min="0"
            data-request-action-field="adjusted_md"
            value="${escapeHtml(selectedEstimate?.adjusted_md || "")}"
          />
        </label>
        <label>
          Reason / conditions
          <textarea
            class="matrix-input owner-action-reason"
            data-request-action-field="reason"
            placeholder="Required for conditions, adjustment, rejection, or more information"
          >${escapeHtml(selectedRequest?.adjustment_reason || "")}</textarea>
        </label>
        <label>
          Owner comments
          <textarea
            class="matrix-input owner-action-comments"
            data-request-action-field="comments"
            placeholder="Optional owner comments for the validation trail"
          >${escapeHtml(selectedRequest?.comments || "")}</textarea>
        </label>
        <div class="request-action-row">
          <button type="button" class="primary-button" data-owner-action="Approved" data-request-id="${escapeHtml(selectedRequest?.id || "")}">
            Approve
          </button>
          <button type="button" class="secondary-button" data-owner-action="Approved with Conditions" data-request-id="${escapeHtml(selectedRequest?.id || "")}">
            Approve with conditions
          </button>
          <button type="button" class="secondary-button" data-owner-action="Needs Adjustment" data-request-id="${escapeHtml(selectedRequest?.id || "")}">
            Adjust MD
          </button>
          <button type="button" class="secondary-button" data-owner-action="More Information Requested" data-request-id="${escapeHtml(selectedRequest?.id || "")}">
            Request more information
          </button>
          <button type="button" class="secondary-button danger-action" data-owner-action="Rejected" data-request-id="${escapeHtml(selectedRequest?.id || "")}">
            Reject
          </button>
        </div>
      </div>
      <div class="validation-context-grid">
        <div><span>Sizing drivers</span><p>${escapeHtml(selectedEstimate?.sizing_driver_summary || "Select a request to inspect sizing drivers.")}</p></div>
        <div><span>Assumptions</span><p>${escapeHtml(selectedEstimate?.assumptions_used || "Sizing assumptions will appear here.")}</p></div>
        ${selectedRequest?.comments ? `<div><span>Latest owner comment</span><p>${escapeHtml(selectedRequest.comments)}</p></div>` : ""}
      </div>
    </aside>

    <section class="validation-closeout ${closeComplete ? "complete" : "attention"}">
      <div><span class="log-type">Final sizing closeout</span><strong>${closeComplete ? "Validation baseline complete" : `${unresolvedCount} response${unresolvedCount === 1 ? "" : "s"} still required`}</strong><p>${closeComplete ? "All sizing lines have final MD and can support governance preparation." : "Resolve the remaining owner actions before treating the MD baseline as final."}</p></div>
      <div><strong>${finalCount}/${requests.length}</strong><span>validated lines</span></div>
      <div><strong>${formatNumber(finalMd)}</strong><span>final validated MD</span></div>
      <span class="status-pill ${closeComplete ? "ready" : "attention"}">${closeComplete ? "Ready to close" : "BAB dependency"}</span>
    </section>
  `;
}

function renderNotificationPreview() {
  if (!elements.notificationPreview) return;
  const request = mockDb.validationRequests.find((item) => item.id === selectedValidationRequestId);
  const notification = request ? notificationForRequest(request.id) : null;
  if (!request || !notification) {
    elements.notificationPreview.innerHTML = `
      <div class="empty-state guided-empty">
        <strong>No notification selected.</strong>
        <p>Select a validation request to preview the simulated Email or Teams message. The MVP never sends external notifications.</p>
        <button type="button" class="secondary-button" data-action="scroll" data-target="#resource-validation">Review validation requests</button>
      </div>
    `;
    return;
  }

  const channel = ["Email", "Teams"].includes(selectedNotificationChannel) ? selectedNotificationChannel : "Email";
  const channelState = notificationChannelState(notification, channel);
  const title = channel === "Email" ? notification.subject : notification.teams_title;
  const body = channel === "Email" ? notification.body : notification.teams_body;
  const activity = notification.activity || [];
  const stateTone = channelState.status.startsWith("Triggered") ? "ready" : "pending";

  elements.notificationPreview.innerHTML = `
    <div class="notification-preview-shell">
      <div class="notification-preview-toolbar">
        <div class="notification-channel-switch" role="group" aria-label="Notification preview channel">
          ${["Email", "Teams"]
            .map(
              (item) => `
            <button type="button" data-notification-channel="${item}" aria-pressed="${item === channel}" class="${item === channel ? "active" : ""}">${item}</button>`,
            )
            .join("")}
        </div>
        <span class="status-pill ${stateTone}">${escapeHtml(channelState.status)}</span>
      </div>
      <div class="email-preview ${channel === "Teams" ? "teams-preview" : ""}">
        <div>
          <span class="log-type">Simulated ${escapeHtml(channel)} ${channel === "Email" ? "draft" : "message"}</span>
          <strong>${escapeHtml(title)}</strong>
          <small>To: ${escapeHtml(notification.recipient)} - ${escapeHtml(formatNotificationTimestamp(channelState.last_triggered_at))}</small>
        </div>
        <pre>${escapeHtml(body)}</pre>
      </div>
      <div class="notification-preview-action">
        <p>This action only updates the local prototype and creates an audit entry.</p>
        <button type="button" class="primary-button" data-notification-trigger="${escapeHtml(channel)}" data-request-id="${escapeHtml(request.id)}">
          Generate ${escapeHtml(channel)} simulation
        </button>
      </div>
      <section class="notification-activity" aria-label="Notification activity">
        <div class="notification-activity-heading">
          <strong>Notification activity</strong>
          <span>${activity.length} event${activity.length === 1 ? "" : "s"}</span>
        </div>
        ${
          activity.length
            ? `<div class="notification-activity-list">${activity
                .map(
                  (item) => `
              <div class="notification-activity-row">
                <span class="notification-channel-mark">${escapeHtml(item.channel.slice(0, 1))}</span>
                <span><strong>${escapeHtml(item.channel)} trigger generated</strong><small>${escapeHtml(item.recipient)} - ${escapeHtml(
                  formatNotificationTimestamp(item.created_at),
                )}</small></span>
                <span class="status-pill ready">Recorded</span>
              </div>`,
                )
                .join("")}</div>`
            : `<div class="notification-activity-empty"><strong>No trigger activity yet</strong><small>Generate an Email or Teams simulation to demonstrate the workflow.</small></div>`
        }
      </section>
    </div>
  `;
}

function renderResourceOwnerRegistry(opportunity) {
  if (!elements.resourceOwnerRegistry) return;
  const products = new Set(productScopesFor(opportunity.id).map((scope) => scope.product_name));
  const owners = mockDb.resourceOwners.filter(
    (owner) => owner.product_scope === "Any" || products.has(owner.product_scope) || owner.region === opportunity.region,
  );

  elements.resourceOwnerRegistry.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Function</th>
          <th>Product</th>
          <th>Region</th>
          <th>Workstream</th>
          <th>Backup</th>
        </tr>
      </thead>
      <tbody>
        ${owners
          .map(
            (owner) => `
          <tr>
            <th scope="row">${escapeHtml(owner.name)}</th>
            <td>${escapeHtml(owner.email)}</td>
            <td>${escapeHtml(owner.function)}</td>
            <td>${escapeHtml(owner.product_scope)}</td>
            <td>${escapeHtml(owner.region)}</td>
            <td>${escapeHtml(owner.workstream)}</td>
            <td>${escapeHtml(owner.backup_owner)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderSizingEngine(opportunity) {
  renderAirportProfile(opportunity);
  renderClassificationRules();
  renderSizingSummary(opportunity);
  renderSizingEstimates(opportunity);
  renderValidationRequests(opportunity);
  renderNotificationPreview();
  renderResourceOwnerRegistry(opportunity);
}

function renderReadinessBreakdown(opportunity) {
  if (!elements.readinessBreakdown) return;
  const breakdown = readinessBreakdown(opportunity);
  const topGaps = readinessGapsForOpportunity(opportunity).slice(0, 6);

  elements.readinessBreakdown.innerHTML = `
    <section class="overall-readiness-card ${statusClass(breakdown.status)}">
      <div>
        <span>${breakdown.score}%</span>
        <label>Overall readiness</label>
      </div>
      <div>
        <strong>${escapeHtml(breakdown.status)}</strong>
        <p>${
          breakdown.caps.length
            ? `Base score ${breakdown.baseScore}/100; a critical control caps the final score at ${breakdown.cap}/100.`
            : `Base score ${breakdown.baseScore}/100. No critical score cap is applied.`
        }</p>
      </div>
    </section>

    <section class="forum-score-grid" aria-label="Forum readiness scoring">
      ${GOVERNANCE_FORUMS.map((forum) => {
        const detail = breakdown.forumDetails[forum];
        const primaryAction = detail.recommendedActions[0] || "No readiness action required.";
        return `
        <article class="forum-score-card ${statusClass(detail.status)}">
          <div class="forum-score-head">
            <strong>${forum}</strong>
            <span>${detail.score}%</span>
          </div>
          <div class="progress-track" aria-hidden="true"><span style="width: ${detail.score}%"></span></div>
          <div class="forum-status-line">
            <span class="status-pill ${statusClass(detail.status)}">${escapeHtml(detail.status)}</span>
            <small>${detail.complete}/${detail.total} complete</small>
          </div>
          <div class="forum-readiness-counts" aria-label="Readiness issue counts">
            <span>${detail.missing.length} missing</span>
            <span class="${detail.blockers.length ? "has-blocker" : ""}">${detail.blockers.length} blocking</span>
            <span>${detail.conditions.length} conditional</span>
          </div>
          <div class="forum-next-action">
            <strong>Recommended next action</strong>
            <p>${escapeHtml(primaryAction)}</p>
          </div>
          <details class="forum-score-detail">
            <summary>Why this readiness result?</summary>
            <div class="forum-explanation-grid">
              <section>
                <strong>Missing items</strong>
                ${
                  detail.missing.length
                    ? `<ul>${detail.missing.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
                    : "<p>None. All checklist evidence is complete.</p>"
                }
              </section>
              <section>
                <strong>Blocking items</strong>
                ${
                  detail.blockers.length
                    ? `<ul>${detail.blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
                    : "<p>None. No hard governance gates are open.</p>"
                }
              </section>
              <section>
                <strong>Next actions</strong>
                ${
                  detail.recommendedActions.length
                    ? `<ol>${detail.recommendedActions.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
                    : "<p>No action required for this forum.</p>"
                }
              </section>
            </div>
          </details>
        </article>
      `;
      }).join("")}
    </section>

    <section class="score-calculation-card">
      <div class="score-card-heading">
        <strong>Overall score calculation</strong>
        <span>${breakdown.baseScore} base points - final ${breakdown.score}</span>
      </div>
      <div class="score-component-list">
        ${breakdown.components
          .map(
            (component) => `
          <div class="score-component-row">
            <div>
              <strong>${escapeHtml(component.label)}</strong>
              <small>${escapeHtml(component.detail)}</small>
            </div>
            <span>${component.score}% x ${component.weight}% = ${component.points} pts</span>
          </div>
        `,
          )
          .join("")}
        ${
          breakdown.caps.length
            ? `<div class="score-cap-list">
                ${breakdown.caps
                  .map(
                    (cap) => `
                  <div class="score-cap-row">
                    <strong>${escapeHtml(cap.label)}</strong>
                    <span>Cap ${cap.cap}%</span>
                    <small>${escapeHtml(cap.reason)}</small>
                  </div>
                `,
                  )
                  .join("")}
              </div>`
            : `<div class="score-cap-row calm"><strong>No score cap applied</strong><span>Cap 100%</span><small>No critical blockers detected.</small></div>`
        }
      </div>
    </section>

    <section class="readiness-gap-card">
      <div class="readiness-gap-heading">
        <div>
          <span>Readiness drivers</span>
          <strong>Priority actions</strong>
        </div>
        <span class="section-count">${topGaps.length} open</span>
      </div>
      ${
        topGaps.length
          ? `<div class="gap-list">${topGaps
              .map(
                (gap, index) => `
            <div class="gap-item severity-${statusClass(gap.severity)}">
              <span class="gap-rank" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
              <div class="gap-item-copy">
                <strong>${escapeHtml(gap.label)}</strong>
                <small>${escapeHtml(gap.source)} - ${escapeHtml(gap.detail)}</small>
                <div class="gap-next-action"><span>Next action</span><p>${escapeHtml(gap.action)}</p></div>
              </div>
              <span class="status-pill ${statusClass(gap.severity)}">${escapeHtml(gap.severity)}</span>
            </div>
          `,
              )
              .join("")}</div>`
          : "<p>No blocking readiness gaps detected.</p>"
      }
    </section>
  `;
}

function renderGovernanceChecklist(opportunity) {
  elements.governanceChecklist.innerHTML = "";
  const breakdown = readinessBreakdown(opportunity);
  elements.checklistScore.textContent = `${breakdown.score}% overall - ${breakdown.status}`;
  renderReadinessBreakdown(opportunity);

  GOVERNANCE_FORUMS.forEach((forum) => {
    const items = readinessRuleResults(opportunity, forum);
    const complete = items.filter((item) => item.complete).length;
    const detail = breakdown.forumDetails[forum];
    const column = document.createElement("div");
    column.className = `checklist-column ${forum === opportunity.current_governance_stage ? "current" : ""} ${statusClass(detail.status)}`;
    column.innerHTML = `
      <div class="checklist-title">
        <strong>${forum}</strong>
        <span>${detail.checklistPercent}% - ${escapeHtml(detail.status)}</span>
      </div>
      <div class="progress-track" aria-hidden="true"><span style="width: ${detail.checklistPercent}%"></span></div>
      <div class="checklist-items">
        ${items
          .map(
            (item) => `
          <label class="check-item">
            <input type="checkbox" ${item.complete ? "checked" : ""} disabled />
            <span class="check-item-copy">
              <strong>${escapeHtml(item.label)}</strong>
              <small>${escapeHtml(item.evidence)}</small>
            </span>
          </label>
        `,
          )
          .join("")}
      </div>
    `;
    elements.governanceChecklist.appendChild(column);
  });
}

function renderValidationMatrix(opportunity) {
  const rows = validationsFor(opportunity.id)
    .map(
      (validation) => `
        <tr>
          <th scope="row">${escapeHtml(validation.function)}</th>
          <td>${escapeHtml(validation.stakeholder_name)}</td>
          <td>
            <label class="required-control">
              <input type="checkbox" data-validation-id="${escapeHtml(validation.id)}" data-field="required" ${validation.required ? "checked" : ""} />
              <span>${validation.required ? "Required" : "Optional"}</span>
            </label>
          </td>
          <td>
            <button type="button" class="status-token ${statusClass(validation.status)}" data-validation-id="${escapeHtml(validation.id)}" data-cycle-status="true">
              ${escapeHtml(validation.status)}
            </button>
          </td>
          <td><input class="matrix-input" type="date" data-validation-id="${escapeHtml(validation.id)}" data-field="due_date" value="${escapeHtml(
        validation.due_date,
      )}" /></td>
          <td><input class="matrix-input wide" type="text" data-validation-id="${escapeHtml(validation.id)}" data-field="comments" value="${escapeHtml(
        validation.comments,
      )}" /></td>
        </tr>
      `,
    )
    .join("");

  elements.validationMatrix.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Function</th>
          <th>Stakeholder</th>
          <th>Required</th>
          <th>Status</th>
          <th>Due date</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderRisks(opportunity) {
  elements.riskList.innerHTML = "";
  risksFor(opportunity.id).forEach((entry) => {
    const item = document.createElement("div");
    item.className = `log-item risk ${statusClass(entry.severity)}`;
    item.innerHTML = `
      <div>
        <span class="log-type">${escapeHtml(entry.category)} - ${escapeHtml(entry.severity)} - ${escapeHtml(entry.status)}</span>
        <strong>${escapeHtml(entry.description)}</strong>
        <small>${escapeHtml(entry.owner)} - ${escapeHtml(entry.mitigation)}</small>
      </div>
      <button type="button" data-risk-id="${escapeHtml(entry.id)}" aria-label="Remove risk">x</button>
    `;
    elements.riskList.appendChild(item);
  });

  if (!risksFor(opportunity.id).length) {
    elements.riskList.innerHTML = `
      <div class="empty-state guided-empty">
        <strong>No risks added.</strong>
        <p>Add the first technical, delivery, commercial, or governance risk that should influence readiness.</p>
        <button type="button" class="secondary-button" data-action="focus-risk-form" data-target="#risk-log">Add first risk</button>
      </div>
    `;
  }
}

function renderAssumptions(opportunity) {
  elements.assumptionList.innerHTML = "";
  assumptionsFor(opportunity.id).forEach((entry) => {
    const item = document.createElement("div");
    item.className = "log-item assumption";
    item.innerHTML = `
      <div>
        <span class="log-type">${escapeHtml(entry.category)} - ${escapeHtml(entry.impact)} impact</span>
        <strong>${escapeHtml(entry.description)}</strong>
        <small>${escapeHtml(entry.owner)}</small>
      </div>
      <button type="button" data-assumption-id="${escapeHtml(entry.id)}" aria-label="Remove assumption">x</button>
    `;
    elements.assumptionList.appendChild(item);
  });

  if (!assumptionsFor(opportunity.id).length) {
    elements.assumptionList.innerHTML = `
      <div class="empty-state guided-empty">
        <strong>No assumptions logged yet.</strong>
        <p>Capture assumptions that explain the sizing baseline and business case conditions.</p>
      </div>
    `;
  }
}

function renderDecisions(opportunity) {
  elements.decisionList.innerHTML = "";
  decisionsFor(opportunity.id).forEach((entry) => {
    const item = document.createElement("div");
    item.className = "log-item decision";
    item.innerHTML = `
      <div>
        <span class="log-type">${escapeHtml(entry.date)} - ${escapeHtml(entry.forum)} - ${escapeHtml(entry.decision_owner)}</span>
        <strong>${escapeHtml(entry.decision)}</strong>
        <small>${escapeHtml(entry.conditions)} Next: ${escapeHtml(entry.next_steps)}</small>
      </div>
      <button type="button" data-decision-id="${escapeHtml(entry.id)}" aria-label="Remove decision">x</button>
    `;
    elements.decisionList.appendChild(item);
  });

  if (!decisionsFor(opportunity.id).length) {
    elements.decisionList.innerHTML = `
      <div class="empty-state guided-empty">
        <strong>No decisions logged.</strong>
        <p>Record the first BCM, SRM, or BAB outcome with its owner, conditions, and next steps.</p>
        <button type="button" class="primary-button" data-action="focus-decision-form" data-target="#decisions">Record first decision</button>
      </div>
    `;
  }
}

// Mock historical benchmark library - previously validated reference cases used
// to sanity-check a new opportunity's sizing against comparable airports.
const MOCK_BENCHMARKS = [
  {
    id: "bench-medium-pax-2025",
    name: "Iberia Regional Hub - CUSS/CUPPS Refresh",
    category: "Medium",
    year: 2025,
    products: ["CUSS", "CUPPS", "AODB"],
    validated_md_total: 196,
    validated_md_range: [170, 230],
    confidence: "High",
    note: "Validated common-use refresh with light AODB integration.",
  },
  {
    id: "bench-large-bio-2025",
    name: "Gulf International - Biometrics & SBD Programme",
    category: "Large",
    year: 2025,
    products: ["Biometrics", "SBD", "Integrations / APIs"],
    validated_md_total: 412,
    validated_md_range: [360, 470],
    confidence: "High",
    note: "Biometric touchpoints and self bag drop with multiple DCS integrations.",
  },
  {
    id: "bench-large-ops-2024",
    name: "Northstar Airports - AODB/DDS Modernization",
    category: "Large",
    year: 2024,
    products: ["AODB", "DDS/FIDS", "Integrations / APIs"],
    validated_md_total: 358,
    validated_md_range: [310, 405],
    confidence: "Medium",
    note: "Operations data platform and display estate modernization.",
  },
  {
    id: "bench-xl-fullstack-2024",
    name: "Meridian Mega-Hub - Full Passenger Processing",
    category: "Extra Large",
    year: 2024,
    products: ["CUPPS", "CUSS", "SBD", "Biometrics", "AODB"],
    validated_md_total: 684,
    validated_md_range: [600, 760],
    confidence: "Medium",
    note: "Full common-use and self-service stack for a major international hub.",
  },
  {
    id: "bench-small-cuss-2025",
    name: "Alpine Regional - CUSS Pilot",
    category: "Small",
    year: 2025,
    products: ["CUSS", "Support / Field Services"],
    validated_md_total: 88,
    validated_md_range: [72, 110],
    confidence: "High",
    note: "Single-terminal self-service pilot with field support readiness.",
  },
];

function benchmarksForCategory(category) {
  const order = AIRPORT_CATEGORIES;
  const target = order.indexOf(category);
  return [...MOCK_BENCHMARKS]
    .map((benchmark) => ({
      ...benchmark,
      distance: target < 0 ? 99 : Math.abs(order.indexOf(benchmark.category) - target),
    }))
    .sort((a, b) => a.distance - b.distance || b.year - a.year)
    .slice(0, 3);
}

function benchmarkSignal(value, range) {
  if (!value) return { label: "No validated MD yet", tone: "neutral" };
  if (value < range[0]) return { label: "Below benchmark range", tone: "low" };
  if (value > range[1]) return { label: "Above benchmark range", tone: "high" };
  return { label: "Within benchmark range", tone: "ok" };
}

function businessCaseConditions(opportunity) {
  const conditions = [];
  if (isDocumented(opportunity.exceptions_approval_conditions)) {
    conditions.push({ source: "Opportunity exceptions", text: opportunity.exceptions_approval_conditions });
  }
  decisionsFor(opportunity.id).forEach((item) => {
    if (item.conditions && !/^no conditions/i.test(item.conditions.trim())) {
      conditions.push({ source: `${item.forum} decision`, text: item.conditions });
    }
  });
  sizingEstimatesFor(opportunity.id)
    .filter((estimate) => estimate.status === "Approved with Conditions")
    .forEach((estimate) => {
      conditions.push({
        source: `${estimate.product_name} · ${estimate.workstream}`,
        text: estimate.adjustment_reason || estimate.owner_comments || estimate.manual_override_reason || "Approved with conditions by the resource owner.",
      });
    });
  return conditions;
}

function businessCaseWorkstreams(opportunity) {
  const estimates = sizingEstimatesFor(opportunity.id);
  const groups = new Map();
  estimates.forEach((estimate) => {
    const key = estimate.workstream;
    const group = groups.get(key) || { workstream: key, initial: 0, validated: 0, total: 0, approved: 0 };
    group.initial += Number(estimate.initial_md || 0);
    group.validated += finalMdForEstimate(estimate);
    group.total += 1;
    if (["Approved", "Approved with Conditions"].includes(estimate.status)) group.approved += 1;
    groups.set(key, group);
  });
  return WORKSTREAMS.filter((workstream) => groups.has(workstream)).map((workstream) => groups.get(workstream));
}

function buildBusinessCaseText(opportunity) {
  const profile = airportProfileFor(opportunity.id);
  const category = profile.airport_category || classifyAirport(profile);
  const totals = totalsForOpportunity(opportunity.id);
  const breakdown = readinessBreakdown(opportunity);
  const scopes = productScopesFor(opportunity.id).map((scope) => scope.product_name);
  const conditions = businessCaseConditions(opportunity);
  const openRisks = risksFor(opportunity.id).filter((risk) => risk.status !== "Closed");
  const assumptions = assumptionsFor(opportunity.id);
  const lines = [];
  lines.push(`BUSINESS CASE PACK - ${opportunity.name}`);
  lines.push(`Customer: ${opportunity.customer} | Region: ${opportunity.region} | Stage: ${opportunity.current_governance_stage}`);
  lines.push(`Generated (mock): ${DASHBOARD_TODAY} | Submission deadline: ${opportunity.submission_deadline || "TBC"}`);
  lines.push(`Airport: ${profile.airport_name || opportunity.customer} (${category}) - ${formatNumber(profile.annual_passengers)} pax / ${formatNumber(profile.annual_movements)} movements`);
  lines.push(`Overall readiness: ${breakdown.score}% (${breakdown.status})`);
  lines.push("");
  lines.push(`Products in scope: ${scopes.length ? scopes.join(", ") : "None selected"}`);
  lines.push(`Sizing baseline: ${formatNumber(totals.initial)} initial MD | ${formatNumber(totals.validated)} validated MD | ${totals.pending} pending validation`);
  lines.push("");
  lines.push("Validated effort by workstream:");
  businessCaseWorkstreams(opportunity).forEach((group) => {
    lines.push(`  - ${group.workstream}: ${formatNumber(group.validated)} validated / ${formatNumber(group.initial)} initial MD (${group.approved}/${group.total} approved)`);
  });
  lines.push("");
  lines.push(`Approval conditions (${conditions.length}):`);
  conditions.forEach((item) => lines.push(`  - [${item.source}] ${item.text}`));
  lines.push("");
  lines.push(`Open risks (${openRisks.length}):`);
  openRisks.forEach((risk) => lines.push(`  - [${risk.severity}] ${risk.description}`));
  lines.push("");
  lines.push(`Key assumptions (${assumptions.length}):`);
  assumptions.forEach((assumption) => lines.push(`  - ${assumption.description}`));
  lines.push("");
  lines.push("Mock pack - not for external distribution. Salesforce remains the system of record.");
  return lines.join("\n");
}

function renderBusinessCasePack(opportunity) {
  if (!elements.businessCasePack) return;
  const profile = airportProfileFor(opportunity.id);
  const category = profile.airport_category || classifyAirport(profile);
  const totals = totalsForOpportunity(opportunity.id);
  const breakdown = readinessBreakdown(opportunity);
  const scopes = productScopesFor(opportunity.id);
  const estimates = sizingEstimatesFor(opportunity.id);
  const workstreamRows = businessCaseWorkstreams(opportunity);
  const conditions = businessCaseConditions(opportunity);
  const openRisks = risksFor(opportunity.id).filter((risk) => risk.status !== "Closed");
  const assumptions = assumptionsFor(opportunity.id);
  const decisions = decisionsFor(opportunity.id);
  const benchmarks = benchmarksForCategory(category);
  const compareMd = totals.validated || totals.initial;

  const scopeChips = scopes.length
    ? scopes.map((scope) => `<span class="pack-chip">${escapeHtml(scope.product_name)}</span>`).join("")
    : `<span class="pack-chip muted">No products selected</span>`;

  const workstreamTable = workstreamRows.length
    ? `
      <table>
        <thead>
          <tr><th>Workstream</th><th>Initial MD</th><th>Validated MD</th><th>Delta</th><th>Approved</th></tr>
        </thead>
        <tbody>
          ${workstreamRows
            .map((group) => {
              const delta = group.validated - group.initial;
              const deltaText = group.validated ? (delta === 0 ? "0" : `${delta > 0 ? "+" : ""}${formatNumber(delta)}`) : "-";
              return `
                <tr>
                  <th scope="row">${escapeHtml(group.workstream)}</th>
                  <td>${formatNumber(group.initial)}</td>
                  <td>${group.validated ? formatNumber(group.validated) : "<span class=\"pack-muted\">Pending</span>"}</td>
                  <td>${deltaText}</td>
                  <td>${group.approved}/${group.total}</td>
                </tr>`;
            })
            .join("")}
          <tr class="pack-total-row">
            <th scope="row">Total</th>
            <td>${formatNumber(totals.initial)}</td>
            <td>${formatNumber(totals.validated)}</td>
            <td>${totals.validated ? `${totals.delta > 0 ? "+" : ""}${formatNumber(totals.delta)}` : "-"}</td>
            <td>${estimates.filter((estimate) => ["Approved", "Approved with Conditions"].includes(estimate.status)).length}/${estimates.length}</td>
          </tr>
        </tbody>
      </table>`
    : `<p class="pack-muted">No sizing estimates yet. Run sizing to populate the validated effort baseline.</p>`;

  const benchmarkCards = benchmarks.length
    ? benchmarks
        .map((benchmark) => {
          const signal = benchmarkSignal(compareMd, benchmark.validated_md_range);
          return `
            <article class="pack-benchmark-card">
              <header>
                <strong>${escapeHtml(benchmark.name)}</strong>
                <span class="pack-chip muted">${escapeHtml(benchmark.category)} · ${benchmark.year}</span>
              </header>
              <p class="pack-muted">${escapeHtml(benchmark.products.join(", "))}</p>
              <div class="pack-benchmark-md">
                <span>${formatNumber(benchmark.validated_md_total)} MD</span>
                <small>validated range ${formatNumber(benchmark.validated_md_range[0])}-${formatNumber(benchmark.validated_md_range[1])} MD · ${escapeHtml(benchmark.confidence)} confidence</small>
              </div>
              <span class="pack-benchmark-signal ${signal.tone}">${escapeHtml(signal.label)}</span>
              <p class="pack-benchmark-note">${escapeHtml(benchmark.note)}</p>
            </article>`;
        })
        .join("")
    : `<p class="pack-muted">No comparable benchmarks recorded for this category.</p>`;

  const listOrEmpty = (items, mapper, empty) => (items.length ? `<ul class="pack-list">${items.map(mapper).join("")}</ul>` : `<p class="pack-muted">${empty}</p>`);

  elements.businessCasePack.innerHTML = `
    <div class="pack-banner">
      <div>
        <p class="eyebrow">${escapeHtml(opportunity.customer)} · ${escapeHtml(opportunity.region)}</p>
        <h4>${escapeHtml(opportunity.name)}</h4>
        <p class="pack-muted">Mock pack generated ${escapeHtml(formatShortDate(DASHBOARD_TODAY))} · Submission ${escapeHtml(formatShortDate(opportunity.submission_deadline))} · Stage ${escapeHtml(opportunity.current_governance_stage)}</p>
      </div>
      <div class="pack-banner-metrics">
        <div><span>${breakdown.score}%</span><label>Overall readiness</label></div>
        <div><span class="status-pill ${statusClass(breakdown.status)}">${escapeHtml(breakdown.status)}</span><label>Readiness status</label></div>
      </div>
    </div>

    <div class="pack-grid">
      <section class="pack-section">
        <h5>Solution summary</h5>
        <dl class="pack-facts">
          <div><dt>Airport category</dt><dd>${escapeHtml(category || "Pending")}</dd></div>
          <div><dt>Annual passengers</dt><dd>${formatNumber(profile.annual_passengers)}</dd></div>
          <div><dt>Annual movements</dt><dd>${formatNumber(profile.annual_movements)}</dd></div>
          <div><dt>Estimated value</dt><dd>${formatCurrency(opportunity.estimated_value)}</dd></div>
        </dl>
        <p class="pack-label">Products in scope</p>
        <div class="pack-chip-row">${scopeChips}</div>
      </section>

      <section class="pack-section">
        <h5>Validated sizing baseline</h5>
        <div class="pack-md-strip">
          <div><span>${formatNumber(totals.initial)}</span><label>Initial MD</label></div>
          <div><span>${formatNumber(totals.validated)}</span><label>Validated MD</label></div>
          <div><span>${totals.pending}</span><label>Pending validation</label></div>
        </div>
        <div class="matrix-wrap pack-table">${workstreamTable}</div>
      </section>
    </div>

    <section class="pack-section">
      <h5>Historical benchmark comparison</h5>
      <p class="pack-muted">Validated reference cases for ${escapeHtml(category || "comparable")} and adjacent airport categories. Current baseline used for comparison: ${formatNumber(compareMd)} MD.</p>
      <div class="pack-benchmark-grid">${benchmarkCards}</div>
    </section>

    <div class="pack-grid">
      <section class="pack-section">
        <h5>Approval conditions <span class="pack-count">${conditions.length}</span></h5>
        ${listOrEmpty(conditions, (item) => `<li><strong>${escapeHtml(item.source)}</strong> ${escapeHtml(item.text)}</li>`, "No approval conditions recorded.")}
      </section>
      <section class="pack-section">
        <h5>Open risks <span class="pack-count">${openRisks.length}</span></h5>
        ${listOrEmpty(openRisks, (risk) => `<li><span class="status-pill ${statusClass(risk.severity)}">${escapeHtml(risk.severity)}</span> ${escapeHtml(risk.description)}</li>`, "No open risks recorded.")}
      </section>
    </div>

    <div class="pack-grid">
      <section class="pack-section">
        <h5>Key assumptions <span class="pack-count">${assumptions.length}</span></h5>
        ${listOrEmpty(assumptions, (assumption) => `<li>${escapeHtml(assumption.description)}${assumption.category ? ` <span class="pack-muted">(${escapeHtml(assumption.category)})</span>` : ""}</li>`, "No assumptions recorded.")}
      </section>
      <section class="pack-section">
        <h5>Decision log <span class="pack-count">${decisions.length}</span></h5>
        ${listOrEmpty(decisions, (item) => `<li><strong>${escapeHtml(item.forum)}</strong> ${escapeHtml(item.decision)} <span class="pack-muted">${escapeHtml(formatShortDate(item.date))}</span></li>`, "No decisions logged.")}
      </section>
    </div>

    <p class="pack-footnote">Mock pack for internal pre-sales review only. Salesforce remains the commercial system of record; SRM and BAB remain the governance forums of record.</p>
  `;
}

function renderSelectedWorkspace() {
  const opportunity = selectedOpportunity();
  fillIntakeForm(opportunity);
  renderIntakeNarrativeSummary(opportunity);
  renderRecordHeader(opportunity);
  renderJourneyGuide(opportunity);
  renderProductScope(opportunity);
  renderSizingEngine(opportunity);
  renderGovernanceChecklist(opportunity);
  renderValidationMatrix(opportunity);
  renderRisks(opportunity);
  renderAssumptions(opportunity);
  renderDecisions(opportunity);
  renderBusinessCasePack(opportunity);
}

function renderAll() {
  renderExecutiveDashboard();
  renderOpportunityList();
  renderSelectedWorkspace();
  hydrateHelpTooltips();
  updateRouteChrome(activeRoute);
}

function syncIntakeFromForm() {
  const opportunity = selectedOpportunity();
  const data = new FormData(elements.intakeForm);
  opportunity.name = data.get("name").toString().trim() || "Untitled opportunity";
  opportunity.customer = data.get("customer").toString().trim() || "Customer name";
  opportunity.region = data.get("region").toString();
  opportunity.sales_owner = data.get("sales_owner").toString().trim() || "Sales owner";
  opportunity.presales_owner = data.get("presales_owner").toString().trim() || "Pre-sales owner";
  opportunity.opportunity_stage = data.get("opportunity_stage").toString();
  opportunity.estimated_value = Number(data.get("estimated_value")) || 0;
  opportunity.close_date = data.get("close_date").toString();
  opportunity.submission_deadline = data.get("submission_deadline").toString();
  opportunity.strategic_importance = data.get("strategic_importance").toString();
  opportunity.complexity = data.get("complexity").toString();
  opportunity.current_governance_stage = data.get("current_governance_stage").toString();
  opportunity.bcm_status = data.get("bcm_status").toString();
  opportunity.srm_status = data.get("srm_status").toString();
  opportunity.bab_status = data.get("bab_status").toString();
  opportunity.bid_no_bid_recommendation = data.get("bid_no_bid_recommendation").toString();
  opportunity.business_case_status = data.get("business_case_status").toString();
  opportunity.pricing_readiness_status = data.get("pricing_readiness_status").toString();
  opportunity.strategic_rationale = data.get("strategic_rationale").toString().trim();
  opportunity.preliminary_architecture = data.get("preliminary_architecture").toString().trim();
  opportunity.delivery_dependency = data.get("delivery_dependency").toString().trim();
  opportunity.integration_assumptions = data.get("integration_assumptions").toString().trim();
  opportunity.executive_decision_required = data.get("executive_decision_required").toString().trim();
  opportunity.exceptions_approval_conditions = data.get("exceptions_approval_conditions").toString().trim();
  readiness(opportunity);
  renderIntakeNarrativeSummary(opportunity);
  renderRecordHeader(opportunity);
}

function createOpportunity() {
  const id = `opp-${Date.now()}`;
  const opportunity = {
    id,
    name: "New Airport IT Opportunity",
    customer: "Customer name",
    region: "EMEA",
    sales_owner: "Sales owner",
    presales_owner: "Pre-sales owner",
    opportunity_stage: "Qualification",
    estimated_value: 0,
    close_date: new Date().toISOString().slice(0, 10),
    submission_deadline: new Date().toISOString().slice(0, 10),
    strategic_importance: "Medium",
    complexity: "Medium",
    current_governance_stage: "BCM",
    bcm_status: "Not started",
    srm_status: "Not started",
    bab_status: "Not started",
    strategic_rationale: "",
    bid_no_bid_recommendation: "",
    preliminary_architecture: "",
    delivery_dependency: "",
    integration_assumptions: "",
    business_case_status: "Not documented",
    pricing_readiness_status: "Not documented",
    executive_decision_required: "",
    exceptions_approval_conditions: "",
    overall_readiness_score: 0,
  };

  mockDb.opportunities = [opportunity, ...mockDb.opportunities];
  mockDb.airportProfiles.push(airportProfile(id, opportunity.customer, 0, 0, opportunity.region));
  mockDb.stakeholderValidations.push(
    ...stakeholderTemplates.map((_, index) =>
      makeValidation(id, index, {
        due_date: new Date(Date.now() + (index + 7) * 86400000).toISOString().slice(0, 10),
      }),
    ),
  );
  mockDb.governanceItems.push(...GOVERNANCE_FORUMS.flatMap((forum) => makeGovernanceItems(id, forum, [])));
  selectedId = id;
  demoMode = false;
  demoPresenterStep = 0;
  estimateProductFilter = "all";
  estimateStatusFilter = "all";
  selectedValidationRequestId = "";
  renderAll();
  showToast("New mock opportunity created. Start by entering the airport profile.");
  navigateToRoute("intake");
}

function findProductScope(opportunityId, productName) {
  return mockDb.productScopes.find((item) => item.opportunity_id === opportunityId && item.product_name === productName);
}

function addProductScope(opportunityId, productName) {
  mockDb.productScopes.push(productScope(opportunityId, productName, "Not started", selectedOpportunity().presales_owner, "Pending", "Low", ""));
}

function runSizingForSelected() {
  syncAirportProfileFromForm();
  if (!productScopesFor(selectedId).length) {
    showToast("Select at least one product before running sizing.", "attention");
    scrollToSection("#scope");
    return;
  }
  generateSizingForOpportunity(selectedId, { preserveExisting: false });
  if (selectedId === DEMO_OPPORTUNITY_ID && demoMode) applyDemoValidationOverrides();
  estimateProductFilter = "all";
  estimateStatusFilter = "all";
  selectedValidationRequestId = defaultValidationRequestId(selectedId);
  const estimateCount = sizingEstimatesFor(selectedId).length;
  const requestCount = validationRequestsFor(selectedId).length;
  renderAll();
  showToast(`Sizing generated: ${estimateCount} estimates and ${requestCount} validation requests created.`);
}

function executeJourneyAction(action, target, stepIndex) {
  if (action === "create-opportunity") {
    createOpportunity();
    return;
  }
  if (action === "run-sizing") {
    runSizingForSelected();
    scrollToSection(target || "#sizing");
    return;
  }
  if (action === "demo-step") {
    const steps = demoScenarioSteps(selectedOpportunity());
    demoPresenterStep = clamp(Number(stepIndex), 0, Math.max(0, steps.length - 1));
    renderJourneyGuide(selectedOpportunity());
    navigateToRoute("demo");
    return;
  }
  if (action === "focus-first-product") {
    scrollToSection(target || "#scope");
    document.querySelector('#productScope input[data-product]')?.focus();
    return;
  }
  if (action === "focus-risk-form") {
    scrollToSection(target || "#risk-log");
    elements.riskForm.querySelector('[name="description"]')?.focus();
    return;
  }
  if (action === "focus-decision-form") {
    scrollToSection(target || "#decisions");
    elements.decisionForm.querySelector('[name="decision"]')?.focus();
    return;
  }
  scrollToSection(target || ".workspace-grid");
}

function updateScopeDriverValue(opportunityId, productName, driverKey, value) {
  const scope = findProductScope(opportunityId, productName);
  if (!scope) return;
  if (!scope.sizing_inputs) scope.sizing_inputs = {};
  scope.sizing_inputs[driverKey] = Number(value) || 0;
}

function syncScopeOwnerEmailToEstimates(opportunityId, productName, email) {
  sizingEstimatesFor(opportunityId)
    .filter((estimate) => estimate.product_name === productName)
    .forEach((estimate) => {
      estimate.owner_email = email;
      const request = mockDb.validationRequests.find((item) => item.sizing_estimate_id === estimate.id);
      const notification = request ? notificationForRequest(request.id) : null;
      if (notification) notification.recipient = email;
    });
}

function syncAirportProfileFromForm() {
  if (!elements.airportProfileForm) return;
  const profile = airportProfileFor(selectedId);
  const data = new FormData(elements.airportProfileForm);
  profile.airport_name = data.get("airport_name").toString().trim() || selectedOpportunity().customer;
  profile.annual_passengers = Number(data.get("annual_passengers")) || 0;
  profile.annual_movements = Number(data.get("annual_movements")) || 0;
  profile.region = data.get("region").toString();
  profile.categorization_override = data.get("categorization_override").toString();
  profile.override_reason = data.get("override_reason").toString().trim();
  classifyAirport(profile);
  selectedOpportunity().customer = profile.airport_name;
  selectedOpportunity().region = profile.region;
}

function syncEstimateWorkflowAfterChange(estimate) {
  const request = mockDb.validationRequests.find((item) => item.sizing_estimate_id === estimate.id);
  if (request) {
    request.status = estimate.status;
    request.response_date = ["Approved", "Approved with Conditions", "Needs Adjustment", "More Information Requested", "Rejected"].includes(
      estimate.status,
    )
      ? "2026-06-17"
      : "";
    if (estimate.status === "Needs Adjustment" && estimate.adjusted_md) {
      request.adjustment_reason = `Owner adjusted estimate to ${estimate.adjusted_md} MD.`;
    }
  }

  const notification = request ? notificationForRequest(request.id) : null;
  if (notification) {
    const opportunity = mockDb.opportunities.find((item) => item.id === estimate.opportunity_id);
    const profile = airportProfileFor(estimate.opportunity_id);
    const owner = mockDb.resourceOwners.find((item) => item.id === estimate.owner_id) || mockDb.resourceOwners[0];
    notification.recipient = estimate.owner_email || ownerEmail(estimate.owner_id);
    if (opportunity && owner) {
      notification.body = buildNotificationBody(opportunity, profile, estimate, owner);
    }
  }
}

function updateEstimateManualOverride(estimate, field, value) {
  if (field === "manual_override_md") {
    estimate.manual_override_md = Number(value) || "";
  }
  if (field === "manual_override_reason") {
    estimate.manual_override_reason = String(value || "").trim();
  }

  applyEstimateInitialMd(estimate);
  syncEstimateWorkflowAfterChange(estimate);

  if (estimate.manual_override_pending) {
    return {
      message: "Manual override saved as pending. Add justification to apply it to the initial MD.",
      tone: "attention",
    };
  }
  if (estimate.initial_md_source === "Manual override") {
    return {
      message: "Manual override applied with justification; readiness and validation drafts refreshed.",
      tone: "success",
    };
  }
  return {
    message: "Manual override cleared; rule-calculated MD restored.",
    tone: "success",
  };
}

function updateEstimateValidation(estimate, field, value) {
  estimate[field] = field === "adjusted_md" ? Number(value) || "" : value;
  if (["Approved", "Approved with Conditions"].includes(estimate.status)) {
    estimate.final_validated_md = finalMdForEstimate(estimate);
  }
  if (["Needs Adjustment", "More Information Requested", "Rejected", "Overdue", "Pending Validation", "Not Started"].includes(estimate.status)) {
    estimate.final_validated_md = "";
  }

  syncEstimateWorkflowAfterChange(estimate);
}

function applyOwnerValidationAction(requestId, action, fields) {
  const request = mockDb.validationRequests.find((item) => item.id === requestId);
  const estimate = request ? mockDb.sizingEstimates.find((item) => item.id === request.sizing_estimate_id) : null;
  if (!request || !estimate) return { ok: false, message: "Select a validation request before applying an owner action.", tone: "attention" };

  const adjustedMd = Number(fields.adjusted_md || 0);
  const reason = String(fields.reason || "").trim();
  const comments = String(fields.comments || "").trim();
  const requiresReason = ["Approved with Conditions", "Needs Adjustment", "More Information Requested", "Rejected"].includes(action);

  if (requiresReason && !isDocumented(reason)) {
    return { ok: false, message: "A reason is required for this owner action.", tone: "attention" };
  }

  if (action === "Needs Adjustment" && adjustedMd <= 0) {
    return { ok: false, message: "Enter an adjusted MD before marking the estimate as Needs Adjustment.", tone: "attention" };
  }

  if (adjustedMd > 0) {
    estimate.adjusted_md = adjustedMd;
  }

  estimate.status = action;
  if (["Approved", "Approved with Conditions"].includes(action)) {
    estimate.final_validated_md = finalMdForEstimate(estimate);
  } else {
    estimate.final_validated_md = "";
  }

  request.status = action;
  request.response_date = "2026-06-17";
  request.adjustment_reason = reason;
  request.comments =
    comments ||
    reason ||
    (action === "Approved" ? "Approved by resource owner in the mock validation workflow." : request.comments || "");
  request.escalation_required = ["Rejected", "Overdue"].includes(action);

  syncEstimateWorkflowAfterChange(estimate);
  request.adjustment_reason = reason;
  request.comments =
    comments ||
    reason ||
    (action === "Approved" ? "Approved by resource owner in the mock validation workflow." : request.comments || "");
  selectedValidationRequestId = request.id;

  return { ok: true, message: `Owner validation updated: ${action}. SRM/BAB readiness recalculated.`, tone: "success" };
}

elements.opportunityList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-id]");
  if (!card) return;
  selectedId = card.dataset.id;
  estimateProductFilter = "all";
  estimateStatusFilter = "all";
  selectedValidationRequestId = defaultValidationRequestId(selectedId);
  renderAll();
  navigateToRoute("intake");
});

if (elements.blockerList) {
  elements.blockerList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    selectedId = button.dataset.id;
    estimateProductFilter = "all";
    estimateStatusFilter = "all";
    selectedValidationRequestId = defaultValidationRequestId(selectedId);
    renderAll();
    navigateToRoute("intake");
  });
}

if (elements.dashboard) {
  elements.dashboard.addEventListener("click", (event) => {
    const row = event.target.closest(".dashboard-row[data-id], .executive-action-card[data-id]");
    if (!row) return;
    selectedId = row.dataset.id;
    estimateProductFilter = "all";
    estimateStatusFilter = "all";
    selectedValidationRequestId = row.dataset.requestId || defaultValidationRequestId(selectedId);
    renderAll();
    navigateToRoute(row.dataset.requestId ? "validation" : "intake");
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  event.preventDefault();
  executeJourneyAction(button.dataset.action, button.dataset.target, button.dataset.demoStep);
});

if (elements.executiveNextActions) {
  elements.executiveNextActions.addEventListener("click", (event) => {
    const card = event.target.closest("[data-id]");
    if (!card) return;
    selectedId = card.dataset.id;
    estimateProductFilter = "all";
    estimateStatusFilter = "all";
    selectedValidationRequestId = defaultValidationRequestId(selectedId);
    renderAll();
    navigateToRoute("intake");
  });
}

elements.searchInput.addEventListener("input", renderAll);
elements.stageFilter.addEventListener("change", renderAll);
elements.sortReadinessBtn.addEventListener("click", () => {
  sortByReadiness = !sortByReadiness;
  elements.sortReadinessBtn.classList.toggle("active", sortByReadiness);
  renderAll();
});
elements.newOpportunityBtn.addEventListener("click", createOpportunity);
if (elements.demoModeBtn) {
  elements.demoModeBtn.addEventListener("click", () => {
    const exitingDemo = activeRoute === "demo" && isDemoScenario(selectedOpportunity());
    demoMode = !exitingDemo;
    demoPresenterStep = 0;
    if (demoMode) {
      selectedId = DEMO_OPPORTUNITY_ID;
      estimateProductFilter = "all";
      estimateStatusFilter = "all";
      selectedValidationRequestId = defaultValidationRequestId(selectedId);
      elements.searchInput.value = "";
      elements.stageFilter.value = "all";
    }
    renderAll();
    navigateToRoute(demoMode ? "demo" : "dashboard");
    showToast(demoMode ? "Guided demo started at the intake step." : "Guided demo closed; operational journey restored.");
  });
}
if (elements.airportProfileForm) {
  elements.airportProfileForm.addEventListener("input", () => {
    syncAirportProfileFromForm();
    renderAll();
  });
  elements.airportProfileForm.addEventListener("change", () => {
    syncAirportProfileFromForm();
    renderAll();
    const profile = airportProfileFor(selectedId);
    if (airportProfileComplete(profile)) {
      showToast(`Airport classified as ${profile.airport_category}.`);
    }
  });
}
if (elements.runSizingBtn) {
  elements.runSizingBtn.addEventListener("click", runSizingForSelected);
}
if (elements.estimateProductFilter) {
  elements.estimateProductFilter.addEventListener("change", () => {
    estimateProductFilter = elements.estimateProductFilter.value;
    renderSizingEstimates(selectedOpportunity());
  });
}
if (elements.estimateStatusFilter) {
  elements.estimateStatusFilter.addEventListener("change", () => {
    estimateStatusFilter = elements.estimateStatusFilter.value;
    renderSizingEstimates(selectedOpportunity());
  });
}
elements.intakeForm.addEventListener("input", syncIntakeFromForm);
elements.intakeForm.addEventListener("change", syncIntakeFromForm);
elements.intakeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  syncIntakeFromForm();
  renderAll();
  showToast("Mock intake saved. Readiness and next actions refreshed.");
});

elements.productScope.addEventListener("input", (event) => {
  const productName = event.target.dataset.scopeProduct;
  const field = event.target.dataset.field;
  const driverKey = event.target.dataset.driver;
  if (!productName) return;
  if (driverKey) {
    updateScopeDriverValue(selectedId, productName, driverKey, event.target.value);
    return;
  }
  if (!field) return;
  const scope = findProductScope(selectedId, productName);
  if (scope) scope[field] = event.target.value;
});

elements.productScope.addEventListener("change", (event) => {
  const productName = event.target.dataset.product;
  const scopeProduct = event.target.dataset.scopeProduct;
  const field = event.target.dataset.field;
  const driverKey = event.target.dataset.driver;

  if (productName) {
    if (event.target.checked && !findProductScope(selectedId, productName)) {
      addProductScope(selectedId, productName);
      showToast(`${productName} added to scope. Sizing placeholders are ready.`);
    }
    if (!event.target.checked) {
      mockDb.productScopes = mockDb.productScopes.filter((item) => !(item.opportunity_id === selectedId && item.product_name === productName));
      showToast(`${productName} removed from scope. Sizing and requests were refreshed.`);
    }
    generateSizingForOpportunity(selectedId);
    renderAll();
    return;
  }

  if (scopeProduct && driverKey) {
    updateScopeDriverValue(selectedId, scopeProduct, driverKey, event.target.value);
    generateSizingForOpportunity(selectedId);
    renderAll();
    showToast(`${scopeProduct} sizing driver updated; estimates recalculated.`);
    return;
  }

  if (scopeProduct && field) {
    const scope = findProductScope(selectedId, scopeProduct);
    if (scope) {
      scope[field] = event.target.value;
      if (field === "owner_email") syncScopeOwnerEmailToEstimates(selectedId, scopeProduct, event.target.value);
    }
    generateSizingForOpportunity(selectedId);
    renderAll();
    showToast(`${scopeProduct} scope details updated; sizing and readiness refreshed.`);
  }
});

if (elements.sizingEstimateTable) {
  elements.sizingEstimateTable.addEventListener(
    "toggle",
    (event) => {
      const group = event.target.closest?.("[data-estimate-product-group]");
      if (!group) return;
      const productName = group.dataset.estimateProductGroup;
      if (group.open) expandedEstimateProducts.add(productName);
      else expandedEstimateProducts.delete(productName);
    },
    true,
  );

  elements.sizingEstimateTable.addEventListener("input", (event) => {
    const id = event.target.dataset.estimateId;
    const field = event.target.dataset.field;
    if (!id || !field) return;
    const estimate = mockDb.sizingEstimates.find((item) => item.id === id);
    if (!estimate) return;
    if (field === "manual_override_md" || field === "manual_override_reason") {
      updateEstimateManualOverride(estimate, field, event.target.value);
      return;
    }
    updateEstimateValidation(estimate, field, event.target.value);
  });

  elements.sizingEstimateTable.addEventListener("focusout", (event) => {
    const id = event.target.dataset.estimateId;
    const field = event.target.dataset.field;
    if (!id || !["manual_override_md", "manual_override_reason"].includes(field)) return;
    const estimate = mockDb.sizingEstimates.find((item) => item.id === id);
    if (!estimate) return;
    const result = updateEstimateManualOverride(estimate, field, event.target.value);
    renderAll();
    if (estimate.manual_override_pending || estimate.initial_md_source === "Manual override") {
      showToast(result.message, result.tone);
    }
  });

  elements.sizingEstimateTable.addEventListener("change", (event) => {
    const id = event.target.dataset.estimateId;
    const field = event.target.dataset.field;
    if (!id || !field) return;
    const estimate = mockDb.sizingEstimates.find((item) => item.id === id);
    if (!estimate) return;
    if (field === "manual_override_md" || field === "manual_override_reason") {
      const result = updateEstimateManualOverride(estimate, field, event.target.value);
      renderAll();
      showToast(result.message, result.tone);
      return;
    }
    updateEstimateValidation(estimate, field, event.target.value);
    renderAll();
    showToast("Validation updated; SRM/BAB readiness recalculated.");
  });
}

if (elements.validationRequestList) {
  elements.validationRequestList.addEventListener("click", (event) => {
    const notificationTrigger = event.target.closest("[data-notification-trigger]");
    if (notificationTrigger) {
      runMockNotificationTrigger(notificationTrigger);
      return;
    }

    const ownerActionButton = event.target.closest("[data-owner-action]");
    if (ownerActionButton) {
      const panel = ownerActionButton.closest("[data-request-action-panel]");
      const fields = {};
      panel?.querySelectorAll("[data-request-action-field]").forEach((input) => {
        fields[input.dataset.requestActionField] = input.value;
      });
      const result = applyOwnerValidationAction(ownerActionButton.dataset.requestId, ownerActionButton.dataset.ownerAction, fields);
      if (!result.ok) {
        showToast(result.message, result.tone);
        return;
      }
      renderAll();
      showToast(result.message, result.tone);
      return;
    }

    const statusButton = event.target.closest("[data-request-status]");
    if (statusButton) {
      const request = mockDb.validationRequests.find((item) => item.id === statusButton.dataset.requestId);
      const estimate = request ? mockDb.sizingEstimates.find((item) => item.id === request.sizing_estimate_id) : null;
      if (!request || !estimate) return;
      const nextStatus = statusButton.dataset.requestStatus;
      if (nextStatus === "Needs Adjustment" && !estimate.adjusted_md) {
        updateEstimateValidation(estimate, "adjusted_md", Number(estimate.initial_md || 0) + 5);
      }
      updateEstimateValidation(estimate, "status", nextStatus);
      selectedValidationRequestId = request.id;
      renderAll();
      showToast(`Owner validation marked as ${nextStatus}; readiness recalculated.`);
      return;
    }

    const row = event.target.closest("[data-request-id]");
    if (!row) return;
    selectedValidationRequestId = row.dataset.requestId;
    renderValidationRequests(selectedOpportunity());
    renderNotificationPreview();
  });
}

if (elements.notificationPreview) {
  elements.notificationPreview.addEventListener("click", (event) => {
    const channelButton = event.target.closest("[data-notification-channel]");
    if (channelButton) {
      selectedNotificationChannel = channelButton.dataset.notificationChannel;
      renderNotificationPreview();
      return;
    }

    const notificationTrigger = event.target.closest("[data-notification-trigger]");
    if (notificationTrigger) {
      runMockNotificationTrigger(notificationTrigger);
    }
  });
}

elements.governanceChecklist.addEventListener("change", (event) => {
  const id = event.target.dataset.governanceId;
  if (!id) return;
  const item = mockDb.governanceItems.find((entry) => entry.id === id);
  if (item) item.complete = event.target.checked;
  renderAll();
});

elements.validationMatrix.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cycle-status]");
  if (!button) return;
  const validation = mockDb.stakeholderValidations.find((item) => item.id === button.dataset.validationId);
  if (!validation) return;
  const currentIndex = VALIDATION_STATUSES.indexOf(validation.status);
  validation.status = VALIDATION_STATUSES[(currentIndex + 1) % VALIDATION_STATUSES.length];
  renderAll();
  showToast(`${validation.function} stakeholder status updated to ${validation.status}.`);
});

elements.validationMatrix.addEventListener("input", (event) => {
  const id = event.target.dataset.validationId;
  const field = event.target.dataset.field;
  if (!id || !field) return;
  const validation = mockDb.stakeholderValidations.find((item) => item.id === id);
  if (!validation) return;
  validation[field] = field === "required" ? event.target.checked : event.target.value;
});

elements.validationMatrix.addEventListener("change", (event) => {
  const id = event.target.dataset.validationId;
  const field = event.target.dataset.field;
  if (!id || !field) return;
  const validation = mockDb.stakeholderValidations.find((item) => item.id === id);
  if (!validation) return;
  validation[field] = field === "required" ? event.target.checked : event.target.value;
  renderAll();
});

elements.riskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(elements.riskForm);
  const description = data.get("description").toString().trim();
  if (!description) return;
  mockDb.risks.unshift(
    risk(
      selectedId,
      data.get("category").toString(),
      description,
      data.get("severity").toString(),
      data.get("mitigation").toString().trim() || "Mitigation to be defined.",
      data.get("owner").toString().trim() || selectedOpportunity().presales_owner,
      data.get("status").toString(),
    ),
  );
  elements.riskForm.reset();
  renderAll();
  showToast("Risk added to the readiness view.");
});

elements.riskList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-risk-id]");
  if (!button) return;
  mockDb.risks = mockDb.risks.filter((item) => item.id !== button.dataset.riskId);
  renderAll();
});

elements.assumptionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(elements.assumptionForm);
  const description = data.get("description").toString().trim();
  if (!description) return;
  mockDb.assumptions.unshift(
    assumption(
      selectedId,
      description,
      data.get("category").toString(),
      data.get("impact").toString(),
      data.get("owner").toString().trim() || selectedOpportunity().presales_owner,
    ),
  );
  elements.assumptionForm.reset();
  renderAll();
  showToast("Assumption added to the governance evidence.");
});

elements.assumptionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-assumption-id]");
  if (!button) return;
  mockDb.assumptions = mockDb.assumptions.filter((item) => item.id !== button.dataset.assumptionId);
  renderAll();
});

elements.decisionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(elements.decisionForm);
  const decisionText = data.get("decision").toString().trim();
  if (!decisionText) return;
  mockDb.decisions.unshift(
    decision(
      selectedId,
      data.get("forum").toString(),
      decisionText,
      data.get("decision_owner").toString().trim() || selectedOpportunity().presales_owner,
      new Date().toISOString().slice(0, 10),
      data.get("conditions").toString().trim() || "No conditions recorded.",
      data.get("next_steps").toString().trim() || "Next steps to be defined.",
    ),
  );
  elements.decisionForm.reset();
  renderAll();
  showToast("Decision logged for the governance trail.");
});

elements.decisionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-decision-id]");
  if (!button) return;
  mockDb.decisions = mockDb.decisions.filter((item) => item.id !== button.dataset.decisionId);
  renderAll();
});

elements.routePreviousBtn?.addEventListener("click", () => {
  if (elements.routePreviousBtn.dataset.route) navigateToRoute(elements.routePreviousBtn.dataset.route);
});

elements.routeNextBtn?.addEventListener("click", () => {
  if (elements.routeNextBtn.dataset.route) navigateToRoute(elements.routeNextBtn.dataset.route);
});

elements.routeRecommendationBtn?.addEventListener("click", () => {
  executeJourneyAction(
    elements.routeRecommendationBtn.dataset.journeyAction || "scroll",
    elements.routeRecommendationBtn.dataset.journeyTarget || "#intake",
  );
});

elements.copyBusinessCaseBtn?.addEventListener("click", async () => {
  const text = buildBusinessCaseText(selectedOpportunity());
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "absolute";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    showToast("Business case pack summary copied to clipboard.");
  } catch (error) {
    showToast("Copy is unavailable in this browser. Select the pack text manually.", "attention");
  }
});

window.addEventListener("hashchange", () => applyRoute(routeFromHash()));

initializeSizingEngine();
selectedValidationRequestId = defaultValidationRequestId(selectedId);
mockDb.opportunities.forEach(readiness);
activeRoute = routeFromHash();
renderAll();
applyRoute(activeRoute, { scroll: false });
