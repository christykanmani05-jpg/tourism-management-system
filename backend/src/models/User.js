const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  profilePhoto: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }
});

module.exports = mongoose.model("User", userSchema);
