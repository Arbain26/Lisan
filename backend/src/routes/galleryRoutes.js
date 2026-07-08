const express = require('express');
const router = express.Router();
const { getAllGallery, createGallery, deleteGallery } = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getAllGallery);
router.post('/', protect, upload.single('image'), createGallery);
router.delete('/:id', protect, deleteGallery);

module.exports = router;
