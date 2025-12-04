import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/product.js'
import categoryRoutes from './routes/category.js'
import brandRoutes from './routes/brand.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/order.js'
import blogRoutes from './routes/blog.js'
import bannerRoutes from './routes/banner.js'
import policyRoutes from './routes/policy.js'
import promotionRoutes from './routes/promotion.js'
import adminRoutes from './routes/admin.js'
import uploadRoutes from './routes/upload.js'
import reviewRoutes from './routes/reviews.js'
import preorderRoutes from './routes/preorder.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/brands', brandRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/banners', bannerRoutes)
app.use('/api/policies', policyRoutes)
app.use('/api/promotions', promotionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api', reviewRoutes)
app.use('/api/preorders', preorderRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'GameForge API' })
})

export default app
