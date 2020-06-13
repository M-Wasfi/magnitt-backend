const express = require("express");

const registerValidation = require("../validation/auth/register_validation");
const loginValidation = require("../validation/auth/login_validation");

const router = express.Router();

const { loginUser, registerUser } = require("../controllers/auth_controllers");

router.route("/login").post(loginValidation, loginUser);

router.route("/register").post(registerValidation, registerUser);

module.exports = router;
