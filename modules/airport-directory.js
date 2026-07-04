// Bundled airport reference directory used by the header search so an
// opportunity can be created from a real airport target. Figures are
// approximate recent-year public statistics (annual passengers and aircraft
// movements) and are meant as a starting baseline, not verified governance
// data. Regions map to the app's region taxonomy (AMS, EMEA, APAC, NORAM,
// LATAM). traffic_year records the reference year of the figures.
const AIRPORT_DIRECTORY = [
  // NORAM
  { iata: "ATL", icao: "KATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", state: "Georgia", country: "United States", region: "NORAM", annual_passengers: 104650000, annual_movements: 707000, traffic_year: 2023 },
  { iata: "DFW", icao: "KDFW", name: "Dallas Fort Worth International", city: "Dallas", state: "Texas", country: "United States", region: "NORAM", annual_passengers: 81760000, annual_movements: 720000, traffic_year: 2023 },
  { iata: "DEN", icao: "KDEN", name: "Denver International", city: "Denver", state: "Colorado", country: "United States", region: "NORAM", annual_passengers: 77840000, annual_movements: 640000, traffic_year: 2023 },
  { iata: "LAX", icao: "KLAX", name: "Los Angeles International", city: "Los Angeles", state: "California", country: "United States", region: "NORAM", annual_passengers: 75050000, annual_movements: 636000, traffic_year: 2023 },
  { iata: "ORD", icao: "KORD", name: "O'Hare International", city: "Chicago", state: "Illinois", country: "United States", region: "NORAM", annual_passengers: 73890000, annual_movements: 722000, traffic_year: 2023 },
  { iata: "JFK", icao: "KJFK", name: "John F. Kennedy International", city: "New York", state: "New York", country: "United States", region: "NORAM", annual_passengers: 62470000, annual_movements: 462000, traffic_year: 2023 },
  { iata: "SFO", icao: "KSFO", name: "San Francisco International", city: "San Francisco", state: "California", country: "United States", region: "NORAM", annual_passengers: 50200000, annual_movements: 383000, traffic_year: 2023 },
  { iata: "SEA", icao: "KSEA", name: "Seattle-Tacoma International", city: "Seattle", state: "Washington", country: "United States", region: "NORAM", annual_passengers: 50870000, annual_movements: 428000, traffic_year: 2023 },
  { iata: "YYZ", icao: "CYYZ", name: "Toronto Pearson International", city: "Toronto", state: "Ontario", country: "Canada", region: "NORAM", annual_passengers: 44800000, annual_movements: 428000, traffic_year: 2023 },
  { iata: "YVR", icao: "CYVR", name: "Vancouver International", city: "Vancouver", state: "British Columbia", country: "Canada", region: "NORAM", annual_passengers: 24900000, annual_movements: 280000, traffic_year: 2023 },

  // EMEA
  { iata: "LHR", icao: "EGLL", name: "London Heathrow", city: "London", state: "England", country: "United Kingdom", region: "EMEA", annual_passengers: 79200000, annual_movements: 472000, traffic_year: 2023 },
  { iata: "LGW", icao: "EGKK", name: "London Gatwick", city: "London", state: "England", country: "United Kingdom", region: "EMEA", annual_passengers: 40900000, annual_movements: 256000, traffic_year: 2023 },
  { iata: "CDG", icao: "LFPG", name: "Paris Charles de Gaulle", city: "Paris", state: "Ile-de-France", country: "France", region: "EMEA", annual_passengers: 67400000, annual_movements: 480000, traffic_year: 2023 },
  { iata: "AMS", icao: "EHAM", name: "Amsterdam Schiphol", city: "Amsterdam", state: "North Holland", country: "Netherlands", region: "EMEA", annual_passengers: 61900000, annual_movements: 441000, traffic_year: 2023 },
  { iata: "FRA", icao: "EDDF", name: "Frankfurt Airport", city: "Frankfurt", state: "Hesse", country: "Germany", region: "EMEA", annual_passengers: 59400000, annual_movements: 453000, traffic_year: 2023 },
  { iata: "MUC", icao: "EDDM", name: "Munich Airport", city: "Munich", state: "Bavaria", country: "Germany", region: "EMEA", annual_passengers: 37000000, annual_movements: 344000, traffic_year: 2023 },
  { iata: "MAD", icao: "LEMD", name: "Adolfo Suarez Madrid-Barajas", city: "Madrid", state: "Community of Madrid", country: "Spain", region: "EMEA", annual_passengers: 60200000, annual_movements: 380000, traffic_year: 2023 },
  { iata: "BCN", icao: "LEBL", name: "Josep Tarradellas Barcelona-El Prat", city: "Barcelona", state: "Catalonia", country: "Spain", region: "EMEA", annual_passengers: 49900000, annual_movements: 324000, traffic_year: 2023 },
  { iata: "FCO", icao: "LIRF", name: "Leonardo da Vinci-Fiumicino", city: "Rome", state: "Lazio", country: "Italy", region: "EMEA", annual_passengers: 40500000, annual_movements: 300000, traffic_year: 2023 },
  { iata: "IST", icao: "LTFM", name: "Istanbul Airport", city: "Istanbul", state: "Istanbul", country: "Turkey", region: "EMEA", annual_passengers: 76000000, annual_movements: 500000, traffic_year: 2023 },
  { iata: "DXB", icao: "OMDB", name: "Dubai International", city: "Dubai", state: "Dubai", country: "United Arab Emirates", region: "EMEA", annual_passengers: 87000000, annual_movements: 416000, traffic_year: 2023 },
  { iata: "DOH", icao: "OTHH", name: "Hamad International", city: "Doha", state: "Doha", country: "Qatar", region: "EMEA", annual_passengers: 45900000, annual_movements: 233000, traffic_year: 2023 },
  { iata: "CAI", icao: "HECA", name: "Cairo International", city: "Cairo", state: "Cairo", country: "Egypt", region: "EMEA", annual_passengers: 30000000, annual_movements: 210000, traffic_year: 2023 },
  { iata: "JNB", icao: "FAOR", name: "O. R. Tambo International", city: "Johannesburg", state: "Gauteng", country: "South Africa", region: "EMEA", annual_passengers: 21000000, annual_movements: 190000, traffic_year: 2023 },

  // APAC
  { iata: "HND", icao: "RJTT", name: "Tokyo Haneda", city: "Tokyo", state: "Tokyo", country: "Japan", region: "APAC", annual_passengers: 78700000, annual_movements: 460000, traffic_year: 2023 },
  { iata: "NRT", icao: "RJAA", name: "Narita International", city: "Tokyo", state: "Chiba", country: "Japan", region: "APAC", annual_passengers: 35000000, annual_movements: 230000, traffic_year: 2023 },
  { iata: "PVG", icao: "ZSPD", name: "Shanghai Pudong International", city: "Shanghai", state: "Shanghai", country: "China", region: "APAC", annual_passengers: 54400000, annual_movements: 460000, traffic_year: 2023 },
  { iata: "PEK", icao: "ZBAA", name: "Beijing Capital International", city: "Beijing", state: "Beijing", country: "China", region: "APAC", annual_passengers: 52900000, annual_movements: 440000, traffic_year: 2023 },
  { iata: "HKG", icao: "VHHH", name: "Hong Kong International", city: "Hong Kong", state: "Hong Kong", country: "China", region: "APAC", annual_passengers: 40000000, annual_movements: 300000, traffic_year: 2023 },
  { iata: "SIN", icao: "WSSS", name: "Singapore Changi", city: "Singapore", state: "Singapore", country: "Singapore", region: "APAC", annual_passengers: 58900000, annual_movements: 351000, traffic_year: 2023 },
  { iata: "ICN", icao: "RKSI", name: "Incheon International", city: "Seoul", state: "Incheon", country: "South Korea", region: "APAC", annual_passengers: 56000000, annual_movements: 340000, traffic_year: 2023 },
  { iata: "BKK", icao: "VTBS", name: "Suvarnabhumi Airport", city: "Bangkok", state: "Samut Prakan", country: "Thailand", region: "APAC", annual_passengers: 51900000, annual_movements: 320000, traffic_year: 2023 },
  { iata: "KUL", icao: "WMKK", name: "Kuala Lumpur International", city: "Kuala Lumpur", state: "Selangor", country: "Malaysia", region: "APAC", annual_passengers: 47200000, annual_movements: 310000, traffic_year: 2023 },
  { iata: "CGK", icao: "WIII", name: "Soekarno-Hatta International", city: "Jakarta", state: "Banten", country: "Indonesia", region: "APAC", annual_passengers: 54000000, annual_movements: 380000, traffic_year: 2023 },
  { iata: "DEL", icao: "VIDP", name: "Indira Gandhi International", city: "Delhi", state: "Delhi", country: "India", region: "APAC", annual_passengers: 72200000, annual_movements: 480000, traffic_year: 2023 },
  { iata: "BOM", icao: "VABB", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", state: "Maharashtra", country: "India", region: "APAC", annual_passengers: 52000000, annual_movements: 330000, traffic_year: 2023 },
  { iata: "SYD", icao: "YSSY", name: "Sydney Kingsford Smith", city: "Sydney", state: "New South Wales", country: "Australia", region: "APAC", annual_passengers: 40000000, annual_movements: 320000, traffic_year: 2023 },
  { iata: "MEL", icao: "YMML", name: "Melbourne Airport", city: "Melbourne", state: "Victoria", country: "Australia", region: "APAC", annual_passengers: 35000000, annual_movements: 240000, traffic_year: 2023 },

  // LATAM
  { iata: "GRU", icao: "SBGR", name: "Sao Paulo/Guarulhos International", city: "Guarulhos", state: "Sao Paulo", country: "Brazil", region: "LATAM", annual_passengers: 43000000, annual_movements: 280000, traffic_year: 2023 },
  { iata: "GIG", icao: "SBGL", name: "Rio de Janeiro/Galeao International", city: "Rio de Janeiro", state: "Rio de Janeiro", country: "Brazil", region: "LATAM", annual_passengers: 13000000, annual_movements: 120000, traffic_year: 2023 },
  { iata: "BSB", icao: "SBBR", name: "Brasilia International", city: "Brasilia", state: "Federal District", country: "Brazil", region: "LATAM", annual_passengers: 16000000, annual_movements: 140000, traffic_year: 2023 },
  { iata: "CGH", icao: "SBSP", name: "Sao Paulo/Congonhas", city: "Sao Paulo", state: "Sao Paulo", country: "Brazil", region: "LATAM", annual_passengers: 21000000, annual_movements: 200000, traffic_year: 2023 },
  { iata: "MEX", icao: "MMMX", name: "Mexico City International (Benito Juarez)", city: "Mexico City", state: "Mexico City", country: "Mexico", region: "LATAM", annual_passengers: 48400000, annual_movements: 450000, traffic_year: 2023 },
  { iata: "CUN", icao: "MMUN", name: "Cancun International", city: "Cancun", state: "Quintana Roo", country: "Mexico", region: "LATAM", annual_passengers: 30000000, annual_movements: 210000, traffic_year: 2023 },
  { iata: "BOG", icao: "SKBO", name: "El Dorado International", city: "Bogota", state: "Cundinamarca", country: "Colombia", region: "LATAM", annual_passengers: 35000000, annual_movements: 330000, traffic_year: 2023 },
  { iata: "SCL", icao: "SCEL", name: "Arturo Merino Benitez International", city: "Santiago", state: "Santiago Metropolitan", country: "Chile", region: "LATAM", annual_passengers: 26000000, annual_movements: 210000, traffic_year: 2023 },
  { iata: "LIM", icao: "SPJC", name: "Jorge Chavez International", city: "Lima", state: "Callao", country: "Peru", region: "LATAM", annual_passengers: 24000000, annual_movements: 200000, traffic_year: 2023 },
  { iata: "EZE", icao: "SAEZ", name: "Ministro Pistarini International (Ezeiza)", city: "Buenos Aires", state: "Buenos Aires", country: "Argentina", region: "LATAM", annual_passengers: 11000000, annual_movements: 100000, traffic_year: 2023 },
  { iata: "PTY", icao: "MPTO", name: "Tocumen International", city: "Panama City", state: "Panama", country: "Panama", region: "LATAM", annual_passengers: 18000000, annual_movements: 160000, traffic_year: 2023 },
];

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Ranks directory matches for a query: exact code first, then code/name
// prefix, then substring across name, city, country, and codes.
function searchAirportDirectory(query, limit = 6) {
  const term = normalizeSearchText(query).trim();
  if (term.length < 2) return [];
  const scored = [];
  AIRPORT_DIRECTORY.forEach((airport) => {
    const iata = airport.iata.toLowerCase();
    const icao = airport.icao.toLowerCase();
    const name = normalizeSearchText(airport.name);
    const city = normalizeSearchText(airport.city);
    const country = normalizeSearchText(airport.country);
    let score = 0;
    if (iata === term || icao === term) score = 100;
    else if (iata.startsWith(term) || icao.startsWith(term)) score = 80;
    else if (name.startsWith(term) || city.startsWith(term)) score = 60;
    else if (name.includes(term) || city.includes(term)) score = 40;
    else if (country.includes(term) || icao.includes(term) || iata.includes(term)) score = 20;
    if (score > 0) scored.push({ airport, score });
  });
  return scored
    .sort((a, b) => b.score - a.score || b.airport.annual_passengers - a.airport.annual_passengers)
    .slice(0, limit)
    .map((entry) => entry.airport);
}

function airportByCode(code) {
  const term = String(code || "").trim().toUpperCase();
  if (!term) return null;
  return AIRPORT_DIRECTORY.find((airport) => airport.iata === term || airport.icao === term) || null;
}

export { AIRPORT_DIRECTORY, searchAirportDirectory, airportByCode, normalizeSearchText };
