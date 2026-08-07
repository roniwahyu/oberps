// Utilities for RPS tags management
// Tags are stored as comma-separated string in the database (e.g. "wajib,semester-ganjil,proyek")

/**
 * Parse a comma-separated tags string into an array of trimmed tags.
 */
export function parseTags(tagsStr: string | null | undefined): string[] {
  if (!tagsStr) return [];
  return tagsStr
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * Serialize an array of tags into a comma-separated string.
 */
export function serializeTags(tags: string[]): string {
  return tags.map((t) => t.trim()).filter((t) => t.length > 0).join(",");
}

/**
 * Add a tag to a tags string (returns new string).
 * Prevents duplicates (case-insensitive).
 */
export function addTag(tagsStr: string, tag: string): string {
  const tags = parseTags(tagsStr);
  const normalized = tag.trim();
  if (!normalized) return tagsStr;
  if (tags.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
    return tagsStr; // already exists
  }
  tags.push(normalized);
  return serializeTags(tags);
}

/**
 * Remove a tag from a tags string (returns new string).
 */
export function removeTag(tagsStr: string, tag: string): string {
  const tags = parseTags(tagsStr);
  const filtered = tags.filter(
    (t) => t.toLowerCase() !== tag.toLowerCase()
  );
  return serializeTags(filtered);
}

/**
 * Suggested common tags for RPS categorization.
 */
export const SUGGESTED_TAGS = [
  "Wajib",
  "Pilihan",
  "Semester Ganjil",
  "Semester Genap",
  "Proyek",
  "Praktikum",
  "Teori",
  "Capstone",
  "Kerja Praktik",
  "Riset",
];
