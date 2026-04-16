import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { BlogCard } from "../components/blog/BlogCard";
import { Button } from "../components/ui/Button";
import { BlogCardSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { usePosts } from "../hooks/usePosts";

const heroVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function Home() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = usePosts({ page, limit: 9 });
  const items = data?.items || [];
  const pages = data?.pages || 1;

  return (
    <>
      <Helmet>
        <title>QuickPost — Discover products before you buy</title>
        <meta
          name="description"
          content="Premium guides and honest picks so you can discover the best products before you buy."
        />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-surface/80 to-jet">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.13),_transparent_55%)]" />
        {/* subtle shimmer bar */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <motion.div
          className="relative mx-auto max-w-6xl px-4 py-20 text-center md:px-6 md:py-28"
          variants={heroVariants}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={heroItem}
            className="mb-3 inline-block rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold/90"
          >
            Premium product journalism
          </motion.p>

          <motion.h1
            variants={heroItem}
            className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
          >
            Discover the{" "}
            <span className="relative inline-block bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">
              Best Products
            </span>{" "}
            Before You Buy
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400"
          >
            Honest reviews, sharp comparisons, and editor-tested recommendations — all in
            one premium reading experience.
          </motion.p>

          <motion.div
            variants={heroItem}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/categories">
              <Button>Browse categories</Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Posts grid ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <ScrollReveal>
          <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Latest stories</h2>
              <p className="text-sm text-zinc-500">Fresh guides and product picks</p>
            </div>
          </div>
        </ScrollReveal>

        {error && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <BlogCardSkeleton key={i} />)
            : items.map((post, i) => (
                <ScrollReveal key={post._id} delay={i * 0.06}>
                  <BlogCard post={post} />
                </ScrollReveal>
              ))}
        </div>

        {!loading && items.length === 0 && !error && (
          <p className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
            No posts yet. Check back soon.
          </p>
        )}

        {pages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-zinc-500">
              Page {page} of {pages}
            </span>
            <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
              Next
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
