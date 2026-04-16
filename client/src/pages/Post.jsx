import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api/client";
import { formatDate } from "../utils/formatDate";
import { stripMarkdown } from "../utils/stripMarkdown";
import { ProductCard } from "../components/blog/ProductCard";
import { PostSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollReveal";

function readTime(content) {
  const words = stripMarkdown(content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/posts/${encodeURIComponent(slug)}`);
        if (!cancelled) setPost(res.data);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message || "Failed to load post");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const metaTitle = post?.seo?.metaTitle || post?.title || "Post";
  const metaDesc = post?.seo?.metaDescription || stripMarkdown(post?.content || "").slice(0, 160);
  const mins = readTime(post?.content);

  if (loading) return <PostSkeleton />;

  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-red-300">{error || "Post not found"}</p>
        <Link to="/" className="mt-4 inline-block text-gold hover:underline">Back home</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
      </Helmet>

      <article>
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative aspect-[21/8] w-full overflow-hidden bg-zinc-900"
        >
          {post.bannerImage ? (
            <img src={post.bannerImage} alt={post.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center bg-gradient-to-br from-zinc-800 to-jet text-zinc-600">QuickPost</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-jet via-jet/40 to-transparent" />
        </motion.div>

        <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          >
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link to={`/category/${post.category}`} className="font-medium text-gold hover:underline">
                {post.category}
              </Link>
              {post.createdAt && (
                <><span className="text-zinc-700">·</span><span className="text-zinc-500">{formatDate(post.createdAt)}</span></>
              )}
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-1 text-zinc-500">
                <Clock className="h-3.5 w-3.5" />{mins} min read
              </span>
              {post.views > 0 && (
                <><span className="text-zinc-700">·</span>
                <span className="flex items-center gap-1 text-zinc-500"><Eye className="h-3.5 w-3.5" />{post.views} reads</span></>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-bold leading-tight text-white md:text-5xl">{post.title}</h1>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 transition hover:border-gold/40 hover:text-gold"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Gold divider */}
          <div className="my-10 h-px w-full bg-gradient-to-r from-gold/30 via-gold/10 to-transparent" />

          {/* Content */}
          <ScrollReveal>
            <div className="prose-post max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img({ src, alt, title }) {
                    return (
                      <img
                        src={src}
                        alt={alt || ""}
                        title={title}
                        loading="lazy"
                        className="my-8 w-full rounded-2xl border border-zinc-800/60 object-cover shadow-xl shadow-black/40"
                        style={{ maxHeight: "520px" }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
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
                  h1({ children }) { return <h1 className="mt-12 mb-4 text-3xl font-bold text-white">{children}</h1>; },
                  h2({ children }) { return <h2 className="mt-10 mb-4 text-2xl font-semibold text-white">{children}</h2>; },
                  h3({ children }) { return <h3 className="mt-8 mb-3 text-xl font-medium text-white">{children}</h3>; },
                  p({ children }) { return <p className="mb-4 text-zinc-300 leading-relaxed">{children}</p>; },
                  ul({ children }) { return <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-300">{children}</ul>; },
                  ol({ children }) { return <ol className="mb-4 list-decimal space-y-2 pl-6 text-zinc-300">{children}</ol>; },
                  strong({ children }) { return <strong className="font-semibold text-white">{children}</strong>; },
                  hr() { return <hr className="my-10 border-zinc-800" />; },
                  table({ children }) {
                    return (
                      <div className="my-6 overflow-x-auto">
                        <table className="w-full border-collapse text-sm text-zinc-300">{children}</table>
                      </div>
                    );
                  },
                  th({ children }) { return <th className="border border-zinc-700 bg-zinc-900 px-4 py-2 text-left font-semibold text-white">{children}</th>; },
                  td({ children }) { return <td className="border border-zinc-800 px-4 py-2">{children}</td>; },
                }}
              >
                {post.content || ""}
              </ReactMarkdown>
            </div>
          </ScrollReveal>

          {post.products?.length > 0 && (
            <section className="mt-16 border-t border-zinc-800/60 pt-12">
              <ScrollReveal>
                <h2 className="text-2xl font-semibold text-white">Featured products</h2>
                <p className="mt-2 text-sm text-zinc-500">Hand-picked items referenced in this story</p>
              </ScrollReveal>
              <div className="mt-8 space-y-8">
                {post.products.map((p, i) => <ProductCard key={i} product={p} />)}
              </div>
            </section>
          )}

          <div className="mt-12 border-t border-zinc-800/60 pt-8">
            <Link to="/" className="text-sm text-zinc-500 hover:text-gold transition-colors">
              ← Back to all posts
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
