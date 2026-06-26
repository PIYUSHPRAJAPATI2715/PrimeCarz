const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 500 },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
