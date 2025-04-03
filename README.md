# SongGPT Forum Backend

A RESTful API backend for the SongGPT forum built with Node.js, Express, TypeScript, and Neon PostgreSQL database.

## Features

- Forum post and comment functionality
- PostgreSQL database integration with Neon Cloud
- User authentication with JWT
- Rate limiting to prevent abuse
- Email notifications for new posts and comments
- TypeScript for type safety

## Database Schema

The application uses two main tables:

### forum_posts

```sql
CREATE TABLE forum_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  likes INTEGER DEFAULT 0
);
```

### forum_comments

```sql
CREATE TABLE forum_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  likes INTEGER DEFAULT 0
);
```

## Project Structure

```
songgpt-forum-backend/
├── src/
│   ├── config/
│   │   ├── db.ts          # Database configuration
│   │   └── env.ts         # Environment variables
│   ├── controllers/
│   │   ├── forumController.ts  # Forum post/comment controllers
│   │   └── emailController.ts  # Email notification controllers
│   ├── middleware/
│   │   ├── auth.ts        # Authentication middleware
│   │   └── rateLimit.ts   # Rate limiting middleware
│   ├── routes/
│   │   └── forumRoutes.ts # API routes
│   ├── services/
│   │   ├── emailService.ts # Email service
│   │   └── forumService.ts # Database operations
│   ├── templates/
│   │   └── emailTemplate.ts # Email HTML templates
│   ├── types/
│   │   └── index.ts       # TypeScript type definitions
│   └── app.ts             # Main application file
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` with your database credentials
4. Compile TypeScript to JavaScript:
   ```
   npm run build
   ```
5. Start the server:
   ```
   npm start
   ```

## Development

For development with hot-reloading:
```
npm run dev
```

## API Endpoints

The API base URL is `http://localhost:5000` for local development.

### Authentication

All protected endpoints require a JWT token provided in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Public Endpoints

#### Server Health Check
- **URL:** `/`
- **Method:** `GET`
- **Description:** Check if the API is running
- **Success Response:**
  ```json
  {
    "message": "Welcome to SongGPT Forum API",
    "status": "Server is running",
    "version": "1.0.0"
  }
  ```

#### Get All Posts
- **URL:** `/api/forum/posts`
- **Method:** `GET`
- **Query Parameters:**
  - `limit` (optional): Number of posts to return (default: 10)
  - `page` (optional): Page number for pagination (default: 1)
- **Success Response:**
  ```json
  {
    "success": true,
    "posts": [
      {
        "id": 1,
        "title": "Post Title",
        "content": "Post content here...",
        "author_id": "user123",
        "author_name": "John Doe",
        "author_image": "https://example.com/image.jpg",
        "created_at": "2023-06-01T12:00:00Z",
        "likes": 5
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
  ```

#### Get Single Post
- **URL:** `/api/forum/posts/:id`
- **Method:** `GET`
- **URL Parameters:**
  - `id`: Post ID
- **Success Response:**
  ```json
  {
    "success": true,
    "post": {
      "id": 1,
      "title": "Post Title",
      "content": "Post content here...",
      "author_id": "user123",
      "author_name": "John Doe",
      "author_image": "https://example.com/image.jpg",
      "created_at": "2023-06-01T12:00:00Z",
      "likes": 5
    },
    "comments": [
      {
        "id": 1,
        "post_id": 1,
        "content": "Comment content here...",
        "author_id": "user456",
        "author_name": "Jane Smith",
        "author_image": "https://example.com/image2.jpg",
        "created_at": "2023-06-01T13:00:00Z",
        "likes": 2
      }
    ]
  }
  ```
- **Error Response:** 
  ```json
  {
    "success": false,
    "message": "Post not found"
  }
  ```

### Protected Endpoints

#### Create Post
- **URL:** `/api/forum/posts`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "My New Post",
    "content": "This is the content of my post",
    "authorName": "Your Name"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "post": {
      "id": 3,
      "title": "My New Post",
      "content": "This is the content of my post",
      "author_id": "user123",
      "author_name": "Your Name",
      "author_image": null,
      "created_at": "2023-06-03T14:30:00Z",
      "likes": 0
    }
  }
  ```
- **Error Responses:**
  - **400**: Missing title or content
  - **401**: Unauthorized (missing or invalid token)
  - **429**: Rate limit exceeded

#### Add Comment
- **URL:** `/api/forum/posts/:id/comments`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Post ID
- **Body:**
  ```json
  {
    "content": "This is my comment on the post",
    "authorName": "Your Name"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "comment": {
      "id": 5,
      "post_id": 3,
      "content": "This is my comment on the post",
      "author_id": "user123",
      "author_name": "Your Name",
      "author_image": null,
      "created_at": "2023-06-03T15:00:00Z",
      "likes": 0
    }
  }
  ```
- **Error Responses:**
  - **400**: Missing content
  - **401**: Unauthorized
  - **404**: Post not found
  - **429**: Rate limit exceeded

#### Like Post
- **URL:** `/api/forum/posts/:id/like`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Post ID
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Post liked successfully"
  }
  ```
- **Error Responses:**
  - **401**: Unauthorized
  - **404**: Post not found
  - **429**: Rate limit exceeded

#### Like Comment
- **URL:** `/api/forum/comments/:id/like`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Comment ID
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Comment liked successfully"
  }
  ```
- **Error Responses:**
  - **401**: Unauthorized
  - **404**: Comment not found
  - **429**: Rate limit exceeded

#### Delete Post
- **URL:** `/api/forum/posts/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Post ID
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Post deleted successfully"
  }
  ```
- **Error Responses:**
  - **401**: Unauthorized
  - **403**: Forbidden (not the post author)
  - **404**: Post not found

#### Delete Comment
- **URL:** `/api/forum/comments/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Comment ID
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Comment deleted successfully"
  }
  ```
- **Error Responses:**
  - **401**: Unauthorized
  - **403**: Forbidden (not the comment author)
  - **404**: Comment not found

## Testing API Endpoints

### Using Postman

1. **Install and open Postman**
2. **Create a new Collection** for SongGPT Forum API tests
3. **Set up environment variables**:
   - Create a "SongGPT Local" environment
   - Add variables: `base_url` (http://localhost:5000) and `token` (your JWT token)
4. **Create requests for each endpoint** using the documentation above
5. **Testing workflow**:
   - Start with public endpoints
   - Create a post and note the returned post ID
   - Use the post ID to test comment-related endpoints
   - Test like functionality
   - Finally test delete endpoints

### Using the Test Script

We've included a test script that automatically tests all API endpoints:

```bash
# Generate a test token first
node generate-test-token.js

# Add the token to your .env file as API_TOKEN

# Run the tests
node test-endpoints.js
```

## License

ISC 