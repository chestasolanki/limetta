import express from 'express';
import Setting from '../models/Setting.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get store settings (e.g., deliveryCharge)
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settingsList = await Setting.find({});
    const settingsMap = {
      deliveryCharge: 0
    };

    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update store settings (e.g. deliveryCharge)
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  const { key, value, deliveryCharge } = req.body;

  try {
    if (deliveryCharge !== undefined) {
      await Setting.findOneAndUpdate(
        { key: 'deliveryCharge' },
        { value: Number(deliveryCharge) },
        { upsert: true, new: true }
      );
    }

    if (key && value !== undefined) {
      await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }

    const updatedSettings = await Setting.find({});
    const settingsMap = {
      deliveryCharge: 0
    };

    updatedSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json(settingsMap);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
