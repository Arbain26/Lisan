const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const {
  getTemplate,
  uploadProker,
  getAllProker,
  updateScheduleStatus,
  getNotifications,
  readNotification,
  getProkerDashboard,
  getUploadedFiles
} = require('../controllers/prokerController');

// Multer disk storage configuration for Excel files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'proker');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
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
router.put('/:id/schedule/:scheduleId', protect, updateScheduleStatus);
router.get('/notifications', protect, getNotifications);
router.post('/notifications/:id/read', protect, readNotification);

module.exports = router;
