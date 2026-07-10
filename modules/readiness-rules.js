import {
  AIRPORT_CATEGORIES,
  GOVERNANCE_FORUMS,
  clamp,
  formatNumber,
  formatShortDate,
  forumStatusField,
  isDocumented,
  pluralize,
} from "./data.js?v=20260710-25";
import {
  airportProfileFor,
  assumptionsFor,
  decisionsFor,
  mockDb,
  productScopesFor,
  risksFor,
  sizingEstimatesFor,
  validationsFor,
} from "./state.js?v=20260710-25";
import {
  finalMdForEstimate,
  requestActionLabel,
  requestGovernanceImpact,
  requestIsOverdue,
  requestNeedsOwnerAction,
  requestPriorityScore,
  validationRequestContexts,
} from "./sizing-engine.js?v=20260710-25";

function sizingReadinessImpact(opportunity, forum) {
  const estimates = sizingEstimatesFor(opportunity.id);
  const contexts = validationRequestContexts([opportunity]);
  const criticalContexts = contexts.filter((context) => context.hasTechnical || context.hasHighRisk);
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
  const context = validationRequestContexts([opportunity]).find((item) => item.request.product_name === estimate.product_name);
  // Product-level overdue trumps the line status; otherwise the line's own
  // status (set by the product decision or a per-line edit) is authoritative.
  if (context && context.effectiveStatus === "Overdue") return "Overdue";
  return estimate.status || context?.effectiveStatus || "Not Started";
}

function workstreamValidationEvidence(opportunity, workstream) {
  const workstreams = Array.isArray(workstream) ? workstream : [workstream];
  const label = workstreams[0];
  const estimates = sizingEstimatesFor(opportunity.id).filter((estimate) => workstreams.includes(estimate.workstream));
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
      ? `${statuses.filter((status) => approvedStatuses.includes(status)).length}/${estimates.length} ${label} sizing validations approved or conditional`
      : `No ${label} effort is required for the selected product scope`,
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
    "Project Manager",
    "Implementation Engineer",
    "ACS Training",
    "ACS Support Establishment",
    "Central Service Delivery",
    "Airline Integration",
    "Insights Set up",
    "Agent Portal",
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
  const implementationValidation = workstreamValidationEvidence(opportunity, ["Implementation", "Implementation Engineer"]);
  const rdValidation = workstreamValidationEvidence(opportunity, "R&D");
  const deliveryValidation = deliveryEffortEvidence(opportunity);
  const criticalBlockers = openBlockersFor(opportunity);
  const contexts = validationRequestContexts([opportunity]);
  const finalSizingLines = estimates.filter(
    (estimate) =>
      ["Approved", "Approved with Conditions"].includes(estimateValidationStatus(opportunity, estimate)) && finalMdForEstimate(estimate) > 0,
  );
  const integrationExposure =
    scopes.some((scope) => scope.product_name === "Integrations & APIs") || estimates.some((estimate) => estimate.workstream === "Integrations");
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
  sizingEstimatesFor(opportunity.id)
    .filter((item) => ["Rejected", "Overdue"].includes(item.status))
    .forEach((estimate) => blockers.push(`Sizing ${estimate.status.toLowerCase()}: ${estimate.product_name} ${estimate.workstream}`));
  validationRequestContexts([opportunity])
    .filter(
      (context) =>
        ["Rejected", "Overdue"].includes(context.effectiveStatus) &&
        !context.estimates.some((estimate) => ["Rejected", "Overdue"].includes(estimate.status)),
    )
    .forEach((context) => blockers.push(`Owner validation ${context.effectiveStatus.toLowerCase()}: ${context.request.product_name}`));
  return blockers;
}

function productValidationReadiness(opportunity) {
  // Scored from real sizing-estimate/owner-validation status only. The manual
  // scope-level Sizing/Validation fields were removed from Product Scope
  // (see renderProductScope) because they let readiness be marked complete
  // without any resource owner actually validating anything.
  const estimates = sizingEstimatesFor(opportunity.id);
  const contexts = validationRequestContexts([opportunity]);
  const estimateScores = estimates.map((estimate) => validationScore(estimateValidationStatus(opportunity, estimate)));
  const score = estimateScores.length
    ? Math.round((estimateScores.reduce((sum, value) => sum + value, 0) / estimateScores.length) * 100)
    : 0;
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
      label: `${context.request.product_name}: ${requestActionLabel(context)}`,
      detail: `${context.owner.name} - ${requestGovernanceImpact(context)} - ${formatNumber(context.totalMd)} MD - ${formatShortDate(
        context.request.due_date,
      )}`,
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

function portfolioReadinessGaps(opportunities, limit = 8, { perOpportunity = false } = {}) {
  const ranked = (gaps) =>
    gaps.slice().sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity) || b.priority - a.priority);

  if (perOpportunity) {
    // One row per opportunity: the single most urgent gap. Avoids a single
    // struggling deal flooding the leadership "What Needs Attention" list.
    const topPerOpportunity = opportunities
      .map((opportunity) => ranked(readinessGapsForOpportunity(opportunity))[0])
      .filter(Boolean);
    return ranked(topPerOpportunity).slice(0, limit);
  }

  return ranked(opportunities.flatMap((opportunity) => readinessGapsForOpportunity(opportunity))).slice(0, limit);
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

export {
  sizingReadinessImpact,
  functionValidation,
  hasRiskCategory,
  hasAssumptionCategory,
  estimateValidationStatus,
  workstreamValidationEvidence,
  deliveryEffortEvidence,
  ruleResult,
  readinessRuleResults,
  allReadinessRules,
  checklistTotal,
  checklistComplete,
  validationScore,
  forumReadinessDetail,
  openBlockersFor,
  productValidationReadiness,
  stakeholderValidationReadiness,
  riskReadiness,
  blockerReadiness,
  readinessBreakdown,
  readiness,
  severityWeight,
  readinessGapAction,
  readinessGapsForOpportunity,
  stakeholdersValidationRows,
  portfolioReadinessGaps,
  hasBlocker,
  forumReadinessLabel,
  forumReady,
};
