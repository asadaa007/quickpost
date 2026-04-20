import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cpu, Headphones, Smartphone, Laptop, Home,
  Tag, TrendingUp, Clock, Eye, ArrowRight, Search,
} from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { usePosts } from "../hooks/usePosts";
import { BlogCard } from "../components/blog/BlogCard";
import { Skeleton, BlogCardSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { getTopViewedPost } from "../services/posts";
import { formatDate } from "../utils/formatDate";
import { stripMarkdown } from "../utils/stripMarkdown";

// ── Icon + accent colour per category slug ────────────────────────────────
const CATEGORY_META = {
  "tech-gadgets":  { Icon: Cpu,        accent: "text-blue-400",   bg: "bg-blue-400/10",   border: "hover:border-blue-400/30"  },
  "audio-sound":   { Icon: Headphones, accent: "text-purple-400", bg: "bg-purple-400/10", border: "hover:border-purple-400/30" },
  "smartphones":   { Icon: Smartphone, accent: "text-emerald-400",bg: "bg-emerald-400/10",border: "hover:border-emerald-400/30" },
  "laptops-pcs":   { Icon: Laptop,     accent: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "hover:border-cyan-400/30"  },
  "home-office":   { Icon: Home,       accent: "text-amber-400",  bg: "bg-amber-400/10",  border: "hover:border-amber-400/30" },
};

function getCategoryMeta(slug) {
  return CATEGORY_META[slug] || { Icon: Tag, accent: "text-gold", bg: "bg-gold/10", border: "hover:border-gold/30" };
}

// ── Trending post card ────────────────────────────────────────────────────
function TrendingCard({ post }) {
  const excerpt = stripMarkdown(post.content || "").slice(0, 180);
  return (
    <Link
      to={`/post/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-surface transition-all duration-300 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 md:flex-row"
    >
      {/* Image */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-zinc-900 md:aspect-auto md:w-2/5">
        {post.bannerImage ? (
          <img
            src={post.bannerImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-zinc-800 to-jet text-zinc-600">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/30 md:block hidden" />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-gold/90 px-3 py-1 text-xs font-bold text-jet">
          <TrendingUp className="h-3 w-3" /> Trending
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span className="rounded-full bg-zinc-800 px-2.5 py-1 font-medium capitalize text-zinc-300">
              {(post.category || "uncategorized").replace(/-/g, " ")}
            </span>
            {post.createdAt && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(post.createdAt)}</span>}
            {post.views > 0 && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views.toLocaleString()} reads</span>}
          </div>
          <h3 className="text-xl font-bold leading-snug text-white transition-colors group-hover:text-gold md:text-2xl">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">{excerpt}…</p>
        </div>
        <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-gold">
          Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export function Categories() {
  const navigate = useNavigate();
  const { data: categories, loading: catsLoading, error: catsError } = useCategories();
  const { data: postsData, loading: postsLoading } = usePosts({ limit: 6 });
  const [trending, setTrending] = useState(null);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Press "/" to jump to search
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "/") {
        e.preventDefault();
        navigate("/search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    getTopViewedPost()
      .then((data) => { if (!cancelled) setTrending(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTrendingLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const recentPosts = postsData?.items || [];
  const totalPosts = postsData?.total || 0;

  return (
    <>
      <Helmet>
        <title>Categories — QuickPost</title>
        <meta name="description" content="Browse all QuickPost categories. Find reviews, comparisons and buying guides by topic." />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.08),_transparent_55%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20"
        >
          <p className="mb-3 inline-block rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold/90">
            Browse by topic
          </p>
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            All Categories
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-400">
            Explore hand-curated guides and honest reviews across{" "}
            {!catsLoading && categories.length > 0 ? (
              <span className="text-white font-medium">{categories.length} topics</span>
            ) : "every topic"}{" "}
            — all in one place.
          </p>

          {/* Quick search CTA */}
          <Link
            to="/search"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/60 px-5 py-3 text-sm text-zinc-400 transition hover:border-gold/40 hover:text-gold"
          >
            <Search className="h-4 w-4" />
            Search all {totalPosts > 0 ? `${totalPosts} ` : ""}articles…
            <kbd className="ml-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">/</kbd>
          </Link>
        </motion.div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 space-y-20">

        {/* ── Category grid ─────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Topics</h2>
                <p className="mt-1 text-sm text-zinc-500">Pick a category to browse its posts</p>
              </div>
            </div>
          </ScrollReveal>

          {catsError && (
            <p className="rounded-2xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">{catsError}</p>
          )}

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catsLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)
              : categories.map((cat, i) => {
                  const { Icon, accent, bg, border } = getCategoryMeta(cat.slug);
                  return (
                    <ScrollReveal key={cat._id} delay={i * 0.07}>
                      <li>
                        <Link
                          to={`/category/${cat.slug}`}
                          className={`group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-surface p-5 transition-all duration-300 hover:shadow-lg ${border}`}
                        >
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg} transition-transform duration-300 group-hover:scale-110`}>
                            <Icon className={`h-6 w-6 ${accent}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-white transition-colors group-hover:text-gold">
                              {cat.name}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {cat.postCount ?? 0} post{cat.postCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <ArrowRight className={`h-4 w-4 shrink-0 text-zinc-700 transition-all duration-300 group-hover:translate-x-1 ${accent}`} />
                        </Link>
                      </li>
                    </ScrollReveal>
                  );
                })}
          </ul>

          {!catsLoading && categories.length === 0 && !catsError && (
            <p className="mt-8 text-center text-zinc-500">No categories yet. Check back soon.</p>
          )}
        </section>

        {/* ── Trending post ─────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <div className="mb-8">
              <div className="flex items-center gap-2 text-gold mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">Most Read Right Now</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Trending Article</h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            {trendingLoading ? (
              <div className="flex gap-0 overflow-hidden rounded-2xl border border-zinc-800">
                <Skeleton className="h-56 w-2/5 rounded-none" />
                <div className="flex-1 space-y-3 p-8">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : trending ? (
              <TrendingCard post={trending} />
            ) : null}
          </ScrollReveal>
        </section>

        {/* ── Recent posts ──────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">Latest stories</span>
                </div>
                <h2 className="text-2xl font-semibold text-white">Recent Posts</h2>
              </div>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-gold"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {postsLoading
              ? Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)
              : recentPosts.map((post, i) => (
                  <ScrollReveal key={post._id} delay={i * 0.06}>
                    <BlogCard post={post} />
                  </ScrollReveal>
                ))}
          </div>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────────── */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent p-8 text-center md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08),_transparent_70%)]" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-gold/80 mb-3">
              Can't find what you're looking for?
            </p>
            <h3 className="relative text-2xl font-bold text-white md:text-3xl">
              Search across all articles
            </h3>
            <p className="relative mt-3 text-zinc-400 max-w-md mx-auto">
              Use our search to find reviews, comparisons, and buying guides across every topic instantly.
            </p>
            <Link
              to="/search"
              className="relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-amber-500 px-6 py-3 text-sm font-semibold text-jet shadow-lg shadow-gold/20 transition hover:shadow-gold/40 hover:from-amber-400 hover:to-yellow-400"
            >
              <Search className="h-4 w-4" /> Search all posts
            </Link>
          </div>
        </ScrollReveal>

      </div>
    </>
  );
}
