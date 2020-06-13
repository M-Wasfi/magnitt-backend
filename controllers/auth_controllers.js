const asyncHandler = require("../helpers/async_handler");
const jsonResponse = require("../helpers/json_response");
const tokenResponse = require("../helpers/token_response");

const User = require("../models/user");

/////////////////////////////////////////////////////////////////////
// @route     POST /api/users/register
// @desc      Register user
// @access    Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;

  // check username and email are unique
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

/////////////////////////////////////////////////////////////////////
//@route  POST /api/users/login
//@Desc   User login
//@access Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  try {
    //Check if user exists
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
