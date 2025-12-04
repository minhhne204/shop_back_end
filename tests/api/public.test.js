import request from 'supertest'
import app from '../../app.js'

describe('Public APIs', () => {
  describe('GET /', () => {
    it('should return API info', async () => {
      const res = await request(app).get('/')
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('message', 'GameForge API')
    })
  })

  describe('GET /api/products', () => {
    it('should return products list', async () => {
      const res = await request(app).get('/api/products')
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('products')
      expect(Array.isArray(res.body.products)).toBe(true)
      expect(res.body).toHaveProperty('page')
      expect(res.body).toHaveProperty('pages')
      expect(res.body).toHaveProperty('total')
    })

    it('should support pagination', async () => {
      const res = await request(app).get('/api/products?page=1&limit=5')
      expect(res.statusCode).toBe(200)
      expect(res.body.products.length).toBeLessThanOrEqual(5)
    })

    it('should filter by category', async () => {
      const categories = await request(app).get('/api/categories')
      if (categories.body.length > 0) {
        const categoryId = categories.body[0]._id
        const res = await request(app).get(`/api/products?category=${categoryId}`)
        expect(res.statusCode).toBe(200)
      }
    })

    it('should filter by brand', async () => {
      const brands = await request(app).get('/api/brands')
      if (brands.body.length > 0) {
        const brandId = brands.body[0]._id
        const res = await request(app).get(`/api/products?brand=${brandId}`)
        expect(res.statusCode).toBe(200)
      }
    })

    it('should filter by status', async () => {
      const res = await request(app).get('/api/products?status=available')
      expect(res.statusCode).toBe(200)
      res.body.products.forEach(product => {
        expect(product.status).toBe('available')
      })
    })

    it('should accept sort parameter', async () => {
      const res = await request(app).get('/api/products?sort=price')
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('products')
    })

    it('should accept sort descending parameter', async () => {
      const res = await request(app).get('/api/products?sort=-price')
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('products')
    })
  })

  describe('GET /api/products/:slug', () => {
    it('should return product detail by slug', async () => {
      const products = await request(app).get('/api/products')
      if (products.body.products.length > 0) {
        const slug = products.body.products[0].slug
        const res = await request(app).get(`/api/products/${slug}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('name')
        expect(res.body).toHaveProperty('price')
        expect(res.body.slug).toBe(slug)
      }
    })

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/non-existent-slug-12345')
      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /api/categories', () => {
    it('should return categories list', async () => {
      const res = await request(app).get('/api/categories')
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('should have required fields', async () => {
      const res = await request(app).get('/api/categories')
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('name')
        expect(res.body[0]).toHaveProperty('slug')
      }
    })
  })

  describe('GET /api/brands', () => {
    it('should return brands list', async () => {
      const res = await request(app).get('/api/brands')
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('should have required fields', async () => {
      const res = await request(app).get('/api/brands')
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('name')
        expect(res.body[0]).toHaveProperty('slug')
      }
    })
  })

  describe('GET /api/blogs', () => {
    it('should return blogs list', async () => {
      const res = await request(app).get('/api/blogs')
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('blogs')
      expect(Array.isArray(res.body.blogs)).toBe(true)
    })

    it('should support pagination', async () => {
      const res = await request(app).get('/api/blogs?page=1&limit=2')
      expect(res.statusCode).toBe(200)
      expect(res.body.blogs.length).toBeLessThanOrEqual(2)
    })
  })

  describe('GET /api/blogs/:slug', () => {
    it('should return blog detail by slug', async () => {
      const blogs = await request(app).get('/api/blogs')
      if (blogs.body.blogs.length > 0) {
        const slug = blogs.body.blogs[0].slug
        const res = await request(app).get(`/api/blogs/${slug}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('title')
        expect(res.body).toHaveProperty('content')
      }
    })
  })

  describe('GET /api/policies/:type', () => {
    const policyTypes = ['shipping', 'return', 'payment', 'privacy', 'terms']

    policyTypes.forEach(type => {
      it(`should return ${type} policy`, async () => {
        const res = await request(app).get(`/api/policies/${type}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('type', type)
        expect(res.body).toHaveProperty('title')
        expect(res.body).toHaveProperty('content')
      })
    })

    it('should return 404 for invalid policy type', async () => {
      const res = await request(app).get('/api/policies/invalid-type')
      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /api/banners', () => {
    it('should return banners list', async () => {
      const res = await request(app).get('/api/banners')
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe('POST /api/promotions/apply', () => {
    it('should validate promotion code', async () => {
      const res = await request(app)
        .post('/api/promotions/apply')
        .send({ code: 'TESTCODE', cartTotal: 100000 })
      expect([200, 400, 404]).toContain(res.statusCode)
    })

    it('should reject invalid promotion code', async () => {
      const res = await request(app)
        .post('/api/promotions/apply')
        .send({ code: 'INVALID_CODE_12345', cartTotal: 100000 })
      expect([400, 404]).toContain(res.statusCode)
    })
  })
})
