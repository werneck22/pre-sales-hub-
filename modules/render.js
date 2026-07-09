import {
  GOVERNANCE_FORUMS,
  HELP_TEXT,
  PRODUCT_NAMES,
  RISK_LEVELS,
  SCOPE_STATUSES,
  VALIDATION_REQUEST_STATUSES,
  WORKSTREAMS,
  benchmarkSignal,
  benchmarksForCategory,
  currentForumStatus,
  daysUntil,
  defaultSizingInputs,
  driverDetailsForScope,
  driversForProduct,
  ensureScopeSizingInputs,
  escapeHtml,
  formatCurrency,
  formatNumber,
  formatShortDate,
  isDocumented,
  pluralize,
  PRODUCT_FAMILY_ORDER,
  PRODUCT_LINKS,
  PRODUCTS_AWAITING_SIZING,
  productFamily,
  referenceToday,
  sizingRuleCode,
  statusClass,
  statusOptions,
} from "./data.js?v=20260709-23";
import {
  activeRoute,
  airportProfileFor,
  assumptionsFor,
  classifyAirport,
  decisionsFor,
  elements,
  estimateExpansionOpportunityId,
  estimateProductFilter,
  estimateStatusFilter,
  expandedEstimateProducts,
  filteredOpportunities,
  mockDb,
  notificationForRequest,
  persistState,
  productScopesFor,
  risksFor,
  selectedId,
  selectedNotificationChannel,
  selectedOpportunity,
  selectedValidationRequestId,
  setEstimateExpansionOpportunityId,
  setEstimateProductFilter,
  setSelectedValidationRequestId,
  sizingEstimatesFor,
  updateRouteChrome,
  validationQueueFilter,
  validationRequestsFor,
  validationsFor,
} from "./state.js?v=20260709-23";
import {
  dashboardMdForEstimate,
  dashboardTotalsForOpportunity,
  defaultValidationRequestId,
  estimateWhyText,
  finalMdForEstimate,
  formatFactor,
  formatNotificationTimestamp,
  notificationChannelState,
  ownerEmail,
  ownerName,
  requestActionLabel,
  requestContextFor,
  requestGovernanceImpact,
  requestIsOverdue,
  requestNeedsOwnerAction,
  requestPriorityLabel,
  requestPriorityScore,
  sizingRuleForEstimate,
  totalsForOpportunity,
  validationRequestContexts,
} from "./sizing-engine.js?v=20260709-23";
import {
  forumReadinessDetail,
  forumReadinessLabel,
  forumReady,
  hasBlocker,
  openBlockersFor,
  portfolioReadinessGaps,
  readiness,
  readinessBreakdown,
  readinessGapsForOpportunity,
  readinessRuleResults,
  sizingReadinessImpact,
} from "./readiness-rules.js?v=20260709-23";
import {
  trafficProvenanceText,
} from "./airport-lookup.js?v=20260709-23";

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

  if (elements.dashboardEmptyState) {
    elements.dashboardEmptyState.innerHTML = visible.length
      ? ""
      : `<div class="empty-state guided-empty">
          <strong>No opportunities match the current filters.</strong>
          <p>Clear the filter or create a new opportunity to walk through intake, sizing, validation, and readiness.</p>
          <button type="button" class="primary-button" data-action="create-opportunity">Create opportunity</button>
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
          <strong>${escapeHtml(context.opportunity.name)}</strong>
          <small>${escapeHtml(context.estimate.product_name)} - ${escapeHtml(context.estimate.workstream)} - ${escapeHtml(requestActionLabel(context))}</small>
        </span>
        <span class="dashboard-row-meta">
          <span class="status-pill ${statusClass(context.effectiveStatus)}">${escapeHtml(context.effectiveStatus)}</span>
          <span class="row-metric">${escapeHtml(priority)} - ${escapeHtml(requestGovernanceImpact(context))}</span>
          <small class="row-date">${escapeHtml(formatShortDate(context.request.due_date))} - ${escapeHtml(dueLabel)}</small>
        </span>
      </button>`;
  };

  if (elements.pendingValidationList) {
    // Overdue and pending share one list (overdue ranks highest by priority),
    // so the dashboard shows a single owner-validation queue instead of two.
    const ownerValidations = [
      ...overdueRequests,
      ...pendingRequests.filter((context) => context.effectiveStatus !== "Overdue"),
    ]
      .sort((a, b) => requestPriorityScore(b) - requestPriorityScore(a) || a.dueIn - b.dueIn)
      .slice(0, 7);
    elements.pendingValidationList.innerHTML =
      ownerValidations.map(requestRow).join("") || emptyDashboard("No owner validations pending.");
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
    const topGaps = portfolioReadinessGaps(visible, 7, { perOpportunity: true });
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
        <p>Clear the search/filter or create a new opportunity to start.</p>
        <button type="button" class="primary-button" data-action="create-opportunity">Create opportunity</button>
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

  const profile = airportProfileFor(opportunity.id);
  if (form.elements.airport_iata) form.elements.airport_iata.value = profile.airport_code || "";
  if (elements.intakeAirportSummary) {
    const loaded = isDocumented(profile.airport_name) && Number(profile.annual_passengers) > 0;
    elements.intakeAirportSummary.classList.toggle("loaded", loaded);
    elements.intakeAirportSummary.textContent = loaded
      ? `${profile.airport_name} · ${[profile.airport_city, profile.airport_country].filter(Boolean).join(", ") || profile.region} · ${formatNumber(
          profile.annual_passengers,
        )} passengers · ${formatNumber(profile.annual_movements)} movements · ${profile.airport_category || "Unclassified"}`
      : "Enter the airport IATA code to load name, location, region, and annual traffic.";
  }
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
            <span>${isDocumented(item.value) ? "" : "Missing"}</span>
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
  elements.recordCustomer.textContent = `${opportunity.customer} · ${opportunity.region}`;
  elements.recordName.textContent = opportunity.name;
  elements.stageBadge.textContent = `${opportunity.current_governance_stage}: ${currentForumStatus(opportunity)}`;
  elements.stageBadge.className = `status-pill ${statusClass(currentForumStatus(opportunity))}`;
  elements.readinessBadge.textContent = `${score}% readiness`;
  elements.readinessBadge.className = `status-pill ${statusClass(breakdown.status)}`;
  elements.readinessBadge.title = breakdown.caps.length
    ? `Base score ${breakdown.baseScore}% is capped at ${breakdown.cap}% by a critical control: ${breakdown.caps[0].reason}`
    : `${breakdown.status} - no critical score cap applied`;
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
      meta: "Airport profile incomplete",
    };
  }
  if (!scopes.length) {
    return {
      title: "Select products in scope",
      body: "Choose CUSS, CUPPS, ABD, Standalone Biopod, AODB, DDS, Integrations, Seamless, or Support to start sizing.",
      cta: "Open product scope",
      target: "#scope",
      action: "scroll",
      meta: "No products in scope yet",
    };
  }
  if (!estimates.length || !requests.length || !notifications.length) {
    return {
      title: "Generate sizing and owner requests",
      body: "Run automated sizing to create product/workstream MD lines, identify owners, and draft validation emails.",
      cta: "Run automated sizing",
      target: "#sizing",
      action: "run-sizing",
      meta: `${scopes.length} products ready for sizing`,
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
      meta: "No governance decision logged",
    };
  }
  return {
    title: "Ready for executive review",
    body: "The opportunity has sizing, validation evidence, readiness scoring, and decision history.",
    cta: "Open executive dashboard",
    target: "#dashboard",
    action: "scroll",
    meta: `${breakdown.score}% overall readiness`,
  };
}

function renderScopeDriverControls(scope, airportCategory, selected) {
  const drivers = selected ? driverDetailsForScope(scope, airportCategory) : driversForProduct(scope.product_name);
  if (!selected || !drivers.length) return "";

  return `
    <div class="scope-driver-panel">
      <div class="scope-driver-title">
        <strong>Sizing drivers</strong>
      </div>
      <div class="scope-driver-grid">
        ${drivers
          .map((driver) =>
            driver.computed
              ? `
          <label class="scope-driver-computed">
            <span class="driver-label-row">${escapeHtml(driver.label)}<span class="driver-auto-tag">Auto</span></span>
            <input type="number" value="${escapeHtml(driver.value)}" readonly disabled />
          </label>
        `
              : driver.type === "boolean"
                ? `
          <label>
            ${escapeHtml(driver.label)}
            <select data-scope-product="${escapeHtml(scope.product_name)}" data-driver="${escapeHtml(driver.key)}">
              <option value="0" ${Number(driver.value) ? "" : "selected"}>No</option>
              <option value="1" ${Number(driver.value) ? "selected" : ""}>Yes</option>
            </select>
          </label>
        `
                : driver.type === "select"
                  ? `
          <label>
            ${escapeHtml(driver.label)}
            <select data-scope-product="${escapeHtml(scope.product_name)}" data-driver="${escapeHtml(driver.key)}">
              ${(driver.options || [])
                .map((option) => `<option value="${escapeHtml(option)}" ${option === String(driver.value) ? "selected" : ""}>${escapeHtml(option)}</option>`)
                .join("")}
            </select>
          </label>
        `
                  : `
          <label>
            ${escapeHtml(driver.label)}
            <input
              type="number"
              min="0"
              step="1"
              title="Default ${formatNumber(driver.defaultValue)} for ${escapeHtml(airportCategory)}"
              data-scope-product="${escapeHtml(scope.product_name)}"
              data-driver="${escapeHtml(driver.key)}"
              value="${escapeHtml(driver.value)}"
            />
          </label>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function productSizingRollup(opportunityId, productName) {
  const estimates = sizingEstimatesFor(opportunityId).filter((estimate) => estimate.product_name === productName);
  if (!estimates.length) {
    return { sizing: "Not sized yet", validation: "Run Automated Sizing first", tone: "" };
  }
  const approved = estimates.filter((estimate) => ["Approved", "Approved with Conditions"].includes(estimate.status)).length;
  const rejected = estimates.filter((estimate) => estimate.status === "Rejected").length;
  const overdue = estimates.filter((estimate) => estimate.status === "Overdue").length;
  const tone = rejected || overdue ? "attention" : approved === estimates.length ? "ready" : "";
  const flags = [rejected ? `${rejected} rejected` : "", overdue ? `${overdue} overdue` : ""].filter(Boolean).join(", ");
  return {
    sizing: `${pluralize(estimates.length, "estimate")} generated`,
    validation: `${approved}/${estimates.length} approved${flags ? ` - ${flags}` : ""}`,
    tone,
  };
}

function selectedProductCardHtml(opportunity, scope, airportCategory) {
  ensureScopeSizingInputs(scope, airportCategory);
  const productName = scope.product_name;
  const rollup = productSizingRollup(opportunity.id, productName);
  const notes = [
    PRODUCT_LINKS[productName] ? `Linked to ${PRODUCT_LINKS[productName]}` : "",
    PRODUCTS_AWAITING_SIZING.has(productName) ? "Sizing rules pending" : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return `
    <div class="product-card included">
      <label class="product-toggle">
        <input type="checkbox" data-product="${escapeHtml(productName)}" checked />
        <span>
          <strong>${escapeHtml(productName)}</strong>
          ${notes ? `<small>${escapeHtml(notes)}</small>` : ""}
        </span>
      </label>
      <div class="scope-fields" aria-label="${escapeHtml(productName)} product scope">
        <label>
          Scope
          <select data-scope-product="${escapeHtml(productName)}" data-field="scope_status">
            ${statusOptions(SCOPE_STATUSES, scope.scope_status)}
          </select>
        </label>
        <label>
          Sizing
          <span class="scope-readout ${rollup.tone}">${escapeHtml(rollup.sizing)}</span>
        </label>
        <label>
          Validation
          <span class="scope-readout ${rollup.tone}">${escapeHtml(rollup.validation)}</span>
        </label>
        <label>
          Owner email override
          <input type="email" data-scope-product="${escapeHtml(productName)}" data-field="owner_email" value="${escapeHtml(scope.owner_email)}" />
        </label>
        <label>
          Risk level
          <select data-scope-product="${escapeHtml(productName)}" data-field="risk_level">
            ${statusOptions(RISK_LEVELS, scope.risk_level)}
          </select>
        </label>
      </div>
      ${renderScopeDriverControls(scope, airportCategory, true)}
    </div>
  `;
}

function renderProductScope(opportunity) {
  const scopes = productScopesFor(opportunity.id);
  const profile = airportProfileFor(opportunity.id);
  const airportCategory = classifyAirport(profile);
  elements.productCount.textContent = `${scopes.length} products`;

  const selectedNames = new Set(scopes.map((scope) => scope.product_name));
  const outOfScope = PRODUCT_NAMES.filter((name) => !selectedNames.has(name));
  const scopeByName = new Map(scopes.map((scope) => [scope.product_name, scope]));

  const familiesWithSelected = PRODUCT_FAMILY_ORDER.filter((family) =>
    scopes.some((scope) => productFamily(scope.product_name) === family),
  );

  const selectedSectionsHtml = scopes.length
    ? familiesWithSelected
        .map((family) => {
          const cards = PRODUCT_NAMES.filter((name) => selectedNames.has(name) && productFamily(name) === family)
            .map((name) => selectedProductCardHtml(opportunity, scopeByName.get(name), airportCategory))
            .join("");
          return `
            <div class="scope-family span-2">
              <h4 class="scope-family-title">${escapeHtml(family)}</h4>
              <div class="scope-family-grid">${cards}</div>
            </div>`;
        })
        .join("")
    : `
      <div class="guided-empty product-onboarding-card span-2">
        <strong>No products selected.</strong>
        <p>Selecting products creates sizing lines, identifies resource owners, and generates validation requests. Open "Add products" below to start.</p>
      </div>`;

  const addPanelHtml = outOfScope.length
    ? `
      <details class="scope-add-panel span-2" ${scopes.length ? "" : "open"}>
        <summary>
          <span>Add products to scope</span>
          <span class="meta-chip">${outOfScope.length} available</span>
        </summary>
        <div class="scope-add-body">
          ${PRODUCT_FAMILY_ORDER.filter((family) => outOfScope.some((name) => productFamily(name) === family))
            .map((family) => {
              const toggles = outOfScope
                .filter((name) => productFamily(name) === family)
                .map(
                  (name) => `
                  <label class="scope-add-toggle">
                    <input type="checkbox" data-product="${escapeHtml(name)}" />
                    <span>${escapeHtml(name)}</span>
                  </label>`,
                )
                .join("");
              return `
                <div class="scope-add-group">
                  <span class="scope-add-group-label">${escapeHtml(family)}</span>
                  ${toggles}
                </div>`;
            })
            .join("")}
        </div>
      </details>`
    : "";

  elements.productScope.innerHTML = selectedSectionsHtml + addPanelHtml;
}

function renderAirportProfile(opportunity) {
  if (!elements.airportProfileForm) return;
  const profile = airportProfileFor(opportunity.id);
  classifyAirport(profile);
  const form = elements.airportProfileForm;
  if (form.categorization_override) form.categorization_override.value = profile.categorization_override;
  if (form.override_reason) form.override_reason.value = profile.override_reason;
  elements.categoryBadge.textContent = `${profile.airport_category} - ${profile.categorization_method}`;
  const summary = form.querySelector("#sizingAirportProfile");
  if (summary) {
    const facts = [
      ["Airport", profile.airport_name || "-"],
      ["IATA/ICAO", profile.airport_code || "-"],
      ["Annual passengers", profile.annual_passengers ? formatNumber(profile.annual_passengers) : "-"],
      ["Annual movements", profile.annual_movements ? formatNumber(profile.annual_movements) : "-"],
      ["Region", profile.region || "-"],
      ["Category", `${profile.airport_category} (${profile.categorization_method})`],
    ];
    summary.innerHTML = `
      <div class="sizing-airport-profile-head">
        <span class="log-type">Airport profile</span>
        <a class="link-button" href="#/intake">Edit in Intake</a>
      </div>
      <dl class="sizing-airport-profile-grid">
        ${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(String(value))}</dd></div>`).join("")}
      </dl>`;
  }
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

  elements.sizingSummary.innerHTML = `
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
    setEstimateProductFilter("all");
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
    setEstimateExpansionOpportunityId(opportunity.id);
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
                <span>${escapeHtml(estimate.confidence_level)} confidence</span>
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
              <div class="estimate-status-field">
                <span class="estimate-mobile-label">Validation status</span>
                <span class="status-pill ${statusClass(estimate.status)}">${escapeHtml(estimate.status)}</span>
                <a class="estimate-status-link" href="#/validation" data-action="scroll" data-target="#resource-validation">Review in validation queue</a>
              </div>

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
    setSelectedValidationRequestId(defaultValidationRequestId(opportunity.id));
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
  // Canonical "needs action" figure: each line counted once by its lane, so an
  // overdue line is not tallied as both pending and an exception.
  const needActionCount = contexts.filter((context) => lanes[0].statuses.includes(context.effectiveStatus)).length;
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
  const stageGuidance = {
    Prepare: "Generate the sizing baseline before creating owner requests.",
    Route: "Resolve missing owners or email addresses before triggering validation.",
    Validate: `Resolve ${needActionCount} line${needActionCount === 1 ? "" : "s"} needing action before closing the baseline.`,
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

  const filterDefs = [
    { key: "all", label: "All lines", match: () => true },
    { key: "attention", label: "Needs action", match: (context) => lanes[0].statuses.includes(context.effectiveStatus) },
    { key: "conditional", label: "Conditional", match: (context) => context.effectiveStatus === "Approved with Conditions" },
    { key: "approved", label: "Approved", match: (context) => context.effectiveStatus === "Approved" },
  ];
  const activeFilter = filterDefs.find((item) => item.key === validationQueueFilter) || filterDefs[0];
  const productGroups = new Map();
  contexts.forEach((context) => {
    const key = context.estimate.product_name;
    const group = productGroups.get(key) || { product: key, contexts: [], md: 0, pending: 0, conditional: 0 };
    group.contexts.push(context);
    group.md += Number(context.estimate.initial_md || 0);
    if (lanes[0].statuses.includes(context.effectiveStatus)) group.pending += 1;
    if (context.effectiveStatus === "Approved with Conditions") group.conditional += 1;
    productGroups.set(key, group);
  });
  const groupRows = Array.from(productGroups.values()).sort(
    (a, b) => b.pending - a.pending || b.conditional - a.conditional || a.product.localeCompare(b.product),
  );
  const visibleLineCount = contexts.filter(activeFilter.match).length;

  elements.validationRequestList.innerHTML = `
    <section class="validation-summary-bar ${closeComplete ? "complete" : "attention"}" aria-label="Validation progress summary">
      <div class="validation-summary-copy">
        <span class="log-type">Current step: ${escapeHtml(currentStage)}</span>
        <strong>${closeComplete ? "Validation baseline complete" : escapeHtml(stageGuidance[currentStage])}</strong>
      </div>
      <div class="validation-summary-metrics">
        <span><strong>${requests.length}</strong> sizing lines</span>
        <span class="${needActionCount ? "attention" : ""}"><strong>${needActionCount}</strong> need action</span>
        <span class="${overdueCount ? "attention" : ""}"><strong>${overdueCount}</strong> overdue</span>
        <span><strong>${approvedCount}</strong> approved</span>
        <span class="${mdWaiting ? "attention" : ""}"><strong>${formatNumber(mdWaiting)}</strong> MD awaiting owner</span>
      </div>
    </section>

    <section class="validation-queue-board" aria-label="Validation queue">
      <div class="validation-queue-heading">
        <div>
          <strong>Validation queue</strong>
          <small>Grouped by product. Select a line to record the owner decision.</small>
        </div>
        <span class="section-count">${pluralize(visibleLineCount, "line")}</span>
      </div>
      <div class="validation-queue-filters" role="group" aria-label="Filter validation lines by status">
        ${filterDefs
          .map((item) => {
            const count = contexts.filter(item.match).length;
            return `<button type="button" data-validation-filter="${item.key}" class="${item.key === activeFilter.key ? "active" : ""}">${escapeHtml(item.label)} (${count})</button>`;
          })
          .join("")}
      </div>
      <div class="validation-queue-scroll matrix-wrap">
        <table class="validation-queue-table">
          <thead>
            <tr>
              <th>Product / workstream</th>
              <th>Resource owner</th>
              <th>MD</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${groupRows
              .map((group) => {
                const groupLines = group.contexts.filter(activeFilter.match);
                if (!groupLines.length) return "";
                const groupSummary = [
                  group.pending ? `${group.pending} need action` : "",
                  group.conditional ? `${group.conditional} conditional` : "",
                  !group.pending && !group.conditional ? "all approved" : "",
                ]
                  .filter(Boolean)
                  .join(" - ");
                return `
              <tr class="queue-product-row ${group.pending ? "attention" : ""}">
                <th colspan="5" scope="colgroup">${escapeHtml(group.product)} <span>${pluralize(group.contexts.length, "line")} - ${formatNumber(group.md)} MD - ${escapeHtml(groupSummary)}</span></th>
              </tr>
              ${groupLines
                .map((context) => {
                  const needsAction = lanes[0].statuses.includes(context.effectiveStatus);
                  const tone = requestIsOverdue(context)
                    ? "critical"
                    : needsAction
                      ? "attention"
                      : context.effectiveStatus === "Approved with Conditions"
                        ? "warning"
                        : "ready";
                  return `
                <tr class="queue-line-row ${tone} ${context.request.id === selectedValidationRequestId ? "selected" : ""}" data-request-id="${escapeHtml(context.request.id)}" tabindex="0">
                  <td><strong>${escapeHtml(context.estimate.workstream)}</strong></td>
                  <td>${escapeHtml(context.owner?.name || "Owner not assigned")}</td>
                  <td>${formatNumber(dashboardMdForEstimate(context.estimate))}</td>
                  <td class="${context.dueIn < 0 ? "overdue-cell" : ""}">${escapeHtml(formatShortDate(context.request.due_date))} (${context.dueIn < 0 ? `${Math.abs(context.dueIn)}d overdue` : `${context.dueIn}d`})</td>
                  <td><span class="status-pill ${statusClass(context.effectiveStatus)}">${escapeHtml(context.effectiveStatus)}</span></td>
                </tr>`;
                })
                .join("")}`;
              })
              .join("")}
          </tbody>
        </table>
        ${visibleLineCount ? "" : `<div class="empty-state"><strong>No lines match this filter.</strong><p>Switch back to "All lines" to see the full queue.</p></div>`}
      </div>
    </section>

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
          <span class="log-type">Notify owner</span>
          <strong>Send validation request</strong>
        </div>
        <div class="notification-trigger-actions">
          <button type="button" class="primary-button" data-notification-trigger="Email" data-request-id="${escapeHtml(selectedRequest?.id || "")}" ${selectedRequest ? "" : "disabled"}>
            Send request (Email)
          </button>
          <button type="button" class="secondary-button" data-notification-trigger="Teams" data-request-id="${escapeHtml(selectedRequest?.id || "")}" ${selectedRequest ? "" : "disabled"}>
            Send request (Teams)
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
          <small>Approve, adjust, condition, reject, or request more information.</small>
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
          <button type="button" class="primary-button" data-owner-action="Approved" data-owner-advance="true" data-request-id="${escapeHtml(selectedRequest?.id || "")}">
            Approve &amp; next
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

    <details class="owner-workload-details">
      <summary>
        <strong>Owner workload view</strong>
        <small>The same queue grouped by resource owner - ${pluralize(packageRows.length, "owner")}. Selecting an owner opens their most urgent line.</small>
      </summary>
      <div class="owner-package-grid">
        ${packageRows
          .map((item) => {
            const status = item.overdue ? "Escalate" : item.exceptions ? "Exception" : item.pending ? "Requires action" : item.conditional ? "Conditional" : "Completed";
            const tone = item.overdue || item.exceptions ? "critical" : item.pending || item.conditional ? "attention" : "ready";
            const approvableIds = item.contexts
              .filter((context) => requestNeedsOwnerAction(context) && !["Needs Adjustment", "Rejected"].includes(context.effectiveStatus))
              .map((context) => context.request.id);
            return `
          <div class="owner-package ${tone}">
            <button type="button" class="owner-package-open" data-request-id="${escapeHtml(item.primary.request.id)}">
              <span class="owner-package-main"><strong>${escapeHtml(item.owner?.name || "Owner not assigned")}</strong><small>${pluralize(item.contexts.length, "sizing line")} - ${formatNumber(item.md)} MD - ${item.dueIn < 0 ? `${Math.abs(item.dueIn)}d overdue` : `due in ${item.dueIn}d`}</small></span>
              <span class="status-pill ${statusClass(tone)}">${escapeHtml(status)}</span>
            </button>
            ${approvableIds.length ? `<button type="button" class="secondary-button owner-package-approve" data-bulk-approve="${escapeHtml(approvableIds.join(","))}">Approve ${approvableIds.length} pending</button>` : ""}
          </div>`;
          })
          .join("")}
      </div>
    </details>
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
        <p>Select a validation request to preview its Email or Teams message.</p>
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
          <span class="log-type">${escapeHtml(channel)} ${channel === "Email" ? "draft" : "message"}</span>
          <strong>${escapeHtml(title)}</strong>
          <small>To: ${escapeHtml(notification.recipient)} - ${escapeHtml(formatNotificationTimestamp(channelState.last_triggered_at))}</small>
        </div>
        <pre>${escapeHtml(body)}</pre>
      </div>
      <div class="notification-preview-action">
        <button type="button" class="primary-button" data-notification-trigger="${escapeHtml(channel)}" data-request-id="${escapeHtml(request.id)}">
          Send ${escapeHtml(channel)} request
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
            : `<div class="notification-activity-empty"><strong>No activity yet</strong><small>Send an Email or Teams request to record owner notifications here.</small></div>`
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

function renderSrmCockpitBanner(opportunity, breakdown) {
  const srm = breakdown.forumDetails.SRM;
  const sizingImpact = sizingReadinessImpact(opportunity, "SRM");
  const blockers = [...new Set([...srm.blockers, ...srm.missing])].slice(0, 4);
  const ready = ["Ready", "Ready with Conditions"].includes(srm.status);
  return `
    <section class="srm-cockpit ${statusClass(srm.status)}" aria-label="SRM readiness cockpit">
      <div class="srm-cockpit-head">
        <div>
          <p class="eyebrow">Solution Review Meeting</p>
          <h4>SRM readiness</h4>
          <p class="section-help">Validated technical and delivery inputs for the Solution Review Meeting.</p>
        </div>
        <div class="srm-cockpit-score">
          <span>${srm.score}%</span>
          <span class="status-pill ${statusClass(srm.status)}">${escapeHtml(srm.status)}</span>
        </div>
      </div>
      <div class="srm-cockpit-body">
        <div class="srm-cockpit-facts">
          <div><span>${srm.complete}/${srm.total}</span><label>SRM checklist complete</label></div>
          <div><span>${srm.blockers.length}</span><label>Hard blockers</label></div>
          <div><span>${escapeHtml(sizingImpact)}</span><label>Validated sizing</label></div>
        </div>
        <div class="srm-cockpit-blockers">
          <strong>${ready ? "Ready for SRM" : "What is blocking SRM"}</strong>
          ${
            blockers.length
              ? `<ul>${blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
              : "<p>All SRM evidence is in place. Generate the pack for the review.</p>"
          }
        </div>
      </div>
      <div class="srm-cockpit-actions">
        <button type="button" class="primary-button" data-action="scroll" data-target="#businessCase">Generate SRM pack</button>
        <button type="button" class="secondary-button" data-action="scroll" data-target="#resource-validation">Open validation queue</button>
      </div>
    </section>`;
}

function renderReadinessBreakdown(opportunity) {
  if (!elements.readinessBreakdown) return;
  const breakdown = readinessBreakdown(opportunity);
  const topGaps = readinessGapsForOpportunity(opportunity).slice(0, 6);

  elements.readinessBreakdown.innerHTML = `
    ${renderSrmCockpitBanner(opportunity, breakdown)}
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

    <details class="score-calculation-card">
      <summary class="score-card-heading">
        <strong>Why this score</strong>
        <span>${breakdown.baseScore} base points - final ${breakdown.score}</span>
      </summary>
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
    </details>

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
              <span class="required-mark">${validation.required ? "Required" : "Optional"}</span>
            </label>
          </td>
          <td>
            <button type="button" class="status-token ${statusClass(validation.status)}" data-validation-id="${escapeHtml(validation.id)}" data-cycle-status="true" title="Click to advance status - keep clicking to cycle back around">
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
  lines.push(`Generated (mock): ${referenceToday()} | Submission deadline: ${opportunity.submission_deadline || "TBC"}`);
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
        <p class="pack-muted">Generated ${escapeHtml(formatShortDate(referenceToday()))} · Submission ${escapeHtml(formatShortDate(opportunity.submission_deadline))} · Stage ${escapeHtml(opportunity.current_governance_stage)}</p>
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

    <p class="pack-footnote">Salesforce remains the system of record; SRM and BAB are the governance forums.</p>
  `;
}

function renderSelectedWorkspace() {
  const opportunity = selectedOpportunity();
  fillIntakeForm(opportunity);
  renderIntakeNarrativeSummary(opportunity);
  renderRecordHeader(opportunity);
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
  persistState();
}

export {
  helpTooltip,
  helpTerm,
  hydrateHelpTooltips,
  renderExecutiveDashboard,
  renderOpportunityList,
  fillIntakeForm,
  shortText,
  renderIntakeNarrativeSummary,
  renderRecordHeader,
  airportProfileComplete,
  actionableValidationStatuses,
  recommendedNextAction,
  renderScopeDriverControls,
  renderProductScope,
  renderAirportProfile,
  renderClassificationRules,
  renderSizingSummary,
  filteredSizingEstimates,
  renderEstimateFilters,
  renderSizingEstimates,
  renderValidationRequests,
  renderNotificationPreview,
  renderResourceOwnerRegistry,
  renderSizingEngine,
  renderReadinessBreakdown,
  renderGovernanceChecklist,
  renderValidationMatrix,
  renderRisks,
  renderAssumptions,
  renderDecisions,
  businessCaseConditions,
  businessCaseWorkstreams,
  buildBusinessCaseText,
  renderBusinessCasePack,
  renderSelectedWorkspace,
  renderAll,
};
