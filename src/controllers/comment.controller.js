import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!req.user?._id) {
    throw new ApiError(400, "You must be authenticated to get comments");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const commentsAggregate = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        $owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        owner: {
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
        isLiked: 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  return res
    .status(200)
    .json(
      new ApiResponse(200, comments, "Video Comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { content } = req.body;

  if (!req.user?._id) {
    throw new ApiError(400, "You must be authenticated to add a comment");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  if (!content) {
    throw new ApiError(404, "Content is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to add comment, Try again later");
  }

  const owner = {
    0: {
      avatar: {
        url: req.user.avatar,
      },
      username: req.user.username,
    },
  };

  const response = {
    _id: comment._id,
    content: comment.comment,
    createdAt: comment.createdAt,
    owner: owner,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!req.user?._id) {
    throw new ApiError(400, "You must be authenticated to add a comment");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  if (!content) {
    throw new ApiError(404, "Content is required");
  }

  const commentDetails = await Comment.findById(commentId);
  const userId = new mongoose.Types.ObjectId(req.user?._id);

  if (!userId.equals(commentDetails?.owner)) {
    throw new ApiError(404, "You are not authorized to update this comment");
  }

  const comment = Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(500, "Failed to update comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!userId.equals(commentDetails?.owner)) {
    throw new ApiError(404, "You are not authorized to delete this comment");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const commentDetails = await Comment.findById(commentId);
  const userId = new mongoose.Types.ObjectId(req.user?._id);

  if (!userId.equals(commentDetails?.owner)) {
    throw new ApiError(404, "You are not authorized to update this comment");
  }

  const comment = await Comment.findByIdAndDelete(commentDetails?._id);

  await Like.deleteMany({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to delete comment, Try again later");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, commentId, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
