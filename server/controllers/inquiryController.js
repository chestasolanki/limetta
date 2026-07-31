import Inquiry from '../models/Inquiry.js';

// @desc    Get all active/unresolved inquiries & feedback
// @route   GET /api/inquiries
// @access  Public / Admin
const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ resolved: false }).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new inquiry / client feedback
// @route   POST /api/inquiries
// @access  Public
const createInquiry = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please provide name, email, and message.' });
  }

  try {
    const dateFormatted = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const inquiry = await Inquiry.create({
      name,
      email,
      phone: phone || 'Not provided',
      subject: subject || 'General Inquiry',
      message,
      resolved: false,
      date: dateFormatted
    });

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Resolve or delete an inquiry
// @route   PUT /api/inquiries/:id/resolve
// @access  Public / Admin
const resolveInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.resolved = true;
    await inquiry.save();

    res.json({ message: 'Inquiry marked as resolved', id: inquiry._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getInquiries, createInquiry, resolveInquiry };
