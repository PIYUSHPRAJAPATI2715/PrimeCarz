const express = require('express');
const router = express.Router();
const CarEnquiry = require('../models/CarEnquiry');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const enquiryData = { ...req.body };
    if (req.files && req.files.length > 0) {
      enquiryData.images = req.files.map(f => f.path);
    }
    const enquiry = await CarEnquiry.create(enquiryData);
    res.status(201).json({ success: true, enquiry, message: 'Enquiry submitted! We will contact you within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const enquiries = await CarEnquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const enquiry = await CarEnquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await CarEnquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
