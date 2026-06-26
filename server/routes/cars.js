const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Get all cars (public) with filters
router.get('/', async (req, res) => {
  try {
    const { type, fuel, transmission, seats, minPrice, maxPrice, available, featured, search, sort, page = 1, limit = 12 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (fuel) query.fuel = fuel;
    if (transmission) query.transmission = transmission;
    if (seats) query.seats = parseInt(seats);
    if (available !== undefined) query.available = available === 'true';
    if (featured) query.featured = featured === 'true';
    if (minPrice || maxPrice) query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = parseInt(minPrice);
    if (maxPrice) query.pricePerDay.$lte = parseInt(maxPrice);
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
    ];

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { pricePerDay: 1 };
    if (sort === 'price_desc') sortObj = { pricePerDay: -1 };
    if (sort === 'rating') sortObj = { rating: -1 };
    if (sort === 'popular') sortObj = { totalBookings: -1 };

    const total = await Car.countDocuments(query);
    const cars = await Car.find(query).sort(sortObj).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, cars, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create car
router.post('/', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const carData = { ...req.body };
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map(f => f.path);
      carData.thumbnail = req.files[0].path;
    }
    if (carData.features && typeof carData.features === 'string') {
      carData.features = carData.features.split(',').map(f => f.trim());
    }
    const car = await Car.create(carData);
    res.status(201).json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update car
router.put('/:id', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const carData = { ...req.body };
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map(f => f.path);
      carData.thumbnail = req.files[0].path;
    }
    if (carData.features && typeof carData.features === 'string') {
      carData.features = carData.features.split(',').map(f => f.trim());
    }
    const car = await Car.findByIdAndUpdate(req.params.id, carData, { new: true });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete car
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle availability
router.patch('/:id/availability', protect, adminOnly, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    car.available = !car.available;
    await car.save();
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
