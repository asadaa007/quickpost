import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Library } from "lucide-react";
import { BlogCard } from "../components/blog/BlogCard";
import { BlogCardSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { Button } from "../components/ui/Button";
import { usePosts } from "../hooks/usePosts";
import { useCategories } from "../hooks/useCategories";
import { useDebounce } from "../hooks/useDebounce";
import { listPublishedTags } from "../services/posts";

const PER_PAGE = 12;

function siteOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function parsePositiveInt(v, fallback = 1) {
  const n = parseInt(String(v || ""), 10);
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

function normalizeSort(v) {
  const s = String(v || "latest").toLowerCase();
  if (s === "views" || s === "most-viewed") return "views";
  if (s === "oldest") return "oldest";
  return "latest";
}

/** Page numbers with null gaps for ellipses */
function visiblePages(current, total, radius = 1) {
  if (total <= 1) return [];
  const set = new Set([1, total]);
  for (let i = current - radius; i <= current + radius; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  let lastNum = null;
  for (const p of sorted) {
    if (lastNum != null && p - lastNum > 1) out.push(null);
    out.push(p);
    lastNum = p;
  }
  return out;
}

export function AllPosts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories, loading: categoriesLoading } = useCategories();
  const [tagOptions, setTagOptions] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  const page = useMemo(() => parsePositiveInt(searchParams.get("page"), 1), [searchParams]);
  const category = (searchParams.get("category") || "").trim();
  const tag = (searchParams.get("tag") || "").trim();
  const sort = useMemo(() => normalizeSort(searchParams.get("sort")), [searchParams]);
  const qFromUrl = (searchParams.get("q") || "").trim();

  const [searchInput, setSearchInput] = useState(qFromUrl);
  const debouncedQ = useDebounce(searchInput, 350);

  useEffect(() => {
    setSearchInput(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    const next = debouncedQ.trim();
    setSearchParams(
      (prev) => {
        const current = (prev.get("q") || "").trim();
        if (next === current) return prev;
        const nextParams = new URLSearchParams(prev);
        if (next) nextParams.set("q", next);
        else nextParams.delete("q");
        nextParams.set("page", "1");
        return nextParams;
      },
      { replace: true }
    );
  }, [debouncedQ, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      setTagsLoading(true);
      try {
        const tags = await listPublishedTags({ signal: controller.signal });
        if (!cancelled) setTagOptions(Array.isArray(tags) ? tags : []);
      } catch {
        if (!cancelled) setTagOptions([]);
      } finally {
        if (!cancelled) setTagsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const { data, loading, error } = usePosts({
    page,
    limit: PER_PAGE,
    category: category || undefined,
    tag: tag || undefined,
    q: qFromUrl || undefined,
    sort,
  });

  const items = data?.items || [];
  const pages = data?.pages || 1;
  const total = data?.total ?? 0;

  const patchParams = useCallback(
    (patch) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([k, v]) => {
            if (v === "" || v == null) next.delete(k);
            else next.set(k, String(v));
          });
          return next;
        },
        { replace: true }
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams]
  );

  const canonical = useMemo(() => {
    const base = `${siteOrigin()}/posts`;
    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
  }, [searchParams]);

  const pageButtons = useMemo(() => visiblePages(page, pages, 1), [page, pages]);

  return (
    <>
      <Helmet>
        <title>All Posts | QuickPost</title>
        <meta name="description" content="Browse all product comparison guides" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="All Posts | QuickPost" />
        <meta property="og:description" content="Browse all product comparison guides" />
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="border-b border-zinc-800/70 pb-10"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold/90">
                <Library className="h-3.5 w-3.5" />
                Archive
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">All Posts</h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-500 md:text-base">
                Browse all product guides and comparisons—filter, sort, and search the full library.
              </p>
            </div>
            {!loading && (
              <p className="text-sm text-zinc-500">
                <span className="font-medium text-zinc-300">{total}</span> post{total !== 1 ? "s" : ""} match your filters
              </p>
            )}
          </div>
        </motion.header>

        {/* Controls */}
        <motion.div
          layout
          className="sticky top-[4.5rem] z-30 -mx-4 mb-10 border-b border-zinc-800/80 bg-jet/90 px-4 py-4 backdrop-blur-xl md:static md:mx-0 md:rounded-2xl md:border md:border-zinc-800/80 md:bg-zinc-900/40 md:px-5 md:py-5"
        >
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <Filter className="h-3.5 w-3.5 text-gold" />
            Filters &amp; sort
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs font-medium text-zinc-400">
              Category
              <select
                className="input-field mt-1.5"
                value={category}
                disabled={categoriesLoading}
                onChange={(e) => patchParams({ category: e.target.value, page: 1 })}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-medium text-zinc-400">
              Sort
              <select
                className="input-field mt-1.5"
                value={sort}
                onChange={(e) => patchParams({ sort: e.target.value, page: 1 })}
              >
                <option value="latest">Latest</option>
                <option value="views">Most viewed</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>

            <label className="block text-xs font-medium text-zinc-400 sm:col-span-2 lg:col-span-1">
              Search
              <input
                type="search"
                className="input-field mt-1.5"
                placeholder="Search titles and content…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search posts"
              />
            </label>

            <label className="block text-xs font-medium text-zinc-400 sm:col-span-2 lg:col-span-1">
              Tag
              <select
                className="input-field mt-1.5"
                value={tag}
                disabled={tagsLoading}
                onChange={(e) => patchParams({ tag: e.target.value, page: 1 })}
              >
                <option value="">All tags</option>
                {tagOptions.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {(category || tag || qFromUrl || sort !== "latest") && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                className="text-xs"
                onClick={() => {
                  setSearchInput("");
                  setSearchParams({}, { replace: true });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </motion.div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${page}-${category}-${tag}-${sort}-${qFromUrl}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: PER_PAGE }).map((_, i) => <BlogCardSkeleton key={i} />)
                : items.map((post, i) => (
                    <ScrollReveal key={post._id} delay={i * 0.04}>
                      <BlogCard post={post} />
                    </ScrollReveal>
                  ))}
            </div>

            {!loading && items.length === 0 && (
              <div className="mt-16 rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
                <p className="text-lg text-zinc-400">No posts match your filters</p>
                <p className="mt-2 text-sm text-zinc-600">Try clearing filters or broadening your search.</p>
              </div>
            )}

            {!loading && pages > 1 && items.length > 0 && (
              <nav className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center" aria-label="Pagination">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button variant="ghost" disabled={page <= 1} onClick={() => patchParams({ page: page - 1 })}>
                    Previous
                  </Button>
                  {pageButtons.map((pNum, idx) =>
                    pNum === null ? (
                      <span key={`e-${idx}`} className="px-1 text-zinc-600">
                        …
                      </span>
                    ) : (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => patchParams({ page: pNum })}
                        className={`min-w-[2.5rem] rounded-xl border px-3 py-2 text-sm font-medium transition ${
                          pNum === page
                            ? "border-gold/50 bg-gold/10 text-gold"
                            : "border-zinc-800 text-zinc-400 hover:border-gold/40 hover:text-gold"
                        }`}
                      >
                        {pNum}
                      </button>
                    )
                  )}
                  <Button variant="ghost" disabled={page >= pages} onClick={() => patchParams({ page: page + 1 })}>
                    Next
                  </Button>
                </div>
                <p className="text-sm text-zinc-500">
                  Page {page} of {pages}
                </p>
              </nav>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
