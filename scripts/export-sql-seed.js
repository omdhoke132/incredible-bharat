import { writeFile } from "node:fs/promises";
import states from "../src/data/states/index.js";

const OUTPUT_PATH = new URL("../supabase/seed.generated.sql", import.meta.url);

const CATEGORY_KEYS = [
  "heritage",
  "traditions",
  "festivals",
  "arts",
  "crafts",
  "textiles",
  "music",
  "instruments",
  "cuisine",
  "communities",
  "culturalPlaces",
  "institutions",
  "languages",
  "literature",
  "knowledgeHeritage",
];

function sqlText(value) {
  if (value === null || value === undefined) return "NULL";
  return "'" + String(value).replaceAll("'", "''") + "'";
}

function sqlJson(value) {
  return sqlText(JSON.stringify(value ?? {})) + "::jsonb";
}

function sqlTextArray(value) {
  const values = Array.isArray(value)
    ? value.filter((entry) => typeof entry === "string" || typeof entry === "number")
      .map((entry) => String(entry).trim())
      .filter(Boolean)
    : [];
  return values.length
    ? "ARRAY[" + values.map(sqlText).join(", ") + "]::text[]"
    : "ARRAY[]::text[]";
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function asTextArray(value) {
  if (Array.isArray(value)) return value;
  return typeof value === "string" && value.trim() ? [value.trim()] : [];
}

function normalizeSource(raw) {
  if (typeof raw === "string") {
    const url = raw.trim();
    if (!/^https?:\/\//i.test(url)) return null;
    return { title: url, url };
  }
  if (!raw || typeof raw !== "object") return null;

  const url = typeof raw.url === "string"
    ? raw.url.trim()
    : typeof raw.href === "string" ? raw.href.trim() : "";
  if (!/^https?:\/\//i.test(url)) return null;

  const accessedAt = raw.accessedAt || raw.accessed_at || raw.checkedAt || raw.checked_at;
  return {
    title: String(raw.title || raw.name || raw.label || url).trim(),
    url,
    publisher: raw.publisher || raw.organization || null,
    sourceType: raw.type || raw.sourceType || raw.source_type || null,
    license: raw.license || null,
    licenseUrl: raw.licenseUrl || raw.license_url || null,
    accessedAt: /^\d{4}-\d{2}-\d{2}$/.test(String(accessedAt || "")) ? accessedAt : null,
    citationType: raw.citationType || raw.citation_type || "supports",
    citationNote: raw.note || raw.citationNote || raw.citation_note || null,
    checkedAt: /^\d{4}-\d{2}-\d{2}$/.test(String(accessedAt || "")) ? accessedAt : null,
  };
}

function normalizeUnesco(value) {
  if (value === true) return "UNESCO World Heritage";
  if (value === false || value == null) return "none";
  const text = String(value).trim();
  if (!text || ["none", "false", "no", "not-listed", "n/a", "na", "null"].includes(text.toLowerCase())) {
    return "none";
  }
  if (["world heritage", "unesco world heritage", "world-heritage"].includes(text.toLowerCase())) {
    return "UNESCO World Heritage";
  }
  return text;
}

function normalizeItem(raw, state, categoryKey, index) {
  const item = typeof raw === "string"
    ? { name: raw, description: raw + " is listed among the languages associated with " + state.name + ". Detailed language notes are being curated." }
    : (raw && typeof raw === "object" ? raw : {});

  const name = String(item.name || item.title || "Untitled cultural entry").trim();
  const rawDescription = typeof item.description === "string" ? item.description.trim() : "";
  const rawSignificance = typeof item.significance === "string" ? item.significance.trim() : "";
  const description = rawDescription || rawSignificance ||
    "Additional details for this entry are being curated and verified.";
  const generatedId = categoryKey === "languages"
    ? slugify(name)
    : state.id + "-" + categoryKey + "-" + slugify(name);
  const legacyId = String(item.id || generatedId || (categoryKey + "-" + (index + 1)));
  const recordKey = state.id + ":" + categoryKey + ":" + legacyId;

  const validStatuses = new Set(["needs_review", "partially_verified", "verified", "rejected"]);
  const requestedStatus = String(item.verificationStatus || item.verification_status || "needs_review");
  const verificationStatus = validStatuses.has(requestedStatus) ? requestedStatus : "needs_review";

  const rawSources = [
    ...asTextArray(item.sources),
    ...asTextArray(item.citations),
    ...asTextArray(item.references),
  ];
  const sources = rawSources.map(normalizeSource).filter(Boolean);

  return {
    raw: item,
    state,
    categoryKey,
    name,
    legacyId,
    recordKey,
    region: item.region || state.region || null,
    location: item.location || null,
    city: item.city || null,
    period: item.period || null,
    era: item.era || null,
    type: item.type || null,
    category: item.category || null,
    shortDescription: item.shortDescription || item.short_description || null,
    description,
    significance: rawSignificance || rawDescription || null,
    unescoStatus: normalizeUnesco(item.unesco ?? item.unescoStatus ?? item.unesco_status),
    icon: item.icon || null,
    imageUrl: item.imageUrl || item.image_url || item.image || null,
    tags: asTextArray(item.tags),
    alternateNames: asTextArray(item.alternateNames || item.alternate_names),
    descriptionStatus: rawDescription ? "provided" : rawSignificance ? "derived-from-significance" : "needs-curation",
    verificationStatus,
    sources,
  };
}

const records = [];
const allSources = new Map();
const stateSourceLinks = [];
const recordSourceLinks = [];

function rememberSource(raw) {
  const source = normalizeSource(raw);
  if (!source) return null;
  const existing = allSources.get(source.url);
  if (existing) {
    for (const key of ["publisher", "sourceType", "license", "licenseUrl", "accessedAt"]) {
      if (!existing[key] && source[key]) existing[key] = source[key];
    }
    return existing;
  }
  allSources.set(source.url, source);
  return source;
}

for (const state of states) {
  for (const source of Array.isArray(state.sources) ? state.sources : []) {
    const normalized = rememberSource(source);
    if (normalized) stateSourceLinks.push({ stateId: state.id, url: normalized.url });
  }

  for (const categoryKey of CATEGORY_KEYS) {
    const rawItems = Array.isArray(state[categoryKey]) ? state[categoryKey] : [];
    rawItems.forEach((raw, index) => {
      const record = normalizeItem(raw, state, categoryKey, index);
      records.push(record);
      for (const source of record.sources) {
        const normalized = rememberSource(source);
        if (normalized) {
          recordSourceLinks.push({
            recordKey: record.recordKey,
            url: normalized.url,
            citationType: source.citationType,
            citationNote: source.citationNote,
            checkedAt: source.checkedAt,
          });
        }
      }
    });
  }
}

const statements = [
  "-- Generated by scripts/export-sql-seed.js from src/data/states/.",
  "-- Re-run the exporter after updating the source datasets.",
  "-- Imported records are marked needs_review unless the source data explicitly sets a status.",
  "BEGIN;",
];

for (const state of states) {
  statements.push(
    "INSERT INTO public.states (id, name, region, description) VALUES (" +
    [sqlText(state.id), sqlText(state.name), sqlText(state.region), sqlText(state.description || "")].join(", ") +
    ") ON CONFLICT (id) DO UPDATE SET " +
    "name = EXCLUDED.name, region = EXCLUDED.region, description = EXCLUDED.description, updated_at = now();"
  );
}

for (const source of allSources.values()) {
  statements.push(
    "INSERT INTO public.source_references (title, url, publisher, source_type, license, license_url, accessed_at) VALUES (" +
    [
      sqlText(source.title), sqlText(source.url), sqlText(source.publisher),
      sqlText(source.sourceType), sqlText(source.license), sqlText(source.licenseUrl),
      source.accessedAt ? sqlText(source.accessedAt) : "NULL",
    ].join(", ") +
    ") ON CONFLICT (url) DO UPDATE SET " +
    "title = EXCLUDED.title, " +
    "publisher = COALESCE(EXCLUDED.publisher, public.source_references.publisher), " +
    "source_type = COALESCE(EXCLUDED.source_type, public.source_references.source_type), " +
    "license = COALESCE(EXCLUDED.license, public.source_references.license), " +
    "license_url = COALESCE(EXCLUDED.license_url, public.source_references.license_url), " +
    "accessed_at = COALESCE(EXCLUDED.accessed_at, public.source_references.accessed_at);"
  );
}

for (const record of records) {
  statements.push(
    "INSERT INTO public.cultural_records (" +
      "record_key, state_id, category_key, legacy_id, name, region, location, city, period, era, " +
      "type, category, short_description, description, significance, unesco_status, icon, image_url, " +
      "tags, alternate_names, description_status, verification_status, raw_data" +
    ") VALUES (" +
      [
        sqlText(record.recordKey), sqlText(record.state.id), sqlText(record.categoryKey),
        sqlText(record.legacyId), sqlText(record.name), sqlText(record.region), sqlText(record.location),
        sqlText(record.city), sqlText(record.period), sqlText(record.era), sqlText(record.type),
        sqlText(record.category), sqlText(record.shortDescription), sqlText(record.description),
        sqlText(record.significance), sqlText(record.unescoStatus), sqlText(record.icon),
        sqlText(record.imageUrl), sqlTextArray(record.tags), sqlTextArray(record.alternateNames),
        sqlText(record.descriptionStatus), sqlText(record.verificationStatus), sqlJson(record.raw),
      ].join(", ") +
    ") ON CONFLICT (record_key) DO UPDATE SET " +
      "state_id = EXCLUDED.state_id, category_key = EXCLUDED.category_key, legacy_id = EXCLUDED.legacy_id, " +
      "name = EXCLUDED.name, region = EXCLUDED.region, location = EXCLUDED.location, city = EXCLUDED.city, " +
      "period = EXCLUDED.period, era = EXCLUDED.era, type = EXCLUDED.type, category = EXCLUDED.category, " +
      "short_description = EXCLUDED.short_description, description = EXCLUDED.description, " +
      "significance = EXCLUDED.significance, unesco_status = EXCLUDED.unesco_status, icon = EXCLUDED.icon, " +
      "image_url = EXCLUDED.image_url, tags = EXCLUDED.tags, alternate_names = EXCLUDED.alternate_names, " +
      "description_status = EXCLUDED.description_status, verification_status = EXCLUDED.verification_status, " +
      "raw_data = EXCLUDED.raw_data, updated_at = now();"
  );
}

for (const link of stateSourceLinks) {
  statements.push(
    "INSERT INTO public.state_source_links (state_id, source_id) " +
    "SELECT " + sqlText(link.stateId) + ", id FROM public.source_references WHERE url = " + sqlText(link.url) +
    " ON CONFLICT DO NOTHING;"
  );
}

for (const link of recordSourceLinks) {
  statements.push(
    "INSERT INTO public.cultural_record_source_links (record_key, source_id, citation_type, citation_note, checked_at) " +
    "SELECT " + [
      sqlText(link.recordKey), "id", sqlText(link.citationType || "supports"),
      sqlText(link.citationNote), link.checkedAt ? sqlText(link.checkedAt) : "NULL",
    ].join(", ") +
    " FROM public.source_references WHERE url = " + sqlText(link.url) +
    " ON CONFLICT (record_key, source_id) DO UPDATE SET " +
    "citation_type = EXCLUDED.citation_type, citation_note = EXCLUDED.citation_note, checked_at = EXCLUDED.checked_at;"
  );
}

statements.push("COMMIT;", "");
await writeFile(OUTPUT_PATH, statements.join("\n"), "utf8");

console.log("Exported SQL seed:", OUTPUT_PATH.pathname);
console.log("States:", states.length);
console.log("Cultural records:", records.length);
console.log("Unique reference links:", allSources.size);
console.log("Note: regional sources are not automatically treated as item-level citations.");
