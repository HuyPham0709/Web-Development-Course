// backend/models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  type: { type: String, default: "apply" },
  link_url: { type: String, default: "/dashboard" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);