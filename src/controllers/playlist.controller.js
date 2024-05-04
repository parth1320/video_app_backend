import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!req.user?._id) {
    throw new ApiError(404, "You are not authorized to create playlist");
  }

  if (!(name && description)) {
    throw new ApiError(
      400,
      "name and description both required to create playlist"
    );
  }

  const playlist = await Playlist.create({
    name: name.toString().trim(),
    description: description.toString().trim(),
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(500, "Failed to create playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "Invalid userId");
  }

  const playlists = Playlist.aggregate([
    {
      from: "videos",
      localField: "videos",
      foreignField: "_id",
      as: "videos",
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        totalVideos: 1,
        totalViews: 1,
        updatedAt: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlistId");
  }

  const playlist = await Playlist.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $match: {
        "videos.isPublished": true,
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
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
      },
      totalViews: {
        $sum: "$videos.views",
      },
      owner: {
        $first: "$owner",
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideos: 1,
        totalViews: 1,
        videos: {
          _id: 1,
          videoFile: 1,
          title: 1,
          description: 1,
          duration: 1,
          createdAt: 1,
          views: 1,
        },
        owner: {
          username: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!req.user?._id) {
    throw new ApiError(
      404,
      "You are must be authenticated before adding video into playlist"
    );
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't add video to this playlist as you are not the loggedIn user"
    );
  }

  const addVideoToPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!addVideoToPlaylist) {
    throw new ApiError(500, "Failed to add video to playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        addVideoToPlaylist,
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!req.user?._id) {
    throw new ApiError(
      404,
      "You are must be authenticated before removing video from playlist"
    );
  }

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid PlaylistId or videoId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't add video to this playlist as you are not the loggedIn user"
    );
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylist,
        "Removed video from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlistDetails = await Playlist.findById(playlistId);

  const userId = new mongoose.Types.ObjectId(req.user?._id);

  if (!userId.equals(playlistDetails?.owner)) {
    throw new ApiError(
      400,
      "You can't delete this Playlist as you are not the loggedIn User"
    );
  }

  const result = await Playlist.findByIdAndDelete(playlistDetails._id);

  if (!result) {
    throw new ApiError(500, "Couldnt Delete the Playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully Deleted the Playlist"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!req.user?._id) {
    throw new ApiError(400, "You must be authenticated to update a playlist");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!name && !description) {
    throw new ApiError(404, "Name & Description both are Required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "No Playlist found");
  }

  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't update video to this playlist as you are not the loggedIn user"
    );
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlist._id,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!updatePlaylist) {
    throw new ApiError(500, "Failed to update the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatePlaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
