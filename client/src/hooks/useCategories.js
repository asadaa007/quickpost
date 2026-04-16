import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export function useCategories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/categories");
      setData(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to load categories");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { data, loading, error, refetch: fetchCategories };
}
