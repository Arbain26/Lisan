const express = require('express');
const router = express.Router();
const { 
  getAllDepartemen, 
  getDepartemenById, 
  createDepartemen, 
  updateDepartemen, 
  deleteDepartemen 
} = require('../controllers/departemenController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllDepartemen);
router.get('/:id', getDepartemenById);
router.post('/', protect, createDepartemen);
router.put('/:id', protect, updateDepartemen);
router.delete('/:id', protect, deleteDepartemen);

module.exports = router;
