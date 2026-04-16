import Post from "../models/Post.js";
import Category from "../models/Category.js";
import { slugify } from "../utils/slugify.js";

function isValidUrl(str) {
  if (!str) return true; // empty is allowed
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function getTopViewed(req, res) {
  try {
    const post = await Post.findOne({ status: "published" })
      .sort({ views: -1, createdAt: -1 })
      .select("title slug views bannerImage category")
      .lean();
    res.json(post || null);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to get top post" });
  }
}

export async function listPosts(req, res) {
  try {
    const { category, tag, q, page = "1", limit = "12" } = req.query;
    const filter = { status: "published" };

    if (category) filter.category = String(category).trim();
    if (tag) filter.tags = String(tag).trim();
    if (q) {
      const regex = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: regex }, { content: regex }];
    }

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).select("-content").lean(),
      Post.countDocuments(filter),
    ]);

    res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) || 1 });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to list posts" });
  }
}

export async function listPostsAdmin(req, res) {
  try {
    const { page = "1", limit = "20" } = req.query;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      Post.countDocuments(),
    ]);

    res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) || 1 });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to list posts" });
  }
}

export async function getPostBySlug(req, res) {
  try {
    const { slug } = req.params;
    const post = await Post.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to get post" });
  }
}

export async function getPostById(req, res) {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to get post" });
  }
}

export async function createPost(req, res) {
  try {
    const body = req.body;
    if (!body.title) return res.status(400).json({ message: "title is required" });
    if (!body.category) return res.status(400).json({ message: "category is required" });

    const categoryExists = await Category.exists({ slug: body.category });
    if (!categoryExists) {
      return res.status(400).json({ message: `Category "${body.category}" does not exist` });
    }

    if (body.bannerImage && !isValidUrl(body.bannerImage)) {
      return res.status(400).json({ message: "bannerImage must be a valid http/https URL" });
    }

    const products = Array.isArray(body.products) ? body.products : [];
    for (const p of products) {
      if (p.affiliateLink && !isValidUrl(p.affiliateLink)) {
        return res.status(400).json({ message: `affiliateLink for "${p.title}" must be a valid http/https URL` });
      }
      if (p.image && !isValidUrl(p.image)) {
        return res.status(400).json({ message: `image URL for "${p.title}" must be a valid http/https URL` });
      }
    }

    const tags = Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const post = await Post.create({
      title: body.title,
      slug: body.slug ? slugify(body.slug) : slugify(body.title),
      category: body.category,
      content: body.content ?? "",
      bannerImage: body.bannerImage ?? "",
      products,
      tags,
      seo: body.seo || {},
      status: body.status === "draft" ? "draft" : "published",
    });
    res.status(201).json(post);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Post slug already exists" });
    res.status(500).json({ message: err.message || "Failed to create post" });
  }
}

export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;
    const update = {};

    if (body.title !== undefined) update.title = body.title;
    if (body.slug !== undefined) update.slug = slugify(body.slug);
    if (body.category !== undefined) {
      const categoryExists = await Category.exists({ slug: body.category });
      if (!categoryExists) {
        return res.status(400).json({ message: `Category "${body.category}" does not exist` });
      }
      update.category = body.category;
    }
    if (body.content !== undefined) update.content = body.content;
    if (body.status !== undefined) update.status = body.status === "draft" ? "draft" : "published";
    if (body.seo !== undefined) update.seo = body.seo;

    if (body.bannerImage !== undefined) {
      if (body.bannerImage && !isValidUrl(body.bannerImage)) {
        return res.status(400).json({ message: "bannerImage must be a valid http/https URL" });
      }
      update.bannerImage = body.bannerImage;
    }

    if (body.products !== undefined) {
      const products = Array.isArray(body.products) ? body.products : [];
      for (const p of products) {
        if (p.affiliateLink && !isValidUrl(p.affiliateLink)) {
          return res.status(400).json({ message: `affiliateLink for "${p.title}" must be a valid http/https URL` });
        }
        if (p.image && !isValidUrl(p.image)) {
          return res.status(400).json({ message: `image URL for "${p.title}" must be a valid http/https URL` });
        }
      }
      update.products = products;
    }

    if (body.tags !== undefined) {
      update.tags = Array.isArray(body.tags)
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : [];
    }

    if (body.title && !body.slug) update.slug = slugify(body.title);

    const post = await Post.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Post slug already exists" });
    res.status(500).json({ message: err.message || "Failed to update post" });
  }
}

export async function deletePost(req, res) {
  try {
    const result = await Post.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete post" });
  }
}
