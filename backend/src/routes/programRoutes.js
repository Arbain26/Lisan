const express = require('express');
const router = express.Router();
const { getAllPrograms, createProgram, updateProgram, deleteProgram } = require('../controllers/programController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllPrograms);
router.post('/', protect, createProgram);
router.put('/:id', protect, updateProgram);
router.delete('/:id', protect, deleteProgram);

module.exports = router;
