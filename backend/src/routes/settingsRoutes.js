const express = require('express');
const router = express.Router();
const { 
  getSettings, 
  updateSettings, 
  updateProfile, 
  updateMenuVisibility 
} = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/', protect, updateSettings);
router.put('/profile', protect, updateProfile);
router.put('/menu-visibility', protect, updateMenuVisibility);

module.exports = router;
