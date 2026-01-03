// API test script for AccessEdu backend
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Mock console.log to suppress server startup logs
console.log = jest.fn();

describe('AccessEdu API Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accessedu_test');
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('Content API', () => {
    test('should get all content', async () => {
      const response = await request(app)
        .get('/api/content')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get content by subject', async () => {
      // This would require a valid subject ID to test properly
      const response = await request(app)
        .get('/api/content/subject/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Subject API', () => {
    test('should get all subjects', async () => {
      const response = await request(app)
        .get('/api/subjects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Authentication API', () => {
    test('should return health check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
    });

    test('should require credentials for login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});