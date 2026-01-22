import express from 'express';
import { handleUpload } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/upload
// Dedicated endpoint for uploading files
// Returns standard file object structure
router.post('/', authenticate, handleUpload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Generate URL (assuming local storage for MVP)
  // In production, this would be an S3 URL
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    }
  });
});

export default router;
