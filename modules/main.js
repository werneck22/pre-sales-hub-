import {
  DEMO_OPPORTUNITY_ID,
  VALIDATION_STATUSES,
  assumption,
  decision,
  productScope,
  risk,
} from "./data.js";
import {
  activeRoute,
  airportProfileFor,
  applyRoute,
  demoMode,
  demoPresenterStep,
  elements,
  estimateProductFilter,
  estimateStatusFilter,
  expandedEstimateProducts,
  loadPersistedState,
  mockDb,
  navigateToRoute,
  routeFromHash,
  selectedId,
  selectedNotificationChannel,
  selectedOpportunity,
  selectedValidationRequestId,
  setActiveRoute,
  setDemoMode,
  setDemoPresenterStep,
  setEstimateProductFilter,
  setEstimateStatusFilter,
  setMockDb,
  setSelectedId,
  setSelectedNotificationChannel,
  setSelectedValidationRequestId,
  setSortByReadiness,
  setValidationQueueFilter,
  showToast,
  sortByReadiness,
} from "./state.js";
import {
  defaultValidationRequestId,
  estimateId,
  generateSizingForOpportunity,
  initializeSizingEngine,
  requestId,
  runMockNotificationTrigger,
} from "./sizing-engine.js";
import {
  readiness,
} from "./readiness-rules.js";
import {
  airportProfileComplete,
  buildBusinessCaseText,
  isDemoScenario,
  renderAll,
  renderNotificationPreview,
  renderSizingEstimates,
  renderValidationRequests,
} from "./render.js";
import {
  addProductScope,
  applyOwnerValidationAction,
  createOpportunity,
  executeJourneyAction,
  findProductScope,
  runSizingForSelected,
  syncAirportProfileFromForm,
  syncIntakeFromForm,
  syncScopeOwnerEmailToEstimates,
  updateEstimateManualOverride,
  updateEstimateValidation,
  updateScopeDriverValue,
} from "./actions.js";

elements.opportunityList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-id]");
  if (!card) return;
  setSelectedId(card.dataset.id);
  setEstimateProductFilter("all");
  setEstimateStatusFilter("all");
  setSelectedValidationRequestId(defaultValidationRequestId(selectedId));
  renderAll();
  navigateToRoute("intake");
});

if (elements.blockerList) {
  elements.blockerList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    setSelectedId(button.dataset.id);
    setEstimateProductFilter("all");
    setEstimateStatusFilter("all");
    setSelectedValidationRequestId(defaultValidationRequestId(selectedId));
    renderAll();
    navigateToRoute("intake");
  });
}

if (elements.topReadinessGaps) {
  elements.topReadinessGaps.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    setSelectedId(button.dataset.id);
    setEstimateProductFilter("all");
    setEstimateStatusFilter("all");
    setSelectedValidationRequestId(defaultValidationRequestId(selectedId));
    renderAll();
    navigateToRoute("intake");
  });
}

if (elements.dashboard) {
  elements.dashboard.addEventListener("click", (event) => {
    const row = event.target.closest(".dashboard-row[data-id], .executive-action-card[data-id]");
    if (!row) return;
    setSelectedId(row.dataset.id);
    setEstimateProductFilter("all");
    setEstimateStatusFilter("all");
    setSelectedValidationRequestId(row.dataset.requestId || defaultValidationRequestId(selectedId));
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
    setSelectedId(card.dataset.id);
    setEstimateProductFilter("all");
    setEstimateStatusFilter("all");
    setSelectedValidationRequestId(defaultValidationRequestId(selectedId));
    renderAll();
    navigateToRoute("intake");
  });
}

elements.searchInput.addEventListener("input", renderAll);
elements.stageFilter.addEventListener("change", renderAll);
elements.sortReadinessBtn.addEventListener("click", () => {
  setSortByReadiness(!sortByReadiness);
  elements.sortReadinessBtn.classList.toggle("active", sortByReadiness);
  renderAll();
});
elements.newOpportunityBtn.addEventListener("click", createOpportunity);
if (elements.demoModeBtn) {
  elements.demoModeBtn.addEventListener("click", () => {
    const exitingDemo = activeRoute === "demo" && isDemoScenario(selectedOpportunity());
    setDemoMode(!exitingDemo);
    setDemoPresenterStep(0);
    if (demoMode) {
      setSelectedId(DEMO_OPPORTUNITY_ID);
      setEstimateProductFilter("all");
      setEstimateStatusFilter("all");
      setSelectedValidationRequestId(defaultValidationRequestId(selectedId));
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
    setEstimateProductFilter(elements.estimateProductFilter.value);
    renderSizingEstimates(selectedOpportunity());
  });
}
if (elements.estimateStatusFilter) {
  elements.estimateStatusFilter.addEventListener("change", () => {
    setEstimateStatusFilter(elements.estimateStatusFilter.value);
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
      setSelectedValidationRequestId(request.id);
      renderAll();
      showToast(`Owner validation marked as ${nextStatus}; readiness recalculated.`);
      return;
    }

    const filterButton = event.target.closest("[data-validation-filter]");
    if (filterButton) {
      setValidationQueueFilter(filterButton.dataset.validationFilter);
      renderValidationRequests(selectedOpportunity());
      return;
    }

    const row = event.target.closest("[data-request-id]");
    if (!row) return;
    setSelectedValidationRequestId(row.dataset.requestId);
    renderValidationRequests(selectedOpportunity());
    renderNotificationPreview();
    elements.validationRequestList.querySelector(".request-detail-card")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  elements.validationRequestList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const row = event.target.closest("tr[data-request-id]");
    if (!row) return;
    event.preventDefault();
    setSelectedValidationRequestId(row.dataset.requestId);
    renderValidationRequests(selectedOpportunity());
    renderNotificationPreview();
  });
}

if (elements.notificationPreview) {
  elements.notificationPreview.addEventListener("click", (event) => {
    const channelButton = event.target.closest("[data-notification-channel]");
    if (channelButton) {
      setSelectedNotificationChannel(channelButton.dataset.notificationChannel);
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

const persisted = loadPersistedState();
if (persisted) {
  setMockDb(persisted.mockDb);
  setSelectedId(
    mockDb.opportunities.some((opportunity) => opportunity.id === persisted.selectedId)
      ? persisted.selectedId
      : mockDb.opportunities[0].id,
  );
} else {
  initializeSizingEngine();
}
setSelectedValidationRequestId(defaultValidationRequestId(selectedId));
mockDb.opportunities.forEach(readiness);
setActiveRoute(routeFromHash());
renderAll();
applyRoute(activeRoute, { scroll: false });
