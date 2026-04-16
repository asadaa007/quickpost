import { useCallback, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { api } from "../api/client";
import { BlogCard } from "../components/blog/BlogCard";
import { BlogCardSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { useDebounce } from "../hooks/useDebounce";

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Debounce the input so we update URL (and trigger fetch) 300ms after typing stops
  const debouncedInput = useDebounce(inputVal, 300);

  useEffect(() => {
    const trimmed = debouncedInput.trim();
    if (trimmed !== query) {
      if (trimmed) {
        setSearchParams({ q: trimmed }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  const fetchResults = useCallback(async (q, signal) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/posts", { params: { q, limit: 24 }, signal });
      setResults(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchResults(query, controller.signal);
    return () => controller.abort();
  }, [query, fetchResults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputVal.trim();
    if (q) setSearchParams({ q });
  };

  return (
    <>
      <Helmet>
        <title>{query ? `"${query}" — Search · QuickPost` : "Search · QuickPost"}</title>
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h1 className="mb-6 text-3xl font-bold text-white">Search</h1>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                autoFocus
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                placeholder="Search posts…"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-gold to-amber-500 px-5 py-2.5 text-sm font-medium text-jet transition hover:from-amber-400 hover:to-yellow-400"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* Results */}
        {query && (
          <div className="mt-10">
            {!loading && (
              <p className="mb-6 text-sm text-zinc-500">
                {total === 0
                  ? `No results for "${query}"`
                  : `${total} result${total !== 1 ? "s" : ""} for "${query}"`}
              </p>
            )}

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)
                : results.map((post, i) => (
                    <ScrollReveal key={post._id} delay={i * 0.05}>
                      <BlogCard post={post} />
                    </ScrollReveal>
                  ))}
            </div>

            {!loading && results.length === 0 && (
              <div className="mt-12 text-center">
                <p className="text-zinc-500">
                  Try a different keyword or{" "}
                  <Link to="/" className="text-gold hover:underline">browse all posts</Link>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
