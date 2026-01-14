import express from "express";
import {
  addComment,
  getCommentsByPostId,
} from "../controllers/commentController.js";

const router = express.Router();
router.post("/", addComment);
router.get("/post/:postId", getCommentsByPostId);
export default router;
