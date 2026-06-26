const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Revenue = require('../models/Revenue');
const { protect, adminOnly } = require('../middleware/auth');

// Create booking
router.post('/', protect, async (req, res) => {
  try {
    const { carId, pickupDate, returnDate, pickupLocation, dropLocation, withDriver, couponCode, paymentMethod } = req.body;
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (!car.available) return res.status(400).json({ success: false, message: 'Car is not available' });

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const totalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));
    if (totalDays < 1) return res.status(400).json({ success: false, message: 'Invalid dates' });

    const driverCharge = withDriver ? totalDays * 500 : 0;
    const subtotal = car.pricePerDay * totalDays;
    let discountAmount = 0;

    if (couponCode) {
      const Coupon = require('../models/Coupon');
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiryDate: { $gt: new Date() } });
      if (coupon && (coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses) && subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount > 0) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        } else {
          discountAmount = coupon.discountValue;
        }
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const totalCost = subtotal - discountAmount + driverCharge + car.securityDeposit;

    const booking = await Booking.create({
      car: carId,
      user: req.user._id,
      customerName: req.user.name,
      customerPhone: req.user.phone,
      customerEmail: req.user.email,
      pickupLocation,
      dropLocation,
      pickupDate: pickup,
      returnDate: returnD,
      totalDays,
      pricePerDay: car.pricePerDay,
      subtotal,
      discountAmount,
      couponCode: couponCode || '',
      totalCost,
      securityDeposit: car.securityDeposit,
      withDriver,
      driverCharge,
      paymentMethod: paymentMethod || 'cash',
    });

    await Car.findByIdAndUpdate(carId, { $inc: { totalBookings: 1 } });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('car', 'name brand model thumbnail pricePerDay').sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all bookings
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20, startDate, endDate } = req.query;
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.pickupDate = {};
      if (startDate) query.pickupDate.$gte = new Date(startDate);
      if (endDate) query.pickupDate.$lte = new Date(endDate);
    }
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('car', 'name brand model thumbnail')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, bookings, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('car').populate('user', '-password');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update booking status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status, paymentStatus }, { new: true }).populate('car').populate('user', '-password');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // If completed, add revenue record
    if (status === 'completed') {
      await Revenue.create({
        type: 'income',
        category: 'booking',
        amount: booking.totalCost,
        description: `Booking ${booking.bookingId} completed`,
        booking: booking._id,
        car: booking.car._id,
        date: new Date(),
      });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create manual booking
router.post('/manual', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, isManualBooking: true });
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Stats for dashboard
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const completed = await Booking.countDocuments({ status: 'completed' });
    const upcoming = await Booking.countDocuments({ status: 'confirmed', pickupDate: { $gte: new Date() } });
    const pending = await Booking.countDocuments({ status: 'pending' });
    const ongoing = await Booking.countDocuments({ status: 'ongoing' });
    const totalRevenue = await Revenue.aggregate([{ $match: { type: 'income' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalExpenses = await Revenue.aggregate([{ $match: { type: 'expense' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    res.json({
      success: true,
      stats: {
        total, completed, upcoming, pending, ongoing,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        netProfit: (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
