const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1 });
    res.json({ success: true, faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
