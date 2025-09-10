const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  currentCity: {
    type: String,
    trim: true
  },
  highestEducation: {
    type: String,
    enum: ['HSC', 'Bachelor', 'Masters', 'PhD', ''],
    default: ''
  },
  gpaOrCgpa: {
    type: String,
    trim: true
  },
  englishTest: {
    type: String,
    enum: ['IELTS', 'TOEFL', 'PTE', 'None', ''],
    default: ''
  },
  englishScore: {
    type: String,
    trim: true
  },
  targetDegree: {
    type: String,
    enum: ['UG', 'Masters', 'PhD', ''],
    default: ''
  },
  targetCountries: {
    type: [String],
    default: [],
    validate: {
      validator: function(countries) {
        return countries.length <= 3;
      },
      message: 'Maximum 3 target countries allowed'
    }
  },
  budgetMonthlyBDT: {
    type: Number,
    min: 0
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  savedPrograms: [{
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  alertPreferences: {
    emailAlerts: {
      type: Boolean,
      default: true
    },
    onsiteAlerts: {
      type: Boolean,
      default: true
    },
    daysBefore: {
      type: [Number],
      default: [30, 14, 7, 1]
    }
  },
  notifications: [{
    type: {
      type: String,
      enum: ['deadline_alert', 'general'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Academic Documents
  academicDocuments: {
    oLevelResults: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      subjects: [{
        subject: String,
        grade: String
      }]
    },
    aLevelResults: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      subjects: [{
        subject: String,
        grade: String
      }]
    },
    bachelorTranscript: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      cgpa: String,
      institution: String
    },
    masterTranscript: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      cgpa: String,
      institution: String
    },
    degreeCertificates: [{
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      degreeType: String,
      institution: String
    }]
  },
  
  // Test Scores
  testScores: {
    ielts: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      overallScore: Number,
      listening: Number,
      reading: Number,
      writing: Number,
      speaking: Number,
      testDate: Date
    },
    toefl: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      totalScore: Number,
      reading: Number,
      listening: Number,
      speaking: Number,
      writing: Number,
      testDate: Date
    },
    gre: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      quantitative: Number,
      verbal: Number,
      analyticalWriting: Number,
      testDate: Date
    },
    gmat: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      totalScore: Number,
      quantitative: Number,
      verbal: Number,
      integratedReasoning: Number,
      analyticalWriting: Number,
      testDate: Date
    },
    sat: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      totalScore: Number,
      math: Number,
      evidenceBasedReading: Number,
      testDate: Date
    }
  },
  
  // Personal Documents
  personalDocuments: {
    passport: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      passportNumber: String,
      expiryDate: Date,
      nationality: String
    },
    nationalId: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      idNumber: String
    },
    birthCertificate: {
      fileName: String,
      filePath: String,
      uploadedAt: Date
    },
    photograph: {
      fileName: String,
      filePath: String,
      uploadedAt: Date
    }
  },
  
  // Financial Documents
  financialDocuments: {
    bankStatements: [{
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      bankName: String,
      accountType: String,
      statementPeriod: String
    }],
    sponsorshipLetter: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      sponsorName: String,
      relationship: String
    },
    scholarshipDocuments: [{
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      scholarshipName: String,
      amount: String
    }],
    taxReturns: [{
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      year: String
    }],
    salarySlips: [{
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      month: String,
      year: String
    }]
  },
  
  // Application Documents
  applicationDocuments: {
    statementOfPurpose: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      wordCount: Number
    },
    personalStatement: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      wordCount: Number
    },
    recommendationLetters: [{
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      recommenderName: String,
      recommenderTitle: String,
      recommenderInstitution: String
    }],
    cv: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      lastUpdated: Date
    },
    portfolioDocuments: [{
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      documentType: String,
      description: String
    }],
    researchProposal: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      wordCount: Number
    }
  },
  
  // Additional Documents
  additionalDocuments: [{
    fileName: String,
    filePath: String,
    uploadedAt: Date,
    documentType: String,
    description: String
  }]
}, {
  timestamps: true
});

// Index for faster queries
userProfileSchema.index({ userId: 1 });

// Virtual to populate user data
userProfileSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
userProfileSchema.set('toJSON', { virtuals: true });
userProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);