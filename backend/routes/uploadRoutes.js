const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, admin } = require('../middleware/auth');

// ─── Image storage (5 MB, images only) ───────────────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  },
});

// ─── Video storage (50 MB, videos only) ──────────────────────────────────────
const videoUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files allowed'), false);
    }
  },
});

// ─── Cloudinary config ────────────────────────────────────────────────────────
const getCloudinary = () => {
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
};

// ─── Upload helpers ───────────────────────────────────────────────────────────
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary();
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'videstore/products', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const uploadVideoToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary();
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'videstore/products/videos',
        resource_type: 'video',
        quality: 'auto',
        chunk_size: 6000000, // 6 MB chunks for large files
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ─── IMAGE ROUTES ─────────────────────────────────────────────────────────────

// Admin only — single image
router.post('/image', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error('Single upload error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Any logged-in user (admin + seller) — multiple images
router.post('/images', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer)));
    const images = results.map(r => ({ url: r.secure_url, public_id: r.public_id }));
    res.json({ success: true, images });
  } catch (error) {
    console.error('Multi upload error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin only — delete image
router.delete('/image', protect, admin, async (req, res) => {
  try {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(req.body.public_id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── VIDEO ROUTES ─────────────────────────────────────────────────────────────

// Any logged-in user (admin + seller) — multiple videos (max 2)
router.post('/videos', protect, videoUpload.array('videos', 2), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No video files uploaded' });
    }
    const results = await Promise.all(req.files.map(f => uploadVideoToCloudinary(f.buffer)));
    const videos = results.map(r => ({ url: r.secure_url, public_id: r.public_id }));
    res.json({ success: true, videos });
  } catch (error) {
    console.error('Video upload error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin only — delete video
router.delete('/video', protect, admin, async (req, res) => {
  try {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(req.body.public_id, { resource_type: 'video' });
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;