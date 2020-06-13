const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConnectionsSchema = Schema({
  sender: {
    type: Schema.Types.ObjectID,
    ref: "companies",
  },
  receiver: {
    type: Schema.Types.ObjectID,
    ref: "companies",
  },
  status: {
    type: String,
    enum: ["PENDING", "CONNECTED", "REJECTED"],
    default: "PENDING",
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Connection = mongoose.model("connections", ConnectionsSchema);
