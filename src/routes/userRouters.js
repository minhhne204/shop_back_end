const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.put("/update-user/:id", userController.updateUser);
router.delete("/delete-user/:id", userController.deleteUser);
router.get("/getAll", userController.getAllUser);
router.get("/get-detail/:id", userController.getDetail);

module.exports = router;
