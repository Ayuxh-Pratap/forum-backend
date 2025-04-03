const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const API_TOKEN = process.env.API_TOKEN || ''; // JWT token for authenticated requests

// Test summary
let passed = 0;
let failed = 0;
let total = 0;

// Test helper function
async function testEndpoint(method, endpoint, data = null, auth = false, expectedStatus = 200) {
  total++;
  const url = `${API_URL}${endpoint}`;
  console.log(`\nTesting ${method.toUpperCase()} ${url}`);
  
  if (data) {
    console.log('Request data:', JSON.stringify(data, null, 2));
  }
  
  try {
    const headers = {};
    if (auth) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
      console.log('Using Authorization header:', headers['Authorization'].substring(0, 20) + '...');
    }
    
    let response;
    if (method.toLowerCase() === 'get') {
      response = await axios.get(url, { headers });
    } else if (method.toLowerCase() === 'post') {
      response = await axios.post(url, data, { headers });
    } else if (method.toLowerCase() === 'delete') {
      response = await axios.delete(url, { headers });
    }
    
    if (response.status === expectedStatus) {
      console.log(`✅ Success (${response.status})`);
      console.log('Response:', JSON.stringify(response.data, null, 2).slice(0, 200) + '...');
      passed++;
    } else {
      console.log(`❌ Failed - Expected status ${expectedStatus}, got ${response.status}`);
      failed++;
    }
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === expectedStatus) {
      console.log(`✅ Success - Expected error (${error.response.status})`);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
      passed++;
    } else {
      console.log('❌ Failed - Error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.request) {
        console.log('Request details:', {
          method: method.toUpperCase(),
          url,
          headers: auth ? { Authorization: 'Bearer [REDACTED]' } : {},
          data: data || {}
        });
      }
      failed++;
    }
  }
}

// Main test function
async function runTests() {
  console.log('=== FORUM API ENDPOINT TESTS ===');
  console.log(`Base URL: ${API_URL}`);
  console.log(`API Token available: ${Boolean(API_TOKEN)}`);
  
  // Test public endpoints
  await testEndpoint('get', '/api/forum/posts');
  await testEndpoint('get', '/api/forum/posts?limit=5&page=1');
  
  // Test root endpoint
  await testEndpoint('get', '/');
  
  // Create a post (requires auth)
  const postData = {
    title: 'Test Post Title',
    content: 'This is a test post created by the API test script.',
    authorName: 'Test User'
  };
  const newPost = await testEndpoint('post', '/api/forum/posts', postData, true, 201);
  
  // If post creation succeeded, test related endpoints
  if (newPost && newPost.post && newPost.post.id) {
    const postId = newPost.post.id;
    
    // Get single post
    await testEndpoint('get', `/api/forum/posts/${postId}`);
    
    // Add a comment
    const commentData = {
      content: 'This is a test comment!',
      authorName: 'Test Commenter'
    };
    const newComment = await testEndpoint('post', `/api/forum/posts/${postId}/comments`, commentData, true, 201);
    
    // Like the post
    await testEndpoint('post', `/api/forum/posts/${postId}/like`, {}, true);
    
    // If comment creation succeeded, test comment-related endpoints
    if (newComment && newComment.comment && newComment.comment.id) {
      const commentId = newComment.comment.id;
      
      // Like the comment
      await testEndpoint('post', `/api/forum/comments/${commentId}/like`, {}, true);
      
      // Delete the comment
      await testEndpoint('delete', `/api/forum/comments/${commentId}`, null, true);
    }
    
    // Delete the post
    await testEndpoint('delete', `/api/forum/posts/${postId}`, null, true);
  }
  
  // Test invalid requests
  await testEndpoint('get', '/api/forum/posts/999999', null, false, 404);
  await testEndpoint('post', '/api/forum/posts', { title: 'Missing Content' }, true, 400);
  await testEndpoint('post', '/api/forum/posts', postData, false, 401); // No auth
  
  // Print test summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Total tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
}

// Run the tests
runTests().catch(error => {
  console.error('Test script error:', error);
}); 