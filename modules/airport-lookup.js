import {
  airportProfileFor,
  classifyAirport,
  elements,
  selectedId,
  showToast,
} from "./state.js";
import {
  renderAll,
} from "./render.js";

// Public SPARQL endpoint, CORS-enabled, no key required. Wikidata stores
// annual passenger traffic as "patronage" (P3872) statements with a
// "point in time" (P585) qualifier; airports are matched by IATA (P238)
// or ICAO (P239) code. Aircraft movements have no reliable Wikidata
// property, so that figure stays manual.
const WIKIDATA_SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
const LOOKUP_TIMEOUT_MS = 12000;

function normalizeAirportCode(raw) {
  const code = String(raw || "").trim().toUpperCase();
  return /^[A-Z0-9]{3,4}$/.test(code) ? code : "";
}

function sparqlQueryForCode(code) {
  const property = code.length === 4 ? "P239" : "P238";
  return `SELECT ?airport ?airportLabel ?pax ?paxDate WHERE {
  ?airport wdt:${property} "${code}" .
  OPTIONAL { ?airport p:P3872 ?paxStatement . ?paxStatement ps:P3872 ?pax . OPTIONAL { ?paxStatement pq:P585 ?paxDate . } }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}`;
}

function parseWikidataResult(payload) {
  const rows = payload?.results?.bindings || [];
  if (!rows.length) return null;
  const label = rows[0].airportLabel?.value || "";
  let best = null;
  rows.forEach((row) => {
    if (!row.pax) return;
    const value = Number(row.pax.value);
    if (!Number.isFinite(value) || value <= 0) return;
    const date = row.paxDate?.value || "";
    if (!best || date > best.date) best = { value, date };
  });
  return {
    label,
    passengers: best ? Math.round(best.value) : 0,
    referenceYear: best?.date ? best.date.slice(0, 4) : "",
  };
}

async function fetchWikidataAirport(code) {
  const url = `${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(sparqlQueryForCode(code))}&format=json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/sparql-results+json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Wikidata returned HTTP ${response.status}`);
    return parseWikidataResult(await response.json());
  } finally {
    clearTimeout(timer);
  }
}

function trafficProvenanceText(profile) {
  if (profile.traffic_source !== "Wikidata") {
    return "Traffic figures: manual entry. Enter an IATA/ICAO code to look up passenger traffic.";
  }
  const year = profile.traffic_source_year ? ` (${profile.traffic_source_year})` : "";
  const retrieved = profile.traffic_retrieved_at ? ` · retrieved ${profile.traffic_retrieved_at}` : "";
  const edited = Number(profile.annual_passengers) !== Number(profile.traffic_fetched_passengers || 0);
  if (edited) {
    return `Passengers manually edited after Wikidata${year} lookup suggested ${Number(
      profile.traffic_fetched_passengers || 0,
    ).toLocaleString("en-US")}${retrieved}.`;
  }
  return `Passengers from Wikidata${year}${retrieved} · unverified suggestion - confirm against official statistics. Movements remain manual.`;
}

async function lookupAirportData() {
  const form = elements.airportProfileForm;
  const button = elements.airportLookupBtn;
  if (!form || !button) return;
  const code = normalizeAirportCode(form.airport_code?.value);
  if (!code) {
    showToast("Enter a valid 3-letter IATA or 4-letter ICAO code before looking up airport data.", "attention");
    return;
  }

  const defaultLabel = button.textContent;
  button.disabled = true;
  button.textContent = "Looking up...";
  try {
    const result = await fetchWikidataAirport(code);
    if (!result) {
      showToast(`No Wikidata airport entry found for code ${code}.`, "attention");
      return;
    }

    const profile = airportProfileFor(selectedId);
    profile.airport_code = code;
    if (result.label && !String(profile.airport_name || "").trim()) {
      profile.airport_name = result.label;
    }
    if (result.passengers > 0) {
      profile.annual_passengers = result.passengers;
      profile.traffic_source = "Wikidata";
      profile.traffic_source_label = result.label;
      profile.traffic_source_year = result.referenceYear;
      profile.traffic_retrieved_at = new Date().toISOString().slice(0, 10);
      profile.traffic_fetched_passengers = result.passengers;
    }
    classifyAirport(profile);
    renderAll();

    if (result.passengers > 0) {
      showToast(
        `${result.label || code}: ${result.passengers.toLocaleString("en-US")} annual passengers${
          result.referenceYear ? ` (${result.referenceYear})` : ""
        } from Wikidata. Category recalculated as ${profile.airport_category}; movements still need manual entry.`,
      );
    } else {
      showToast(
        `${result.label || code} found on Wikidata, but it has no annual passenger figure. Enter traffic manually.`,
        "attention",
      );
    }
  } catch (error) {
    const reason = error?.name === "AbortError" ? "the request timed out" : "the service could not be reached";
    showToast(`Wikidata lookup failed - ${reason}. Enter traffic figures manually.`, "attention");
  } finally {
    button.disabled = false;
    button.textContent = defaultLabel;
  }
}

export {
  normalizeAirportCode,
  sparqlQueryForCode,
  parseWikidataResult,
  fetchWikidataAirport,
  trafficProvenanceText,
  lookupAirportData,
};
