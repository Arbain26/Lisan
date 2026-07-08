const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'uploads/';
    
    // Determine folder based on route path
    if (req.baseUrl.includes('news') || req.baseUrl.includes('articles')) {
      folder += 'news/';
    } else if (req.baseUrl.includes('gallery')) {
      folder += 'gallery/';
    } else if (req.baseUrl.includes('programs')) {
      folder += 'programs/';
    } else if (req.baseUrl.includes('pengurus')) {
      folder += 'pengurus/';
    } else {
      folder += 'misc/';
    }

    const fullPath = path.join(__dirname, '..', '..', folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
