const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  totalCost: { type: Number, required: true },
  securityDeposit: { type: Number, default: 0 },
  withDriver: { type: Boolean, default: false },
  driverCharge: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'bank_transfer', 'razorpay'], default: 'cash' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  notes: { type: String, default: '' },
  isManualBooking: { type: Boolean, default: false },
}, { timestamps: true });

bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'PC' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
