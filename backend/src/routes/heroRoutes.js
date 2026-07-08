const express = require('express');
const router = express.Router();
const { getHeroes, createHero, updateHero, deleteHero } = require('../controllers/heroController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');

// Public route
router.get('/', getHeroes);

// Protected routes (Admin only)
router.post('/', protect, upload.single('image'), createHero);
router.put('/:id', protect, upload.single('image'), updateHero);
router.delete('/:id', protect, deleteHero);

module.exports = router;
