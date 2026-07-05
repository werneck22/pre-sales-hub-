import {
  clamp,
  complexityMultipliers,
  dateDaysBefore,
  daysUntil,
  driverSummary,
  ensureScopeSizingInputs,
  formatNumber,
  isDocumented,
  productWorkstreamBase,
  riskMultipliers,
  sizingDriverFactor,
  sizingRuleCode,
  slug,
} from "./data.js";
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
} from "./state.js";
import {
  renderNotificationPreview,
  renderValidationRequests,
} from "./render.js";

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

Link to opportunity: [link]

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

Open opportunity: [link]`;
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
  setSelectedNotificationChannel(channel);

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
      ownerName(estimate.owner_id),
      estimate.owner_email || ownerEmail(estimate.owner_id),
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
  ownerName,
  ownerEmail,
  requestContextFor,
  validationRequestContexts,
  defaultValidationRequestId,
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
  triggerMockNotification,
  runMockNotificationTrigger,
  upsertValidationWorkflow,
  generateSizingForOpportunity,
  applyDemoValidationOverrides,
  initializeSizingEngine,
  totalsForOpportunity,
  dashboardTotalsForOpportunity,
  buildSizingCsv,
};
