const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const University = require('../models/University');
const Scholarship = require('../models/Scholarship');
const { auth, authorize, adminOnly } = require('../middleware/auth');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// GET /api/universities - Get all universities with basic filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'ranking.world',
      sortOrder = 'asc',
      includeScholarshipCount = 'false',
      country,
      city,
      type,
      q
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build query with filters
    let query = { isActive: true };
    
    if (q) {
      query.$text = { $search: q };
    }
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }

    const universities = await University.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Add scholarship count if requested
    if (includeScholarshipCount === 'true') {
      for (let university of universities) {
        const scholarshipCount = await Scholarship.countDocuments({
          university: university._id,
          isActive: true
        });
        university._doc.scholarshipCount = scholarshipCount;
      }
    }

    const total = await University.countDocuments(query);
    
    // Get filter options
    const countries = await University.distinct('country', { isActive: true });
    const cities = await University.distinct('city', { isActive: true });
    const types = await University.distinct('type', { isActive: true });
    const programLevels = await University.distinct('programs.level', { isActive: true });

    res.json({
      success: true,
      data: universities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        countries: countries.sort(),
        cities: cities.sort(),
        types: types.sort(),
        programLevels: programLevels.sort()
      }
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching universities'
    });
  }
});

// GET /api/universities/search - Search universities with filters
router.get('/search', async (req, res) => {
  try {
    const {
      q, // search query
      country,
      city,
      type,
      minRanking,
      maxRanking,
      minTuition,
      maxTuition,
      programs,
      level,
      page = 1,
      limit = 12,
      sortBy = 'ranking.world',
      sortOrder = 'asc'
    } = req.query;

    // Build search query
    let searchQuery = { isActive: true };

    // Text search
    if (q) {
      searchQuery.$text = { $search: q };
    }

    // Country filter
    if (country) {
      searchQuery.country = { $regex: country, $options: 'i' };
    }

    // City filter
    if (city) {
      searchQuery.city = { $regex: city, $options: 'i' };
    }

    // Type filter
    if (type) {
      searchQuery.type = type;
    }

    // Ranking filter
    if (minRanking || maxRanking) {
      searchQuery['ranking.world'] = {};
      if (minRanking) searchQuery['ranking.world'].$gte = parseInt(minRanking);
      if (maxRanking) searchQuery['ranking.world'].$lte = parseInt(maxRanking);
    }

    // Tuition filter
    if (minTuition || maxTuition) {
      searchQuery.$or = [
        {
          'tuitionFee.undergraduate.min': {
            ...(minTuition && { $gte: parseInt(minTuition) }),
            ...(maxTuition && { $lte: parseInt(maxTuition) })
          }
        },
        {
          'tuitionFee.graduate.min': {
            ...(minTuition && { $gte: parseInt(minTuition) }),
            ...(maxTuition && { $lte: parseInt(maxTuition) })
          }
        }
      ];
    }

    // Program filter
    if (programs) {
      searchQuery['programs.name'] = { $regex: programs, $options: 'i' };
    }

    // Level filter
    if (level) {
      searchQuery['programs.level'] = level;
    }

    // Build sort object
    let sortObject = {};
    if (sortBy === 'ranking') {
      sortObject['ranking.world'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'tuition') {
      sortObject['tuitionFee.undergraduate.min'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sortObject.name = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Add text score for text search
    if (q) {
      sortObject.score = { $meta: 'textScore' };
    }

    const skip = (page - 1) * limit;

    // Execute search
    const universities = await University.find(searchQuery)
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await University.countDocuments(searchQuery);

    // Get filter options for frontend
    const countries = await University.distinct('country', { isActive: true });
    const cities = await University.distinct('city', { isActive: true });
    const types = await University.distinct('type', { isActive: true });
    const programLevels = await University.distinct('programs.level', { isActive: true });

    res.json({
      success: true,
      universities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      filters: {
        countries: countries.sort(),
        cities: cities.sort(),
        types: types.sort(),
        programLevels: programLevels.sort()
      }
    });

  } catch (error) {
    console.error('University search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
});

// GET /api/universities/:id - Get university by ID
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid university ID format' 
      });
    }

    const university = await University.findById(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    if (!university.isActive) {
      return res.status(404).json({
        success: false,
        message: 'University not available'
      });
    }

    res.json({
      success: true,
      university
    });

  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET /api/universities/:id/scholarships - Get scholarships for a specific university
router.get('/:id/scholarships', async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid university ID format' 
      });
    }

    const {
      page = 1,
      limit = 12,
      sortBy = 'deadline',
      sortOrder = 'asc'
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOptions = {};
    
    if (sortBy === 'deadline') {
      sortOptions.rolling = 1;
      sortOptions.deadline = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const scholarships = await Scholarship.find({
      university: req.params.id,
      isActive: true
    })
      .populate('university', 'name country city logoUrl ranking')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Scholarship.countDocuments({
      university: req.params.id,
      isActive: true
    });

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
    console.error('Error fetching university scholarships:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid university ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching university scholarships'
    });
  }
});

// GET /api/universities/featured - Get featured universities
router.get('/featured', async (req, res) => {
  try {
    const universities = await University.find({ 
      isActive: true,
      'ranking.world': { $lte: 100 } // Top 100 universities
    })
    .sort({ 'ranking.world': 1 })
    .limit(6)
    .select('name country city ranking tuitionFee images description');

    res.json({
      success: true,
      universities
    });

  } catch (error) {
    console.error('Get featured universities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /api/universities - Create new university (Admin only)
router.post('/', [auth, adminOnly], async (req, res) => {
  try {
    const university = new University(req.body);
    await university.save();

    res.status(201).json({
      success: true,
      message: 'University created successfully',
      university
    });

  } catch (error) {
    console.error('Create university error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/universities/:id - Update university (Admin only)
router.put('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.json({
      success: true,
      message: 'University updated successfully',
      university
    });

  } catch (error) {
    console.error('Update university error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/universities/:id - Delete university (Admin only)
router.delete('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.json({
      success: true,
      message: 'University deactivated successfully'
    });

  } catch (error) {
    console.error('Delete university error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET /api/universities/stats/overview - Get university statistics (Admin only)
router.get('/stats/overview', [auth, adminOnly], async (req, res) => {
  try {
    const totalUniversities = await University.countDocuments({ isActive: true });
    const countriesCount = await University.distinct('country', { isActive: true });
    const typesStats = await University.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalUniversities,
        countries: countriesCount.length,
        byType: typesStats
      }
    });

  } catch (error) {
    console.error('Get university stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;