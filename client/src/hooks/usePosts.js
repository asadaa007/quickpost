import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export function usePosts({ category, page = 1, limit = 12 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (category) params.category = category;
      const res = await api.get("/posts", { params });
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to load posts");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [category, page, limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { data, loading, error, refetch: fetchPosts };
}
