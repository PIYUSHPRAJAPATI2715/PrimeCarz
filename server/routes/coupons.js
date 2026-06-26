const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

// Validate coupon (public)
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true, expiryDate: { $gt: new Date() } });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (orderAmount < coupon.minOrderAmount) return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount > 0) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({ success: true, coupon, discountAmount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin CRUD
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
