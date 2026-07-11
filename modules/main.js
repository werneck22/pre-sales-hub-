import {
  VALIDATION_STATUSES,
  assumption,
  decision,
  productScope,
  risk,
  slug,
} from "./data.js?v=20260711-3";
import {
  activeRoute,
  airportProfileFor,
  applyRoute,
  clearPersistedState,
  elements,
  estimateProductFilter,
  estimateStatusFilter,
  expandedEstimateProducts,
  loadPersistedState,
  migrateMockDb,
  mockDb,
  navigateToRoute,
  productScopesFor,
  routeFromHash,
  selectedId,
  selectedOpportunity,
  setActiveRoute,
  setEstimateProductFilter,
  setEstimateStatusFilter,
  setMockDb,
  setSelectedId,
  setSelectedNotificationChannel,
  setSelectedValidationRequestId,
  setRegistryShowAll,
  setSortByReadiness,
  setValidationLineFilter,
  setValidationTab,
  showToast,
  toggleValidationProduct,
  sizingEstimatesFor,
  sortByReadiness,
} from "./state.js?v=20260711-3";
import {
  buildSizingCsv,
  defaultValidationRequestId,
  generateSizingForOpportunity,
  initializeSizingEngine,
  nextActionableRequestId,
  runNotificationTrigger,
} from "./sizing-engine.js?v=20260711-3";
import {
  readiness,
} from "./readiness-rules.js?v=20260711-3";
import {
  airportProfileComplete,
  buildBusinessCaseText,
  renderAll,
  renderNotificationPreview,
  renderSizingEstimates,
  renderValidationRequests,
} from "./render.js?v=20260711-3";
import {
  lookupAirportData,
} from "./airport-lookup.js?v=20260711-3";
import {
  handleSearchResultClick,
  hideSearchResults,
  renderSearchResults,
} from "./airport-search.js?v=20260711-3";
import {
  addProductScope,
  applyAirportCodeToProfile,
  applyOwnerValidationAction,
  updateValidationOwnerContact,
  updateSizingOwner,
  createOpportunity,
  executeJourneyAction,
  findProductScope,
  runSizingForSelected,
  syncAirportProfileFromForm,
  syncIntakeFromForm,
  updateEstimateManualOverride,
  updateEstimateValidation,
  updateScopeDriverValue,
} from "./actions.js?v=20260711-3";

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
  executeJourneyAction(button.dataset.action, button.dataset.target);
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

elements.searchInput.addEventListener("input", () => {
  renderSearchResults(elements.searchInput.value);
  renderAll();
});
elements.searchInput.addEventListener("focus", () => {
  if (elements.searchInput.value.trim().length >= 2) renderSearchResults(elements.searchInput.value);
});
elements.searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideSearchResults();
});
if (elements.searchResults) {
  elements.searchResults.addEventListener("mousedown", (event) => {
    // mousedown fires before the input blur, so the result survives the click.
    event.preventDefault();
    handleSearchResultClick(event);
  });
}
document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-wrap")) hideSearchResults();
});
elements.stageFilter.addEventListener("change", renderAll);
elements.sortReadinessBtn.addEventListener("click", () => {
  setSortByReadiness(!sortByReadiness);
  elements.sortReadinessBtn.classList.toggle("active", sortByReadiness);
  renderAll();
});
elements.newOpportunityBtn.addEventListener("click", createOpportunity);
if (elements.airportProfileForm) {
  elements.airportProfileForm.addEventListener("input", () => {
    syncAirportProfileFromForm();
    renderAll();
  });
  elements.airportProfileForm.addEventListener("change", (event) => {
    syncAirportProfileFromForm();
    if (event.target.name === "airport_code") {
      const airport = applyAirportCodeToProfile(event.target.value);
      if (airport) {
        renderAll();
        showToast(`${airport.name} loaded from the airport directory.`);
        return;
      }
    }
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
elements.generateSizingBtn?.addEventListener("click", () => {
  runSizingForSelected();
  if (productScopesFor(selectedId).length) navigateToRoute("sizing");
});
elements.airportLookupBtn?.addEventListener("click", lookupAirportData);
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
elements.intakeForm.addEventListener("input", (event) => {
  if (event.target.name === "airport_iata") return;
  syncIntakeFromForm();
});
elements.intakeForm.addEventListener("change", (event) => {
  if (event.target.name === "airport_iata") {
    const airport = applyAirportCodeToProfile(event.target.value);
    renderAll();
    showToast(
      airport
        ? `${airport.name} loaded: region, passengers, and movements populated.`
        : "Airport code not in the reference directory. Enter traffic manually on Automated Sizing.",
      airport ? "success" : "attention",
    );
    return;
  }
  syncIntakeFromForm();
});
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
    if (scope) scope[field] = event.target.value;
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

elements.validationTabs?.addEventListener("click", (event) => {
  const tabButton = event.target.closest("[data-validation-tab]");
  if (!tabButton) return;
  setValidationTab(tabButton.dataset.validationTab);
  renderValidationRequests(selectedOpportunity());
});

if (elements.validationRequestList) {
  elements.validationRequestList.addEventListener("click", (event) => {
    if (event.target.closest("[data-owner-contact-field], [data-request-action-field]")) return;

    const filterButton = event.target.closest("[data-line-filter]");
    if (filterButton) {
      setValidationLineFilter(filterButton.dataset.lineFilter);
      renderValidationRequests(selectedOpportunity());
      return;
    }

    const productToggle = event.target.closest("[data-product-toggle]");
    if (productToggle) {
      toggleValidationProduct(productToggle.dataset.productToggle);
      renderValidationRequests(selectedOpportunity());
      return;
    }

    const notificationTrigger = event.target.closest("[data-notification-trigger]");
    if (notificationTrigger) {
      runNotificationTrigger(notificationTrigger);
      return;
    }

    const ownerActionButton = event.target.closest("[data-owner-action]");
    if (ownerActionButton) {
      const panel = ownerActionButton.closest("[data-request-action-panel]");
      const fields = {};
      panel?.querySelectorAll("[data-request-action-field]").forEach((input) => {
        fields[input.dataset.requestActionField] = input.value;
      });
      const currentRequestId = ownerActionButton.dataset.requestId;
      const result = applyOwnerValidationAction(currentRequestId, ownerActionButton.dataset.ownerAction, fields);
      if (!result.ok) {
        showToast(result.message, result.tone);
        return;
      }
      if (ownerActionButton.dataset.ownerAdvance === "true") {
        const nextId = nextActionableRequestId(selectedOpportunity(), currentRequestId);
        if (nextId) setSelectedValidationRequestId(nextId);
      }
      renderAll();
      showToast(result.message, result.tone);
      return;
    }

    const row = event.target.closest("[data-request-id]");
    if (!row) return;
    setSelectedValidationRequestId(row.dataset.requestId);
    renderValidationRequests(selectedOpportunity());
    renderNotificationPreview();
    elements.validationRequestList.querySelector(".request-detail-card")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  elements.validationRequestList.addEventListener("change", (event) => {
    const contactField = event.target.closest("[data-owner-contact-field]");
    if (contactField) {
      updateValidationOwnerContact(contactField.dataset.requestId, contactField.dataset.ownerContactField, contactField.value);
      renderValidationRequests(selectedOpportunity());
      renderNotificationPreview();
      showToast("Owner contact overridden for this activity.");
    }
  });

  elements.validationRequestList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("input, textarea")) return;
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
      runNotificationTrigger(notificationTrigger);
    }
  });
}

if (elements.ownerRegistryTable) {
  elements.ownerRegistryTable.addEventListener("change", (event) => {
    const registryField = event.target.closest("[data-owner-registry]");
    if (registryField) {
      updateSizingOwner(registryField.dataset.ownerRegistry, registryField.dataset.registryField, registryField.value);
      renderAll();
      showToast("Owner registry updated.");
      return;
    }
    const showAll = event.target.closest("[data-registry-show-all]");
    if (showAll) {
      setRegistryShowAll(showAll.checked);
      renderValidationRequests(selectedOpportunity());
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

elements.printBusinessCaseBtn?.addEventListener("click", () => {
  window.print();
});

elements.exportSizingCsvBtn?.addEventListener("click", () => {
  const opportunity = selectedOpportunity();
  if (!sizingEstimatesFor(opportunity.id).length) {
    showToast("Run sizing first - there are no estimates to export.", "attention");
    return;
  }
  const blob = new Blob([buildSizingCsv(opportunity)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug(opportunity.name)}-sizing-baseline.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Sizing baseline exported as CSV.");
});

elements.resetDataBtn?.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Reset all locally saved data and reload the seeded demo dataset? Your local edits will be lost.",
  );
  if (!confirmed) return;
  clearPersistedState();
  window.location.reload();
});

window.addEventListener("hashchange", () => applyRoute(routeFromHash()));

const persisted = loadPersistedState();
if (persisted) {
  setMockDb(migrateMockDb(persisted.mockDb));
  setSelectedId(
    mockDb.opportunities.some((opportunity) => opportunity.id === persisted.selectedId)
      ? persisted.selectedId
      : mockDb.opportunities[0].id,
  );
  // Rebuild the per-product validation workflow from the persisted estimates
  // (existing owner decisions and adjustments are preserved).
  mockDb.opportunities.forEach((opportunity) => generateSizingForOpportunity(opportunity.id));
} else {
  initializeSizingEngine();
}
setSelectedValidationRequestId(defaultValidationRequestId(selectedId));
mockDb.opportunities.forEach(readiness);
setActiveRoute(routeFromHash());
renderAll();
applyRoute(activeRoute, { scroll: false });
