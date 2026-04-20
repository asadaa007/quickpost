import { useCallback, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { listPosts } from "../services/posts";
import { BlogCard } from "../components/blog/BlogCard";
import { BlogCardSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { useDebounce } from "../hooks/useDebounce";
import { Button } from "../components/ui/Button";

const PER_PAGE = 12;

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const [page, setPage] = useState(pageParam);
  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const debouncedInput = useDebounce(inputVal, 300);

  useEffect(() => {
    const trimmed = debouncedInput.trim();
    if (trimmed !== query) {
      if (trimmed) {
        setSearchParams({ q: trimmed, page: "1" }, { replace: true });
        setPage(1);
      } else {
        setSearchParams({}, { replace: true });
        setPage(1);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  useEffect(() => {
    setPage(pageParam);
  }, [pageParam, query]);

  const fetchResults = useCallback(async (q, p, signal) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setPages(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listPosts({ q, page: p, limit: PER_PAGE, signal });
      if (signal?.aborted) return;
      setResults(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") setResults([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchResults(query, page, controller.signal);
    return () => controller.abort();
  }, [query, page, fetchResults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputVal.trim();
    if (q) {
      setPage(1);
      setSearchParams({ q, page: "1" });
    }
  };

  const goPage = (next) => {
    const clamped = Math.max(1, Math.min(pages, next));
    setPage(clamped);
    setSearchParams({ q: query, page: String(clamped) }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>{query ? `"${query}" — Search · QuickPost` : "Search · QuickPost"}</title>
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
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
                ? Array.from({ length: PER_PAGE }).map((_, i) => <BlogCardSkeleton key={i} />)
                : results.map((post, i) => (
                    <ScrollReveal key={post._id} delay={i * 0.05}>
                      <BlogCard post={post} />
                    </ScrollReveal>
                  ))}
            </div>

            {pages > 1 && !loading && (
              <div className="mt-12 flex justify-center gap-2">
                <Button variant="ghost" disabled={page <= 1} onClick={() => goPage(page - 1)}>Previous</Button>
                <span className="flex items-center px-4 text-sm text-zinc-500">Page {page} of {pages}</span>
                <Button variant="ghost" disabled={page >= pages} onClick={() => goPage(page + 1)}>Next</Button>
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="mt-12 text-center">
                <p className="text-zinc-500">
                  Try a different keyword or{" "}
                  <Link to="/posts" className="text-gold hover:underline">browse all posts</Link>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
