import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    affiliateLink: { type: String, default: "" },
    features: [{ type: String }],
    pros: [{ type: String }],
    cons: [{ type: String }],
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    products: [productSchema],
    tags: [{ type: String, trim: true }],
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
