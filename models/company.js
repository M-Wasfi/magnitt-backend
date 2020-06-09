const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongooseUniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const CompanySchema = Schema({
  owner: {
    type: Schema.Types.ObjectID,
    ref: "users",
    required: [true, "Owner is required."],
  },
  companyName: {
    type: String,
    required: [true, "companyName is required."],
    unique: [true, "companyName must be unique."],
  },
  size: {
    type: Number,
    required: [true, "companySize is required."],
  },
  type: {
    type: String,
    required: [true, "Type is required."],
  },
  industry: {
    type: String,
    required: [true, "Industry is required."],
  },
  employees: [
    {
      type: Schema.Types.ObjectID,
      ref: "users",
    },
  ],
  companyConnections: [
    {
      type: Schema.Types.ObjectID,
      ref: "jobs",
    },
  ],
  sentConnections: [
    {
      type: Schema.Types.ObjectID,
      ref: "jobs",
    },
  ],
  pendingConnections: [
    {
      type: Schema.Types.ObjectID,
      ref: "jobs",
    },
  ],
  creationDate: {
    type: Date,
    default: Date.now,
  },
});

CompanySchema.plugin(mongooseUniqueValidator);

module.exports = User = mongoose.model("companies", CompanySchema);
