import pool from '../config/db';
import { ForumPost, ForumComment } from '../types';

export const getAllPosts = async (
  limit: number = 10,
  offset: number = 0
): Promise<{ posts: ForumPost[], total: number }> => {
  const client = await pool.connect();
  try {
    // Get posts with pagination
    const postsResult = await client.query(
      `SELECT * FROM forum_posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Get total count for pagination
    const countResult = await client.query('SELECT COUNT(*) FROM forum_posts');
    
    return {
      posts: postsResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  } finally {
    client.release();
  }
};

export const getPostById = async (postId: number): Promise<ForumPost | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM forum_posts WHERE id = $1',
      [postId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

export const createPost = async (
  title: string,
  content: string,
  authorId: string,
  authorName: string,
  authorImage: string | null
): Promise<ForumPost> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO forum_posts (title, content, author_id, author_name, author_image) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [title, content, authorId, authorName, authorImage]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const getCommentsByPostId = async (postId: number): Promise<ForumComment[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM forum_comments WHERE post_id = $1 ORDER BY created_at ASC',
      [postId]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
};

export const createComment = async (
  postId: number,
  content: string,
  authorId: string,
  authorName: string,
  authorImage: string | null
): Promise<ForumComment> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO forum_comments (post_id, content, author_id, author_name, author_image) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [postId, content, authorId, authorName, authorImage]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const likePost = async (postId: number): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE forum_posts SET likes = likes + 1 WHERE id = $1',
      [postId]
    );
  } finally {
    client.release();
  }
};

export const likeComment = async (commentId: number): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE forum_comments SET likes = likes + 1 WHERE id = $1',
      [commentId]
    );
  } finally {
    client.release();
  }
};

export const deletePost = async (postId: number, authorId: string): Promise<boolean> => {
  const client = await pool.connect();
  try {
    // Only allow deletion if the current user is the author
    const result = await client.query(
      'DELETE FROM forum_posts WHERE id = $1 AND author_id = $2 RETURNING id',
      [postId, authorId]
    );
    
    return result.rowCount ? result.rowCount > 0 : false;
  } finally {
    client.release();
  }
};

export const deleteComment = async (commentId: number, authorId: string): Promise<boolean> => {
  const client = await pool.connect();
  try {
    // Only allow deletion if the current user is the author
    const result = await client.query(
      'DELETE FROM forum_comments WHERE id = $1 AND author_id = $2 RETURNING id',
      [commentId, authorId]
    );
    
    return result.rowCount ? result.rowCount > 0 : false;
  } finally {
    client.release();
  }
};

// Helper function to extract mentions from a comment
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}; 