import {
  GOVERNANCE_FORUMS,
  airportProfile,
  dateDaysAfter,
  decision,
  driversForProduct,
  isDocumented,
  makeGovernanceItems,
  makeValidation,
  productScope,
  referenceToday,
  stakeholderTemplates,
} from "./data.js?v=20260711-3";
import {
  airportProfileFor,
  classifyAirport,
  elements,
  mockDb,
  navigateToRoute,
  notificationForRequest,
  productScopesFor,
  scrollToSection,
  selectedId,
  selectedOpportunity,
  setEstimateProductFilter,
  setEstimateStatusFilter,
  setSelectedId,
  setSelectedValidationRequestId,
  showToast,
  sizingEstimatesFor,
  validationRequestsFor,
} from "./state.js?v=20260711-3";
import {
  applyEstimateInitialMd,
  buildNotificationBody,
  buildTeamsNotificationBody,
  defaultValidationRequestId,
  finalMdForEstimate,
  generateSizingForOpportunity,
} from "./sizing-engine.js?v=20260711-3";
import {
  readiness,
} from "./readiness-rules.js?v=20260711-3";
import {
  airportByCode,
} from "./airport-directory.js?v=20260711-3";
import {
  renderAll,
  renderIntakeNarrativeSummary,
  renderRecordHeader,
} from "./render.js?v=20260711-3";

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
  opportunity.implementation_start = (data.get("implementation_start") || "").toString();
  opportunity.go_live_date = (data.get("go_live_date") || "").toString();
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

function newOpportunityRecord(id, overrides = {}) {
  return {
    id,
    name: "New Airport IT Opportunity",
    customer: "Customer name",
    region: "EMEA",
    sales_owner: "Sales owner",
    presales_owner: "Pre-sales owner",
    opportunity_stage: "Qualification",
    estimated_value: 0,
    close_date: dateDaysAfter(referenceToday(), 45),
    submission_deadline: dateDaysAfter(referenceToday(), 30),
    implementation_start: "",
    go_live_date: "",
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
    ...overrides,
  };
}

// Registers a new opportunity and its associated scaffold (airport profile,
// stakeholder validations, governance items), then selects it and opens intake.
function registerOpportunity(opportunity, profile, toastMessage) {
  const id = opportunity.id;
  mockDb.opportunities = [opportunity, ...mockDb.opportunities];
  mockDb.airportProfiles.push(profile);
  mockDb.stakeholderValidations.push(
    ...stakeholderTemplates.map((_, index) =>
      makeValidation(id, index, {
        due_date: new Date(Date.now() + (index + 7) * 86400000).toISOString().slice(0, 10),
      }),
    ),
  );
  mockDb.governanceItems.push(...GOVERNANCE_FORUMS.flatMap((forum) => makeGovernanceItems(id, forum, [])));
  setSelectedId(id);
  setEstimateProductFilter("all");
  setEstimateStatusFilter("all");
  setSelectedValidationRequestId("");
  readiness(opportunity);
  renderAll();
  if (toastMessage) showToast(toastMessage);
  navigateToRoute("intake");
}

function createOpportunity() {
  const id = `opp-${Date.now()}`;
  const opportunity = newOpportunityRecord(id);
  const profile = airportProfile(id, opportunity.customer, 0, 0, opportunity.region);
  registerOpportunity(opportunity, profile, "New mock opportunity created. Start by entering the airport profile.");
}

// Creates an opportunity targeting a specific airport from the reference
// directory, pre-filling the airport profile (name, location, traffic) and
// classifying it so the sizing baseline can start immediately.
function createOpportunityFromAirport(airport) {
  if (!airport) return;
  const id = `opp-${airport.iata.toLowerCase()}-${Date.now()}`;
  const opportunity = newOpportunityRecord(id, {
    name: `${airport.name} - Airport IT Opportunity`,
    customer: airport.name,
    region: airport.region,
  });
  const profile = airportProfile(id, airport.name, airport.annual_passengers, airport.annual_movements, airport.region);
  profile.airport_code = airport.iata;
  profile.airport_city = airport.city;
  profile.airport_state = airport.state;
  profile.airport_country = airport.country;
  profile.traffic_source = "Reference directory";
  profile.traffic_source_label = airport.name;
  profile.traffic_source_year = String(airport.traffic_year || "");
  profile.traffic_retrieved_at = new Date().toISOString().slice(0, 10);
  profile.traffic_fetched_passengers = airport.annual_passengers;
  classifyAirport(profile);
  registerOpportunity(
    opportunity,
    profile,
    `Opportunity created for ${airport.name} (${airport.iata}). Classified as ${profile.airport_category} from ${Number(
      airport.annual_passengers,
    ).toLocaleString("en-US")} passengers / ${Number(airport.annual_movements).toLocaleString("en-US")} movements.`,
  );
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
  generateSizingForOpportunity(selectedId);
  setEstimateProductFilter("all");
  setEstimateStatusFilter("all");
  setSelectedValidationRequestId(defaultValidationRequestId(selectedId));
  const estimateCount = sizingEstimatesFor(selectedId).length;
  const requestCount = validationRequestsFor(selectedId).length;
  renderAll();
  showToast(`Sizing refreshed: ${estimateCount} estimates and ${requestCount} validation requests. Existing owner validations were kept.`);
}

function executeJourneyAction(action, target) {
  if (action === "create-opportunity") {
    createOpportunity();
    return;
  }
  if (action === "run-sizing") {
    runSizingForSelected();
    scrollToSection(target || "#sizing");
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

// Populates the airport profile from the bundled directory when the IATA/ICAO
// code matches, so entering a code fills name, location, region, and traffic.
// Returns the directory entry, or null when the code is unknown.
function applyAirportCodeToProfile(rawCode, opportunityId = selectedId) {
  const profile = airportProfileFor(opportunityId);
  const code = String(rawCode || "").trim().toUpperCase();
  profile.airport_code = code;
  const airport = airportByCode(code);
  if (!airport) return null;
  profile.airport_name = airport.name;
  profile.airport_city = airport.city;
  profile.airport_state = airport.state;
  profile.airport_country = airport.country;
  profile.region = airport.region;
  profile.annual_passengers = airport.annual_passengers;
  profile.annual_movements = airport.annual_movements;
  profile.traffic_source = "Reference directory";
  profile.traffic_source_label = airport.name;
  profile.traffic_source_year = String(airport.traffic_year || "");
  profile.traffic_retrieved_at = new Date().toISOString().slice(0, 10);
  profile.traffic_fetched_passengers = airport.annual_passengers;
  classifyAirport(profile);
  const opportunity = mockDb.opportunities.find((item) => item.id === opportunityId);
  if (opportunity) opportunity.region = airport.region;
  return airport;
}

function updateScopeDriverValue(opportunityId, productName, driverKey, value) {
  const scope = findProductScope(opportunityId, productName);
  if (!scope) return;
  if (!scope.sizing_inputs) scope.sizing_inputs = {};
  const driver = driversForProduct(productName).find((item) => item.key === driverKey);
  scope.sizing_inputs[driverKey] = driver?.type === "select" ? String(value) : Number(value) || 0;
}

function lineValidationRequest(estimateId) {
  return mockDb.validationRequests.find((item) => item.sizing_estimate_id === estimateId);
}

// Rebuilds one line's outgoing Email/Teams bodies from its current owner + estimate.
function refreshLineNotification(request) {
  const notification = notificationForRequest(request.id);
  if (!notification) return;
  notification.recipient = request.owner_email;
  const opportunity = mockDb.opportunities.find((item) => item.id === request.opportunity_id);
  const profile = airportProfileFor(request.opportunity_id);
  const estimate = mockDb.sizingEstimates.find((item) => item.id === request.sizing_estimate_id);
  if (opportunity && estimate) {
    notification.body = buildNotificationBody(opportunity, profile, estimate, request.owner_name || "Owner");
    notification.teams_body = buildTeamsNotificationBody(opportunity, profile, estimate, request.owner_name || "Owner", request.due_date);
  }
}

// Overrides the owner contact for ONE activity line in this opportunity only.
// The global registry (cadastro) is untouched; edit that on the registry tab.
function updateValidationOwnerContact(requestId, field, value) {
  const request = mockDb.validationRequests.find((item) => item.id === requestId);
  if (!request) return;
  const text = String(value || "").trim();
  if (field === "owner_name") request.owner_name = text;
  if (field === "owner_email") request.owner_email = text;
  refreshLineNotification(request);
}

// Edits the global owner registry (product + workstream). Newly generated
// sizing lines pick this up; lines already created keep their snapshot unless
// they never had a value (kept in sync here for the current portfolio so the
// cadastro edit is visible immediately).
function updateSizingOwner(key, field, value) {
  const entry = (mockDb.sizingOwners || []).find((owner) => owner.key === key);
  if (!entry) return;
  const text = String(value || "").trim();
  if (field === "owner_name") entry.owner_name = text;
  if (field === "owner_email") entry.owner_email = text;
  // Propagate to existing line requests that still carry the previous registry
  // value (i.e. were never overridden locally to something different).
  mockDb.validationRequests
    .filter((request) => request.product_name === entry.product_name && request.workstream === entry.workstream)
    .forEach((request) => {
      if (field === "owner_name") request.owner_name = text;
      if (field === "owner_email") request.owner_email = text;
      refreshLineNotification(request);
    });
}

function syncAirportProfileFromForm() {
  if (!elements.airportProfileForm) return;
  const profile = airportProfileFor(selectedId);
  const data = new FormData(elements.airportProfileForm);
  // Airport identity is owned by Intake; the sizing form only edits the
  // category override and its justification.
  profile.categorization_override = (data.get("categorization_override") || "").toString();
  profile.override_reason = (data.get("override_reason") || "").toString().trim();
  classifyAirport(profile);
}

// Keeps one line's validation request in step with its estimate after a
// status or MD edit made on the sizing screen.
function syncEstimateWorkflowAfterChange(estimate) {
  const request = lineValidationRequest(estimate.id);
  if (!request) return;
  request.status = estimate.status;
  request.response_date = ["Approved", "Approved with Conditions", "Needs Adjustment", "More Information Requested", "Rejected"].includes(
    estimate.status,
  )
    ? referenceToday()
    : "";
  if (estimate.status === "Needs Adjustment" && estimate.adjusted_md) {
    request.adjustment_reason = `Owner adjusted ${estimate.workstream} to ${estimate.adjusted_md} MD.`;
  }
  refreshLineNotification(request);
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

// Records the owner's decision for ONE activity line (its own validation
// request + estimate). An adjusted MD entered in the panel feeds the final
// validated baseline on approval.
function applyOwnerValidationAction(requestId, action, fields) {
  const request = mockDb.validationRequests.find((item) => item.id === requestId);
  const estimate = request ? mockDb.sizingEstimates.find((item) => item.id === request.sizing_estimate_id) : null;
  if (!request || !estimate) {
    return { ok: false, message: "Select an activity validation before applying an owner action.", tone: "attention" };
  }

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

  if (adjustedMd > 0) estimate.adjusted_md = adjustedMd;
  estimate.status = action;
  estimate.final_validated_md = ["Approved", "Approved with Conditions"].includes(action) ? finalMdForEstimate(estimate) : "";

  request.status = action;
  request.response_date = referenceToday();
  request.adjustment_reason = reason;
  request.comments =
    comments ||
    reason ||
    (action === "Approved" ? `Approved by ${request.owner_name || "the owner"}.` : request.comments || "");
  request.escalation_required = ["Rejected", "Overdue"].includes(action);

  refreshLineNotification(request);
  setSelectedValidationRequestId(request.id);

  return { ok: true, message: `${request.product_name} ${request.workstream} updated: ${action}. Readiness recalculated.`, tone: "success" };
}

export {
  syncIntakeFromForm,
  createOpportunity,
  createOpportunityFromAirport,
  findProductScope,
  addProductScope,
  runSizingForSelected,
  executeJourneyAction,
  updateScopeDriverValue,
  syncAirportProfileFromForm,
  applyAirportCodeToProfile,
  syncEstimateWorkflowAfterChange,
  updateEstimateManualOverride,
  updateEstimateValidation,
  updateValidationOwnerContact,
  updateSizingOwner,
  applyOwnerValidationAction,
};
