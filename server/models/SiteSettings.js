const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'PrimeCarz' },
  siteTagline: { type: String, default: 'Drive Your Dreams' },
  heroTitle: { type: String, default: 'Premium Car Rentals at Your Fingertips' },
  heroSubtitle: { type: String, default: 'Find the perfect car for every journey. Luxury, comfort, and affordability.' },
  contactPhone: { type: String, default: '+91 98765 43210' },
  contactEmail: { type: String, default: 'info@primecarz.com' },
  contactAddress: { type: String, default: 'Mumbai, Maharashtra, India' },
  googleMapsUrl: { type: String, default: '' },
  whatsappNumber: { type: String, default: '+919876543210' },
  businessHours: { type: String, default: 'Mon-Sun: 7:00 AM - 10:00 PM' },
  facebookUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  aboutTitle: { type: String, default: 'About PrimeCarz' },
  aboutDescription: { type: String, default: '' },
  totalCars: { type: Number, default: 50 },
  totalCities: { type: Number, default: 10 },
  totalCustomers: { type: Number, default: 5000 },
  totalRating: { type: Number, default: 4.8 },
  metaDescription: { type: String, default: 'PrimeCarz - Premium car rental service. Book luxury, SUV, sedan cars at best prices.' },
  bannerImages: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
