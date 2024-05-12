import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLink = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!req.user?._id) {
    throw new ApiError(400, "You must be authenticated to like the video");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Invalid objectId");
  }

  const likeAlready = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (likeAlready) {
    await Like.findByIdAndDelete(likeAlready._id);

    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }

  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

const toggleCommentLink = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!req.user?._id) {
    throw new ApiError(400, "You must be authenticated to like the comment");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(404, "Invalid objectId");
  }

  const commentLikeAlready = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (commentLikeAlready) {
    await Like.findByIdAndDelete(commentLikeAlready._id);

    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

const toggleTweetLink = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!req.user?._id) {
    throw new ApiError(400, "You must be authenticated to like the tweet");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(404, "Invalid objectId");
  }

  const tweetLikeAlready = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (tweetLikeAlready) {
    await Like.findByIdAndDelete(tweetLikeAlready._id);

    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }

  await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, { isLiked: true }));
});

const getLikedVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(404, "no user id available");
  }

  const likedVideo = await Like.aggregate([
    {
      $match: {
        likedBy: userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
          {
            $project: {
              _id: 1,
              "videoFile.url": 1,
              "thumbnail.url": 1,
              owner: 1,
              title: 1,
              description: 1,
              views: 1,
              duration: 1,
              createdAt: 1,
              isPublished: 1,
              ownerDetails: {
                username: 1,
                fullName: 1,
                "avatar.url": 1,
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$likedVideo",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $replaceRoot: {
        newRoot: "$likedVideo",
      },
    },
  ]);

  if (!likedVideo) {
    throw new ApiError(404, "No liked videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideo, "liked video fetch successfully"));
});

export { toggleVideoLink, toggleCommentLink, toggleTweetLink, getLikedVideo };
