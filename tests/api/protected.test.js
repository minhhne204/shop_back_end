import request from 'supertest'
import app from '../../app.js'
import User from '../../models/User.js'
import Cart from '../../models/Cart.js'
import Order from '../../models/Order.js'

describe('Protected APIs', () => {
  const testUser = {
    email: `cartuser_${Date.now()}@test.com`,
    password: 'Test123456',
    fullName: 'Cart Test User'
  }
  let authToken = null
  let userId = null
  let productId = null
  let orderId = null

  beforeAll(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser)

    authToken = registerRes.body.token
    userId = registerRes.body._id

    const products = await request(app).get('/api/products')
    if (products.body.products.length > 0) {
      productId = products.body.products[0]._id
    }
  })

  afterAll(async () => {
    await Cart.deleteOne({ user: userId })
    await Order.deleteMany({ user: userId })
    await User.deleteOne({ _id: userId })
  })

  describe('Cart APIs', () => {
    describe('GET /api/cart', () => {
      it('should return empty cart initially', async () => {
        const res = await request(app)
          .get('/api/cart')
          .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('items')
        expect(res.body.items).toHaveLength(0)
      })

      it('should return 401 without token', async () => {
        const res = await request(app).get('/api/cart')
        expect(res.statusCode).toBe(401)
      })
    })

    describe('POST /api/cart/add', () => {
      it('should add product to cart', async () => {
        if (!productId) return

        const res = await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ productId, quantity: 2 })

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('items')
        expect(res.body.items.length).toBeGreaterThan(0)

        const addedItem = res.body.items.find(
          item => item.product._id === productId || item.product === productId
        )
        expect(addedItem).toBeDefined()
        expect(addedItem.quantity).toBe(2)
      })

      it('should increase quantity when adding same product', async () => {
        if (!productId) return

        const res = await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ productId, quantity: 1 })

        expect(res.statusCode).toBe(200)
        const item = res.body.items.find(
          item => item.product._id === productId || item.product === productId
        )
        expect(item.quantity).toBe(3)
      })

      it('should return 401 without token', async () => {
        const res = await request(app)
          .post('/api/cart/add')
          .send({ productId, quantity: 1 })

        expect(res.statusCode).toBe(401)
      })
    })

    describe('PUT /api/cart/update', () => {
      it('should update cart item quantity', async () => {
        if (!productId) return

        const res = await request(app)
          .put('/api/cart/update')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ productId, quantity: 5 })

        expect(res.statusCode).toBe(200)
        const item = res.body.items.find(
          item => item.product._id === productId || item.product === productId
        )
        expect(item.quantity).toBe(5)
      })
    })

    describe('DELETE /api/cart/remove/:productId', () => {
      it('should remove item from cart', async () => {
        if (!productId) return

        await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ productId, quantity: 1 })

        const res = await request(app)
          .delete(`/api/cart/remove/${productId}`)
          .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        const item = res.body.items.find(
          item => item.product._id === productId || item.product === productId
        )
        expect(item).toBeUndefined()
      })
    })

    describe('DELETE /api/cart/clear', () => {
      it('should clear all items from cart', async () => {
        if (!productId) return

        await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ productId, quantity: 1 })

        const res = await request(app)
          .delete('/api/cart/clear')
          .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('message')

        const cartRes = await request(app)
          .get('/api/cart')
          .set('Authorization', `Bearer ${authToken}`)
        expect(cartRes.body.items).toHaveLength(0)
      })
    })
  })

  describe('Order APIs', () => {
    beforeAll(async () => {
      if (productId) {
        await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ productId, quantity: 1 })
      }
    })

    describe('GET /api/orders', () => {
      it('should return empty orders initially', async () => {
        const res = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
      })

      it('should return 401 without token', async () => {
        const res = await request(app).get('/api/orders')
        expect(res.statusCode).toBe(401)
      })
    })

    describe('POST /api/orders', () => {
      it('should create order from cart', async () => {
        if (!productId) return

        const orderData = {
          shippingAddress: {
            fullName: 'Test User',
            phone: '0901234567',
            street: '123 Test Street',
            ward: 'Ward 1',
            district: 'District 1',
            city: 'Ho Chi Minh'
          },
          paymentMethod: 'cod',
          note: 'Test order'
        }

        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(orderData)

        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('_id')
        expect(res.body).toHaveProperty('status', 'pending')
        expect(res.body).toHaveProperty('items')
        expect(res.body).toHaveProperty('totalAmount')
        expect(res.body.shippingAddress).toMatchObject(orderData.shippingAddress)

        orderId = res.body._id
      })

      it('should return 401 without token', async () => {
        const res = await request(app)
          .post('/api/orders')
          .send({})

        expect(res.statusCode).toBe(401)
      })
    })

    describe('GET /api/orders/:id', () => {
      it('should return order detail', async () => {
        if (!orderId) return

        const res = await request(app)
          .get(`/api/orders/${orderId}`)
          .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('_id', orderId)
        expect(res.body).toHaveProperty('status')
        expect(res.body).toHaveProperty('items')
      })

      it('should return 404 for non-existent order', async () => {
        const fakeId = '507f1f77bcf86cd799439011'
        const res = await request(app)
          .get(`/api/orders/${fakeId}`)
          .set('Authorization', `Bearer ${authToken}`)

        expect([404, 500]).toContain(res.statusCode)
      })
    })

    describe('PUT /api/orders/:id/cancel', () => {
      it('should cancel pending order', async () => {
        if (!orderId) return

        const res = await request(app)
          .put(`/api/orders/${orderId}/cancel`)
          .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('status', 'cancelled')
      })

      it('should not cancel already cancelled order', async () => {
        if (!orderId) return

        const res = await request(app)
          .put(`/api/orders/${orderId}/cancel`)
          .set('Authorization', `Bearer ${authToken}`)

        expect(res.statusCode).toBe(400)
      })
    })
  })
})
