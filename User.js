const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  resetOTP: { type: String },
  resetOTPExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
