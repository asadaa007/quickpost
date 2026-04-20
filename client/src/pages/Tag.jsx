import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePosts } from "../hooks/usePosts";
import { BlogCard } from "../components/blog/BlogCard";
import { BlogCardSkeleton } from "../components/ui/Skeleton";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { Button } from "../components/ui/Button";

export function Tag() {
  const { slug } = useParams();
  const tag = slug ? decodeURIComponent(slug) : "";
  const [page, setPage] = useState(1);
  const { data, loading, error } = usePosts({ tag, page, limit: 12 });

  const items = data?.items || [];
  const pages = data?.pages || 1;
  const total = data?.total || 0;

  return (
    <>
      <Helmet>
        <title>{tag ? `#${tag} — QuickPost` : "Tag — QuickPost"}</title>
      </Helmet>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-sm text-zinc-500">
            <Link to="/" className="hover:text-gold">Home</Link>
            {" "}/ <span className="text-zinc-300">Tag</span>
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white">
            {tag ? <span className="text-gold">#{tag}</span> : "Posts by tag"}
          </h1>
          {total > 0 && !loading && (
            <p className="mt-1 text-sm text-zinc-500">{total} post{total !== 1 ? "s" : ""}</p>
          )}
        </motion.div>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">{error}</p>
        )}

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <BlogCardSkeleton key={i} />)
            : items.map((post, i) => (
                <ScrollReveal key={post._id} delay={i * 0.06}>
                  <BlogCard post={post} />
                </ScrollReveal>
              ))}
        </div>

        {!loading && items.length === 0 && !error && tag && (
          <p className="mt-10 text-zinc-500">No posts with this tag yet.</p>
        )}

        {pages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <span className="flex items-center px-4 text-sm text-zinc-500">Page {page} of {pages}</span>
            <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
          </div>
        )}
      </div>
    </>
  );
}
