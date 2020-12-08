const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("../controllers/authController");
const validation = require("../helpers/validate");
const multer = require("../server");

const router = express.Router();

router.post(
  "/signup",
  validation.validateInput("signup"),
  authController.signup
);
router.post("/login", authController.login);
//router.post("/upload", multer.upload.single("file"), userController.fileUpload);
router.patch(
  "/change-password",
  authController.protected,
  authController.changePassword
);

router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
