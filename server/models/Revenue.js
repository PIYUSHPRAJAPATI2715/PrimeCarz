const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, enum: ['booking', 'maintenance', 'fuel', 'insurance', 'salary', 'marketing', 'other'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Revenue', revenueSchema);
