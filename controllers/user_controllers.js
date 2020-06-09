const asyncHandler = require("../helpers/async_handler");
const jsonResponse = require("../helpers/json_response");
const tokenResponse = require("../helpers/token_response");

const User = require("../models/user");

//TODO review access
// @route   GET api/users
// @desc    Get all user
// @access  Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find();

    jsonResponse(res, 200, true, "Got all users successfully", users);
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to get all users", error);
  }
});

// @route     GET /api/users/:id
// @desc      Get single user
// @access    Private
exports.getUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    user
      ? jsonResponse(
          res,
          200,
          true,
          `Got user by id: ${req.params.id} successfully`,
          user
        )
      : jsonResponse(
          res,
          404,
          false,
          `Could not find user by id: ${req.params.id}`,
          user
        );
  } catch (error) {
    jsonResponse(
      res,
      400,
      false,
      `Failed to get user by id: ${req.params.id}`,
      error
    );
  }
});

// @route     POST /api/users/
// @desc      Add a user
// @access    Private
exports.addUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    jsonResponse(res, 201, true, "User created successfully", user);
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to create user", error);
  }
});

// @route     POST /api/users/register
// @desc      Register user
// @access    Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Create user
  try {
    const user = await User.create({
      name,
      email,
      password,
      company: null,
    });

    tokenResponse(res, user, 201, true, "User registered successfully");
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to register user", error);
  }
});

//@route  POST /api/users/login
//@Desc   User login
//@access Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );

    if (!user) {
      return next(jsonResponse(res, 400, false, "Invalid email", {}));
    }

    //Check if password matches
    const passwordMatch = await user.matchPassword(req.body.password);

    if (!passwordMatch) {
      return next(jsonResponse(res, 400, false, "Invalid password", {}));
    }

    tokenResponse(res, user, 200, "User logged in successfully");
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to login", error);
  }
});

// @route     PUT /api/users/:id
// @desc      Update user
// @access    Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    user
      ? jsonResponse(res, 200, true, "User updated successfully", user)
      : jsonResponse(
          res,
          404,
          false,
          `Could not find user by id: ${req.params.id}`,
          user
        );
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to update user", error);
  }
});

// @route     DELETE /api/users/:id
// @desc      Delete a user
// @access    Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id, (error, user) => {
      if (!user) {
        return jsonResponse(res, 404, false, "User not found", {});
      }
    });

    jsonResponse(res, 200, true, "User deleted successfully", {});
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to delete user", error);
  }
});
