import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../app.js'
import User from '../../models/User.js'

describe('Auth APIs', () => {
  const testUser = {
    email: `testuser_${Date.now()}@test.com`,
    password: 'Test123456',
    fullName: 'Test User'
  }
  let authToken = null

  afterAll(async () => {
    await User.deleteOne({ email: testUser.email })
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)

      expect(res.statusCode).toBe(201)
      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('email', testUser.email)
      expect(res.body).toHaveProperty('fullName', testUser.fullName)
      expect(res.body).toHaveProperty('token')
      expect(res.body).toHaveProperty('role', 'user')
      expect(res.body).not.toHaveProperty('password')

      authToken = res.body.token
    })

    it('should not register with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
    })

    it('should not register without email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'Test123456', fullName: 'Test' })

      expect(res.statusCode).toBe(500)
    })

    it('should not register without password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', fullName: 'Test' })

      expect(res.statusCode).toBe(500)
    })

    it('should not register without fullName', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'Test123456' })

      expect(res.statusCode).toBe(500)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('email', testUser.email)
      expect(res.body).toHaveProperty('token')
      expect(res.body).not.toHaveProperty('password')

      authToken = res.body.token
    })

    it('should not login with wrong email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: testUser.password
        })

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty('message')
    })

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty('message')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('email', testUser.email)
      expect(res.body).toHaveProperty('fullName', testUser.fullName)
      expect(res.body).not.toHaveProperty('password')
    })

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.statusCode).toBe(401)
    })

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')

      expect(res.statusCode).toBe(401)
    })
  })

  describe('PUT /api/auth/profile', () => {
    it('should update user profile', async () => {
      const updates = {
        fullName: 'Updated Name',
        phone: '0901234567'
      }

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('fullName', updates.fullName)
      expect(res.body).toHaveProperty('phone', updates.phone)
    })

    it('should update address', async () => {
      const updates = {
        address: {
          street: '123 Test Street',
          ward: 'Ward 1',
          district: 'District 1',
          city: 'Ho Chi Minh'
        }
      }

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)

      expect(res.statusCode).toBe(200)
      expect(res.body.address).toMatchObject(updates.address)
    })

    it('should return 401 without token', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .send({ fullName: 'Test' })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('Wishlist APIs', () => {
    let productId = null

    beforeAll(async () => {
      const products = await request(app).get('/api/products')
      if (products.body.products.length > 0) {
        productId = products.body.products[0]._id
      }
    })

    it('should get empty wishlist initially', async () => {
      const res = await request(app)
        .get('/api/auth/wishlist')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('should add product to wishlist', async () => {
      if (!productId) return

      const res = await request(app)
        .post('/api/auth/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId })

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('message')
    })

    it('should get wishlist with product', async () => {
      if (!productId) return

      const res = await request(app)
        .get('/api/auth/wishlist')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBeGreaterThan(0)
    })

    it('should remove product from wishlist', async () => {
      if (!productId) return

      const res = await request(app)
        .delete(`/api/auth/wishlist/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('message')
    })
  })
})
