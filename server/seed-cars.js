const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Car = require('./models/Car');

dotenv.config();

const sampleCars = [
  {
    name: 'BMW M4 Competition',
    brand: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    type: 'sports',
    fuel: 'petrol',
    transmission: 'automatic',
    seats: 4,
    color: 'Toronto Red Metallic',
    pricePerDay: 18000,
    securityDeposit: 50000,
    mileageLimit: 250,
    extraMileageCharge: 150,
    thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800',
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'
    ],
    features: ['Adaptive M Suspension', 'Harman Kardon Sound System', 'Head-Up Display', 'Carbon Fiber Interior Trim', 'Apple CarPlay / Android Auto'],
    description: 'Experience pure high-performance driving with the BMW M4 Competition. Featuring a twin-turbo inline-6 engine delivering 503 horsepower, this sports coupe offers blistering speed, razor-sharp handling, and an aggressive road presence.',
    engineCC: '2993 cc',
    mileage: '9.8 kmpl',
    ac: true,
    gps: true,
    bluetooth: true,
    available: true,
    rating: 5.0,
    totalReviews: 12,
    featured: true,
    location: 'Mumbai'
  },
  {
    name: 'Mercedes-Benz E-Class',
    brand: 'Mercedes-Benz',
    model: 'E-Class LWB',
    year: 2023,
    type: 'luxury',
    fuel: 'hybrid',
    transmission: 'automatic',
    seats: 5,
    color: 'Obsidian Black',
    pricePerDay: 12000,
    securityDeposit: 30000,
    mileageLimit: 300,
    extraMileageCharge: 80,
    thumbnail: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'
    ],
    features: ['Panoramic Sunroof', 'Burmester Surround Sound', 'Rear Seat Reclining', 'Chauffeur Package', 'Active Parking Assist'],
    description: 'The Mercedes-Benz E-Class Long Wheelbase defines executive comfort. Impeccable craftsmanship, class-leading legroom, whisper-quiet cabin insulation, and a smooth hybrid powertrain make it the ultimate choice for both business and leisure travel.',
    engineCC: '1991 cc',
    mileage: '15.2 kmpl',
    ac: true,
    gps: true,
    bluetooth: true,
    available: true,
    rating: 4.9,
    totalReviews: 24,
    featured: true,
    location: 'Delhi NCR'
  },
  {
    name: 'Range Rover Sport',
    brand: 'Land Rover',
    model: 'Range Rover Sport',
    year: 2023,
    type: 'suv',
    fuel: 'diesel',
    transmission: 'automatic',
    seats: 7,
    color: 'Fuji White',
    pricePerDay: 20000,
    securityDeposit: 40000,
    mileageLimit: 250,
    extraMileageCharge: 120,
    thumbnail: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800',
    images: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'
    ],
    features: ['Electronic Air Suspension', 'All-Wheel Drive (AWD)', 'Meridian Sound System', '3D Surround Camera', 'Terrain Response 2'],
    description: 'Commanding power meets luxury off-roading in the Range Rover Sport. With an advanced air suspension system, intelligent AWD, and space for up to seven passengers, it glides smoothly over highways and masters tough terrains with ease.',
    engineCC: '2997 cc',
    mileage: '12.4 kmpl',
    ac: true,
    gps: true,
    bluetooth: true,
    available: true,
    rating: 4.8,
    totalReviews: 8,
    featured: true,
    location: 'Bengaluru'
  },
  {
    name: 'Hyundai i20 N Line',
    brand: 'Hyundai',
    model: 'i20 N Line N8',
    year: 2023,
    type: 'hatchback',
    fuel: 'petrol',
    transmission: 'manual',
    seats: 5,
    color: 'Thunder Blue',
    pricePerDay: 25000 / 10, // 2500 per day
    securityDeposit: 5000,
    mileageLimit: 350,
    extraMileageCharge: 15,
    thumbnail: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800',
    images: [
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800'
    ],
    features: ['Sporty Exhaust Notes', 'Red Calipers & Highlights', 'Paddle Shifters', 'Bose Premium Audio', 'Electronic Stability Control'],
    description: 'Add excitement to your city commutes with the rally-inspired Hyundai i20 N Line. Equipped with a sporty tuned suspension, throaty exhaust sound, and sharp steering inputs, it offers an agile and fun hatchback experience.',
    engineCC: '998 cc',
    mileage: '20.2 kmpl',
    ac: true,
    gps: true,
    bluetooth: true,
    available: true,
    rating: 4.7,
    totalReviews: 18,
    featured: false,
    location: 'Mumbai'
  }
];

const seedCars = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in server/.env');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding cars');

    // Only seed if empty
    const count = await Car.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ Cars collection already has ${count} records. Skipping seeding.`);
      return;
    }

    await Car.insertMany(sampleCars);
    console.log('✅ Sample cars seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding cars error:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedCars();
