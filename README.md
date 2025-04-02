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

### Posts

- `GET /api/forum` - Get all posts
- `GET /api/forum/:id` - Get post by ID
- `POST /api/forum` - Create a new post
- `PUT /api/forum/:id` - Update a post
- `DELETE /api/forum/:id` - Delete a post
- `POST /api/forum/:id/like` - Like a post

### Comments

- `GET /api/forum/:id/comments` - Get comments for a post
- `POST /api/forum/:id/comments` - Add a comment to a post
- `DELETE /api/forum/:id/comments/:commentId` - Delete a comment
- `POST /api/forum/:id/comments/:commentId/like` - Like a comment

## License

ISC 