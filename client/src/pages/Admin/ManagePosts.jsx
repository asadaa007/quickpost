import { Helmet } from "react-helmet-async";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, PenLine, Pencil, Trash2, Eye } from "lucide-react";
import { deletePost as deletePostApi, listPostsAdmin } from "../../services/admin";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../../utils/formatDate";

export function ManagePosts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPostsAdmin({ page, limit: 20 });
      setItems(res.items || []);
      setPages(res.pages || 1);
      setTotal(res.total || 0);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load posts");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!confirm("Delete this post permanently?")) return;
    try {
      await deletePostApi(id);
      toast.success("Post deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <Helmet><title>Posts — QuickPost Admin</title></Helmet>

      <div className="border-b border-zinc-800/80 bg-[#0d0d0d] px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gold" />
            <div>
              <h1 className="text-lg font-semibold text-white">Posts</h1>
              <p className="text-xs text-zinc-500">{total} total posts</p>
            </div>
          </div>
          <Link to="/dev-post/create">
            <Button><PenLine className="h-4 w-4" />New post</Button>
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Tags</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Date</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Views</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No posts yet.{" "}
                    <Link to="/dev-post/create" className="text-gold hover:underline">Create your first post</Link>
                  </td>
                </tr>
              ) : (
                items.map((post) => (
                  <tr key={post._id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-200 line-clamp-1">{post.title}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">/{post.slug}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-zinc-400 md:table-cell">
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs">{post.category}</span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(post.tags || []).slice(0, 2).map((t) => (
                          <span key={t} className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-gold/80">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-zinc-500 lg:table-cell">{formatDate(post.createdAt)}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Eye className="h-3 w-3" />{post.views ?? 0}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={post.status === "draft"
                        ? "rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                        : "rounded-full bg-emerald-900/40 border border-emerald-800/50 px-2 py-0.5 text-xs text-emerald-400"
                      }>{post.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/post/${post.slug}`} target="_blank" rel="noreferrer"
                        className="mr-1 inline-flex rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition" aria-label="Preview">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link to={`/dev-post/edit/${post._id}`}
                        className="mr-1 inline-flex rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-gold transition" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button type="button"
                        className="inline-flex rounded-lg p-2 text-zinc-500 hover:bg-red-950/60 hover:text-red-400 transition"
                        onClick={() => remove(post._id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-zinc-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
