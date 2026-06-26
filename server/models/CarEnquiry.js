const mongoose = require('mongoose');

const carEnquirySchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  carBrand: { type: String, required: true },
  carModel: { type: String, required: true },
  carYear: { type: Number, required: true },
  carType: { type: String, required: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  expectedPricePerDay: { type: Number, default: 0 },
  location: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('CarEnquiry', carEnquirySchema);
