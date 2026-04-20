/**
 * Extract Amazon ASIN from common URL shapes (US and regional TLDs).
 * Ready for future Product Advertising API / automation workflows.
 */
export function extractAsinFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    if (!host.includes("amazon")) return null;

    const path = u.pathname;
    const dp = path.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (dp) return dp[1].toUpperCase();

    const asinQs = u.searchParams.get("asin");
    if (asinQs && /^[A-Z0-9]{10}$/i.test(asinQs)) return asinQs.toUpperCase();

    return null;
  } catch {
    return null;
  }
}

/** Shape product payload for future API fill (ASIN + link preserved). */
export function normalizeProductForAutomation(product) {
  return {
    ...product,
    asin: extractAsinFromUrl(product?.affiliateLink || "") || undefined,
  };
}
