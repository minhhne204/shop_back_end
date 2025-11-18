const User = require("../models/User");
const userService = require("../services/userService");

const createUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const isCheckEmail = reg.test(email);
    if (!username || !email || !password || !confirmPassword) {
      return res.status(200).json({
        status: "error",
        message: "The input is required.",
      });
    } else if (!isCheckEmail) {
      return res
        .status(200)
        .json({ status: "error", message: "The input is email." });
    } else if (password !== confirmPassword) {
      return res
        .status(200)
        .json({ status: "error", message: "The input is password." });
    }
    console.log("isCheckEmail", isCheckEmail);
    const response = await userService.createUser();
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};


const loginUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const isCheckEmail = reg.test(email);
    if (!username || !email || !password || !confirmPassword) {
      return res.status(200).json({
        status: "error",
        message: "The input is required.",
      });
    } else if (!isCheckEmail) {
      return res
        .status(200)
        .json({ status: "error", message: "The input is email." });
    } else if (password !== confirmPassword) {
      return res
        .status(200)
        .json({ status: "error", message: "The input is password." });
    }
    console.log("isCheckEmail", isCheckEmail);
    const response = await userService.loginUser();
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};


const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    if (!userId) {
      return res
        .status(200)
        .json({ status: "error", message: "User ID is required." });
    }
    const response = await userService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};


const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res
        .status(200)
        .json({ status: "error", message: "User ID is required." });
    }
    const response = await userService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};


const getAllUser = async (req, res) => {
  try {
    const response = await userService.getAllUser();
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};


const getDetail = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(200)
        .json({ status: "error", message: "User ID is required." });
    }
    const response = await userService.getDetail(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error." });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetail,
};
