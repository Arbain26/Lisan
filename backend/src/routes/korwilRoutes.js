const express = require('express');
const router = express.Router();
const { 
  getAllKorwil, 
  getAllKorwilAdmin, 
  createKorwil, 
  updateKorwil, 
  deleteKorwil 
} = require('../controllers/korwilController');
const { protect } = require('../middleware/authMiddleware');

// Public route
router.get('/', getAllKorwil);

// Admin protected routes
router.get('/admin', protect, getAllKorwilAdmin);
router.post('/', protect, createKorwil);
router.put('/:id', protect, updateKorwil);
router.delete('/:id', protect, deleteKorwil);

module.exports = router;
