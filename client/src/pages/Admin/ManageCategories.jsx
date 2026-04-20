import { Helmet } from "react-helmet-async";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Plus, Tag } from "lucide-react";
import { createCategory, deleteCategory as deleteCategoryApi } from "../../services/admin";
import { Button } from "../../components/ui/Button";
import { useCategories } from "../../hooks/useCategories";
import { Skeleton } from "../../components/ui/Skeleton";
import { slugify } from "../../utils/slugify";

export function ManageCategories() {
  const { data: categories, loading, refetch } = useCategories();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!slug || slug === slugify(name)) setSlug(slugify(val));
  };

  const handleCreate = useCallback(
    async (e) => {
      e.preventDefault();
      if (!name.trim()) return;
      setCreating(true);
      try {
        await createCategory({ name: name.trim(), slug: slug.trim() || slugify(name.trim()) });
        toast.success(`"${name.trim()}" created`);
        setName("");
        setSlug("");
        refetch();
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Failed to create");
      } finally {
        setCreating(false);
      }
    },
    [name, slug, refetch]
  );

  const handleDelete = useCallback(
    async (cat) => {
      if (!confirm(`Delete "${cat.name}"? Posts using this category won't be deleted.`)) return;
      setDeletingId(cat._id);
      try {
        await deleteCategoryApi(cat._id);
        toast.success(`"${cat.name}" deleted`);
        refetch();
      } catch (err) {
        toast.error(err.response?.data?.message || "Delete failed");
      } finally {
        setDeletingId(null);
      }
    },
    [refetch]
  );

  return (
    <>
      <Helmet><title>Categories — QuickPost Admin</title></Helmet>

      <div className="border-b border-zinc-800/80 bg-[#0d0d0d] px-6 py-5">
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 text-purple-400" />
          <div>
            <h1 className="text-lg font-semibold text-white">Categories</h1>
            <p className="text-xs text-zinc-500">Create and manage post categories</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleCreate} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">New category</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-300">
              Name <span className="text-gold">*</span>
              <input className="input-field mt-1" placeholder="e.g. Tech Gadgets" value={name} onChange={handleNameChange} required />
            </label>
            <label className="block text-sm font-medium text-zinc-300">
              Slug
              <input className="input-field mt-1 font-mono text-xs" placeholder="tech-gadgets" value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))} />
            </label>
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={creating || !name.trim()}>
              <Plus className="h-4 w-4" />
              {creating ? "Creating…" : "Create category"}
            </Button>
          </div>
        </form>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {loading ? "Loading…" : `${categories.length} categories`}
            </span>
          </div>
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No categories yet — create one above.</p>
          ) : (
            <ul className="divide-y divide-zinc-800/60">
              {categories.map((cat) => (
                <li key={cat._id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-800/30 transition">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{cat.name}</p>
                    <p className="text-xs text-zinc-600 font-mono">/{cat.slug}</p>
                  </div>
                  <button type="button" onClick={() => handleDelete(cat)} disabled={deletingId === cat._id}
                    className="rounded-lg p-2 text-zinc-600 transition hover:bg-red-950/60 hover:text-red-400 disabled:opacity-40"
                    aria-label={`Delete ${cat.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
