const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const imageUpload = require('../middleware/upload');
const {
  getTemplate,
  uploadProker,
  getAllProker,
  updateScheduleStatus,
  getNotifications,
  readNotification,
  getProkerDashboard,
  getUploadedFiles,
  addScheduleDate,
  editScheduleDate,
  deleteScheduleDate
} = require('../controllers/prokerController');

// Multer memory storage configuration for Excel files (serverless-compatible)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls|spreadsheet/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.mimetype === 'application/vnd.ms-excel' ||
                     file.mimetype === 'application/octet-stream';

    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya file Excel (.xlsx atau .xls) yang diperbolehkan!'));
  }
});

router.get('/template', getTemplate);
router.get('/public', getAllProker); // NEW: Public route for Home page
router.get('/files', protect, getUploadedFiles);
router.get('/', protect, getAllProker);
router.get('/dashboard', protect, getProkerDashboard);
router.post('/upload', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadProker);
router.put('/:id/schedule/:scheduleId', protect, imageUpload.single('image'), updateScheduleStatus); // Updated with imageUpload
router.post('/:id/schedule', protect, addScheduleDate); // Add manual date
router.put('/:id/schedule/:scheduleId/reschedule', protect, editScheduleDate); // Edit manual date
router.delete('/:id/schedule/:scheduleId', protect, deleteScheduleDate); // Delete manual date
router.get('/notifications', protect, getNotifications);
router.post('/notifications/:id/read', protect, readNotification);

module.exports = router;
