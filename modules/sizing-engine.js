import {
  clamp,
  complexityMultipliers,
  dateDaysAfter,
  dateDaysBefore,
  daysUntil,
  referenceToday,
  driverSummary,
  ensureScopeSizingInputs,
  formatNumber,
  isDocumented,
  productWorkstreamBase,
  riskMultipliers,
  sizingDriverFactor,
  sizingOwnerKey,
  sizingRuleCode,
  slug,
} from "./data.js?v=20260711-5";
import {
  airportProfileFor,
  classifyAirport,
  mockDb,
  notificationForRequest,
  productScopesFor,
  selectedOpportunity,
  selectedValidationRequestId,
  setSelectedNotificationChannel,
  setSelectedValidationRequestId,
  showToast,
  sizingEstimatesFor,
} from "./state.js?v=20260711-5";
import {
  renderNotificationPreview,
  renderValidationRequests,
} from "./render.js?v=20260711-5";

function confidenceFor(opportunity, scope) {
  if (opportunity.complexity === "Very High" || scope.risk_level === "High") return "Medium";
  if (opportunity.complexity === "High") return "Medium";
  return "High";
}

const TECHNICAL_WORKSTREAMS = [
  "Implementation",
  "R&D",
  "Integrations",
  "Testing & Cutover",
  "Field Services",
  "Implementation Engineer",
  "Airline Integration",
  "Insights Set up",
  "Agent Portal",
];

// Owner contact for one activity scope, read from the global owner registry
// (the reusable "cadastro"). Every product+workstream sizing line has its own
// owner there; a missing row is a safe blank so nothing crashes.
function registryOwner(productName, workstream) {
  const entry = (mockDb.sizingOwners || []).find((owner) => owner.key === sizingOwnerKey(productName, workstream));
  return { name: entry?.owner_name || `${workstream} owner`, email: entry?.owner_email || "" };
}

function requestContextFor(request, opportunityOverride = null) {
  const estimate = mockDb.sizingEstimates.find(
    (item) => item.opportunity_id === request.opportunity_id && item.product_name === request.product_name && item.workstream === request.workstream,
  );
  if (!estimate) return null;
  const opportunity = opportunityOverride || mockDb.opportunities.find((item) => item.id === request.opportunity_id);
  if (!opportunity) return null;
  const dueIn = daysUntil(request.due_date);
  const effectiveStatus = effectiveRequestStatus(request, dueIn);
  return {
    opportunity,
    request,
    estimate,
    md: Number(estimate.initial_md || 0),
    currentMd: dashboardMdForEstimate(estimate),
    owner: { name: request.owner_name || "Owner not registered", email: request.owner_email || "" },
    hasTechnical: TECHNICAL_WORKSTREAMS.includes(estimate.workstream),
    hasHighRisk: estimate.risk_level === "High",
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

// The most urgent line still needing an owner decision, excluding the one just
// cleared, so "Approve & next" walks the queue without manual re-selection.
function nextActionableRequestId(opportunity, excludeId) {
  if (!opportunity) return "";
  const next = validationRequestContexts([opportunity])
    .filter(requestNeedsOwnerAction)
    .filter((context) => context.request.id !== excludeId)
    .sort((a, b) => requestPriorityScore(b) - requestPriorityScore(a) || a.dueIn - b.dueIn)[0];
  return next?.request.id || "";
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
  const riskScore = context.hasHighRisk ? 6 : 0;
  const technicalScore = context.hasTechnical ? 8 : 3;
  const mdScore = Math.min(12, Math.round(Number(context.md || 0) / 10));
  return statusScore + dueScore + riskScore + technicalScore + mdScore;
}

function requestGovernanceImpact(context) {
  if (["Rejected", "Overdue"].includes(context.effectiveStatus) && context.hasTechnical) return "Blocks SRM/BAB";
  if (requestNeedsOwnerAction(context) && context.hasTechnical) return "SRM dependency";
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

function buildNotificationBody(opportunity, profile, estimate, ownerNameValue) {
  return `Hi ${ownerNameValue},

Your validation is required for one activity of the ${opportunity.name} opportunity.

Product: ${estimate.product_name}
Activity: ${estimate.workstream}
Initial estimated effort: ${estimate.initial_md} MD
Airport: ${profile.airport_name} (${estimate.airport_category})
Annual passengers: ${formatNumber(profile.annual_passengers)}
Annual movements: ${formatNumber(profile.annual_movements)}
Submission deadline: ${opportunity.submission_deadline}
Implementation start: ${opportunity.implementation_start || "To be confirmed"}
Target go-live: ${opportunity.go_live_date || "To be confirmed"}

Sizing drivers: ${estimate.sizing_driver_summary || "No product-specific drivers configured"}
Assumptions: ${estimate.assumptions_used}

Please confirm whether this estimate is acceptable, requires adjustment, or needs escalation.

Regards,
Pre-Sales Readiness Hub`;
}

function buildTeamsNotificationBody(opportunity, profile, estimate, ownerNameValue, dueDate) {
  return `Validation required

${ownerNameValue}, your review is required for the ${estimate.product_name} - ${estimate.workstream} sizing estimate.

Opportunity: ${opportunity.name}
Airport: ${profile.airport_name} (${estimate.airport_category})
Initial estimate: ${estimate.initial_md} MD
Validation due: ${dueDate}
Implementation start: ${opportunity.implementation_start || "To be confirmed"}
Target go-live: ${opportunity.go_live_date || "To be confirmed"}

Approve the estimate, adjust the MD, or request more information.`;
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

// Builds the real hand-off link for a channel: Email opens the user's mail
// client with the request pre-filled; Teams opens a pre-filled meeting invite
// to the owner. A static page cannot send on the user's behalf, so the hub
// prepares the message, opens the tool, and records the hand-off.
function notificationTriggerHref(request, notification, channel) {
  if (channel === "Email") {
    return `mailto:${encodeURIComponent(notification.recipient)}?subject=${encodeURIComponent(notification.subject)}&body=${encodeURIComponent(
      notification.body,
    )}`;
  }
  return `https://teams.microsoft.com/l/meeting/new?subject=${encodeURIComponent(notification.teams_title)}&attendees=${encodeURIComponent(
    notification.recipient,
  )}&content=${encodeURIComponent(notification.teams_body)}`;
}

function triggerNotification(requestIdValue, channel) {
  if (!["Email", "Teams"].includes(channel)) {
    return { ok: false, message: "Select Email or Teams before sending the request.", tone: "warning" };
  }
  const request = mockDb.validationRequests.find((item) => item.id === requestIdValue);
  const notification = request ? notificationForRequest(request.id) : null;
  if (!request || !notification) {
    return { ok: false, message: "Select a validation request before sending.", tone: "warning" };
  }
  if (!isDocumented(notification.recipient)) {
    return { ok: false, message: "Enter the owner's email address before sending the request.", tone: "attention" };
  }

  const timestamp = new Date().toISOString();
  const state = notificationChannelState(notification, channel);
  state.status = channel === "Email" ? "Email drafted" : "Meeting invite opened";
  state.last_triggered_at = timestamp;
  state.trigger_count += 1;
  notification.status = "Sent to owner";
  notification.sent_date = timestamp.slice(0, 10);
  request.sent_date = timestamp.slice(0, 10);
  notification.activity.unshift({
    id: `activity-${request.id}-${channel.toLowerCase()}-${Date.now()}`,
    channel,
    recipient: notification.recipient,
    status: channel === "Email" ? "Email opened in mail client" : "Teams meeting invite opened",
    created_at: timestamp,
  });
  notification.activity = notification.activity.slice(0, 8);
  setSelectedNotificationChannel(channel);

  return {
    ok: true,
    href: notificationTriggerHref(request, notification, channel),
    message:
      channel === "Email"
        ? `Email to ${notification.recipient} opened in your mail client.`
        : `Teams meeting invite for ${notification.recipient} opened.`,
    tone: "success",
  };
}

function runNotificationTrigger(button) {
  const result = triggerNotification(button.dataset.requestId, button.dataset.notificationTrigger);
  if (result.ok) {
    renderValidationRequests(selectedOpportunity());
    renderNotificationPreview();
    // Hand off to the user's mail client / Teams via a transient anchor so the
    // page itself never navigates away.
    const link = document.createElement("a");
    link.href = result.href;
    if (result.href.startsWith("https://")) link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  showToast(result.message, result.tone);
}

// Validation is due a week before the submission deadline, but a request
// created today must never be born past-due. Floor the due date to a short
// buffer ahead of today so freshly created BIDs read as actionable, not overdue.
function validationDueDate(opportunity) {
  const target = dateDaysBefore(opportunity.submission_deadline, 7);
  const floor = dateDaysAfter(referenceToday(), 3);
  return target < floor ? floor : target;
}

// One validation request per activity (product + workstream). The owner is a
// snapshot of the global registry when the line is first created; editing it
// later on the validation screen overrides it for this opportunity only.
function upsertValidationWorkflow(opportunity, profile, estimate) {
  const requestKey = requestId(estimate.id);
  const owner = registryOwner(estimate.product_name, estimate.workstream);
  let request = mockDb.validationRequests.find((item) => item.id === requestKey);
  if (!request) {
    request = {
      id: requestKey,
      opportunity_id: opportunity.id,
      product_name: estimate.product_name,
      workstream: estimate.workstream,
      sizing_estimate_id: estimate.id,
      owner_name: owner.name,
      owner_email: owner.email,
      request_type: "Sizing Validation",
      status: estimate.status,
      due_date: validationDueDate(opportunity),
      sent_date: "",
      response_date: "",
      comments: "",
      adjustment_reason: "",
      escalation_required: false,
    };
    mockDb.validationRequests.push(request);
  } else {
    if (!isDocumented(request.owner_name)) request.owner_name = owner.name;
    if (!isDocumented(request.owner_email)) request.owner_email = owner.email;
    request.workstream = estimate.workstream;
    request.sizing_estimate_id = estimate.id;
    request.status = estimate.status;
  }

  let notification = notificationForRequest(request.id);
  const subject = `Validation Required - ${profile.airport_name} - ${estimate.product_name} ${estimate.workstream}`;
  const body = buildNotificationBody(opportunity, profile, estimate, request.owner_name);
  const teamsTitle = `Sizing validation - ${estimate.product_name} ${estimate.workstream} - ${profile.airport_name}`;
  const teamsBody = buildTeamsNotificationBody(opportunity, profile, estimate, request.owner_name, request.due_date);
  if (!notification) {
    notification = {
      id: `notif-${request.id}`,
      validation_request_id: request.id,
      recipient: request.owner_email,
      subject,
      body,
      teams_title: teamsTitle,
      teams_body: teamsBody,
      status: "Draft",
      created_date: referenceToday(),
      sent_date: "",
      channel_states: {},
      activity: [],
    };
    mockDb.notifications.push(notification);
  } else {
    notification.recipient = request.owner_email;
    notification.subject = subject;
    notification.body = body;
    notification.teams_title = teamsTitle;
    notification.teams_body = teamsBody;
  }

  notificationChannelState(notification, "Email");
  notificationChannelState(notification, "Teams");

  if (!selectedValidationRequestId) {
    setSelectedValidationRequestId(request.id);
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
      const driverFactor = sizingDriverFactor(scope, category);
      const driversUsed = driverSummary(scope, category);
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
      }

      applyEstimateInitialMd(estimate);

      upsertValidationWorkflow(opportunity, profile, estimate);
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

// Seeds a couple of overdue owner validations on sample opportunities so the
// dashboard shows realistic attention items out of the box.
function applySeedValidationState() {
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
      product: "Integrations & APIs",
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
  applySeedValidationState();
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

function csvField(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildSizingCsv(opportunity) {
  const header = [
    "Opportunity",
    "Customer",
    "Product",
    "Workstream",
    "Rule",
    "Airport category",
    "Complexity",
    "Initial MD",
    "Adjusted MD",
    "Final MD",
    "Validation status",
    "Resource owner",
    "Owner email",
    "Validation due date",
  ];
  const rows = sizingEstimatesFor(opportunity.id).map((estimate) => {
    const request = mockDb.validationRequests.find((item) => item.sizing_estimate_id === estimate.id);
    return [
      opportunity.name,
      opportunity.customer,
      estimate.product_name,
      estimate.workstream,
      estimate.applied_rule_code || "",
      estimate.airport_category,
      estimate.complexity,
      estimate.initial_md,
      estimate.adjusted_md || "",
      finalMdForEstimate(estimate) || "",
      estimate.status,
      request?.owner_name || "",
      request?.owner_email || "",
      request?.due_date || "",
    ];
  });
  return [header, ...rows].map((row) => row.map(csvField).join(",")).join("\n");
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


export {
  confidenceFor,
  registryOwner,
  requestContextFor,
  validationRequestContexts,
  defaultValidationRequestId,
  nextActionableRequestId,
  ownerActionStatuses,
  effectiveRequestStatus,
  requestNeedsOwnerAction,
  requestIsOverdue,
  requestActionLabel,
  requestPriorityScore,
  requestGovernanceImpact,
  estimateId,
  requestId,
  finalMdForEstimate,
  dashboardMdForEstimate,
  formatFactor,
  applyEstimateInitialMd,
  sizingRuleForEstimate,
  estimateWhyText,
  buildNotificationBody,
  buildTeamsNotificationBody,
  notificationChannelState,
  formatNotificationTimestamp,
  triggerNotification,
  runNotificationTrigger,
  upsertValidationWorkflow,
  generateSizingForOpportunity,
  initializeSizingEngine,
  totalsForOpportunity,
  dashboardTotalsForOpportunity,
  buildSizingCsv,
};
