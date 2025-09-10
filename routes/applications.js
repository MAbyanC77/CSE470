const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');
const University = require('../models/University');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// @route   POST /api/applications
// @desc    Submit a new application
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      university: universityId,
      semester,
      academicYear,
      subject,
      preferredStartDate,
      applyingForScholarship,
      scholarshipType,
      personalStatement,
      additionalDocuments
    } = req.body;

    // Check if university exists
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ 
        success: false,
        message: 'University not found' 
      });
    }

    // Check if user already applied to this university
    const existingApplication = await Application.findOne({
      user: req.user._id,
      university: universityId,
      status: { $in: ['pending', 'under_review', 'waitlisted'] }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have an active application for this university' 
      });
    }

    // Create new application
    const applicationData = {
      user: req.user._id,
      university: universityId,
      semester,
      academicYear,
      subject,
      preferredStartDate,
      applyingForScholarship,
      personalStatement,
      additionalDocuments
    };

    // Only include scholarshipType if applying for scholarship
    if (applyingForScholarship && scholarshipType) {
      applicationData.scholarshipType = scholarshipType;
    }

    const application = new Application(applicationData);

    await application.save();
    
    // Populate university and user data for response
    await application.populate('university', 'name country city');
    await application.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/applications
// @desc    Get user's applications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('university', 'name country city ranking tuition livingCosts')
      .sort({ applicationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/:id/progress
// @desc    Get application progress details
// @access  Private
router.get('/:id/progress', auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid application ID format' 
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('university', 'name city country logoUrl');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error('Error fetching application progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/applications/:id
// @desc    Get specific application details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid application ID format' 
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('university', 'name country city ranking tuition livingCosts programs')
      .populate('user', 'name email phone');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update application (before submission deadline)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only allow updates if application is still pending
    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update application that is already under review' 
      });
    }

    const allowedUpdates = [
      'semester', 'year', 'program', 'level', 'applyingForScholarship',
      'scholarshipType', 'additionalNotes', 'expectedGraduation', 'gpa',
      'testScores', 'workExperience', 'personalStatement'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    await application.save();
    await application.populate('university', 'name country city');

    res.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Withdraw application
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only allow withdrawal if application is not yet decided
    if (['accepted', 'declined'].includes(application.status)) {
      return res.status(400).json({ 
        message: 'Cannot withdraw application that has already been decided' 
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user has active application for a university
router.get('/university/:universityId/check', auth, async (req, res) => {
  try {
    const { universityId } = req.params;
    const userId = req.user._id;

    const activeApplication = await Application.findOne({
      user: userId,
      university: universityId,
      status: { $in: ['pending', 'under_review', 'accepted'] }
    });

    res.json({
      success: true,
      hasActiveApplication: !!activeApplication,
      application: activeApplication
    });
  } catch (error) {
    console.error('Error checking application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking application'
    });
  }
});

// Get user's applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const applications = await Application.find({ user: userId })
      .populate('university', 'name city country images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
});

// Admin routes
// @route   GET /api/applications/admin/all
// @desc    Get all applications (admin only)
// @access  Private (Admin)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { status, university, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (university) query.university = university;

    const applications = await Application.find(query)
      .populate('user', 'name email phone')
      .populate('university', 'name country city')
      .sort({ applicationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Admin get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/admin/:id/status
// @desc    Update application status (admin only)
// @access  Private (Admin)
router.put('/admin/:id/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { status, note } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email')
      .populate('university', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    if (note) {
      application.statusHistory[application.statusHistory.length - 1].note = note;
    }

    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Admin update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;