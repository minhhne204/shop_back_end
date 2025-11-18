const User = require("../models/User");
const bcrypt = require("bcrypt");
const { genneralAccessToken } = require("./jwtService");

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { username, email, password, confirmPassword } = newUser;
    try {
      const checkUser = await User.findOne({ email: email });
      if (checkUser !== null) {
        resolve({ status: "ok", message: "The email is already" });
      }
      const hash = await bcrypt.hash(password, 10);
      const createdUser = await User.create({
        username,
        email,
        password: hash,
        confirmPassword: hash,
      });
      if (createdUser) {
        resolve({
          status: "ok",
          message: "Create user successfully",
          data: createdUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { username, email, password, confirmPassword } = userLogin;
    try {
      const checkUser = await User.findOne({ email: email });
      if (checkUser === null) {
        resolve({ status: "ok", message: "The user is not defined" });
      }
      const comparePassword = await bcrypt.compareSync(
        password,
        checkUser.password
      );

      if (!comparePassword) {
        resolve({ status: "ok", message: "The password is incorrect" });
      }
      const access_Token = await genneralAccessToken({
        id: checkUser._id,
        isAdmin: checkUser.isAdmin,
      });

      const refresh_Token = await genneralRefreshToken({
        id: checkUser._id,
        isAdmin: checkUser.isAdmin,
      });
      resolve({
        status: "ok",
        message: "Login user successfully",
        access_Token,
        refresh_Token,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({ id: id });
      if (checkUser === null) {
        resolve({ status: "ok", message: "The user is not defined" });
      }
      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      if (!updatedUser) {
        resolve({ status: "error", message: "User not found" });
      } else {
        resolve({
          status: "ok",
          message: "User updated successfully",
          data: updatedUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({ id: id });
      if (checkUser === null) {
        resolve({ status: "ok", message: "The user is not defined" });
      }

      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        resolve({ status: "error", message: "User not found" });
      } else {
        resolve({
          status: "ok",
          message: "User deleted successfully",
          data: deletedUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await User.find();
      resolve({
        status: "ok",
        message: "Get all users successfully",
        data: users,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getDetail = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        resolve({ status: "error", message: "User not found" });
      } else {
        resolve({
          status: "ok",
          message: "Get user detail successfully",
          data: user,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetail,
};
