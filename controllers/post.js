import { isValidObjectId } from "mongoose";
import cloudinary from "../filesCloud/cloudinary.js";
import FeaturedPost from "../models/featurePost.js";
import BlogPost from "../models/post.js";

const FEATUREDPOSTLIMIT = 4;

const handleFeaturedPost = async (postId) => {
  try {
    const isAlreadyFeaturedPost = await FeaturedPost.findOne({ post: postId });
    if (isAlreadyFeaturedPost) return;
    // Create a new featuredPost document with the provided postId
    const newFeaturedPost = new FeaturedPost({ post: postId });
    await newFeaturedPost.save();

    // Find all featured posts, sort by createdAt in descending order
    const limitedFeaturedPosts = await FeaturedPost.find({})
      .sort({ createdAt: -1 })
      .exec();
    // Check if there are more featured posts than the limit
    if (limitedFeaturedPosts.length > FEATUREDPOSTLIMIT) {
      // Remove the excess featured posts
      const postsToDelete = limitedFeaturedPosts.slice(FEATUREDPOSTLIMIT);
      for (const post of postsToDelete) {
        await FeaturedPost.findByIdAndDelete(post._id);
      }
    }
  } catch (error) {
    console.error("Error handling featured post:", error);
  }
};

const removeFromFeaturedPost = async (postId) => {
  await FeaturedPost.findOneAndDelete({ post: postId });
};

const isFeaturedPost = async (postId) => {
  const post = await FeaturedPost.findOne({ post: postId }); //we here passing key value pair so it can find the exact match
  return post ? true : false;
};

export const createPost = async (req, res) => {
  try {
    const { title, content, tags, meta, slug, featured } = req.body;
    const { file } = req;
    const newPost = new BlogPost({
      title,
      content,
      tags,
      meta,
      slug,
      featured,
    });

    if (file) {
      const { secure_url: url, public_id } = await cloudinary.uploader.upload(
        file.path
      );
      console.log(url, public_id);
      newPost.thumbnail = { url, public_id };
    }
    await newPost.save();
    if (featured) {
      await handleFeaturedPost(newPost._id);
    }
    res.status(201).json({
      post: {
        id: newPost._id,
        title,
        meta,
        slug,
        thumbnail: newPost.thumbnail?.url,
        author: newPost.author,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!isValidObjectId(postId))
      return res.status(400).json({ error: "envalid request" });

    const post = await BlogPost.findById(postId);
    if (!post) return res.status(400).json({ error: "post not found!" });

    const public_id = post.thumbnail?.public_id;
    if (public_id) {
      const { result } = await cloudinary.uploader.destroy(public_id);
      if (result !== "ok")
        return res
          .status(404)
          .json({ error: "could not remove the thumbnail" });
    }

    await BlogPost.findByIdAndDelete(postId);
    await removeFromFeaturedPost(postId);
    res.status(200).json({ message: "post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content, tags, meta, slug, featured } = req.body;
    const { file } = req;
    const { postId } = req.params;
    if (!isValidObjectId(postId))
      return res.status(400).json({ error: "invalid request" });

    const post = await BlogPost.findById(postId);
    if (!post) return res.status(400).json({ error: "post not found" });

    const public_id = post.thumbnail?.public_id;
    if (public_id && file) {
      const { result } = await cloudinary.uploader.destroy(public_id);
      if (result !== "ok")
        return res
          .status(404)
          .json({ error: "could not remove the thumbnail" });
    }

    if (file) {
      const { secure_url: url, public_id } = await cloudinary.uploader.upload(
        file.path
      );
      console.log("here is the file", url, public_id);
      post.thumbnail = { url, public_id };
    }
    const updatePost = await BlogPost.findByIdAndUpdate(
      postId,
      { title, content, tags, meta, slug },
      { new: true }
    );
    if (featured) await handleFeaturedPost(post._id);
    else await removeFromFeaturedPost(post._id);
    updatePost.thumbnail = post.thumbnail;
    await updatePost.save();
    res.status(200).json({
      post: {
        id: updatePost._id,
        title,
        content,
        tags,
        meta,
        slug,
        thumbnail: updatePost.thumbnail?.url,
        author: updatePost.author,
        featured,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const getSinglePost = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ error: "invalid request" });

    const post = await BlogPost.findOne({ slug }); //we use byId beacuse we passing id to that
    if (!post) return res.status(400).json({ error: "post not found" });

    console.log(post);
    const { title, content, tags, meta, author, createdAt } = post;
    const featured = await isFeaturedPost(post._id);
    res.json({
      post: {
        id: post._id,
        title,
        content,
        tags,
        meta,
        slug,
        thumbnail: post.thumbnail?.url,
        author,
        featured,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const getAllFeaturedPosts = async (req, res) => {
  try {
    const featuredPosts = await FeaturedPost.find({})
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("post"); //beacuse we used reference in the posts so we can get the ref from our Post chema and we can access that too

    console.log(featuredPosts);
    res.status(200).json({
      posts: featuredPosts.map(({ post }) => ({
        //we destructed only post so we need only post
        id: post.id,
        title: post.title,
        meta: post.meta,
        slug: post.slug,
        thumbnail: post.thumbnail?.url,
        author: post.author,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const getLatestPosts = async (req, res) => {
  try {
    const { pageNo, limit } = req.query;
    const post = await BlogPost.find({})
      .sort({ createdAt: -1 })
      .skip(parseInt(pageNo) * parseInt(limit))
      .limit(parseInt(limit));

      const postCount = await BlogPost.countDocuments();

    res.json({
      posts: post.map((post) => ({
        id: post._id,
        title: post.title,
        meta: post.meta,
        slug: post.slug,
        thumbnail: post.thumbnail?.url,
        author: post.author,
        createdAt : post.createdAt,
        tags : post.tags,
      })),
      postCount,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const searchPost = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title.trim()) {
      return res.status(400).json({ message: "query is missing" });
    }

    const posts = await BlogPost.find({
      title: { $regex: title, $options: "i" },
    });

    res.json({
      posts: posts.map((post) => ({
        id: post._id,
        title: post.title,
        meta: post.meta,
        slug: post.slug,
        thumbnail: post.thumbnail?.url,
        author: post.author,
        createdAt : post.createdAt,
        tags : post.tags,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const getRelatedPosts = async (req, res) => {
 try {
  const { postId } = req.params;
  if (!isValidObjectId(postId))
    return res.status(400).json({ message: "please enter valid postId" });

  const post = await BlogPost.findById(postId);
  if (!post) return res.status(400).json({ message: "post not found" });

  const relatedPosts = await BlogPost.find({
    tags: { $in: [...post.tags] },
    _id: { $ne: post._id },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    posts: relatedPosts.map((post) => ({
      id: post._id,
      title: post.title,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.url,
      author: post.author,
    })),
  });
 } catch (error) {
  console.log(error);
  res.status(400).json({error : error.message});
 }
};

export const uploadImage = async(req,res) => {
  const {file} = req;
  if(!file) return res.status(400).json({message : "file not found"});

  const {secure_url : url} = await cloudinary.uploader.upload(file.path)
  res.status(201).json({image : url}); //201 status code is for files
};
