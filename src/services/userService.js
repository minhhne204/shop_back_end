const User = require("../models/User");
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { username, email, password, confirmPassword } = newUser;
    try {
      const checkUser = await User.findOne({ email: email });
      if (checkUser !== null) {
        resolve({ status: "ok", message: "The email is already" });
      }
      const createdUser = await User.create({
        username,
        email,
        password,
        confirmPassword,
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
module.exports = {
  createUser,
};
