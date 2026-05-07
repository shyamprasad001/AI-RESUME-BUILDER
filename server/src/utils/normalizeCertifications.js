// ============================================================
// normalizeCertifications.js
// ============================================================
// Converts ANY user-supplied certifications input into a safe
// array of { name, issuer, date, link } objects that match the
// Mongoose certificationSchema — without ever throwing.
//
// Supported input formats (all of them work):
//   • Array of proper objects  → passed through (fields sanitized)
//   • Array of strings         → each string is parsed
//   • A single string          → split by newline then parsed
//   • Null / undefined / ""    → returns []
//   • Anything else            → returns []
// ============================================================

// ── Helpers ──────────────────────────────────────────────────

/** Extract the first URL found in a string (or return ""). */
const extractUrl = (str) => {
  const match = str.match(/https?:\/\/[^\s]+/i);
  return match ? match[0].trim() : "";
};

/** Extract a 4-digit year from a string (or return ""). */
const extractYear = (str) => {
  const match = str.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : "";
};

/**
 * Separators we try when splitting "issuer — name" or "name | issuer" etc.
 * Ordered from most specific to least specific.
 */
const SEPARATORS = [
  /\s+[—–]\s+/,          // em-dash / en-dash   "APSSDC — Django …"
  /\s*\|\s*/,             // pipe                "Stanford | CS101"
  /\s*[-–]\s+(?=[A-Z])/, // hyphen before capital "AWS - Solutions …"
  /\s*:\s+/,              // colon               "Coursera: Machine …"
];

/**
 * Given a raw string entry, return { name, issuer, date, link }.
 * Never throws.
 */
const parseCertificationString = (raw) => {
  try {
    // Remove the URL so it doesn't pollute the name/issuer split
    const link = extractUrl(raw);
    const date = extractYear(raw);

    // Strip URL and year from the text we'll try to split
    let text = raw
      .replace(/https?:\/\/[^\s]+/gi, "")
      .replace(/\b(19|20)\d{2}\b/, "")
      .trim()
      .replace(/\s{2,}/g, " "); // collapse extra spaces

    // Try each separator
    for (const sep of SEPARATORS) {
      const parts = text.split(sep).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        // Heuristic: issuer is usually the shorter / first part
        // "APSSDC — Django Web Dev"  → issuer=APSSDC, name=Django Web Dev
        const [first, ...rest] = parts;
        return {
          name: rest.join(" ").trim() || first,
          issuer: first || "Unknown",
          date,
          link,
        };
      }
    }

    // No separator found → treat the whole string as the name
    return {
      name: text || raw.trim(),
      issuer: "Unknown",
      date,
      link,
    };
  } catch {
    // Last-resort fallback — never let this function throw
    return { name: String(raw).trim(), issuer: "Unknown", date: "", link: "" };
  }
};

/**
 * Sanitize an object that is already cert-shaped but may have extra /
 * missing fields.  Ensures every required field exists as a string.
 */
const sanitizeCertObject = (obj) => ({
  name: String(obj.name ?? "").trim(),
  issuer: String(obj.issuer ?? "Unknown").trim() || "Unknown",
  date: String(obj.date ?? "").trim(),
  link: String(obj.link ?? "").trim(),
});

// ── Main export ───────────────────────────────────────────────

/**
 * normalizeCertifications(input)
 *
 * @param {*} input - Anything the client / AI may send
 * @returns {Array<{name:string, issuer:string, date:string, link:string}>}
 */
const normalizeCertifications = (input) => {
  try {
    // ── Null / empty guard ──────────────────────────────────
    if (input == null || input === "") return [];

    // ── Already an array ────────────────────────────────────
    if (Array.isArray(input)) {
      return input
        .flatMap((item) => {
          if (item == null) return [];

          // Proper object with at least a name field → sanitize
          if (typeof item === "object" && !Array.isArray(item)) {
            // If every value is empty skip the entry
            const { name = "", issuer = "", date = "", link = "" } = item;
            if (!name && !issuer && !date && !link) return [];
            return [sanitizeCertObject(item)];
          }

          // String inside array → parse it
          if (typeof item === "string") {
            const trimmed = item.trim();
            if (!trimmed) return [];
            return [parseCertificationString(trimmed)];
          }

          return []; // unknown type — skip silently
        });
    }

    // ── Single string (possibly multiline) ──────────────────
    if (typeof input === "string") {
      return input
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map(parseCertificationString);
    }

    // ── Anything else (number, boolean, …) ──────────────────
    return [];
  } catch {
    // Absolute last resort — return empty array, never crash
    return [];
  }
};

export default normalizeCertifications;
