const PRODUCT_NAMES = [
  "CUSS",
  "CUPPS",
  "ABD",
  "Baggage Reconciliation System",
  "Standalone Biopod",
  "Amadeus Passenger Verification",
  "AODB",
  "FRMS",
  "DDS",
  "Integrations & APIs",
  "Seamless GT11 eGate - Non Biometric",
  "Seamless GT11 eGate - Biometric",
  "Seamless GT11 eGate - Biopod",
  "Seamless Journey Platform Lite",
  "Seamless Journey Full",
  "Support & Field Services",
];

// Products for which no owner-validated sizing rule exists yet: the catalog
// carries them, but effort must come from real rules/examples, so the engine
// must not invent MD for them. FRMS: future AMS suite sizing is driven by the
// airport's annual movements. The biometric eGate awaits its own rule set.
const PRODUCTS_AWAITING_SIZING = new Set(["FRMS", "Seamless GT11 eGate - Biometric"]);

// UI grouping for the Product Scope screen so related products (and the four
// Seamless GT 11 variants) sit together instead of scattering down the page.
const PRODUCT_FAMILY_ORDER = [
  "Common Use",
  "Self-Service & Baggage",
  "Biometrics & Identity",
  "AMS - Amadeus Management Solutions",
  "Seamless - Hardware",
  "Seamless - Software",
  "Support",
  "Other products",
];
const PRODUCT_FAMILY_MAP = {
  CUSS: "Common Use",
  CUPPS: "Common Use",
  ABD: "Self-Service & Baggage",
  "Baggage Reconciliation System": "Self-Service & Baggage",
  "Standalone Biopod": "Biometrics & Identity",
  "Amadeus Passenger Verification": "Biometrics & Identity",
  AODB: "AMS - Amadeus Management Solutions",
  FRMS: "AMS - Amadeus Management Solutions",
  DDS: "AMS - Amadeus Management Solutions",
  "Integrations & APIs": "AMS - Amadeus Management Solutions",
  "Support & Field Services": "Support",
};
// The AMS (Amadeus Management Solutions) suite. Integrations/APIs is scoped
// against AODB (see PRODUCT_LINKS) rather than being a suite product itself.
const AMS_SUITE_PRODUCTS = new Set(["AODB", "FRMS", "DDS"]);
const PRODUCT_LINKS = { "Integrations & APIs": "AODB" };
function productFamily(name) {
  if (String(name).startsWith("Seamless GT11 eGate")) return "Seamless - Hardware";
  if (String(name).startsWith("Seamless Journey")) return "Seamless - Software";
  return PRODUCT_FAMILY_MAP[name] || "Other products";
}

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
  // Generic workstreams (products without a dedicated activity list yet)
  "Implementation",
  "R&D",
  "Project Management",
  "Airline Onboarding",
  "Integrations",
  "Testing & Cutover",
  "Training",
  "Support Readiness",
  "Field Services",
  // CUPPS product-specific activities
  "Project Manager",
  "Implementation Engineer",
  "ACS Training",
  "ACS Support Establishment",
  "Central Service Delivery",
  "Airline Integration",
  "Insights Set up",
  "Agent Portal",
];

// The guided demo narrative was authored against this frozen date; outside
// demo mode all deadline/overdue math uses the real current date.
const DEMO_FROZEN_TODAY = "2026-06-17";

function localIsoDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

let referenceTodayValue = localIsoDate();

function referenceToday() {
  return referenceTodayValue;
}

function setReferenceToday(value) {
  referenceTodayValue = value || localIsoDate();
}
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
    "Generate an Email or Teams validation request for the resource owner. The trigger is recorded locally; nothing is sent externally.",
  srmReadiness:
    "SRM readiness indicates whether validated technical and delivery inputs are sufficient to proceed to solution review.",
  babReadiness:
    "BAB readiness indicates whether SRM, validated effort, business case inputs, risks, and executive decisions are sufficiently prepared for approval.",
  decisionLog:
    "The decision log preserves forum outcomes, owners, conditions, and next steps as governance evidence.",
  manualOverrides:
    "Manual overrides require justification to preserve traceability. The original rule calculation remains visible for comparison.",
  airportLookup:
    "Looks up annual passenger traffic on Wikidata by IATA (3-letter) or ICAO (4-letter) airport code. The result is an unverified suggestion with its source and reference year recorded; movements still require manual entry and figures should be confirmed against official statistics before governance use.",
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
  ABD: "ABD",
  "Standalone Biopod": "BIOPOD",
  AODB: "AODB",
  FRMS: "FRMS",
  DDS: "DDS",
  "Integrations & APIs": "API",
  "Support & Field Services": "SUP",
  "Seamless GT11 eGate - Non Biometric": "GT11-NB",
  "Seamless GT11 eGate - Biometric": "GT11-BIO",
  "Seamless GT11 eGate - Biopod": "GT11-BIOPOD",
  "Seamless Journey Platform Lite": "SJP-LITE",
  "Seamless Journey Full": "SJP-FULL",
  "Amadeus Passenger Verification": "APV",
  "Baggage Reconciliation System": "BRS",
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
  "Project Manager": "PMGR",
  "Implementation Engineer": "IMPE",
  "ACS Training": "ACST",
  "ACS Support Establishment": "ACSS",
  "Central Service Delivery": "CSD",
  "Airline Integration": "AINT",
  "Insights Set up": "INS",
  "Agent Portal": "AGP",
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
  // CUPPS uses its product-specific activity list (product owner definition).
  // MD values remain mock placeholders until real historical rules arrive.
  CUPPS: {
    "Project Manager": 9,
    "Implementation Engineer": 25,
    "ACS Training": 5,
    "ACS Support Establishment": 6,
    "Central Service Delivery": 8,
    "Airline Integration": 10,
    "Insights Set up": 7,
    "Agent Portal": 5,
  },
  ABD: {
    Implementation: 20,
    "R&D": 10,
    "Project Management": 8,
    Integrations: 12,
    "Testing & Cutover": 9,
    Training: 5,
    "Support Readiness": 6,
    "Field Services": 10,
  },
  "Standalone Biopod": {
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
  DDS: {
    Implementation: 14,
    "Project Management": 6,
    Integrations: 8,
    "Testing & Cutover": 6,
    Training: 4,
    "Support Readiness": 4,
    "Field Services": 8,
  },
  FRMS: {},
  "Integrations & APIs": {
    Implementation: 8,
    "R&D": 12,
    "Project Management": 6,
    Integrations: 18,
    "Testing & Cutover": 8,
    "Support Readiness": 4,
  },
  "Support & Field Services": {
    "Project Management": 5,
    "Support Readiness": 12,
    "Field Services": 16,
    Training: 4,
  },
  "Seamless GT11 eGate - Non Biometric": {
    Implementation: 14,
    "R&D": 6,
    "Project Management": 6,
    "Airline Onboarding": 6,
    "Testing & Cutover": 6,
    Training: 3,
    "Support Readiness": 4,
  },
  "Seamless GT11 eGate - Biopod": {
    Implementation: 20,
    "R&D": 18,
    "Project Management": 9,
    "Airline Onboarding": 8,
    Integrations: 14,
    "Testing & Cutover": 9,
    Training: 4,
    "Support Readiness": 6,
  },
  "Seamless Journey Platform Lite": {
    Implementation: 18,
    "R&D": 10,
    "Project Management": 8,
    "Airline Onboarding": 8,
    Integrations: 8,
    "Testing & Cutover": 8,
    Training: 4,
    "Support Readiness": 5,
  },
  "Seamless Journey Full": {
    Implementation: 24,
    "R&D": 14,
    "Project Management": 10,
    "Airline Onboarding": 9,
    Integrations: 12,
    "Testing & Cutover": 9,
    Training: 5,
    "Support Readiness": 6,
  },
  "Amadeus Passenger Verification": {
    Implementation: 12,
    "R&D": 14,
    "Project Management": 7,
    "Airline Onboarding": 5,
    Integrations: 16,
    "Testing & Cutover": 8,
    Training: 3,
    "Support Readiness": 5,
  },
  "Baggage Reconciliation System": {
    Implementation: 16,
    "R&D": 10,
    "Project Management": 10,
    Integrations: 16,
    "Testing & Cutover": 8,
    Training: 5,
    "Support Readiness": 6,
    "Field Services": 6,
  },
};

const productSizingDrivers = {
  CUPPS: [
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
    {
      // Auto-populated total; read-only. Weight 0 so it does not double-count
      // the counters and gates it is the sum of.
      key: "cupps_positions",
      label: "CUPPS positions (total)",
      unit: "positions",
      computed: { op: "sum", sources: ["check_in_counters", "gates"] },
      weight: 0,
    },
    // Similarity characteristics for the future example-based sizing engine.
    // Weight 0: their effort impact must come from real historical rules, not
    // an invented multiplier.
    {
      key: "cupps_agent_portal",
      label: "Agent Portal",
      unit: "included",
      type: "boolean",
      weight: 0,
    },
    {
      // Airport Insight tier (product owner definition). Effort impact must
      // come from real historical rules, hence weight 0.
      key: "cupps_airport_insight",
      label: "Airport Insight",
      unit: "tier",
      type: "select",
      options: ["None", "Standard", "Cross Product", "Predictive Insights", "Data Feeds"],
      weight: 0,
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
    {
      key: "cuss_baggage_drops",
      label: "Amadeus Baggage Drops",
      unit: "bag drops",
      defaults: { Small: 4, Medium: 14, Large: 36, "Extra Large": 64 },
      weight: 0.25,
    },
  ],
  ABD: [
    {
      key: "abd_s1_mini_units",
      label: "ABD S1 Mini units",
      unit: "units",
      defaults: { Small: 2, Medium: 6, Large: 14, "Extra Large": 24 },
      weight: 0.2,
    },
    {
      key: "abd_s1_t2_units",
      label: "ABD S1 T2 units",
      unit: "units",
      defaults: { Small: 2, Medium: 5, Large: 12, "Extra Large": 20 },
      weight: 0.2,
    },
    {
      key: "abd_s7_units",
      label: "ABD S7 units",
      unit: "units",
      defaults: { Small: 1, Medium: 3, Large: 8, "Extra Large": 14 },
      weight: 0.2,
    },
  ],
  "Standalone Biopod": [
    {
      key: "biopod_positions",
      label: "Standalone Biopod positions",
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
  DDS: [
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
  "Integrations & APIs": [
    {
      key: "integration_l1_count",
      label: "Integrations - L1 (Simple)",
      unit: "integrations",
      defaults: { Small: 2, Medium: 3, Large: 6, "Extra Large": 10 },
      weight: 0.15,
    },
    {
      key: "integration_l2_count",
      label: "Integrations - L2 (Moderate)",
      unit: "integrations",
      defaults: { Small: 1, Medium: 2, Large: 4, "Extra Large": 7 },
      weight: 0.2,
    },
    {
      key: "integration_l3_count",
      label: "Integrations - L3 (Complex)",
      unit: "integrations",
      defaults: { Small: 1, Medium: 1, Large: 3, "Extra Large": 5 },
      weight: 0.25,
    },
    {
      key: "integration_l4_count",
      label: "Integrations - L4 (Very Complex)",
      unit: "integrations",
      defaults: { Small: 0, Medium: 1, Large: 2, "Extra Large": 3 },
      weight: 0.3,
    },
  ],
  "Support & Field Services": [
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
  "Seamless GT11 eGate - Non Biometric": [
    {
      key: "gt11_nb_doors",
      label: "eGate door units",
      unit: "doors",
      defaults: { Small: 6, Medium: 24, Large: 60, "Extra Large": 100 },
      weight: 0.35,
    },
  ],
  "Seamless GT11 eGate - Biometric": [
    {
      key: "gt11_bio_doors",
      label: "eGate door units",
      unit: "doors",
      defaults: { Small: 6, Medium: 20, Large: 50, "Extra Large": 90 },
      weight: 0.35,
    },
  ],
  "Seamless GT11 eGate - Biopod": [
    {
      key: "gt11_biopod_units",
      label: "Biopod units",
      unit: "pods",
      defaults: { Small: 4, Medium: 16, Large: 40, "Extra Large": 70 },
      weight: 0.4,
    },
  ],
  "Seamless Journey Platform Lite": [
    {
      key: "sjp_lite_doors",
      label: "Journey doors served",
      unit: "doors",
      defaults: { Small: 6, Medium: 22, Large: 55, "Extra Large": 95 },
      weight: 0.3,
    },
  ],
  "Seamless Journey Full": [
    {
      key: "sjp_full_doors",
      label: "Journey doors served",
      unit: "doors",
      defaults: { Small: 6, Medium: 20, Large: 50, "Extra Large": 90 },
      weight: 0.3,
    },
  ],
  "Amadeus Passenger Verification": [
    {
      key: "apv_integrations",
      label: "Verification integrations",
      unit: "integrations",
      defaults: { Small: 2, Medium: 4, Large: 8, "Extra Large": 14 },
      weight: 0.35,
    },
  ],
  "Baggage Reconciliation System": [
    {
      key: "brs_endpoints",
      label: "BRS endpoints",
      unit: "endpoints",
      defaults: { Small: 3, Medium: 8, Large: 18, "Extra Large": 30 },
      weight: 0.3,
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
    airport_code: "",
    airport_city: "",
    airport_state: "",
    airport_country: "",
    traffic_source: "",
    traffic_source_label: "",
    traffic_source_year: "",
    traffic_retrieved_at: "",
    traffic_fetched_passengers: 0,
  };
}

// Passenger bands are the product owner's definition: 2-8M Small, 8-20M
// Medium, 20-40M Large, 40-70M Extra Large. Airports below 2M are treated as
// Small and above 70M as Extra Large until dedicated bands are provided.
// Movement bands remain mock placeholders pending real thresholds.
function defaultClassificationRules() {
  return [
    {
      id: "class-small",
      category: "Small",
      passenger_min: 0,
      passenger_max: 8000000,
      movement_min: 0,
      movement_max: 25000,
      active: true,
    },
    {
      id: "class-medium",
      category: "Medium",
      passenger_min: 8000000,
      passenger_max: 20000000,
      movement_min: 25000,
      movement_max: 100000,
      active: true,
    },
    {
      id: "class-large",
      category: "Large",
      passenger_min: 20000000,
      passenger_max: 40000000,
      movement_min: 100000,
      movement_max: 250000,
      active: true,
    },
    {
      id: "class-extra-large",
      category: "Extra Large",
      passenger_min: 40000000,
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
    ["Project Manager", "Project Manager Owner", "project.manager@example.com"],
    ["Implementation Engineer", "Implementation Engineer Owner", "implementation.engineer@example.com"],
    ["ACS Training", "ACS Training Owner", "acs.training@example.com"],
    ["ACS Support Establishment", "ACS Support Owner", "acs.support@example.com"],
    ["Central Service Delivery", "Central Service Delivery Owner", "central.service.delivery@example.com"],
    ["Airline Integration", "Airline Integration Owner", "airline.integration@example.com"],
    ["Insights Set up", "Insights Owner", "insights.setup@example.com"],
    ["Agent Portal", "Agent Portal Owner", "agent.portal@example.com"],
  ];

  const owners = rows.map(([workstream, name, email]) =>
    resourceOwner(`owner-global-${slug(workstream)}`, name, workstream, email, "Any", "Global", workstream, "Backup Resource Owner"),
  );

  owners.push(
    resourceOwner("owner-biopod-rd-emea", "Standalone Biopod R&D Owner", "R&D", "biopod.rd@example.com", "Standalone Biopod", "EMEA", "R&D", "R&D Owner"),
    resourceOwner("owner-aodb-pm-emea", "AODB PM Owner", "Project Management", "aodb.pm@example.com", "AODB", "EMEA", "Project Management", "PM Owner"),
    resourceOwner("owner-dds-implementation-global", "DDS Implementation Owner", "Implementation", "dds.implementation@example.com", "DDS", "Global", "Implementation", "Implementation Owner"),
    resourceOwner("owner-cupps-implementation-emea", "CUPPS Implementation Owner", "Implementation Engineer", "cupps.implementation@example.com", "CUPPS", "EMEA", "Implementation Engineer", "Implementation Engineer Owner"),
    resourceOwner("owner-cuss-onboarding-emea", "CUSS Airline Onboarding Owner", "Airline Onboarding", "cuss.onboarding@example.com", "CUSS", "EMEA", "Airline Onboarding", "Airline Onboarding Owner"),
    resourceOwner("owner-integration-emea", "EMEA Integration Owner", "Integrations", "emea.integration@example.com", "Integrations & APIs", "EMEA", "Integrations", "Integration Owner"),
    resourceOwner("owner-gt11-nb-rd-global", "eGate Hardware R&D Owner", "R&D", "gt11.hardware.rd@example.com", "Seamless GT11 eGate - Non Biometric", "Global", "R&D", "R&D Owner"),
    resourceOwner("owner-sjp-lite-integration-global", "Seamless Journey Lite Integration Owner", "Integrations", "sjp.lite.integration@example.com", "Seamless Journey Platform Lite", "Global", "Integrations", "Integration Owner"),
    resourceOwner("owner-sjp-full-implementation-global", "Seamless Journey Full Owner", "Implementation", "sjp.full.implementation@example.com", "Seamless Journey Full", "Global", "Implementation", "Implementation Owner"),
    resourceOwner("owner-gt11-biopod-rd-global", "eGate Biopod R&D Owner", "R&D", "gt11.biopod.rd@example.com", "Seamless GT11 eGate - Biopod", "Global", "R&D", "R&D Owner"),
    resourceOwner("owner-apv-integration-global", "Passenger Verification Integration Owner", "Integrations", "apv.integration@example.com", "Amadeus Passenger Verification", "Global", "Integrations", "Integration Owner"),
    resourceOwner("owner-brs-field-global", "Baggage Reconciliation Field Owner", "Field Services", "brs.field@example.com", "Baggage Reconciliation System", "Global", "Field Services", "Field Services Owner"),
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
  if (driver.type === "boolean") return 0;
  if (driver.type === "select") return driver.options?.[0] ?? "";
  return driver.defaults?.[airportCategory] ?? driver.defaults?.Medium ?? 0;
}

// Computed drivers (e.g. CUPPS positions = check-in counters + boarding gates)
// derive their value from other driver inputs and are not stored or edited.
function computeDriverValue(driver, inputs = {}) {
  if (!driver.computed) return 0;
  const values = driver.computed.sources.map((key) => Number(inputs?.[key] || 0));
  if (driver.computed.op === "sum") return values.reduce((sum, value) => sum + value, 0);
  return 0;
}

function defaultSizingInputs(productName, airportCategory = "Medium") {
  return Object.fromEntries(
    driversForProduct(productName)
      .filter((driver) => !driver.computed)
      .map((driver) => [driver.key, driverDefault(driver, airportCategory)]),
  );
}

function ensureScopeSizingInputs(scope, airportCategory = "Medium") {
  if (!scope) return;
  if (!scope.owner_email) scope.owner_email = defaultOwnerEmail(scope.owner);
  if (!scope.sizing_inputs) scope.sizing_inputs = {};
  driversForProduct(scope.product_name).forEach((driver) => {
    if (driver.computed) return;
    if (scope.sizing_inputs[driver.key] === undefined || scope.sizing_inputs[driver.key] === "") {
      scope.sizing_inputs[driver.key] = driverDefault(driver, airportCategory);
    }
  });
}

function driverDetailsForScope(scope, airportCategory = "Medium") {
  ensureScopeSizingInputs(scope, airportCategory);
  return driversForProduct(scope.product_name).map((driver) => {
    const defaultValue = driver.computed ? computeDriverValue(driver, scope.sizing_inputs) : driverDefault(driver, airportCategory);
    let value;
    if (driver.computed) value = computeDriverValue(driver, scope.sizing_inputs);
    else if (driver.type === "select") value = String(scope.sizing_inputs?.[driver.key] ?? defaultValue);
    else value = Number(scope.sizing_inputs?.[driver.key] || 0);
    const ratio = driver.type === "select" || !defaultValue ? 1 : value / defaultValue;
    return {
      ...driver,
      defaultValue,
      value,
      ratio,
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
  return drivers
    .map((driver) => {
      if (driver.type === "boolean") return `${driver.label}: ${Number(driver.value) ? "Yes" : "No"}`;
      if (driver.type === "select") return `${driver.label}: ${driver.value || "None"}`;
      return `${driver.label}: ${formatNumber(driver.value)} ${driver.unit}`;
    })
    .join(" | ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function daysUntil(dateValue, baseDate = referenceToday()) {
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
    products: ["Standalone Biopod", "ABD", "Integrations & APIs"],
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
    products: ["AODB", "DDS", "Integrations & APIs"],
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
    products: ["CUPPS", "CUSS", "ABD", "Standalone Biopod", "AODB"],
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
    products: ["CUSS", "Support & Field Services"],
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

export {
  PRODUCT_NAMES,
  GOVERNANCE_FORUMS,
  VALIDATION_STATUSES,
  GOVERNANCE_STATUSES,
  SIZING_STATUSES,
  SCOPE_STATUSES,
  RISK_LEVELS,
  AIRPORT_CATEGORIES,
  COMPLEXITY_LEVELS,
  VALIDATION_REQUEST_STATUSES,
  WORKSTREAMS,
  PRODUCT_FAMILY_ORDER,
  productFamily,
  PRODUCTS_AWAITING_SIZING,
  AMS_SUITE_PRODUCTS,
  PRODUCT_LINKS,
  computeDriverValue,
  DEMO_FROZEN_TODAY,
  referenceToday,
  setReferenceToday,
  DEMO_OPPORTUNITY_ID,
  DEMO_SCENARIO_NAME,
  HELP_TEXT,
  ROUTE_CONFIG,
  TARGET_ROUTE_MAP,
  productRuleCodes,
  workstreamRuleCodes,
  categoryRuleCodes,
  complexityRuleCodes,
  complexityMultipliers,
  riskMultipliers,
  productWorkstreamBase,
  productSizingDrivers,
  governanceTemplates,
  stakeholderTemplates,
  makeValidation,
  makeGovernanceItems,
  airportProfile,
  defaultClassificationRules,
  sizingRule,
  buildDefaultSizingRules,
  resourceOwner,
  buildResourceOwners,
  productScope,
  risk,
  assumption,
  decision,
  slug,
  defaultOwnerEmail,
  sizingRuleCode,
  sizingRuleDescription,
  driversForProduct,
  driverDefault,
  defaultSizingInputs,
  ensureScopeSizingInputs,
  driverDetailsForScope,
  sizingDriverFactor,
  driverSummary,
  escapeHtml,
  forumStatusField,
  currentForumStatus,
  isDocumented,
  formatNumber,
  clamp,
  dateDaysBefore,
  daysUntil,
  formatShortDate,
  pluralize,
  statusClass,
  statusOptions,
  formatCurrency,
  MOCK_BENCHMARKS,
  benchmarksForCategory,
  benchmarkSignal,
};
