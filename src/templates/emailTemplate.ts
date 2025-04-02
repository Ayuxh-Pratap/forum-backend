export const generateEmailTemplate = (
  recipientName: string,
  title: string,
  content: string,
  actionUrl: string,
  actionText: string
): string => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #121212;
          color: #ffffff;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #6024ca, #a34cff);
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background-color: #1e1e1e;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #6024ca, #a34cff);
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 50px;
          margin-top: 25px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding-top: 30px;
          font-size: 12px;
          color: #888888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SongGPT Forum</h1>
        </div>
        <div class="content">
          <h2>Hello ${recipientName},</h2>
          <p>${content}</p>
          <div style="text-align: center;">
            <a href="${actionUrl}" class="button">${actionText}</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SongGPT. All rights reserved.</p>
          <p>If you don't want to receive these emails, you can unsubscribe.</p>
        </div>
      </div>
    </body>
  </html>
  `;
}; 