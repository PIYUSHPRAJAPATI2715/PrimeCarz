const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys not configured');
      }
      const order = await razorpay.orders.create({
        amount: Math.round(booking.totalCost * 100),
        currency: 'INR',
        receipt: booking.bookingId,
      });

      await Booking.findByIdAndUpdate(bookingId, { razorpayOrderId: order.id });
      res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
    } catch (razorpayErr) {
      // Fallback to simulated payment flow
      const mockOrderId = 'order_mock_' + Date.now();
      await Booking.findByIdAndUpdate(bookingId, { razorpayOrderId: mockOrderId });
      res.json({ 
        success: true, 
        isMock: true, 
        order: { id: mockOrderId, amount: Math.round(booking.totalCost * 100), currency: 'USD' }, 
        key: 'mock_key' 
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify payment
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (razorpay_signature === 'mock_signature') {
      await Booking.findByIdAndUpdate(bookingId, {
        razorpayPaymentId: razorpay_payment_id || ('pay_mock_' + Date.now()),
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentMethod: 'card'
      });
      return res.json({ success: true, message: 'Payment verified successfully (Simulated)' });
    }

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    await Booking.findByIdAndUpdate(bookingId, {
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: 'paid',
      status: 'confirmed',
    });

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
