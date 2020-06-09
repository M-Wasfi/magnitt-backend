const jwt = require("jsonwebtoken");
const asyncHandler = require("./async_handler");
const JsonResponse = require("./json_response");
const User = require("../models/user");

// authorize routes
exports.authorize = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];

    // Set token from cookie
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(
      new JsonResponse(
        res,
        401,
        false,
        "Not authorized to access this route",
        {}
      )
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(
      new JsonResponse(
        res,
        401,
        false,
        "Not authorized to access this route",
        {}
      )
    );
  }
});
