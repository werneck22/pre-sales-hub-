import {
  escapeHtml,
  formatNumber,
} from "./data.js?v=20260711-3";
import {
  elements,
  mockDb,
  navigateToRoute,
  setEstimateProductFilter,
  setEstimateStatusFilter,
  setSelectedId,
  setSelectedValidationRequestId,
} from "./state.js?v=20260711-3";
import {
  renderAll,
} from "./render.js?v=20260711-3";
import {
  createOpportunityFromAirport,
} from "./actions.js?v=20260711-3";
import {
  searchAirportDirectory,
  normalizeSearchText,
} from "./airport-directory.js?v=20260711-3";
import {
  defaultValidationRequestId,
} from "./sizing-engine.js?v=20260711-3";

// Header search doubles as an airport finder: airport matches from the
// reference directory can be turned into a targeted opportunity, and existing
// opportunities matching the query are offered so duplicates are avoided.
let searchAirportMatches = [];
let searchOpportunityMatches = [];

function matchingOpportunities(query, limit = 4) {
  const term = normalizeSearchText(query).trim();
  if (term.length < 2) return [];
  return mockDb.opportunities
    .filter((opportunity) =>
      [opportunity.name, opportunity.customer, opportunity.region]
        .map(normalizeSearchText)
        .some((field) => field.includes(term)),
    )
    .slice(0, limit);
}

function hideSearchResults() {
  if (!elements.searchResults) return;
  elements.searchResults.hidden = true;
  elements.searchResults.innerHTML = "";
  searchAirportMatches = [];
  searchOpportunityMatches = [];
  elements.searchInput?.setAttribute("aria-expanded", "false");
}

function renderSearchResults(query) {
  if (!elements.searchResults) return;
  const term = String(query || "").trim();
  if (term.length < 2) {
    hideSearchResults();
    return;
  }

  searchAirportMatches = searchAirportDirectory(term, 6);
  searchOpportunityMatches = matchingOpportunities(term, 4);

  if (!searchAirportMatches.length && !searchOpportunityMatches.length) {
    elements.searchResults.hidden = false;
    elements.searchResults.innerHTML = `<div class="search-empty">No airport or opportunity matches "${escapeHtml(term)}".</div>`;
    elements.searchInput?.setAttribute("aria-expanded", "true");
    return;
  }

  const opportunitySection = searchOpportunityMatches.length
    ? `<div class="search-group">
        <div class="search-group-label">Your opportunities</div>
        ${searchOpportunityMatches
          .map(
            (opportunity) => `
          <button type="button" role="option" class="search-result opportunity-result" data-opportunity-id="${escapeHtml(opportunity.id)}">
            <span class="search-result-main">
              <strong>${escapeHtml(opportunity.name)}</strong>
              <small>${escapeHtml(opportunity.customer)} · ${escapeHtml(opportunity.region)} · ${escapeHtml(opportunity.current_governance_stage)}</small>
            </span>
            <span class="search-result-cta">Open</span>
          </button>`,
          )
          .join("")}
      </div>`
    : "";

  const airportSection = searchAirportMatches.length
    ? `<div class="search-group">
        <div class="search-group-label">Airports · create opportunity</div>
        ${searchAirportMatches
          .map(
            (airport, index) => `
          <button type="button" role="option" class="search-result airport-result" data-airport-index="${index}">
            <span class="search-result-code">${escapeHtml(airport.iata)}</span>
            <span class="search-result-main">
              <strong>${escapeHtml(airport.name)}</strong>
              <small>${escapeHtml(airport.city)}, ${escapeHtml(airport.state)} · ${escapeHtml(airport.country)}</small>
              <span class="search-result-traffic">${formatNumber(airport.annual_passengers)} pax · ${formatNumber(airport.annual_movements)} movements · ${escapeHtml(String(airport.traffic_year))}</span>
            </span>
            <span class="search-result-cta">Create</span>
          </button>`,
          )
          .join("")}
      </div>`
    : "";

  elements.searchResults.innerHTML = `${opportunitySection}${airportSection}`;
  elements.searchResults.hidden = false;
  elements.searchInput?.setAttribute("aria-expanded", "true");
}

function openExistingOpportunity(opportunityId) {
  setSelectedId(opportunityId);
  setEstimateProductFilter("all");
  setEstimateStatusFilter("all");
  setSelectedValidationRequestId(defaultValidationRequestId(opportunityId));
  renderAll();
  navigateToRoute("intake");
}

function handleSearchResultClick(event) {
  const airportButton = event.target.closest("[data-airport-index]");
  if (airportButton) {
    const airport = searchAirportMatches[Number(airportButton.dataset.airportIndex)];
    if (elements.searchInput) elements.searchInput.value = "";
    hideSearchResults();
    createOpportunityFromAirport(airport);
    return;
  }

  const opportunityButton = event.target.closest("[data-opportunity-id]");
  if (opportunityButton) {
    if (elements.searchInput) elements.searchInput.value = "";
    hideSearchResults();
    openExistingOpportunity(opportunityButton.dataset.opportunityId);
  }
}

export { renderSearchResults, hideSearchResults, handleSearchResultClick };
