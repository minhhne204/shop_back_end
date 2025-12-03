import Policy from '../models/Policy.js'

export const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
    res.json(policies)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPolicyByType = async (req, res) => {
  try {
    const policy = await Policy.findOne({ type: req.params.type })
    if (!policy) {
      return res.status(404).json({ message: 'Khong tim thay chinh sach' })
    }
    res.json(policy)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
