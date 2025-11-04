const mongoose = require('mongoose');

const allowedAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AllowedAdmin', allowedAdminSchema);
