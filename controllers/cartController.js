import Cart from '../models/Cart.js'

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
    const { productId, quantity = 1 } = req.body

    let cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] })
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId)

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity
    } else {
      cart.items.push({ product: productId, quantity })
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
    const { productId, quantity } = req.body

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Gio hang trong' })
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId)

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1)
      } else {
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

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Gio hang trong' })
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId)
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
