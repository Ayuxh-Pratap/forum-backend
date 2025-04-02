import { ForumPost, ForumComment, EmailData } from '../types';
import { sendEmail } from '../services/emailService';

// In a real-world application, you would likely have a subscription system
// where users can opt-in to receive notifications about new posts or comments
// For this example, we'll just use placeholder functions that could be expanded

/**
 * Send notification about a new post to subscribed users
 * @param post The newly created post
 */
export const sendNewPostNotification = async (post: ForumPost): Promise<void> => {
  try {
    // In a real application, you would fetch a list of subscribed users
    // For this example, we'll just log the notification
    console.log(`Would send notification about new post: ${post.title}`);

    // Example of how you would send an email if you had subscribers
    /* 
    const subscribedUsers = await getSubscribedUsers();
    for (const user of subscribedUsers) {
      await sendEmail({
        recipientEmail: user.email,
        recipientName: user.name,
        subject: 'New Post on SongGPT Forum',
        postTitle: post.title,
        type: 'new_post',
        actionUrl: `https://songgpt.com/forum/${post.id}`
      });
    }
    */
  } catch (error) {
    console.error('Error sending new post notification:', error);
  }
};

/**
 * Send notification about a new comment to the post author and other commenters
 * @param post The post that was commented on
 * @param comment The newly created comment
 */
export const sendNewCommentNotification = async (
  post: ForumPost,
  comment: ForumComment
): Promise<void> => {
  try {
    // Avoid sending notification to the commenter themselves
    if (post.author_id === comment.author_id) {
      console.log('Skipping notification to the comment author');
      return;
    }

    // In a real application, you would fetch post author's email
    // For this example, we'll just log the notification
    console.log(
      `Would send notification to ${post.author_name} about new comment on post: ${post.title}`
    );

    // Example of how you would send an email to the post author
    /*
    const postAuthor = await getUserById(post.author_id);
    
    if (postAuthor && postAuthor.email) {
      await sendEmail({
        recipientEmail: postAuthor.email,
        recipientName: post.author_name,
        subject: 'New Comment on Your SongGPT Forum Post',
        postTitle: post.title,
        commentContent: comment.content,
        type: 'new_comment',
        actionUrl: `https://songgpt.com/forum/${post.id}`
      });
    }
    */
  } catch (error) {
    console.error('Error sending new comment notification:', error);
  }
}; 