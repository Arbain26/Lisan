const multer = require('multer');
const path = require('path');

// Use memory storage for serverless / Vercel compatibility
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|webp|gif|svg)$/i;
  const isImageMime = file.mimetype.startsWith('image/');
  const isAllowedExt = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (isImageMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPG, JPEG, PNG, WEBP) yang diperbolehkan!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
