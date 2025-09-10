const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Scholarship = require('../models/Scholarship');
const University = require('../models/University');
const { auth, authorize, adminOnly } = require('../middleware/auth');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// GET /api/scholarships - Get scholarships with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      country,
      city,
      degreeLevel,
      field,
      minGPA,
      maxGPA,
      maxIncome,
      minIELTS,
      minTOEFL,
      minGRE,
      meritBased,
      needBased,
      minCoverage,
      minAmount,
      maxAmount,
      deadline,
      rolling,
      sortBy = 'deadline',
      sortOrder = 'asc',
      q // search query
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { isActive: true };

    // Build filter query
    if (country) query.country = new RegExp(country, 'i');
    if (city) query.city = new RegExp(city, 'i');
    if (degreeLevel) query.degreeLevel = degreeLevel;
    if (field) query.fields = { $in: [new RegExp(field, 'i')] };
    if (minGPA) query.minGPA = { $lte: parseFloat(minGPA) };
    if (maxGPA) query.minGPA = { ...query.minGPA, $gte: parseFloat(maxGPA) };
    if (maxIncome) query.incomeMaxBDT = { $gte: parseFloat(maxIncome) };
    if (minIELTS) query.ieltsMin = { $lte: parseFloat(minIELTS) };
    if (minTOEFL) query.toeflMin = { $lte: parseFloat(minTOEFL) };
    if (minGRE) query.greMin = { $lte: parseFloat(minGRE) };
    if (meritBased === 'true') query.meritBased = true;
    if (needBased === 'true') query.needBased = true;
    if (minCoverage) query.coveragePercent = { $gte: parseFloat(minCoverage) };
    if (minAmount) query.amountBDT = { $gte: parseFloat(minAmount) };
    if (maxAmount) query.amountBDT = { ...query.amountBDT, $lte: parseFloat(maxAmount) };
    if (rolling === 'true') query.rolling = true;
    if (deadline && rolling !== 'true') {
      query.deadline = { $gte: new Date(deadline) };
    }

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'deadline') {
      sortOptions.rolling = 1; // Rolling deadlines first
      sortOptions.deadline = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'coverage') {
      sortOptions.coveragePercent = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'amount') {
      sortOptions.amountBDT = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'newest') {
      sortOptions.createdAt = -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const scholarships = await Scholarship.find(query)
      .populate('university', 'name country city logoUrl ranking')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Scholarship.countDocuments(query);

    // Get filter options for frontend
    const filterOptions = await getFilterOptions();

    res.json({
      success: true,
      scholarships,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      filters: filterOptions
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching scholarships'
    });
  }
});

// GET /api/scholarships/eligible - Get scholarships user is eligible for
router.get('/eligible', auth, async (req, res) => {
  try {
    const {
      gpa,
      income,
      ielts,
      toefl,
      gre,
      degreeLevel,
      field,
      page = 1,
      limit = 12
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { isActive: true };

    // Eligibility filters
    if (gpa) query.minGPA = { $lte: parseFloat(gpa) };
    if (income) query.$or = [
      { needBased: false },
      { needBased: true, incomeMaxBDT: { $gte: parseFloat(income) } }
    ];
    if (ielts) query.$or = [
      { ieltsMin: { $exists: false } },
      { ieltsMin: { $lte: parseFloat(ielts) } }
    ];
    if (toefl) query.$or = [
      { toeflMin: { $exists: false } },
      { toeflMin: { $lte: parseFloat(toefl) } }
    ];
    if (gre) query.$or = [
      { greMin: { $exists: false } },
      { greMin: { $lte: parseFloat(gre) } }
    ];
    if (degreeLevel) query.degreeLevel = degreeLevel;
    if (field) query.fields = { $in: [new RegExp(field, 'i')] };

    const scholarships = await Scholarship.find(query)
      .populate('university', 'name country city logoUrl ranking')
      .sort({ deadline: 1, rolling: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Scholarship.countDocuments(query);

    res.json({
      success: true,
      scholarships,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching eligible scholarships:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching eligible scholarships'
    });
  }
});

// GET /api/scholarships/filters - Get filter options
router.get('/filters', async (req, res) => {
  try {
    const filters = await getFilterOptions();
    res.json({
      success: true,
      filters
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching filters'
    });
  }
});

// GET /api/scholarships/:id - Get scholarship by ID
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid scholarship ID format' 
      });
    }

    const scholarship = await Scholarship.findById(req.params.id)
      .populate('university');

    if (!scholarship || !scholarship.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    res.json({
      success: true,
      scholarship
    });
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching scholarship'
    });
  }
});

// POST /api/scholarships - Create new scholarship (Admin/Counselor only)
router.post('/', [auth, adminOnly], async (req, res) => {
  try {
    const scholarship = new Scholarship(req.body);
    await scholarship.save();
    await scholarship.populate('university', 'name country city logoUrl ranking');

    res.status(201).json({
      success: true,
      scholarship
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating scholarship',
      error: error.message
    });
  }
});

// PUT /api/scholarships/:id - Update scholarship (Admin/Counselor only)
router.put('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('university', 'name country city logoUrl ranking');

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    res.json({
      success: true,
      scholarship
    });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating scholarship',
      error: error.message
    });
  }
});

// DELETE /api/scholarships/:id - Soft delete scholarship (Admin only)
router.delete('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    res.json({
      success: true,
      message: 'Scholarship deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting scholarship'
    });
  }
});



// Helper function to get filter options
async function getFilterOptions() {
  try {
    const [countries, cities, degreeLevels, fields] = await Promise.all([
      Scholarship.distinct('country', { isActive: true }),
      Scholarship.distinct('city', { isActive: true }),
      Scholarship.distinct('degreeLevel', { isActive: true }),
      Scholarship.distinct('fields', { isActive: true })
    ]);

    return {
      countries: countries.sort(),
      cities: cities.sort(),
      degreeLevels: degreeLevels.sort(),
      fields: fields.flat().filter((field, index, arr) => arr.indexOf(field) === index).sort()
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      countries: [],
      cities: [],
      degreeLevels: [],
      fields: []
    };
  }
}

module.exports = router;