const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const projectUploadDir = path.join(__dirname, '../../uploads');
const serverlessUploadDir = path.join(os.tmpdir(), 'rizqshare-uploads');

const resolveUploadDir = () => {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  return isServerless ? serverlessUploadDir : projectUploadDir;
};

const ensureDir = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  } catch (error) {
    if (dirPath !== serverlessUploadDir) {
      try {
        if (!fs.existsSync(serverlessUploadDir)) {
          fs.mkdirSync(serverlessUploadDir, { recursive: true });
        }
        console.warn(`⚠️  Could not write ${dirPath}, using ${serverlessUploadDir}`);
        return serverlessUploadDir;
      } catch (fallbackError) {
        console.warn('⚠️  Uploads directory unavailable:', fallbackError.message);
        return null;
      }
    }
    console.warn('⚠️  Uploads directory unavailable:', error.message);
    return null;
  }
};

const uploadDir = ensureDir(resolveUploadDir()) || serverlessUploadDir;

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'receipts';
    
    // Organize by type
    if (file.fieldname === 'receipt') {
      folder = req.baseUrl.includes('expense') ? 'receipts/expenses' : 'receipts/donations';
    } else if (file.fieldname === 'profilePicture') {
      folder = 'profiles';
    }
    
    const fullPath = path.join(uploadDir, folder);
    const created = ensureDir(fullPath);

    if (!created) {
      return cb(new Error('Upload storage is not available on this host'));
    }

    cb(null, created);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

/**
 * Middleware to handle file upload errors
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        status: 'error',
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  next();
};

/**
 * Delete file helper
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  upload,
  handleUploadError,
  deleteFile,
  uploadDir
};

