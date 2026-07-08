const express = require('express');
const router = express.Router();
const { 
  getAllPengurus, 
  getPengurusById, 
  createPengurus, 
  updatePengurus, 
  deletePengurus 
} = require('../controllers/pengurusController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getAllPengurus);
router.get('/:id', getPengurusById);
router.post('/', protect, upload.single('image'), createPengurus);
router.put('/:id', protect, upload.single('image'), updatePengurus);
router.delete('/:id', protect, deletePengurus);

module.exports = router;
