import { Helmet } from "react-helmet-async";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getRelatedForSlug } from "../services/posts";
import { formatDate } from "../utils/formatDate";
import { stripMarkdown } from "../utils/stripMarkdown";
import { createHeadingIdResolver, extractMarkdownToc } from "../utils/markdownToc";
import { normalizeProductForAutomation } from "../utils/amazon";
import ProductShowcaseCard from "../components/blog/ProductShowcaseCard";
import TableOfContents from "../components/blog/TableOfContents";
import { BlogCard } from "../components/blog/BlogCard";
import { PostSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollReveal";

const ComparisonTable = lazy(() => import("../components/blog/ComparisonTable"));

function readTime(content) {
  const words = stripMarkdown(content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function siteOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function mdPlainText(children) {
  if (children == null) return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(mdPlainText).join("");
  if (typeof children === "object" && children.props?.children != null) return mdPlainText(children.props.children);
  return "";
}

export function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPost(null);
      setLoading(true);
      setError(null);
      setRelated([]);
      try {
        const data = await getPostBySlug(slug);
        if (cancelled) return;
        setPost(data);
        try {
          const rel = await getRelatedForSlug(data.slug);
          if (!cancelled) setRelated(rel?.items || []);
        } catch {
          if (!cancelled) setRelated([]);
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || "Failed to load post");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const metaTitle = post?.seo?.metaTitle || post?.title || "Post";
  const metaDesc = post?.seo?.metaDescription || stripMarkdown(post?.content || "").slice(0, 160);
  const mins = readTime(post?.content);
  const ogImage = post?.bannerImage || "";
  const canonical = post?.slug ? `${siteOrigin()}/post/${post.slug}` : "";

  const categorySlug = post?.category || "uncategorized";
  const categoryLabel =
    categorySlug === "uncategorized" ? "Uncategorized" : categorySlug.replace(/-/g, " ");

  const toc = useMemo(() => extractMarkdownToc(post?.content || ""), [post?.content]);
  const resolveHeadingId = useMemo(() => {
    void slug;
    void post?.content;
    return createHeadingIdResolver();
  }, [slug, post?.content]);

  const introText = useMemo(() => {
    const m = post?.seo?.metaDescription?.trim();
    if (m) return m;
    const s = stripMarkdown(post?.content || "").trim();
    if (!s) return "";
    return s.length > 260 ? `${s.slice(0, 260)}…` : s;
  }, [post?.content, post?.seo?.metaDescription]);

  const productsNorm = useMemo(
    () => (post?.products || []).map((p) => normalizeProductForAutomation(p)),
    [post?.products]
  );

  const articleLd = useMemo(() => {
    if (!post) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: metaDesc,
      image: ogImage ? [ogImage] : undefined,
      datePublished: post.createdAt,
      dateModified: post.updatedAt || post.createdAt,
      mainEntityOfPage: canonical ? { "@type": "WebPage", "@id": canonical } : undefined,
      publisher: {
        "@type": "Organization",
        name: "QuickPost",
        url: siteOrigin() || undefined,
      },
    };
  }, [post, metaDesc, ogImage, canonical]);

  const markdownComponents = useMemo(
    () => ({
      img({ src, alt, title }) {
        return (
          <img
            src={src}
            alt={alt || ""}
            title={title}
            loading="lazy"
            className="my-8 w-full rounded-2xl border border-zinc-800/60 object-cover shadow-xl shadow-black/40"
            style={{ maxHeight: "520px" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        );
      },
      a({ href, children }) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-gold underline-offset-2 hover:underline">
            {children}
          </a>
        );
      },
      code({ className, children, ...props }) {
        const isBlock = className?.startsWith("language-");
        return isBlock ? (
          <code className={`${className} block overflow-x-auto rounded-2xl bg-zinc-900 p-4 text-sm text-zinc-300`} {...props}>
            {children}
          </code>
        ) : (
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-gold" {...props}>
            {children}
          </code>
        );
      },
      pre({ children }) {
        return <pre className="my-6 overflow-x-auto rounded-2xl bg-zinc-900 p-4 text-sm">{children}</pre>;
      },
      blockquote({ children }) {
        return <blockquote className="my-6 border-l-4 border-gold/40 pl-4 italic text-zinc-400">{children}</blockquote>;
      },
      h1({ children }) {
        return <h1 className="mt-14 mb-5 scroll-mt-28 text-4xl font-bold text-white">{children}</h1>;
      },
      h2({ children }) {
        const id = resolveHeadingId(mdPlainText(children));
        return (
          <h2 id={id} className="mt-12 mb-5 scroll-mt-28 text-3xl font-semibold tracking-tight text-white">
            {children}
          </h2>
        );
      },
      h3({ children }) {
        const id = resolveHeadingId(mdPlainText(children));
        return (
          <h3 id={id} className="mt-10 mb-4 scroll-mt-28 text-2xl font-semibold tracking-tight text-white">
            {children}
          </h3>
        );
      },
      p({ children }) {
        return <p className="mb-5 text-[1.05rem] leading-[1.75] text-zinc-300">{children}</p>;
      },
      ul({ children }) {
        return <ul className="mb-5 list-disc space-y-2 pl-6 text-zinc-300">{children}</ul>;
      },
      ol({ children }) {
        return <ol className="mb-5 list-decimal space-y-2 pl-6 text-zinc-300">{children}</ol>;
      },
      strong({ children }) {
        return <strong className="font-semibold text-white">{children}</strong>;
      },
      hr() {
        return <hr className="my-10 border-zinc-800" />;
      },
      table({ children }) {
        return (
          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm text-zinc-300">{children}</table>
          </div>
        );
      },
      th({ children }) {
        return <th className="border border-zinc-700 bg-zinc-900 px-4 py-2 text-left font-semibold text-white">{children}</th>;
      },
      td({ children }) {
        return <td className="border border-zinc-800 px-4 py-2">{children}</td>;
      },
    }),
    [resolveHeadingId]
  );

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading… — QuickPost</title>
        </Helmet>
        <PostSkeleton />
      </>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-red-300">{error || "Post not found"}</p>
        <Link to="/" className="mt-4 inline-block text-gold hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        {canonical ? <meta property="og:url" content={canonical} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        {articleLd ? (
          <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        ) : null}
      </Helmet>

      <article>
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative aspect-[21/8] w-full overflow-hidden bg-zinc-900"
        >
          {post.bannerImage ? (
            <img src={post.bannerImage} alt={post.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center bg-gradient-to-br from-zinc-800 to-jet text-zinc-600">
              QuickPost
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-jet via-jet/40 to-transparent" />
        </motion.div>

        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <ScrollReveal>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                to={`/category/${encodeURIComponent(categorySlug)}`}
                className="font-medium capitalize text-gold hover:underline"
              >
                {categoryLabel.replace(/-/g, " ")}
              </Link>
              {post.createdAt && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="text-zinc-500">{formatDate(post.createdAt)}</span>
                </>
              )}
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-1 text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                {mins} min read
              </span>
              {post.views > 0 && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Eye className="h-3.5 w-3.5" />
                    {post.views} reads
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-bold leading-tight text-white md:text-5xl">{post.title}</h1>

            {post.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tag/${encodeURIComponent(tag)}`}
                    className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 transition hover:border-gold/40 hover:text-gold"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </ScrollReveal>

          <div className="my-10 h-px w-full bg-gradient-to-r from-gold/30 via-gold/10 to-transparent" />

          {introText && (
            <ScrollReveal delay={0.04}>
              <p className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-base leading-relaxed text-zinc-300 md:p-6 md:text-lg">
                {introText}
              </p>
            </ScrollReveal>
          )}

          <div className="mt-8 lg:hidden">{toc.length > 0 ? <TableOfContents items={toc} /> : null}</div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start lg:gap-12">
            <div className="min-w-0">
              <ScrollReveal delay={0.06}>
                <div className="prose-post max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {post.content || ""}
                  </ReactMarkdown>
                </div>
              </ScrollReveal>

              {productsNorm.length > 0 && (
                <section className="mt-16 border-t border-zinc-800/60 pt-12">
                  <ScrollReveal>
                    <h2 className="text-2xl font-semibold text-white md:text-3xl">Products in this guide</h2>
                    <p className="mt-2 text-sm text-zinc-500">
                      Big picture on each pick—pros, cons, and a clear path to buy when you are ready.
                    </p>
                  </ScrollReveal>
                  <div className="mt-10 flex flex-col gap-10">
                    {productsNorm.map((p, i) => (
                      <ProductShowcaseCard key={`${p.title}-${i}`} product={p} index={i} />
                    ))}
                  </div>

                  {productsNorm.length >= 2 && (
                    <Suspense
                      fallback={<div className="mt-12 h-40 animate-pulse rounded-3xl bg-zinc-900/60" aria-hidden />}
                    >
                      <ComparisonTable products={productsNorm} />
                    </Suspense>
                  )}
                </section>
              )}

              {related.length > 0 && (
                <section className="mt-16 border-t border-zinc-800/60 pt-12">
                  <ScrollReveal>
                    <h2 className="text-2xl font-semibold text-white md:text-3xl">Related posts</h2>
                    <p className="mt-2 text-sm text-zinc-500">More picks from similar topics</p>
                  </ScrollReveal>
                  <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible lg:grid-cols-3">
                    {related.slice(0, 6).map((rp, i) => (
                      <div
                        key={rp._id}
                        className="w-[min(100%,320px)] shrink-0 snap-center md:w-auto md:shrink md:snap-none"
                      >
                        <ScrollReveal delay={i * 0.05}>
                          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
                            <BlogCard post={rp} />
                          </motion.div>
                        </ScrollReveal>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="mt-12 border-t border-zinc-800/60 pt-8">
                <Link to="/" className="text-sm text-zinc-500 transition-colors hover:text-gold">
                  ← Back to all posts
                </Link>
              </div>
            </div>

            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <TableOfContents items={toc} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
