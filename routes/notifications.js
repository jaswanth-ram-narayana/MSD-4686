const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get notifications for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: notifications.length, data: { notifications } });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ status: 'error', message: 'Error fetching notifications' });
  }
});

// Mark a notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.status(200).json({ status: 'success', data: { notification: notif } });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ status: 'error', message: 'Error updating notification' });
  }
});

module.exports = router;
