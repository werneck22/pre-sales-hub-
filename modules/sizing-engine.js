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
  sizingRuleCode,
  slug,
} from "./data.js?v=20260709-24";
import {
  airportProfileFor,
  classifyAirport,
  mockDb,
  notificationForRequest,
  productScopesFor,
  selectedNotificationChannel,
  selectedOpportunity,
  selectedValidationRequestId,
  setSelectedNotificationChannel,
  setSelectedValidationRequestId,
  showToast,
  sizingEstimatesFor,
} from "./state.js?v=20260709-24";
import {
  renderNotificationPreview,
  renderValidationRequests,
} from "./render.js?v=20260709-24";

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

// Default owner contact for a product: the scope's own owner fields win;
// the reference registry is only a fallback so a new product is never
// contact-less.
function defaultOwnerContact(scope, region) {
  const fallback =
    mockDb.resourceOwners.find(
      (owner) => owner.active && owner.product_scope === scope.product_name && (owner.region === region || owner.region === "Global"),
    ) || mockDb.resourceOwners.find((owner) => owner.active && owner.product_scope === scope.product_name);
  const name = isDocumented(scope.owner) && !/^product owner$/i.test(scope.owner.trim()) ? scope.owner.trim() : fallback?.name || "Product owner";
  const email = (scope.owner_email || "").trim() || fallback?.email || "";
  return { name, email };
}

// Worst-first status across a product's sizing lines, used to derive the
// product-level request status when lines are edited individually.
const STATUS_SEVERITY = [
  "Rejected",
  "Overdue",
  "Needs Adjustment",
  "More Information Requested",
  "Pending Validation",
  "Not Started",
  "Approved with Conditions",
  "Approved",
];

function worstStatus(estimates) {
  const statuses = estimates.map((estimate) => estimate.status || "Pending Validation");
  return STATUS_SEVERITY.find((status) => statuses.includes(status)) || "Pending Validation";
}

function requestContextFor(request, opportunityOverride = null) {
  const estimates = mockDb.sizingEstimates.filter(
    (item) => item.opportunity_id === request.opportunity_id && item.product_name === request.product_name,
  );
  if (!estimates.length) return null;
  const opportunity = opportunityOverride || mockDb.opportunities.find((item) => item.id === request.opportunity_id);
  if (!opportunity) return null;
  const scope = mockDb.productScopes.find(
    (item) => item.opportunity_id === request.opportunity_id && item.product_name === request.product_name,
  );
  const dueIn = daysUntil(request.due_date);
  const effectiveStatus = effectiveRequestStatus(request, dueIn);
  return {
    opportunity,
    request,
    scope,
    estimates,
    totalMd: estimates.reduce((sum, estimate) => sum + Number(estimate.initial_md || 0), 0),
    currentMd: estimates.reduce((sum, estimate) => sum + dashboardMdForEstimate(estimate), 0),
    owner: { name: request.owner_name || "Product owner", email: request.owner_email || "" },
    hasTechnical: estimates.some((estimate) => TECHNICAL_WORKSTREAMS.includes(estimate.workstream)),
    hasHighRisk: estimates.some((estimate) => estimate.risk_level === "High"),
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
  const mdScore = Math.min(12, Math.round(Number(context.totalMd || 0) / 25));
  return statusScore + dueScore + riskScore + technicalScore + mdScore;
}

function requestPriorityLabel(score) {
  if (score >= 95) return "Critical";
  if (score >= 70) return "High";
  if (score >= 45) return "Medium";
  return "Low";
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

function requestId(opportunityId, productName) {
  return `vr-${opportunityId}-${slug(productName)}`;
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

function buildNotificationBody(opportunity, profile, scope, estimates, ownerNameValue) {
  const total = estimates.reduce((sum, estimate) => sum + Number(estimate.initial_md || 0), 0);
  const lines = estimates.map((estimate) => `- ${estimate.workstream}: ${estimate.initial_md} MD`).join("\n");
  const category = estimates[0]?.airport_category || profile.airport_category || "";
  const drivers = estimates.find((estimate) => isDocumented(estimate.sizing_driver_summary))?.sizing_driver_summary || "No product-specific drivers configured";
  return `Hi ${ownerNameValue},

Your validation is required for the ${scope.product_name} sizing baseline of the ${opportunity.name} opportunity.

Airport: ${profile.airport_name} (${category})
Annual passengers: ${formatNumber(profile.annual_passengers)}
Annual movements: ${formatNumber(profile.annual_movements)}
Submission deadline: ${opportunity.submission_deadline}
Implementation start: ${opportunity.implementation_start || "To be confirmed"}
Target go-live: ${opportunity.go_live_date || "To be confirmed"}

${scope.product_name} estimated effort:
${lines}
Total initial effort: ${total} MD

Sizing drivers: ${drivers}

Please confirm whether this baseline is acceptable, requires adjustment, or needs escalation.

Regards,
Pre-Sales Readiness Hub`;
}

function buildTeamsNotificationBody(opportunity, profile, scope, estimates, ownerNameValue, dueDate) {
  const total = estimates.reduce((sum, estimate) => sum + Number(estimate.initial_md || 0), 0);
  return `Validation required

${ownerNameValue}, your review is required for the ${scope.product_name} sizing baseline.

Opportunity: ${opportunity.name}
Airport: ${profile.airport_name}
Product: ${scope.product_name} (${estimates.length} activities)
Total initial estimate: ${total} MD
Validation due: ${dueDate}
Implementation start: ${opportunity.implementation_start || "To be confirmed"}
Target go-live: ${opportunity.go_live_date || "To be confirmed"}

Review the activity breakdown, approve the baseline, adjust the MD, or request more information.`;
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

// One validation request per product in scope: the product owner receives a
// single package covering every activity line, with an editable contact.
function upsertValidationWorkflow(opportunity, profile, scope, estimates) {
  const requestKey = requestId(opportunity.id, scope.product_name);
  const contact = defaultOwnerContact(scope, opportunity.region);
  let request = mockDb.validationRequests.find((item) => item.id === requestKey);
  if (!request) {
    request = {
      id: requestKey,
      opportunity_id: opportunity.id,
      product_name: scope.product_name,
      owner_name: contact.name,
      owner_email: contact.email,
      request_type: "Sizing Validation",
      status: worstStatus(estimates),
      due_date: validationDueDate(opportunity),
      sent_date: "",
      response_date: "",
      comments: "",
      adjustment_reason: "",
      escalation_required: false,
    };
    mockDb.validationRequests.push(request);
  } else {
    request.owner_name = request.owner_name || contact.name;
    request.owner_email = request.owner_email || contact.email;
    request.status = worstStatus(estimates);
  }

  let notification = notificationForRequest(request.id);
  const subject = `Validation Required - ${profile.airport_name} - ${scope.product_name} Sizing`;
  const body = buildNotificationBody(opportunity, profile, scope, estimates, request.owner_name);
  const teamsTitle = `Sizing validation - ${scope.product_name} - ${profile.airport_name}`;
  const teamsBody = buildTeamsNotificationBody(opportunity, profile, scope, estimates, request.owner_name, request.due_date);
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
  const activeProducts = [];

  scopes.forEach((scope) => {
    ensureScopeSizingInputs(scope, category);
    const productEstimates = [];
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

      productEstimates.push(estimate);
    });

    if (productEstimates.length) {
      activeProducts.push(scope.product_name);
      upsertValidationWorkflow(opportunity, profile, scope, productEstimates);
    }
  });

  mockDb.sizingEstimates = mockDb.sizingEstimates.filter(
    (item) => item.opportunity_id !== opportunityId || activeEstimateIds.includes(item.id),
  );
  mockDb.validationRequests = mockDb.validationRequests.filter(
    (item) => item.opportunity_id !== opportunityId || activeProducts.includes(item.product_name),
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
    const request = mockDb.validationRequests.find(
      (item) => item.opportunity_id === update.opportunity && item.product_name === update.product,
    );
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
    const request = mockDb.validationRequests.find(
      (item) => item.opportunity_id === estimate.opportunity_id && item.product_name === estimate.product_name,
    );
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
      request?.owner_email || estimate.owner_email || "",
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
  resolveResourceOwner,
  requestContextFor,
  worstStatus,
  validationRequestContexts,
  defaultValidationRequestId,
  nextActionableRequestId,
  ownerActionStatuses,
  effectiveRequestStatus,
  requestNeedsOwnerAction,
  requestIsOverdue,
  requestActionLabel,
  requestPriorityScore,
  requestPriorityLabel,
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
