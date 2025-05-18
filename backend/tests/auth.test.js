
const request = require('supertest');
const mongoose = require('mongoose');
const { app, startServer, closeServer } = require('../server');
const User = require('../models/User');
const { redisClient, connectRedis } = require('../config/redisClient'); // Add connectRedis

// Test user credentials
const TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'ValidPassword123!',
  role: 'customer'
};

  // Additional mongoose setup
  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

// Global setup
beforeAll(async () => {
    require('dotenv').config();
    await startServer();
    await connectRedis(); // Add this line
});
  
  // Update cleanup
  beforeEach(async () => {
    await User.deleteMany({});
    await redisClient.del('revokedTokens'); // Now using correct del command
});
  
  // Update teardown
  afterAll(async () => {
    await closeServer();
    if (redisClient.isOpen) { // Now using correct isOpen check
      await redisClient.quit();
    }
});

describe('Authentication API', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(TEST_USER);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      
      // Verify user in database
      const user = await User.findOne({ email: TEST_USER.email });
      expect(user).toBeTruthy();
      expect(user.firstName).toEqual(TEST_USER.firstName);
    });

    it('should reject registration with duplicate email', async () => {
      // Create user first
      await request(app).post('/api/auth/signup').send(TEST_USER);
      
      // Attempt duplicate
      const res = await request(app)
        .post('/api/auth/signup')
        .send(TEST_USER);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should login with valid credentials', async () => {
      // Create user first
      await request(app).post('/api/auth/signup').send(TEST_USER);
      
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject login with invalid password', async () => {
      await request(app).post('/api/auth/signup').send(TEST_USER);
      
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: TEST_USER.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: TEST_USER.password
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should revoke access token', async () => {
      // Register and login
      await request(app).post('/api/auth/signup').send(TEST_USER);
      const loginRes = await request(app)
        .post('/api/auth/signin')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password
        });

      const token = loginRes.body.token;
      
      // Logout
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      
      // Verify token is revoked
      await new Promise(resolve => setTimeout(resolve, 100));
      const isRevoked = await redisClient.sIsMember('revokedTokens', token);
      expect(isRevoked).toBe(true);


    });
  });
});

