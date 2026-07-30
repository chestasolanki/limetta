import express from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';

const router = express.Router();

// Setup Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP, etc.) are allowed!'), false);
    }
  }
});

// Helper to initialize ImageKit client instance
const getImageKit = () => {
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_demo_imagekit_key',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_demo_imagekit_key',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/limetta_store'
  });
};

// @desc    Upload single image file to ImageKit
// @route   POST /api/upload/single
// @access  Public (or Admin protected)
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image file to upload.' });
    }

    const isMock = !process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY === 'private_demo_imagekit_key';

    if (isMock) {
      // Return base64 data URL for seamless instant preview in demo mode
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      return res.json({
        url: base64Image,
        fileId: `ik_demo_${Date.now()}`,
        name: req.file.originalname,
        isMock: true,
        message: 'Image processed (Demo Mode). Add your actual ImageKit keys in server/.env for live cloud storage.'
      });
    }

    const imagekit = getImageKit();
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: `limetta_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      folder: '/products'
    });

    res.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      thumbnailUrl: uploadResponse.thumbnailUrl
    });
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).json({ message: error.message || 'Image upload failed' });
  }
});

// @desc    Upload multiple image files to ImageKit
// @route   POST /api/upload/multiple
// @access  Public (or Admin protected)
router.post('/multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please select at least one image file.' });
    }

    const isMock = !process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY === 'private_demo_imagekit_key';

    if (isMock) {
      const results = req.files.map((file, index) => ({
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        fileId: `ik_demo_${Date.now()}_${index}`,
        name: file.originalname,
        isMock: true
      }));

      return res.json({
        success: true,
        count: results.length,
        images: results,
        urls: results.map((r) => r.url),
        isMock: true,
        message: 'Images processed (Demo Mode). Add actual ImageKit keys in server/.env for live cloud storage.'
      });
    }

    const imagekit = getImageKit();
    const uploadPromises = req.files.map(async (file) => {
      const response = await imagekit.upload({
        file: file.buffer,
        fileName: `limetta_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        folder: '/products'
      });
      return {
        url: response.url,
        fileId: response.fileId,
        name: response.name,
        thumbnailUrl: response.thumbnailUrl
      };
    });

    const results = await Promise.all(uploadPromises);
    res.json({
      success: true,
      count: results.length,
      images: results,
      urls: results.map((r) => r.url)
    });
  } catch (error) {
    console.error('ImageKit batch upload error:', error);
    res.status(500).json({ message: error.message || 'Batch image upload failed' });
  }
});

export default router;
