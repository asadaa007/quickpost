import { useEffect, useState } from "react";
import { listPosts } from "../services/posts";
import { useCategories } from "./useCategories";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const POOL_LIMIT = 40;

/** Deterministic index from rotation slot (same for all visitors in the same 3-day window). */
function pickStableIndex(slot, length) {
  if (length <= 0) return 0;
  const x = (Math.imul(slot, 1103515245) + 12345 + length) >>> 0;
  return x % length;
}

/**
 * Homepage data: single featured post (rotates every 3 days within a pool), total count, categories.
 */
export function useHomeData() {
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFeaturedLoading(true);
      setError(null);
      try {
        const res = await listPosts({ page: 1, limit: POOL_LIMIT });
        if (cancelled) return;
        setTotalPosts(typeof res.total === "number" ? res.total : 0);

        const pool = (res.items || []).filter((p) => p?.slug);
        if (pool.length === 0) {
          setFeatured([]);
          return;
        }

        const slot = Math.floor(Date.now() / THREE_DAYS_MS);
        const idx = pickStableIndex(slot, pool.length);
        const post = pool[idx];
        setFeatured([{ post, badge: "Featured" }]);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || "Failed to load highlights");
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    categories,
    categoriesLoading,
    categoriesError,
    featured,
    featuredLoading,
    totalPosts,
    monthlyReadersLabel: "12k+",
    error,
  };
}
