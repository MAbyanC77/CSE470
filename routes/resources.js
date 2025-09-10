const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { auth } = require('../middleware/auth');

// @route   GET /api/resources
// @desc    Get all resources with filtering and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      type,
      targetAudience,
      difficulty,
      search,
      featured,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (targetAudience && targetAudience !== 'All') query.targetAudience = { $in: [targetAudience, 'All'] };
    if (difficulty) query.difficulty = difficulty;
    if (featured === 'true') query.featured = true;
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const resources = await Resource.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Resource.countDocuments(query);

    // Get categories for filtering
    const categories = await Resource.distinct('category', { isActive: true });
    const types = await Resource.distinct('type', { isActive: true });

    res.json({
      success: true,
      resources,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        categories,
        types,
        targetAudiences: ['All', 'Undergraduate', 'Graduate', 'PhD'],
        difficulties: ['Beginner', 'Intermediate', 'Advanced']
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching resources'
    });
  }
});

// @route   GET /api/resources/featured
// @desc    Get featured resources
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const resources = await Resource.find({ 
      isActive: true, 
      featured: true 
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(6)
      .select('-__v');

    res.json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('Error fetching featured resources:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching featured resources'
    });
  }
});

// @route   GET /api/resources/categories
// @desc    Get resources grouped by category
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const pipeline = [
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resources: {
            $push: {
              _id: '$_id',
              title: '$title',
              description: '$description',
              type: '$type',
              views: '$views',
              featured: '$featured'
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    const categorizedResources = await Resource.aggregate(pipeline);

    res.json({
      success: true,
      categories: categorizedResources
    });
  } catch (error) {
    console.error('Error fetching categorized resources:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categorized resources'
    });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource and increment view count
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource || !resource.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching resource'
    });
  }
});

// @route   POST /api/resources/:id/like
// @desc    Like a resource
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource || !resource.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource.likes += 1;
    await resource.save();

    res.json({
      success: true,
      message: 'Resource liked successfully',
      likes: resource.likes
    });
  } catch (error) {
    console.error('Error liking resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server error liking resource'
    });
  }
});

// Admin routes
// @route   POST /api/resources
// @desc    Create new resource (admin only)
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const resource = new Resource(req.body);
    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating resource'
    });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update resource (admin only)
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating resource'
    });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource (admin only)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting resource'
    });
  }
});

module.exports = router;