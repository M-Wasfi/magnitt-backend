const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongooseUniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const UserSchema = Schema({
  name: {
    type: String,
    required: [true, "User's name is required."],
    unique: [true, "User's name must be unique."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: [true, "Email must be unique."],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Email must be unique.",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: 8,
    maxlength: 255,
    select: false,
  },
  company: {
    type: Schema.Types.ObjectID,
    ref: "companies",
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.plugin(mongooseUniqueValidator);

module.exports = User = mongoose.model("users", UserSchema);
