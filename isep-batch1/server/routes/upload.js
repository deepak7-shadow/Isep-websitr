const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  }
});

// File filter (images and PDF)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit per Section M11
  },
  fileFilter
});

// Handle multiple field names flexibly: 'images', 'image', 'file', 'files'
const uploadMiddleware = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'image', maxCount: 1 },
  { name: 'files', maxCount: 10 },
  { name: 'file', maxCount: 1 }
]);

// POST /api/upload
// Upload single or multiple images/PDFs
router.post('/', (req, res) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File exceeds 5MB size limit.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    const uploadedFiles = [];
    if (req.files) {
      for (const field of Object.keys(req.files)) {
        req.files[field].forEach(f => uploadedFiles.push(f));
      }
    } else if (req.file) {
      uploadedFiles.push(req.file);
    }

    if (uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded.' });
    }

    const fileUrls = uploadedFiles.map(f => `/uploads/${f.filename}`);

    return res.status(201).json({
      success: true,
      message: 'Upload successful.',
      url: fileUrls[0],
      filePath: fileUrls[0],
      paths: fileUrls,
      urls: fileUrls,
      files: uploadedFiles.map(f => ({
        filename: f.filename,
        originalName: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
        url: `/uploads/${f.filename}`
      }))
    });
  });
});

// GET /api/upload
// List all uploaded files
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).map(filename => {
      const stats = fs.statSync(path.join(uploadsDir, filename));
      return {
        filename,
        url: `/uploads/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
    res.json({ success: true, count: files.length, data: files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/upload/:filename
// Delete an uploaded file
router.delete('/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // prevent directory traversal
    const targetPath = path.join(uploadsDir, filename);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ success: false, error: 'File not found.' });
    }

    fs.unlinkSync(targetPath);
    return res.json({ success: true, message: 'File deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
