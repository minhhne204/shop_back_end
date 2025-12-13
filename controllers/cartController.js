import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    if (!cart) {
      cart = { items: [] }
    }
    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variantId = null, variantName = null } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
    }

    let availableStock = product.stock
    let stockItemName = product.name

    if (variantId) {
      if (!product.hasVariants) {
        return res.status(400).json({ message: 'Sản phẩm này không có biến thể' })
      }
      const variant = product.variants.find(v => v._id.toString() === variantId)
      if (!variant) {
        return res.status(400).json({ message: 'Biến thể không tồn tại' })
      }
      if (!variant.isActive) {
        return res.status(400).json({ message: 'Biến thể này không còn khả dụng' })
      }
      availableStock = variant.stock
      stockItemName = `${product.name} - ${variant.name}`
    }

    let cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] })
    }

    const itemIndex = cart.items.findIndex(item => {
      const productMatch = item.product.toString() === productId
      const variantMatch = variantId
        ? item.variantId?.toString() === variantId
        : !item.variantId
      return productMatch && variantMatch
    })

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity
      if (newQuantity > availableStock) {
        return res.status(400).json({
          message: `Không thể thêm. "${stockItemName}" chỉ còn ${availableStock} sản phẩm`
        })
      }
      cart.items[itemIndex].quantity = newQuantity
    } else {
      if (quantity > availableStock) {
        return res.status(400).json({
          message: `Không thể thêm. "${stockItemName}" chỉ còn ${availableStock} sản phẩm`
        })
      }
      cart.items.push({
        product: productId,
        quantity,
        variantId: variantId || null,
        variantName: variantName || null
      })
    }

    await cart.save()
    await cart.populate('items.product')

    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity, variantId = null } = req.body

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng trống' })
    }

    const itemIndex = cart.items.findIndex(item => {
      const productMatch = item.product.toString() === productId
      const variantMatch = variantId
        ? item.variantId?.toString() === variantId
        : !item.variantId
      return productMatch && variantMatch
    })

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1)
      } else {
        const product = await Product.findById(productId)
        if (product) {
          let availableStock = product.stock
          let stockItemName = product.name

          if (variantId && product.hasVariants) {
            const variant = product.variants.find(v => v._id.toString() === variantId)
            if (variant) {
              availableStock = variant.stock
              stockItemName = `${product.name} - ${variant.name}`
            }
          }

          if (quantity > availableStock) {
            return res.status(400).json({
              message: `"${stockItemName}" chỉ còn ${availableStock} sản phẩm`
            })
          }
        }
        cart.items[itemIndex].quantity = quantity
      }
      await cart.save()
    }

    await cart.populate('items.product')
    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params
    const { variantId } = req.query

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng trống' })
    }

    cart.items = cart.items.filter(item => {
      const productMatch = item.product.toString() === productId
      const variantMatch = variantId
        ? item.variantId?.toString() === variantId
        : !item.variantId
      return !(productMatch && variantMatch)
    })

    await cart.save()
    await cart.populate('items.product')

    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id })
    res.json({ message: 'Da xoa gio hang' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
