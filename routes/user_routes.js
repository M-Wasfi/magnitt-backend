const express = require("express");

const { authorize } = require("../helpers/authorization");

const addUserValidation = require("../validation/user/add_user_validation");
const loginValidation = require("../validation/user/login_validation");
const searchUserValidation = require("../validation/user/search_user_validation");

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

router.route("/").get(getUsers).post(authorize, addUserValidation, addUser);

router.route("/email").post(searchUserValidation, getUserByEmail);

router
  .route("/:id")
  .get(getUser)
  .put(authorize, addUserValidation, updateUser)
  .delete(authorize, deleteUser);

router.route("/login").post(loginValidation, loginUser);

router.route("/register").post(addUserValidation, registerUser);

module.exports = router;
