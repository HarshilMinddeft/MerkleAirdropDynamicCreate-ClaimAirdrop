const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  distributorAddress: {
    type: [String],
    required: true,
  },
  contractAddress: {
    type: [String],
    required: true,
  },
  userAddress: {
    type: [String],
    required: true,
  },
  token: {
    type: [String],
    required: true,
  },
  addresses: {
    type: [String],
    required: true,
  },
  claimAmounts: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("Users", userSchema);
