import Category from "../models/Category.js";
export const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const query = { isActive: true };
    if (req.query.search) {
      query.$or = [{ name: { $regex: req.query.search, $options: "i" } }];
    }
    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .sort("name")
      .skip(skip)
      .limit(limit);
    res.json({
      categories,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommentBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!category) {
      return res.status(404).json({ message: "Khong tim thay danh muc" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCommentBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!category) {
      return res.status(404).json({ message: "Khong tim thay danh muc" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
