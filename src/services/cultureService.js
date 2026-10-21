import statesData from "../data/states/index.js";

/* =========================
   HELPERS
========================= */

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function resolveState(state) {
  if (!state) return null;

  if (typeof state === "object") {
    if (state.id) {
      return (
        statesData.find(
          (item) => normalize(item.id) === normalize(state.id)
        ) || null
      );
    }

    if (state.name) {
      return (
        statesData.find(
          (item) => normalize(item.name) === normalize(state.name)
        ) || null
      );
    }

    return null;
  }

  const value = normalize(state);

  return (
    statesData.find(
      (item) =>
        normalize(item.id) === value ||
        normalize(item.name) === value
    ) || null
  );
}

function addStateMeta(items, state) {
  return (items || []).map((item) => ({
    ...item,
    state: state.name,
    stateId: state.id
  }));
}

function flattenCategory(category) {
  return statesData.flatMap((state) =>
    addStateMeta(state[category], state)
  );
}

/* =========================
   STATES
========================= */

export function getAllStates() {
  return statesData;
}

export function getStateById(id) {
  return resolveState(id);
}

export function getStateHeritage(state) {
  return getHeritageByState(state);
}

/* =========================
   HERITAGE
========================= */

export function getAllHeritage() {
  return flattenCategory("heritage");
}

export function getHeritageById(id) {
  return (
    getAllHeritage().find(
      (item) => normalize(item.id) === normalize(id)
    ) || null
  );
}

export function getHeritageByState(state) {
  const resolved = resolveState(state);

  return resolved
    ? addStateMeta(resolved.heritage, resolved)
    : [];
}

export function getHeritageByCategory(category) {
  const value = normalize(category);

  return getAllHeritage().filter(
    (item) => normalize(item.category) === value
  );
}

export function getHeritageByEra(era) {
  const value = normalize(era);

  return getAllHeritage().filter(
    (item) =>
      normalize(item.era) === value ||
      normalize(item.period) === value
  );
}

export function getUNESCOHeritage() {
  return getAllHeritage().filter((item) => item.unesco);
}

/* =========================
   CATEGORY HELPERS
========================= */

function getAll(category) {
  return flattenCategory(category);
}

function getByState(category, state) {
  const resolved = resolveState(state);

  return resolved
    ? addStateMeta(resolved[category], resolved)
    : [];
}

/* =========================
   TRADITIONS
========================= */

export function getAllTraditions() {
  return getAll("traditions");
}

export function getTraditionsByState(state) {
  return getByState("traditions", state);
}

/* =========================
   FESTIVALS
========================= */

export function getAllFestivals() {
  return getAll("festivals");
}

export function getFestivalsByState(state) {
  return getByState("festivals", state);
}

/* =========================
   ARTS
========================= */

export function getAllArts() {
  return getAll("arts");
}

export function getArtsByState(state) {
  return getByState("arts", state);
}

/* =========================
   CRAFTS
========================= */

export function getAllCrafts() {
  return getAll("crafts");
}

export function getCraftsByState(state) {
  return getByState("crafts", state);
}

/* =========================
   TEXTILES
========================= */

export function getAllTextiles() {
  return getAll("textiles");
}

export function getTextilesByState(state) {
  return getByState("textiles", state);
}

/* =========================
   MUSIC
========================= */

export function getAllMusic() {
  return getAll("music");
}

export function getMusicByState(state) {
  return getByState("music", state);
}

/* =========================
   INSTRUMENTS
========================= */

export function getAllInstruments() {
  return getAll("instruments");
}

export function getInstrumentsByState(state) {
  return getByState("instruments", state);
}

/* =========================
   CUISINE
========================= */

export function getAllCuisine() {
  return getAll("cuisine");
}

export function getCuisineByState(state) {
  return getByState("cuisine", state);
}

/* =========================
   COMMUNITIES
========================= */

export function getAllCommunities() {
  return getAll("communities");
}

export function getCommunitiesByState(state) {
  return getByState("communities", state);
}

/* =========================
   CULTURAL PLACES
========================= */

export function getAllCulturalPlaces() {
  return getAll("culturalPlaces");
}

export function getCulturalPlacesByState(state) {
  return getByState("culturalPlaces", state);
}

/* =========================
   INSTITUTIONS
========================= */

export function getAllInstitutions() {
  return getAll("institutions");
}

export function getInstitutionsByState(state) {
  return getByState("institutions", state);
}

/* =========================
   LANGUAGES
========================= */

export function getLanguagesByState(state) {
  const resolved = resolveState(state);

  return resolved?.languages || [];
}

/* =========================
   LITERATURE
========================= */

export function getAllLiterature() {
  return getAll("literature");
}

export function getLiteratureByState(state) {
  return getByState("literature", state);
}

/* =========================
   KNOWLEDGE HERITAGE
========================= */

export function getAllKnowledgeHeritage() {
  return getAll("knowledgeHeritage");
}

export function getKnowledgeHeritageByState(state) {
  return getByState("knowledgeHeritage", state);
}

/* =========================
   CULTURE BY STATE
========================= */

export function getCultureByState(state) {
  const resolved = resolveState(state);

  if (!resolved) {
    return {
      state: null,
      heritage: [],
      festivals: [],
      traditions: [],
      music: [],
      instruments: [],
      arts: [],
      crafts: [],
      textiles: [],
      cuisine: [],
      communities: [],
      culturalPlaces: [],
      institutions: [],
      languages: [],
      literature: [],
      knowledgeHeritage: []
    };
  }

  return {
    state: resolved,
    heritage: getHeritageByState(resolved),
    festivals: getFestivalsByState(resolved),
    traditions: getTraditionsByState(resolved),
    music: getMusicByState(resolved),
    instruments: getInstrumentsByState(resolved),
    arts: getArtsByState(resolved),
    crafts: getCraftsByState(resolved),
    textiles: getTextilesByState(resolved),
    cuisine: getCuisineByState(resolved),
    communities: getCommunitiesByState(resolved),
    culturalPlaces: getCulturalPlacesByState(resolved),
    institutions: getInstitutionsByState(resolved),
    languages: getLanguagesByState(resolved),
    literature: getLiteratureByState(resolved),
    knowledgeHeritage: getKnowledgeHeritageByState(resolved)
  };
}

/* =========================
   SEARCH
========================= */

function searchableText(item) {
  return [
    item.name,
    item.state,
    item.stateId,
    item.region,
    item.location,
    item.city,
    item.category,
    item.type,
    item.period,
    item.era,
    item.unesco,
    item.description,
    item.significance
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function searchItems(items, query) {
  const term = normalize(query);

  return items.filter((item) =>
    searchableText(item).includes(term)
  );
}

export function searchCulture(query) {
  return {
    heritage: searchItems(getAllHeritage(), query),
    traditions: searchItems(getAllTraditions(), query),
    festivals: searchItems(getAllFestivals(), query),
    arts: searchItems(getAllArts(), query),
    crafts: searchItems(getAllCrafts(), query)
  };
}

/* =========================
   RELATED CONTENT
========================= */

export function getRelatedContent(item) {
  if (!item) {
    return {
      heritage: [],
      traditions: [],
      festivals: [],
      arts: [],
      crafts: [],
      music: [],
      cuisine: []
    };
  }

  const state = resolveState(item.stateId || item.state);

  if (!state) {
    return {
      heritage: [],
      traditions: [],
      festivals: [],
      arts: [],
      crafts: [],
      music: [],
      cuisine: []
    };
  }

  return {
    heritage: getHeritageByState(state).filter(
      (entry) => entry.id !== item.id
    ),
    traditions: getTraditionsByState(state),
    festivals: getFestivalsByState(state),
    arts: getArtsByState(state),
    crafts: getCraftsByState(state),
    music: getMusicByState(state),
    cuisine: getCuisineByState(state)
  };
}

/* =========================
   STATS
========================= */

export function getCultureStats() {
  return {
    states: statesData.length,
    heritageSites: getAllHeritage().length,
    traditions: getAllTraditions().length,
    festivals: getAllFestivals().length,
    arts: getAllArts().length,
    crafts: getAllCrafts().length,
    textiles: getAllTextiles().length,
    music: getAllMusic().length,
    instruments: getAllInstruments().length,
    cuisine: getAllCuisine().length,
    communities: getAllCommunities().length,
    culturalPlaces: getAllCulturalPlaces().length,
    institutions: getAllInstitutions().length,
    literature: getAllLiterature().length,
    knowledgeHeritage: getAllKnowledgeHeritage().length
  };
}

export function resolveStateName(state) {
  const resolved = resolveState(state);

  return resolved
    ? resolved.name
    : String(state ?? "").trim();
}

export { resolveState };