import { Router } from "express";
import {
  listCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listCategories);
router.post("/", requireAuth, createCategory);
router.delete("/:id", requireAuth, deleteCategory);

export default router;
