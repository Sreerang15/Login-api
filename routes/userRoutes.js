const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("../controllers/authController");
const validation = require("../helpers/validate");

const router = express.Router();

router.get("/me", userController.getAllUsers);

router.post(
  "/signup",
  validation.validateInput("signup"),
  authController.signup
);
router.post("/login", authController.login);
router.post(
  "/upload",
  //authController.protected,
  userController.uploadUserPhoto,
  userController.uploadUserImage
);
router.patch(
  "/change-password",
  authController.protected,
  authController.changePassword
);

router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
