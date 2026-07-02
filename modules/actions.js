import {
  DEMO_OPPORTUNITY_ID,
  GOVERNANCE_FORUMS,
  airportProfile,
  clamp,
  decision,
  isDocumented,
  makeGovernanceItems,
  makeValidation,
  productScope,
  stakeholderTemplates,
} from "./data.js";
import {
  airportProfileFor,
  classifyAirport,
  demoMode,
  demoPresenterStep,
  elements,
  estimateProductFilter,
  estimateStatusFilter,
  mockDb,
  navigateToRoute,
  notificationForRequest,
  productScopesFor,
  scrollToSection,
  selectedId,
  selectedOpportunity,
  selectedValidationRequestId,
  setDemoMode,
  setDemoPresenterStep,
  setEstimateProductFilter,
  setEstimateStatusFilter,
  setSelectedId,
  setSelectedValidationRequestId,
  showToast,
  sizingEstimatesFor,
  validationRequestsFor,
} from "./state.js";
import {
  applyDemoValidationOverrides,
  applyEstimateInitialMd,
  buildNotificationBody,
  defaultValidationRequestId,
  finalMdForEstimate,
  generateSizingForOpportunity,
  ownerEmail,
  requestId,
} from "./sizing-engine.js";
import {
  readiness,
} from "./readiness-rules.js";
import {
  demoScenarioSteps,
  renderAll,
  renderIntakeNarrativeSummary,
  renderJourneyGuide,
  renderRecordHeader,
} from "./render.js";

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
  setSelectedId(id);
  setDemoMode(false);
  setDemoPresenterStep(0);
  setEstimateProductFilter("all");
  setEstimateStatusFilter("all");
  setSelectedValidationRequestId("");
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
  setEstimateProductFilter("all");
  setEstimateStatusFilter("all");
  setSelectedValidationRequestId(defaultValidationRequestId(selectedId));
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
    setDemoPresenterStep(clamp(Number(stepIndex), 0, Math.max(0, steps.length - 1)));
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
  setSelectedValidationRequestId(request.id);

  return { ok: true, message: `Owner validation updated: ${action}. SRM/BAB readiness recalculated.`, tone: "success" };
}

export {
  syncIntakeFromForm,
  createOpportunity,
  findProductScope,
  addProductScope,
  runSizingForSelected,
  executeJourneyAction,
  updateScopeDriverValue,
  syncScopeOwnerEmailToEstimates,
  syncAirportProfileFromForm,
  syncEstimateWorkflowAfterChange,
  updateEstimateManualOverride,
  updateEstimateValidation,
  applyOwnerValidationAction,
};
