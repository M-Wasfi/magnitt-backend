const express = require("express");

const { authorize } = require("../helpers/authorization");

const addUserValidation = require("../validation/user/add_user_validation");
const loginValidation = require("../validation/auth/login_validation");
const searchUserValidation = require("../validation/user/search_user_validation");
const updateUserValidation = require("../validation/user/update_user_validation");

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
  updateUserProfile,
} = require("../controllers/user_controllers");

router.route("/").get(getUsers).post(authorize, addUserValidation, addUser);

router.route("/email").post(searchUserValidation, getUserByEmail);

router.route("/login").post(loginValidation, loginUser);

router.route("/register").post(addUserValidation, registerUser);

router
  .route("/updateProfile")
  .put(authorize, updateUserValidation, updateUserProfile);

router
  .route("/:id")
  .get(getUser)
  .put(authorize, updateUserValidation, updateUser)
  .delete(authorize, deleteUser);

module.exports = router;
