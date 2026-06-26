const express = require('express');
const router = express.Router();
const Revenue = require('../models/Revenue');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const records = await Revenue.find(query).populate('car', 'name brand').populate('booking', 'bookingId').sort({ date: -1 });
    
    const totalIncome = await Revenue.aggregate([
      { $match: { ...query, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = await Revenue.aggregate([
      { $match: { ...query, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly breakdown for charts
    const monthlyData = await Revenue.aggregate([
      { $match: query },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      records,
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      netProfit: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      monthlyData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const record = await Revenue.create(req.body);
    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Revenue.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
