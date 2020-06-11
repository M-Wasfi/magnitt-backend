const express = require("express");

const { authorize } = require("../helpers/authorization");

const router = express.Router();

const {
  getUsers,
  getUser,
  getUserByEmail,
  addUser,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
} = require("../controllers/user_controllers");

router.route("/").get(getUsers).post(authorize, addUser);

router.route("/email").post(getUserByEmail);

router
  .route("/:id")
  .get(getUser)
  .put(authorize, updateUser)
  .delete(authorize, deleteUser);

router.route("/login").post(loginUser);

router.route("/register").post(registerUser);

module.exports = router;
