const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Generate a test token with user information
const generateToken = () => {
  const testUser = {
    sub: 'test-user-id-123',  // Using 'sub' instead of 'id' to match auth middleware expectations
    email: 'testuser@example.com',
    name: 'Test User'
  };

  const token = jwt.sign(
    testUser,
    process.env.JWT_SECRET || 'fallback-secret-for-testing',
    { expiresIn: '1h' }
  );

  console.log('=== TEST JWT TOKEN ===');
  console.log(token);
  console.log('\nAdd this token to your .env file as:');
  console.log('API_TOKEN=<token>');
};

generateToken(); 