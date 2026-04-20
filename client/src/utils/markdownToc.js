import { slugify } from "./slugify";

/** Matches extractMarkdownToc / rendered heading IDs (duplicate-safe). */
export function createHeadingIdResolver() {
  const used = new Map();
  return (rawText) => {
    const text = String(rawText || "")
      .trim()
      .replace(/\s+#+\s*$/, "");
    if (!text) return "";
    let id = slugify(text);
    const n = (used.get(id) || 0) + 1;
    used.set(id, n);
    if (n > 1) id = `${id}-${n}`;
    return id;
  };
}

/**
 * Extract ## / ### headings from markdown for table of contents (skip # title).
 */
export function extractMarkdownToc(markdown) {
  if (!markdown || typeof markdown !== "string") return [];
  const lines = markdown.split(/\r?\n/);
  const items = [];
  const resolveId = createHeadingIdResolver();

  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].trim().replace(/\s+#+\s*$/, "");
    if (!text) continue;
    const id = resolveId(text);
    if (!id) continue;
    items.push({ id, level, text });
  }
  return items;
}
