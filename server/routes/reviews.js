const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Car = require('../models/Car');
const { protect, adminOnly } = require('../middleware/auth');

// Get reviews for a car
router.get('/car/:carId', async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.carId, isApproved: true }).populate('user', 'name avatar').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all reviews (for homepage)
router.get('/all', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).populate('user', 'name avatar').populate('car', 'name brand').sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add review
router.post('/', protect, async (req, res) => {
  try {
    const { carId, rating, comment, bookingId } = req.body;
    const review = await Review.create({ car: carId, user: req.user._id, booking: bookingId, rating, comment });

    // Update car rating
    const reviews = await Review.find({ car: carId, isApproved: true });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);
    await Car.findByIdAndUpdate(carId, { rating: avgRating.toFixed(1), totalReviews: reviews.length });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Approve/reject review
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all reviews
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name email').populate('car', 'name brand').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
