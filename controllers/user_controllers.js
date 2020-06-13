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
    const users = await User.find().populate("company", "companyName");

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
    const user = await User.findById(req.params.id).populate("company");
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
      { error }
    );
  }
});

// @route     GET /api/users/email
// @desc      Get user by email
// @access    Private
exports.getUserByEmail = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find({
      email: { $regex: req.body.email },
    }).populate("company", "companyName");

    users
      ? jsonResponse(
          res,
          200,
          true,
          `Got user by email: ${req.body.email} successfully`,
          users
        )
      : jsonResponse(
          res,
          404,
          false,
          `Could not find user by email: ${req.body.email}`,
          user
        );
  } catch (error) {
    jsonResponse(
      res,
      400,
      false,
      `Failed to get user by email: ${req.body.email}`,
      { error }
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
    jsonResponse(res, 400, false, "Failed to create user", { error });
  }
});

// @route     POST /api/users/register
// @desc      Register user
// @access    Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;

  const userWithName = await User.findOne({ userName });
  const userWithEmail = await User.findOne({ email });

  if (userWithEmail || userWithName) {
    let errors = {};

    if (userWithName) {
      errors.userName = "Username has already been used";
    }

    if (userWithEmail) {
      errors.email = "Email has already been used";
    }

    return jsonResponse(res, 409, false, "Failed to register user", { errors });
  }

  // Create user
  try {
    const user = await User.create({
      userName,
      email,
      password,
      company: null,
    });

    tokenResponse(res, user, 201, "User registered successfully");
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to register user", { error });
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
      return next(jsonResponse(res, 400, false, "Invalid credentials", {}));
    }

    //Check if password matches
    const passwordMatch = await user.matchPassword(req.body.password);

    if (!passwordMatch) {
      return next(jsonResponse(res, 400, false, "Invalid credentials", {}));
    }

    tokenResponse(res, user, 200, "User logged in successfully");
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to login", { error });
  }
});

// @route     PUT /api/users/:id
// @desc      Update user
// @access    Private/Admin
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
    jsonResponse(res, 400, false, "Failed to update user", { error });
  }
});

// @route     PUT /api/users/updateProfile
// @desc      Update user profile
// @access    Private
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const { userName, email } = req.body;

  // check if name and email exists
  const currentUser = await User.findById(req.user.id);
  const userWithName = await User.findOne({ userName });
  const userWithEmail = await User.findOne({ email });

  const nameExist = userWithName && currentUser.userName !== userName;
  const emailExist = userWithEmail && currentUser.email !== email;

  var errors = {};

  if (nameExist) {
    errors.userName = "Username has already been used";
  }

  if (emailExist) {
    errors.email = "Email has already been used";
  }

  if (nameExist || emailExist) {
    return jsonResponse(res, 409, false, "Failed to update user profile", {
      errors,
    });
  }

  try {
    //update user profile
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    }).populate("company");

    user
      ? jsonResponse(res, 200, true, "User profile updated successfully", user)
      : jsonResponse(
          res,
          404,
          false,
          `Could not find user profile by id: ${req.user.id}`,
          {}
        );
  } catch (error) {
    jsonResponse(res, 400, false, "Failed to update user profile", { error });
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
    jsonResponse(res, 400, false, "Failed to delete user", { error });
  }
});
