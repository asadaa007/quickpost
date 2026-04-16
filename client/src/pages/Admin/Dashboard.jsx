import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { LayoutDashboard, PenLine, FileText, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";

export function AdminDashboard() {
  const [counts, setCounts] = useState({ posts: "—", categories: "—" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [postsRes, catRes] = await Promise.all([
          api.get("/posts/admin/all", { params: { limit: 1 } }),
          api.get("/categories"),
        ]);
        if (!cancelled) {
          setCounts({
            posts: postsRes.data?.total ?? 0,
            categories: Array.isArray(catRes.data) ? catRes.data.length : 0,
          });
        }
      } catch {
        if (!cancelled) setCounts({ posts: "—", categories: "—" });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { title: "Total Posts", value: counts.posts, to: "/dev-post/posts", icon: FileText, color: "text-blue-400" },
    { title: "Categories", value: counts.categories, to: "/dev-post/categories", icon: Tag, color: "text-purple-400" },
    { title: "New Post", value: "+", to: "/dev-post/create", icon: PenLine, color: "text-gold" },
  ];

  return (
    <>
      <Helmet><title>Dashboard — QuickPost Admin</title></Helmet>

      {/* Page header */}
      <div className="border-b border-zinc-800/80 bg-[#0d0d0d] px-6 py-5">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-gold" />
          <div>
            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            <p className="text-xs text-zinc-500">Overview of your content</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-zinc-700"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 group-hover:bg-zinc-700 transition">
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{c.title}</p>
                <p className="text-2xl font-bold text-white">{c.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-600">Quick actions</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/dev-post/create"
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 text-sm text-zinc-300 transition hover:border-gold/30 hover:text-gold"
            >
              <PenLine className="h-4 w-4 text-gold" />
              Write a new post
            </Link>
            <Link
              to="/dev-post/categories"
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 text-sm text-zinc-300 transition hover:border-purple-500/30 hover:text-purple-300"
            >
              <Tag className="h-4 w-4 text-purple-400" />
              Manage categories
            </Link>
          </div>
        </div>

        {/* API info */}
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">API access</p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Protected routes require{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-gold">
              Authorization: Bearer &lt;API_SECRET_KEY&gt;
            </code>{" "}
            header. Base URL:{" "}
            <code className="text-zinc-300">
              {import.meta.env.VITE_API_URL || "http://localhost:5000/api"}
            </code>
          </p>
        </div>
      </div>
    </>
  );
}
