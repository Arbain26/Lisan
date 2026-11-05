const express = require('express');
const router = express.Router();
const { 
  getAllMessages, 
  getBloodNotifications,
  createMessage, 
  updateMessage, 
  deleteMessage 
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllMessages);
router.get('/blood-notifications', protect, getBloodNotifications);
router.post('/', createMessage); // Public endpoint for Contact Form submission
router.put('/:id', protect, updateMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
