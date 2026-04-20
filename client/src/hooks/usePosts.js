import { useEffect, useState } from "react";
import { listPosts } from "../services/posts";

/**
 * @param {object} opts
 * @param {string} [opts.category]
 * @param {string} [opts.tag]
 * @param {string} [opts.q]
 * @param {"latest"|"views"|"oldest"} [opts.sort]
 * @param {number} [opts.page]
 * @param {number} [opts.limit]
 */
export function usePosts({ category, tag, q, sort = "latest", page = 1, limit = 12 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, limit, sort, signal: controller.signal };
        if (category && String(category).trim()) params.category = String(category).trim();
        if (tag && String(tag).trim()) params.tag = String(tag).trim();
        if (q && String(q).trim()) params.q = String(q).trim();
        const res = await listPosts(params);
        if (!cancelled) setData(res);
      } catch (e) {
        if (e.name === "CanceledError" || e.name === "AbortError" || e.code === "ERR_CANCELED") return;
        if (!cancelled) {
          setError(e.response?.data?.message || e.message || "Failed to load posts");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [category, tag, q, sort, page, limit]);

  return { data, loading, error };
}
