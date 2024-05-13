# Backend for video app like youtube

Developing backend using Node.js

# Video App Backend

This repository contains the backend codebase for an application similar to YouTube. It provides functionalities for managing users, videos, subscriptions, comments, tweets, likes, and playlists. The project utilizes MongoDB as the database, Mongoose for object modeling, and Express.js for building the RESTful API endpoints.

## Tech Stack

- **Node.js**: JavaScript runtime for server-side development.
- **MongoDB**: NoSQL database for data storage.
- **Express.js**: Web application framework for Node.js.
- **Mongoose**: MongoDB object modeling tool designed to work in an asynchronous environment.
- **Cloudinary**: Cloud-based service for managing and storing images and videos.
- **Multer**: Middleware for handling multipart/form-data, primarily used for file uploads.

## Models

1. **User**: Represents a user of the platform.
2. **Video**: Represents a video uploaded to the platform.
3. **Subscription**: Represents the subscription relationship between users.
4. **Comment**: Represents a comment made on a video.
5. **Tweet**: Represents a tweet associated with a video.
6. **Like**: Represents a like given to a video.
7. **Playlist**: Represents a playlist created by a user.

All models are interconnected using Mongoose ObjectId references.

## MongoDB Aggregation Pipeline

The project leverages the MongoDB aggregation pipeline for advanced querying and data aggregation operations, enhancing performance and flexibility in retrieving data from MongoDB Atlas documents.

## Authentication and Security

For authentication and security purposes, the project integrates the following npm libraries:

- **jsonwebtoken**: For generating and verifying JSON Web Tokens (JWT).
- **bcrypt**: For hashing user passwords securely.

## Features

### Authentication

- **Register**: Allows users to create a new account.
- **Login**: Enables users to authenticate and obtain access tokens.
- **Logout**: Logs out the current user and invalidates tokens.

### User Management

- **Get User by ID**: Fetches user details based on their ID.
- **Change Profile**: Allows users to update their profile information.

### Video Management

- **Create, Update, and Delete Video**: Provides CRUD operations for managing videos.
- **Get All Liked Videos**: Retrieves all videos liked by a user.
- **Add Video to Playlist**: Adds a video to a user's playlist.
- **Delete a Video from Playlist**: Removes a video from a user's playlist.
- **Update Playlist**: Modifies the details of a playlist.

### Subscription

- **Subscribe and Unsubscribe Channel**: Allows users to subscribe to and unsubscribe from channels.

### Social Interaction

- **Add Likes to Video**: Enables users to like videos.
- **Comment on Video and Tweet**: Allows users to leave comments on videos and tweet about them.
- **Tweet**: Provides functionality for users to tweet about videos.

## Acknowledgments

This project was created with contributions from the open-source community and resources available online. A big shoutout to all contributors and resources that made this project possible!

## Running the Project

To run this repository locally, follow these steps:

1. Install necessary npm libraries:

npm install

2. Set up environment variables by creating a `.env` file with the provided configurations.

3. Set up environment variables by creating a `.env` file with the following configurations:

```plaintext
PORT=               // Port number for running the server
MONGODB_URI=        // MongoDB connection URI
CORS_ORIGIN=        // CORS origin for handling cross-origin requests
ACCESS_TOKEN_SECRET=        // Secret key for JWT access tokens
ACCESS_TOKEN_EXPIRY=1d      // Expiry time for access tokens
REFRESH_TOKEN_SECRET=       // Secret key for JWT refresh tokens
REFRESH_TOKEN_EXPIRY=10d    // Expiry time for refresh tokens
CLOUDINARY_CLOUD_NAME=      // Cloudinary cloud name for image and video storage
CLOUDINARY_API_KEY=         // Cloudinary API key
CLOUDINARY_API_SECRET=      // Cloudinary API secret


3. Start the development server:

npm run dev

## Dependencies

Here is a list of npm libraries used in this project:

- **bcrypt**: ^5.1.1
- **cloudinary**: ^2.2.0
- **cookie-parser**: ^1.4.6
- **cors**: ^2.8.5
- **dotenv**: ^16.4.5
- **express**: ^4.19.2
- **jsonwebtoken**: ^9.0.2
- **mongoose**: ^8.3.2
- **mongoose-aggregate-paginate-v2**: ^1.0.7
- **multer**: ^1.4.5-lts.1

Make sure to check the `package.json` file for detailed library versions.
```
