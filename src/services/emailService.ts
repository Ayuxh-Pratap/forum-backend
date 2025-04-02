import nodemailer from 'nodemailer';
import { EmailData } from '../types';
import { generateEmailTemplate } from '../templates/emailTemplate';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    let subject = emailData.subject;
    let content = '';
    let actionUrl = emailData.actionUrl || 'https://songgpt.com/forum';
    let actionText = 'View in Forum';

    switch (emailData.type) {
      case 'new_post':
        content = `A new post "${emailData.postTitle}" has been created in the SongGPT Forum. Join the discussion!`;
        break;
      case 'new_comment':
        content = `Someone has commented on a post you're following: "${emailData.commentContent}"`;
        break;
      case 'mention':
        content = `You've been mentioned in a comment: "${emailData.commentContent}"`;
        break;
    }

    const htmlContent = generateEmailTemplate(
      emailData.recipientName,
      subject,
      content,
      actionUrl,
      actionText
    );

    const mailOptions = {
      from: `"SongGPT Forum" <${process.env.EMAIL_USER}>`,
      to: emailData.recipientEmail,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}; 