import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { stripMarkdown } from "../../utils/stripMarkdown";
import { formatDate } from "../../utils/formatDate";

function readTime(content) {
  const words = stripMarkdown(content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function BlogCard({ post }) {
  const navigate = useNavigate();
  const raw = useMemo(
    () => stripMarkdown(post.content || post.seo?.metaDescription || ""),
    [post.content, post.seo?.metaDescription]
  );
  const excerpt = raw.slice(0, 140) || "Read insights and product picks curated for you.";
  const mins = useMemo(() => readTime(post.content), [post.content]);
  const categorySlug = post.category || "uncategorized";
  const categoryLabel =
    categorySlug === "uncategorized" ? "Uncategorized" : categorySlug.replace(/-/g, " ");

  const handleTagClick = (e, tag) => {
    e.preventDefault();
    navigate(`/tag/${encodeURIComponent(tag)}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="group relative h-full"
    >
      {/* Invisible full-card link for accessibility / SEO */}
      <Link
        to={`/post/${post.slug}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={post.title}
        tabIndex={-1}
      />

      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-surface shadow-lg shadow-black/30 transition-shadow duration-300 group-hover:border-gold/40 group-hover:shadow-gold/10">
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
          {post.bannerImage ? (
            <img
              src={post.bannerImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-jet text-sm text-zinc-600">
              No image
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-jet/80 px-3 py-1 text-xs font-medium capitalize text-gold ring-1 ring-gold/30 backdrop-blur">
            {categoryLabel}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 text-left">
          <Link
            to={`/post/${post.slug}`}
            className="contents focus:outline-none"
          >
            <h3 className="line-clamp-2 text-lg font-semibold text-white transition-colors duration-200 group-hover:text-gold">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-3 flex-1 text-sm text-zinc-400">{excerpt}…</p>
          </Link>

          {/* Tags — rendered as buttons to avoid nested <a> */}
          {post.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => handleTagClick(e, tag)}
                  className="rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 transition hover:bg-gold/10 hover:text-gold"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
            {post.createdAt && <span>{formatDate(post.createdAt)}</span>}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {mins} min read
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
