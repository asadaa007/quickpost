export function stripMarkdown(md = "") {
  return md
    .replace(/```[\s\S]*?```/g, "")       // fenced code blocks
    .replace(/`[^`]+`/g, "")              // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "")      // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
    .replace(/^#{1,6}\s+/gm, "")         // headings
    .replace(/(\*\*|__)(.*?)\1/g, "$2")  // bold
    .replace(/(\*|_)(.*?)\1/g, "$2")     // italic
    .replace(/^[-*+]\s+/gm, "")         // unordered list bullets
    .replace(/^\d+\.\s+/gm, "")          // ordered list numbers
    .replace(/^>\s+/gm, "")              // blockquotes
    .replace(/[-]{3,}/g, "")             // horizontal rules
    .replace(/\n{2,}/g, " ")             // multiple newlines → space
    .trim();
}
