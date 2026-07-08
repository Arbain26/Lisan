const express = require('express');
const router = express.Router();
const { 
  getAllMessages, 
  createMessage, 
  updateMessage, 
  deleteMessage 
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllMessages);
router.post('/', createMessage); // Public endpoint for Contact Form submission
router.put('/:id', protect, updateMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
