const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllKader,
  createKader,
  updateKader,
  deleteKader
} = require('../controllers/kaderController');

router.get('/', protect, getAllKader);
router.post('/', protect, createKader);
router.put('/:id', protect, updateKader);
router.delete('/:id', protect, deleteKader);

module.exports = router;
