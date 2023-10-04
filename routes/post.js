/* This code is creating a router in Express.js for handling a POST request to create a post. */
import express, { json } from "express";
import {
  createPost,
  deletePost,
  getAllFeaturedPosts,
  getLatestPosts,
  getRelatedPosts,
  getSinglePost,
  searchPost,
  updatePost,
  uploadImage,
} from "../controllers/post.js";
import upload from "../middlewares/multer.js";
import { postValidator, validate } from "../middlewares/postValidator.js";
import { parseUpdateData } from "../middlewares/parseUpdateData.js";
const router = express.Router();

router.post(
  "/create",
  upload.single("thumbnail"),
  parseUpdateData,
  postValidator,
  validate,
  createPost
);

router.put(
  "/update/:postId",
  upload.single("thumbnail"),
  parseUpdateData,
  postValidator,
  validate,
  updatePost
);

router.delete("/delete/:postId", deletePost);
router.get("/single/:slug", getSinglePost);
router.get("/featured-posts", getAllFeaturedPosts);
router.get("/latest-posts", getLatestPosts);
router.get("/search", searchPost);
router.get("/related-posts/:postId", getRelatedPosts);
router.post("/upload-image", upload.single("image"), uploadImage);
export default router;
