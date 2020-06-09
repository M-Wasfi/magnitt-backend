const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
} = require("../controllers/user_controllers");

router.route("/").get(getUsers).post(addUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router.route("/login").post(loginUser);

router.route("/register").post(registerUser);

module.exports = router;
