import Promotion from '../models/Promotion.js'

export const applyPromotion = async (req, res) => {
  try {
    const { code, orderTotal } = req.body

    const promotion = await Promotion.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })

    if (!promotion) {
      return res.status(404).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' })
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' })
    }

    if (orderTotal < promotion.minOrder) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${promotion.minOrder.toLocaleString()}đ để áp dụng mã này`
      })
    }

    let discount = 0
    if (promotion.discountType === 'percent') {
      discount = (orderTotal * promotion.discountValue) / 100
      if (promotion.maxDiscount && discount > promotion.maxDiscount) {
        discount = promotion.maxDiscount
      }
    } else {
      discount = promotion.discountValue
    }

    res.json({
      code: promotion.code,
      discount,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
