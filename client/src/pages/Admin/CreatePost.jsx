import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import MDEditor from "@uiw/react-md-editor";
import { createPost as createPostApi, getPostAdminById, updatePost as updatePostApi } from "../../services/admin";
import { Button } from "../../components/ui/Button";
import { useCategories } from "../../hooks/useCategories";
import { slugify } from "../../utils/slugify";
import { Plus, Trash2, PenLine } from "lucide-react";

const emptyProduct = () => ({
  title: "",
  image: "",
  affiliateLink: "",
  features: "",
  pros: "",
  cons: "",
  bestFor: "",
  rating: "",
  price: "",
});

function splitLines(s) {
  if (!s || !String(s).trim()) return [];
  return String(s).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
}

export function CreatePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { data: categories } = useCategories();

  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", category: "", content: "", bannerImage: "",
    metaTitle: "", metaDescription: "", status: "published",
    tags: "", products: [emptyProduct()],
  });

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await getPostAdminById(id);
        if (cancelled) return;
        setTitleTouched(true);
        setForm({
          title: p.title || "",
          slug: p.slug || "",
          category: p.category || "",
          content: p.content || "",
          bannerImage: p.bannerImage || "",
          metaTitle: p.seo?.metaTitle || "",
          metaDescription: p.seo?.metaDescription || "",
          status: p.status || "published",
          tags: (p.tags || []).join(", "),
          products: p.products?.length > 0
            ? p.products.map((pr) => ({
                title: pr.title || "",
                image: pr.image || "",
                affiliateLink: pr.affiliateLink || "",
                features: (pr.features || []).join("\n"),
                pros: (pr.pros || []).join("\n"),
                cons: (pr.cons || []).join("\n"),
                bestFor: pr.bestFor || "",
                price: pr.price || "",
                rating: pr.rating != null && pr.rating !== "" ? String(pr.rating) : "",
              }))
            : [emptyProduct()],
        });
      } catch (e) {
        toast.error(e.response?.data?.message || "Could not load post");
        navigate("/dev-post/posts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, navigate]);

  const update = (key, val) =>
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "title" && !isEdit && !titleTouched) {
        next.slug = slugify(val);
      }
      return next;
    });

  const updateProduct = (index, key, val) =>
    setForm((f) => {
      const products = [...f.products];
      products[index] = { ...products[index], [key]: val };
      return { ...f, products };
    });

  const addProduct = () => setForm((f) => ({ ...f, products: [...f.products, emptyProduct()] }));
  const removeProduct = (index) => setForm((f) => ({ ...f, products: f.products.filter((_, i) => i !== index) }));

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      category: form.category,
      content: form.content,
      bannerImage: form.bannerImage,
      status: form.status,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      seo: { metaTitle: form.metaTitle, metaDescription: form.metaDescription },
      products: form.products.map((pr) => ({
        title: pr.title,
        image: pr.image,
        affiliateLink: pr.affiliateLink,
        features: splitLines(pr.features),
        pros: splitLines(pr.pros),
        cons: splitLines(pr.cons),
        bestFor: pr.bestFor?.trim() || undefined,
        price: pr.price?.trim() || undefined,
        rating: pr.rating === "" || pr.rating == null ? undefined : Number(pr.rating),
      })),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updatePostApi(id, payload);
        toast.success("Post updated");
      } else {
        await createPostApi(payload);
        toast.success("Post created");
      }
      navigate("/dev-post/posts");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">Loading…</div>;
  }

  return (
    <>
      <Helmet><title>{isEdit ? "Edit post" : "New post"} — QuickPost Admin</title></Helmet>

      <div className="border-b border-zinc-800/80 bg-[#0d0d0d] px-6 py-5">
        <div className="flex items-center gap-3">
          <PenLine className="h-5 w-5 text-gold" />
          <div>
            <h1 className="text-lg font-semibold text-white">{isEdit ? "Edit post" : "New post"}</h1>
            <p className="text-xs text-zinc-500">{isEdit ? "Update post details below" : "Fill in the details to publish"}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <form onSubmit={submit} className="space-y-8">
          <Field label="Title" required>
            <input className="input-field" value={form.title}
              onChange={(e) => update("title", e.target.value)}
              onBlur={() => setTitleTouched(true)} required />
          </Field>
          <Field label="Slug (optional)">
            <input className="input-field" value={form.slug}
              onChange={(e) => { setTitleTouched(true); update("slug", e.target.value); }}
              placeholder="auto-generated from title" />
          </Field>
          <Field label="Category" required>
            <input className="input-field" list="cat-list" value={form.category}
              onChange={(e) => update("category", e.target.value)} required />
            <datalist id="cat-list">
              {(categories || []).map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
            </datalist>
            <p className="mt-1 text-xs text-zinc-500">Use the category slug (e.g. <code className="text-gold">tech</code>).</p>
          </Field>
          <Field label="Tags (comma-separated)">
            <input className="input-field" placeholder="e.g. review, budget, tech" value={form.tags}
              onChange={(e) => update("tags", e.target.value)} />
            <p className="mt-1 text-xs text-zinc-500">Used for filtering and discoverability.</p>
          </Field>
          <Field label="Banner image URL">
            <input className="input-field" value={form.bannerImage}
              onChange={(e) => update("bannerImage", e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Content (Markdown)">
            <div className="mt-1 overflow-hidden rounded-2xl border border-zinc-800 focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/30 transition-all duration-200" data-color-mode="dark">
              <MDEditor
                value={form.content}
                onChange={(val) => update("content", val || "")}
                height={420}
                preview="live"
                style={{ background: "#0b0b0b", color: "#f4f4f5" }}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Markdown supported — <code className="text-gold">![alt text](https://image-url.jpg)</code> to insert images · ## headings · **bold** · *italic*
            </p>
          </Field>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="SEO meta title">
              <input className="input-field" value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} />
            </Field>
            <Field label="Status">
              <select className="input-field" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>
          <Field label="SEO meta description">
            <textarea className="input-field min-h-[80px]" value={form.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)} />
          </Field>

          {/* Products */}
          <div className="rounded-2xl border border-zinc-800 bg-surface/50 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Products</h2>
              <Button type="button" variant="ghost" onClick={addProduct}>
                <Plus className="h-4 w-4" /> Add product
              </Button>
            </div>
            <div className="mt-6 space-y-8">
              {form.products.map((pr, i) => (
                <div key={i} className="rounded-xl border border-zinc-800/80 bg-jet/60 p-4">
                  <div className="mb-4 flex justify-end">
                    {form.products.length > 1 && (
                      <button type="button" className="text-zinc-500 hover:text-red-400" onClick={() => removeProduct(i)} aria-label="Remove product">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Field label="Product title">
                    <input className="input-field" value={pr.title} onChange={(e) => updateProduct(i, "title", e.target.value)} />
                  </Field>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="Image URL">
                      <input className="input-field" placeholder="https://..." value={pr.image} onChange={(e) => updateProduct(i, "image", e.target.value)} />
                    </Field>
                    <Field label="Where to buy (URL)">
                      <input className="input-field" placeholder="https://..." value={pr.affiliateLink} onChange={(e) => updateProduct(i, "affiliateLink", e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Features (one per line)">
                    <textarea className="input-field min-h-[80px] text-sm" value={pr.features} onChange={(e) => updateProduct(i, "features", e.target.value)} />
                  </Field>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="Pros (one per line)">
                      <textarea className="input-field min-h-[72px] text-sm" value={pr.pros} onChange={(e) => updateProduct(i, "pros", e.target.value)} />
                    </Field>
                    <Field label="Cons (one per line)">
                      <textarea className="input-field min-h-[72px] text-sm" value={pr.cons} onChange={(e) => updateProduct(i, "cons", e.target.value)} />
                    </Field>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <Field label="Best for (optional)">
                      <input
                        className="input-field"
                        placeholder="e.g. creators, travel, budget buyers"
                        value={pr.bestFor}
                        onChange={(e) => updateProduct(i, "bestFor", e.target.value)}
                      />
                    </Field>
                    <Field label="Price (optional)">
                      <input
                        className="input-field"
                        placeholder="e.g. $99 or from $49"
                        value={pr.price}
                        onChange={(e) => updateProduct(i, "price", e.target.value)}
                      />
                    </Field>
                    <Field label="Rating 0–5 (optional)">
                      <input
                        className="input-field"
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={pr.rating}
                        onChange={(e) => updateProduct(i, "rating", e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pb-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Update post" : "Publish post"}
            </Button>
            <Link to="/dev-post/posts"><Button type="button" variant="ghost">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="block text-sm font-medium text-zinc-300">
      {label}{required && <span className="text-gold"> *</span>}
      {children}
    </label>
  );
}
