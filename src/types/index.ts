import { Request } from 'express';

// Forum Post type
export interface ForumPost {
  id: number;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_image: string | null;
  created_at: string;
  likes: number;
}

// Forum Comment type
export interface ForumComment {
  id: number;
  post_id: number;
  content: string;
  author_id: string;
  author_name: string;
  author_image: string | null;
  created_at: string;
  likes: number;
}

// Request with User data from Auth middleware
export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    profile_image?: string;
  };
}

// Email data type
export interface EmailData {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  postTitle?: string;
  commentContent?: string;
  actionUrl?: string;
  type: 'new_post' | 'new_comment' | 'mention';
}

// Email options type
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create Post DTO (Data Transfer Object)
export interface CreatePostDTO {
  title: string;
  content: string;
}

// Create Comment DTO
export interface CreateCommentDTO {
  content: string;
  post_id: number;
} 