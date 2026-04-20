import Category from "../models/Category.js";
import Post from "../models/Post.js";
import { UNCATEGORIZED_SLUG } from "../constants.js";

/** Ensures fallback category exists and repairs empty category strings on posts. */
export async function ensureUncategorizedCategory() {
  await Category.findOneAndUpdate(
    { slug: UNCATEGORIZED_SLUG },
    { $setOnInsert: { name: "Uncategorized", slug: UNCATEGORIZED_SLUG } },
    { upsert: true }
  );
  await Post.updateMany({ category: "" }, { $set: { category: UNCATEGORIZED_SLUG } });
}
