const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and user ID
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'application/pdf': ['.pdf']
  };
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/me/profile - Get current user's profile
router.get('/me/profile', auth, async (req, res) => {
  try {
    // Only students can access their own profile
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    let profile = await UserProfile.findOne({ userId: req.user.id });
    
    // Create empty profile if none exists
    if (!profile) {
      profile = new UserProfile({
        userId: req.user.id,
        fullName: req.user.name || '',
        onboardingCompleted: false
      });
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/me/profile - Update current user's profile
router.put('/me/profile', auth, async (req, res) => {
  try {
    // Only students can update their own profile
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const {
      fullName,
      phone,
      currentCity,
      highestEducation,
      gpaOrCgpa,
      englishTest,
      englishScore,
      targetDegree,
      targetCountries,
      budgetMonthlyBDT,
      onboardingCompleted
    } = req.body;

    // Validation
    const errors = [];
    
    if (phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (gpaOrCgpa && (isNaN(gpaOrCgpa) || parseFloat(gpaOrCgpa) < 0 || parseFloat(gpaOrCgpa) > 5)) {
      errors.push('GPA/CGPA must be between 0 and 5');
    }
    
    if (targetCountries && targetCountries.length > 3) {
      errors.push('Maximum 3 target countries allowed');
    }
    
    if (budgetMonthlyBDT && (isNaN(budgetMonthlyBDT) || parseFloat(budgetMonthlyBDT) < 0)) {
      errors.push('Budget must be a positive number');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation errors', errors });
    }

    // Update or create profile
    const profileData = {
      userId: req.user.id,
      fullName: fullName || '',
      phone: phone || '',
      currentCity: currentCity || '',
      highestEducation: highestEducation || '',
      gpaOrCgpa: gpaOrCgpa || '',
      englishTest: englishTest || '',
      englishScore: englishScore || '',
      targetDegree: targetDegree || '',
      targetCountries: targetCountries || [],
      budgetMonthlyBDT: budgetMonthlyBDT || null,
      onboardingCompleted: onboardingCompleted || false
    };

    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation errors', errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/me/profile/onboarding-status - Mark onboarding as completed
router.patch('/me/profile/onboarding-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { onboardingCompleted: true },
      { new: true, upsert: true }
    );

    res.json({ message: 'Onboarding completed', profile });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/students/:userId/profile - View student profile (counselor/admin only)
router.get('/students/:userId/profile', auth, async (req, res) => {
  try {
    // Only counselors and admins can view student profiles
    if (!['counselor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Counselors and admins only.' });
    }

    const { userId } = req.params;

    // Verify the target user is a student
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (targetUser.role !== 'student') {
      return res.status(400).json({ message: 'Can only view student profiles' });
    }

    const profile = await UserProfile.findOne({ userId }).populate('userId', 'name email');
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/students/profiles - Get all student profiles (counselor/admin only)
router.get('/students/profiles', auth, async (req, res) => {
  try {
    if (!['counselor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Counselors and admins only.' });
    }

    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { currentCity: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const profiles = await UserProfile.find(searchQuery)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserProfile.countDocuments(searchQuery);

    res.json({
      profiles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching student profiles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/me/profile/documents/upload - Upload documents
router.post('/me/profile/documents/upload', auth, (req, res, next) => {
  upload.fields([
    { name: 'oLevelResults', maxCount: 1 },
    { name: 'aLevelResults', maxCount: 1 },
    { name: 'bachelorTranscript', maxCount: 1 },
    { name: 'masterTranscript', maxCount: 1 },
    { name: 'ieltsScore', maxCount: 1 },
    { name: 'toeflScore', maxCount: 1 },
    { name: 'greScore', maxCount: 1 },
    { name: 'gmatScore', maxCount: 1 },
    { name: 'satScore', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
    { name: 'nationalId', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'photograph', maxCount: 1 },
    { name: 'bankStatements', maxCount: 5 },
    { name: 'sponsorshipLetter', maxCount: 1 },
    { name: 'scholarshipDocuments', maxCount: 3 },
    { name: 'taxReturns', maxCount: 3 },
    { name: 'salarySlips', maxCount: 3 },
    { name: 'statementOfPurpose', maxCount: 1 },
    { name: 'personalStatement', maxCount: 1 },
    { name: 'recommendationLetters', maxCount: 5 },
    { name: 'cv', maxCount: 1 },
    { name: 'portfolio', maxCount: 1 },
    { name: 'researchProposal', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {

  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    // Process uploaded files
    const documentUpdates = {};
    const uploadedFiles = [];

    // Handle each document type
    Object.keys(req.files).forEach(fieldName => {
      const files = req.files[fieldName];
      if (files && files.length > 0) {
        if (files.length === 1) {
          // Single file upload
          documentUpdates[fieldName] = {
            filename: files[0].filename,
            originalName: files[0].originalname,
            path: files[0].path,
            size: files[0].size,
            uploadedAt: new Date()
          };
        } else {
          // Multiple files upload
          documentUpdates[fieldName] = files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            uploadedAt: new Date()
          }));
        }
        uploadedFiles.push(...files);
      }
    });

    // Handle additional form data (scores, passport details, etc.)
    const additionalData = {};
    if (req.body.ieltsOverallScore) additionalData.ieltsOverallScore = req.body.ieltsOverallScore;
    if (req.body.toeflTotalScore) additionalData.toeflTotalScore = req.body.toeflTotalScore;
    if (req.body.greQuantitative) additionalData.greQuantitative = req.body.greQuantitative;
    if (req.body.greVerbal) additionalData.greVerbal = req.body.greVerbal;
    if (req.body.satTotalScore) additionalData.satTotalScore = req.body.satTotalScore;
    if (req.body.passportNumber) additionalData.passportNumber = req.body.passportNumber;
    if (req.body.passportExpiry) additionalData.passportExpiry = req.body.passportExpiry;
    if (req.body.sponsorName) additionalData.sponsorName = req.body.sponsorName;
    if (req.body.sponsorRelationship) additionalData.sponsorRelationship = req.body.sponsorRelationship;

    // Update user profile with document information
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      { 
        ...documentUpdates,
        ...additionalData,
        documentsLastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Documents uploaded successfully',
      uploadedFiles: uploadedFiles.length,
      profile: profile
    });

  } catch (error) {
    console.error('Error uploading documents:', error);
    
    // Clean up uploaded files if there was an error
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// GET /api/me/profile/documents/:documentType - Download document
router.get('/me/profile/documents/:documentType', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const { documentType } = req.params;
    const profile = await UserProfile.findOne({ userId: req.user.id });
    
    if (!profile || !profile[documentType]) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = profile[documentType];
    const filePath = document.path || path.join(__dirname, '../uploads/documents', document.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, document.originalName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/me/profile/documents/:documentType - Delete document
router.delete('/me/profile/documents/:documentType', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const { documentType } = req.params;
    const profile = await UserProfile.findOne({ userId: req.user.id });
    
    if (!profile || !profile[documentType]) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = profile[documentType];
    const filePath = document.path || path.join(__dirname, '../uploads/documents', document.filename);
    
    // Delete file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove document reference from profile
    const updateQuery = { $unset: {} };
    updateQuery.$unset[documentType] = 1;
    
    await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      updateQuery
    );

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;