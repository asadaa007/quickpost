import Category from "../models/Category.js";
import Post from "../models/Post.js";
import { slugify } from "../utils/slugify.js";
import { sendServerError } from "../utils/httpErrors.js";
import { UNCATEGORIZED_SLUG } from "../constants.js";
import { ensureUncategorizedCategory } from "../bootstrap/ensureUncategorized.js";

export async function listCategories(req, res) {
  try {
    const [categories, postCounts] = await Promise.all([
      Category.find().sort({ createdAt: -1 }).lean(),
      Post.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = {};
    postCounts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    res.json(
      categories.map((cat) => ({ ...cat, postCount: countMap[cat.slug] ?? 0 }))
    );
  } catch (err) {
    sendServerError(res, err, "Failed to list categories");
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const result = await Category.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: "Category not found" });

    if (result.slug === UNCATEGORIZED_SLUG) {
      return res.status(400).json({ message: "The Uncategorized category cannot be deleted." });
    }

    await ensureUncategorizedCategory();
    await Post.updateMany({ category: result.slug }, { $set: { category: UNCATEGORIZED_SLUG } });

    res.json({ message: "Category deleted", id });
  } catch (err) {
    sendServerError(res, err, "Failed to delete category");
  }
}

export async function createCategory(req, res) {
  try {
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });
    const finalSlug = slug ? slugify(slug) : slugify(name);
    const category = await Category.create({ name, slug: finalSlug });
    res.status(201).json({ ...category.toObject(), postCount: 0 });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Category slug already exists" });
    sendServerError(res, err, "Failed to create category");
  }
}
