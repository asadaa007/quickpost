import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye } from "lucide-react";

function categoryLabelFromPost(post) {
  const raw = post?.category;
  const slug = typeof raw === "string" ? raw : raw?.slug;
  if (!slug || slug === "uncategorized") return "Uncategorized";
  return slug.replace(/-/g, " ");
}

export default function FeaturedPostCard({ post, badge, index = 0 }) {
  if (!post) return null;
  const href = `/post/${post.slug}`;
  const categoryLabel = categoryLabelFromPost(post);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/90 to-zinc-950 shadow-xl shadow-black/40"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.12),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <Link to={href} className="relative z-10 flex flex-col md:flex-row md:min-h-[220px]">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden md:aspect-auto md:w-[46%] md:min-h-[220px]">
          <img
            src={post.bannerImage}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-gradient-to-r" />
          {badge && (
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-gold/40 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold backdrop-blur-sm">
              {badge}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="rounded-full border border-zinc-700/80 bg-zinc-900/80 px-2.5 py-0.5 capitalize text-zinc-400">
              {categoryLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-zinc-500">
              <Eye className="h-3.5 w-3.5" />
              {post.views ?? 0} views
            </span>
          </div>
          <h3 className="text-xl font-semibold leading-snug text-white transition group-hover:text-gold md:text-2xl">
            {post.title}
          </h3>
          {post.seo?.metaDescription && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">{post.seo.metaDescription}</p>
          )}
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold">
            Read article
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
