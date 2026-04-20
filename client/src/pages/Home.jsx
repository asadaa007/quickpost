import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Sparkles, Library, Zap, Scale, ShieldCheck, Brain } from "lucide-react";
import { BlogCard } from "../components/blog/BlogCard";
import FeaturedPostCard from "../components/blog/FeaturedPostCard";
import CategoryCard from "../components/blog/CategoryCard";
import { Button } from "../components/ui/Button";
import { BlogCardSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { usePosts } from "../hooks/usePosts";
import { useHomeData } from "../hooks/useHomeData";
import { useAnimatedStat } from "../hooks/useAnimatedStat";

const heroVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const sectionReveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function StatBlock({ value, label, suffix = "" }) {
  const { ref, value: display } = useAnimatedStat(value, { duration: 1.05 });
  return (
    <div ref={ref} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-5 py-4 text-center backdrop-blur-sm">
      <div className="text-2xl font-bold tabular-nums text-white md:text-3xl">
        {display}
        {suffix}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}

export function Home() {
  const { data, loading, error } = usePosts({ page: 1, limit: 3 });
  const items = data?.items || [];

  const {
    categories,
    categoriesLoading,
    categoriesError,
    featured,
    featuredLoading,
    totalPosts,
    monthlyReadersLabel,
    error: homeDataError,
  } = useHomeData();

  const [newsletterEmail, setNewsletterEmail] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: "QuickPost",
            url: origin || undefined,
            description:
              "Honest product guides, curated comparisons, and clear reviews so you can buy with confidence.",
            potentialAction: {
              "@type": "SearchAction",
              target: origin ? `${origin}/search?q={search_term_string}` : "/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@type": "Organization",
            name: "QuickPost",
            url: origin || undefined,
            description: "Premium product journalism and buying guides.",
          },
        ],
      }),
    [origin]
  );

  const onNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error("Enter your email");
      return;
    }
    toast.success("Thanks — you are on the list (preview only).");
    setNewsletterEmail("");
  };

  return (
    <>
      <Helmet>
        <title>QuickPost — honest buying guides & product picks</title>
        <meta
          name="description"
          content="Discover standout products with clear guides, curated comparisons, and straight-talk reviews. Explore categories, trending stories, and weekly insights."
        />
        <meta property="og:title" content="QuickPost — honest buying guides" />
        <meta
          property="og:description"
          content="Premium guides and comparisons to help you choose the right gear—without the hype."
        />
        <meta property="og:type" content="website" />
        {origin ? <meta property="og:url" content={origin} /> : null}
        <script type="application/ld+json">{jsonLd}</script>
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-surface/90 to-jet">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(212,175,55,0.22),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-gold/10 blur-[100px]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-amber-600/10 blur-[90px]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/45 to-transparent" />

        <motion.div
          className="relative mx-auto max-w-6xl px-4 py-20 text-center md:px-6 md:py-28"
          variants={heroVariants}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={heroItem}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold/95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Thoughtful product insights
          </motion.p>

          <motion.h1
            variants={heroItem}
            className="text-4xl font-bold leading-[1.1] text-white md:text-5xl lg:text-6xl"
          >
            <span className="block">Buy smarter with research-backed</span>
            <span className="mt-2 block bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">
              product guides & comparisons
            </span>
          </motion.h1>

          <motion.p variants={heroItem} className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            QuickPost combines careful research, curated picks, and honest pros and cons—so you get trustworthy answers
            without the noise.
          </motion.p>

          <motion.div variants={heroItem} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/categories">
              <Button className="relative overflow-hidden shadow-[0_0_24px_-4px_rgba(212,175,55,0.45)]">
                <span className="relative z-10">Explore top products</span>
              </Button>
            </Link>
            <Link to="#latest-posts">
              <Button variant="ghost" className="border-gold/20 hover:border-gold/40 hover:shadow-[0_0_20px_-6px_rgba(212,175,55,0.35)]">
                Start reading
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={heroItem}
            className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-3 md:gap-4"
          >
            <StatBlock value={totalPosts} label="Articles" />
            <StatBlock value={categories.length} label="Categories" />
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-3 py-4 text-center backdrop-blur-sm md:px-5">
              <div className="text-2xl font-bold text-white md:text-3xl">{monthlyReadersLabel}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">Monthly readers</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Featured ─────────────────────────────────────── */}
      <section id="featured" className="border-b border-zinc-800/60 bg-jet py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={sectionReveal} className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-semibold text-white md:text-3xl">Featured story</h2>
              <p className="mt-2 text-sm text-zinc-500 md:text-base">
                One standout pick from our library, refreshed on a three-day rotation.
              </p>
            </motion.div>

            {(homeDataError || categoriesError) && (
              <div className="mb-6 rounded-2xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
                {homeDataError || categoriesError}
              </div>
            )}

            <div className="flex flex-col gap-6">
              {featuredLoading ? (
                <div className="h-52 animate-pulse rounded-3xl bg-zinc-900/60 md:h-56" />
              ) : (
                featured.map(({ post, badge }, i) => <FeaturedPostCard key={post.slug} post={post} badge={badge} index={i} />)
              )}
            </div>

            {!featuredLoading && featured.length === 0 && (
              <p className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center text-zinc-500">
                No featured posts yet.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────── */}
      <section className="border-b border-zinc-800/60 bg-gradient-to-b from-jet to-zinc-950/80 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          >
            <motion.div variants={sectionReveal} className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-semibold text-white md:text-3xl">Browse by category</h2>
                <p className="mt-2 text-sm text-zinc-500">Jump into the topics you care about.</p>
              </div>
              <Link to="/categories" className="text-sm font-medium text-gold hover:underline">
                View all categories →
              </Link>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoriesLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-900/50" />
                  ))
                : categories.map((c, i) => <CategoryCard key={c.slug || c._id} category={c} index={i} />)}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Why QuickPost ───────────────────────────────── */}
      <section className="border-b border-zinc-800/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          >
            <motion.h2 variants={sectionReveal} className="text-2xl font-semibold text-white md:text-3xl">
              Why QuickPost
            </motion.h2>
            <motion.p variants={sectionReveal} className="mt-2 max-w-2xl text-sm text-zinc-500 md:text-base">
              Built for readers who want clarity, speed, and straight answers—without salesy fluff.
            </motion.p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  Icon: Brain,
                  title: "Research that respects your time",
                  body: "We dig into what actually matters—how something feels day to day, where it shines, and where it falls short—so you can decide without drowning in specs.",
                },
                { Icon: Scale, title: "Curated comparisons", body: "Side-by-side product views and comparison tables that make tradeoffs obvious." },
                { Icon: ShieldCheck, title: "Unbiased reviews", body: "Pros and cons up front—so you can decide faster with fewer regrets." },
                { Icon: Zap, title: "Fast insights", body: "Skimmable layouts, TOCs, and punchy summaries designed for busy buyers." },
              ].map((item, i) => {
                const IconComponent = item.Icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={sectionReveal}
                    custom={i}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 transition hover:border-gold/35 hover:shadow-[0_0_28px_-10px_rgba(212,175,55,0.25)]"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold transition group-hover:scale-105">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Latest posts ───────────────────────────────── */}
      <section id="latest-posts" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <ScrollReveal>
          <div className="mb-12 flex flex-col gap-3 border-b border-zinc-800/60 pb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Latest posts</h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-500 md:text-base">
                The three newest guides—see the full archive anytime.
              </p>
            </div>
            <Link to="/posts" className="self-start">
              <Button variant="ghost" className="gap-2 border border-zinc-700 bg-zinc-900/50 hover:border-gold/40 hover:text-gold">
                <Library className="h-4 w-4" />
                All posts
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)
            : items.map((post, i) => (
                <ScrollReveal key={post._id} delay={i * 0.05}>
                  <BlogCard post={post} />
                </ScrollReveal>
              ))}
        </div>

        {!loading && items.length === 0 && !error && (
          <p className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
            No posts yet. Check back soon.
          </p>
        )}
      </section>

      {/* ── Newsletter ───────────────────────────────────── */}
      <section className="border-t border-zinc-800/60 bg-gradient-to-b from-zinc-950/50 to-jet py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black p-8 md:p-12"
          >
            <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-white md:text-3xl">Get the best product insights weekly</h2>
              <p className="mt-3 text-sm text-zinc-400 md:text-base">
                UI preview only—no emails are stored yet. Drop your address to see the experience.
              </p>
              <form onSubmit={onNewsletter} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="input-field sm:max-w-xs sm:flex-1"
                />
                <Button type="submit" className="sm:w-auto">
                  Subscribe
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
