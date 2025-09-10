const express = require('express');
const router = express.Router();
const University = require('../models/University');
const UserProfile = require('../models/UserProfile');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/deadlines - Get upcoming deadlines for saved programs
router.get('/', auth, async (req, res) => {
  try {
    const { withinDays, country, degreeLevel } = req.query;
    
    // Get user profile with saved programs
    const userProfile = await UserProfile.findOne({ userId: req.user._id })
      .populate({
        path: 'savedPrograms.universityId',
        model: 'University'
      });
    
    if (!userProfile || !userProfile.savedPrograms.length) {
      return res.json({
        success: true,
        data: [],
        message: 'No saved programs found'
      });
    }
    
    // Build deadline data with filtering
    const deadlines = [];
    const now = new Date();
    const withinDate = withinDays ? new Date(now.getTime() + (withinDays * 24 * 60 * 60 * 1000)) : null;
    
    for (const savedProgram of userProfile.savedPrograms) {
      const university = savedProgram.universityId;
      if (!university || !university.isActive) continue;
      
      // Find the specific program
      const program = university.programs.id(savedProgram.programId);
      if (!program) continue;
      
      // Apply filters
      if (country && university.country.toLowerCase() !== country.toLowerCase()) continue;
      if (degreeLevel && program.level.toLowerCase() !== degreeLevel.toLowerCase()) continue;
      
      // Calculate days left (skip rolling admissions)
      let daysLeft = null;
      let status = 'active';
      
      if (!program.rolling && program.applicationDeadline) {
        const deadline = new Date(program.applicationDeadline);
        const timeDiff = deadline.getTime() - now.getTime();
        daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Filter by withinDays if specified
        if (withinDate && deadline > withinDate) continue;
        
        // Set status based on days left
        if (daysLeft < 0) {
          status = 'expired';
        } else if (daysLeft <= 7) {
          status = 'urgent';
        } else if (daysLeft <= 30) {
          status = 'warning';
        }
      }
      
      deadlines.push({
        _id: savedProgram._id,
        university: {
          _id: university._id,
          name: university.name,
          country: university.country,
          city: university.city,
          logoUrl: university.logoUrl
        },
        program: {
          _id: program._id,
          name: program.name,
          level: program.level,
          duration: program.duration,
          applicationDeadline: program.applicationDeadline,
          rolling: program.rolling
        },
        daysLeft,
        status,
        savedAt: savedProgram.savedAt
      });
    }
    
    // Sort by deadline (urgent first, then by days left)
    deadlines.sort((a, b) => {
      if (a.program.rolling && !b.program.rolling) return 1;
      if (!a.program.rolling && b.program.rolling) return -1;
      if (a.program.rolling && b.program.rolling) return 0;
      
      if (a.daysLeft === null) return 1;
      if (b.daysLeft === null) return -1;
      
      return a.daysLeft - b.daysLeft;
    });
    
    res.json({
      success: true,
      data: deadlines,
      count: deadlines.length
    });
    
  } catch (error) {
    console.error('Get deadlines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /api/deadlines/save - Save a program to deadline tracker
router.post('/save', auth, async (req, res) => {
  try {
    const { universityId, programId } = req.body;
    
    if (!universityId || !programId) {
      return res.status(400).json({
        success: false,
        message: 'University ID and Program ID are required'
      });
    }
    
    // Validate university and program exist
    const university = await University.findById(universityId);
    if (!university || !university.isActive) {
      return res.status(404).json({
        success: false,
        message: 'University not found or inactive'
      });
    }
    
    const program = university.programs.id(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    // Get or create user profile
    let userProfile = await UserProfile.findOne({ userId: req.user._id });
    if (!userProfile) {
      userProfile = new UserProfile({ userId: req.user._id });
    }
    
    // Check if already saved
    const existingSave = userProfile.savedPrograms.find(
      sp => sp.universityId.toString() === universityId && sp.programId.toString() === programId
    );
    
    if (existingSave) {
      return res.status(400).json({
        success: false,
        message: 'Program already saved to deadline tracker'
      });
    }
    
    // Add to saved programs
    userProfile.savedPrograms.push({
      universityId: new mongoose.Types.ObjectId(universityId),
      programId: new mongoose.Types.ObjectId(programId)
    });
    
    await userProfile.save();
    
    res.json({
      success: true,
      message: 'Program saved to deadline tracker',
      data: {
        university: {
          name: university.name,
          country: university.country
        },
        program: {
          name: program.name,
          level: program.level
        }
      }
    });
    
  } catch (error) {
    console.error('Save deadline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// DELETE /api/deadlines/remove/:programId - Remove program from deadline tracker
router.delete('/remove/:savedProgramId', auth, async (req, res) => {
  try {
    const { savedProgramId } = req.params;
    
    const userProfile = await UserProfile.findOne({ userId: req.user._id });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
    
    // Find and remove the saved program
    const savedProgramIndex = userProfile.savedPrograms.findIndex(
      sp => sp._id.toString() === savedProgramId
    );
    
    if (savedProgramIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Saved program not found'
      });
    }
    
    userProfile.savedPrograms.splice(savedProgramIndex, 1);
    await userProfile.save();
    
    res.json({
      success: true,
      message: 'Program removed from deadline tracker'
    });
    
  } catch (error) {
    console.error('Remove deadline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET /api/deadlines/notifications - Get unread notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: req.user._id })
      .populate('notifications.universityId', 'name country');
    
    if (!userProfile) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const unreadNotifications = userProfile.notifications
      .filter(notification => !notification.isRead)
      .sort((a, b) => b.createdAt - a.createdAt);
    
    res.json({
      success: true,
      data: unreadNotifications,
      count: unreadNotifications.length
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// PUT /api/deadlines/notifications/:notificationId/read - Mark notification as read
router.put('/notifications/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const userProfile = await UserProfile.findOne({ userId: req.user._id });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
    
    const notification = userProfile.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    notification.isRead = true;
    await userProfile.save();
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
    
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;