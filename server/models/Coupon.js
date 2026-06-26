const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscountAmount: { type: Number, default: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  applicableCars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
