const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    minLength: 5,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
