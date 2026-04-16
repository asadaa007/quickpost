import { Router } from "express";
import {
  listPosts,
  listPostsAdmin,
  getTopViewed,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listPosts);
router.get("/stats/top-viewed", getTopViewed);
router.get("/admin/all", requireAuth, listPostsAdmin);
router.get("/admin/post/:id", requireAuth, getPostById);
router.get("/:slug", getPostBySlug);
router.post("/", requireAuth, createPost);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

export default router;
