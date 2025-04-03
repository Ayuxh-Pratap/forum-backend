import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as forumService from '../services/forumService';
import * as emailService from '../services/emailService';

// Get all posts with pagination
export const getPosts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;
    
    const { posts, total } = await forumService.getAllPosts(limit, offset);
    
    res.status(200).json({
      success: true,
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ success: false, message: 'Failed to get posts' });
  }
};

// Get a single post with its comments
export const getPost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    
    const post = await forumService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const comments = await forumService.getCommentsByPostId(postId);
    
    res.status(200).json({
      success: true,
      post,
      comments
    });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ success: false, message: 'Failed to get post' });
  }
};

// Create a new post
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    
    console.log('Create post request:', {
      body: req.body,
      user: req.user,
      title,
      content
    });
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // In your app, you would get these from your user database based on req.user.id
    // For simplicity, I'm assuming you have them from frontend or can get them somewhere
    const authorId = req.user.id;
    const authorName = req.body.authorName || 'Anonymous';
    const authorImage = req.body.authorImage || null;
    
    console.log('Creating post with params:', {
      title,
      content: content.substring(0, 50) + '...',
      authorId,
      authorName,
      authorImage
    });
    
    const post = await forumService.createPost(
      title,
      content,
      authorId,
      authorName,
      authorImage
    );
    
    console.log('Post created successfully:', post.id);
    
    // Send email notifications to subscribers
    // This is just a placeholder - in a real app you'd have a subscribers table
    // const subscribers = await getForumSubscribers();
    // for (const subscriber of subscribers) {
    //   await emailService.sendEmail({
    //     recipientEmail: subscriber.email,
    //     recipientName: subscriber.name,
    //     subject: 'New Forum Post',
    //     postTitle: title,
    //     type: 'new_post',
    //     actionUrl: `https://songgpt.com/forum/${post.id}`
    //   });
    // }
    
    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
};

// Add a comment to a post
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const post = await forumService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const authorId = req.user.id;
    const authorName = req.body.authorName || 'Anonymous';
    const authorImage = req.body.authorImage || null;
    
    const comment = await forumService.createComment(
      postId,
      content,
      authorId,
      authorName,
      authorImage
    );
    
    // Notify post author about new comment (if not the same as commenter)
    if (post.author_id !== authorId) {
      // In a real app, you'd get the email from your users table
      const authorEmail = await getUserEmailById(post.author_id);
      
      if (authorEmail) {
        await emailService.sendEmail({
          recipientEmail: authorEmail,
          recipientName: post.author_name,
          subject: 'New Comment on Your Post',
          postTitle: post.title,
          commentContent: content,
          type: 'new_comment',
          actionUrl: `https://songgpt.com/forum/${postId}`
        });
      }
    }
    
    // Process mentions in the comment
    const mentions = forumService.extractMentions(content);
    for (const username of mentions) {
      // In a real app, you'd query your database to get user email from username
      const userEmail = await getUserEmailByUsername(username);
      
      if (userEmail) {
        await emailService.sendEmail({
          recipientEmail: userEmail,
          recipientName: username,
          subject: 'You were mentioned in a comment',
          commentContent: content,
          type: 'mention',
          actionUrl: `https://songgpt.com/forum/${postId}`
        });
      }
    }
    
    res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};

// Like a post
export const likePost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    
    const post = await forumService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    await forumService.likePost(postId);
    
    res.status(200).json({ success: true, message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: 'Failed to like post' });
  }
};

// Like a comment
export const likeComment = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id);
    
    await forumService.likeComment(commentId);
    
    res.status(200).json({ success: true, message: 'Comment liked successfully' });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ success: false, message: 'Failed to like comment' });
  }
};

// Delete a post
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const success = await forumService.deletePost(postId, req.user.id);
    
    if (!success) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to delete this post or post not found' 
      });
    }
    
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};

// Delete a comment
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = parseInt(req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const success = await forumService.deleteComment(commentId, req.user.id);
    
    if (!success) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to delete this comment or comment not found' 
      });
    }
    
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};

// Helper function to get user email by ID (placeholder)
const getUserEmailById = async (userId: string): Promise<string | null> => {
  // In a real application, you would query your database to get the user's email
  // For this example, returning null
  return null;
};

// Helper function to get user email by username (placeholder)
const getUserEmailByUsername = async (username: string): Promise<string | null> => {
  // In a real application, you would query your database to get the user's email
  // For this example, returning null
  return null;
}; 