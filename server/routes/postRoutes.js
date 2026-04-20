import { Router } from "express";
import {
  listPosts,
  listPublishedTags,
  listPostsAdmin,
  getTopViewed,
  getRelatedPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listPosts);
router.get("/meta/tags", listPublishedTags);
router.get("/stats/top-viewed", getTopViewed);
router.get("/related/:slug", getRelatedPosts);
router.get("/admin/all", requireAuth, listPostsAdmin);
router.get("/admin/post/:id", requireAuth, getPostById);
router.get("/:slug", getPostBySlug);
router.post("/", requireAuth, createPost);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

export default router;
