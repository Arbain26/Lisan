const express = require('express');
const router = express.Router();
const { getAllRelawan, getRelawanById, createRelawan, updateRelawan, deleteRelawan, importRelawanBulk, deleteAllRelawan } = require('../controllers/relawanController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllRelawan);
router.get('/:id', protect, getRelawanById);
router.post('/', protect, createRelawan);
router.post('/bulk', protect, importRelawanBulk);
router.put('/:id', protect, updateRelawan);
router.delete('/all', protect, deleteAllRelawan);
router.delete('/:id', protect, deleteRelawan);

module.exports = router;
