const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer', 'Winter']
  },
  academicYear: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  preferredStartDate: {
    type: Date,
    required: true
  },
  applyingForScholarship: {
    type: Boolean,
    default: false
  },
  scholarshipType: {
    type: String,
    enum: ['Merit-based', 'Need-based', 'Athletic', 'Academic Excellence', 'Research', 'Other']
  },
  personalStatement: {
    type: String,
    required: true,
    minlength: 100
  },
  additionalDocuments: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'interview_scheduled', 'final_review', 'accepted', 'declined', 'waitlisted'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'under_review', 'interview_scheduled', 'final_review', 'accepted', 'declined', 'waitlisted'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  applicationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'under_review', 'accepted', 'declined', 'waitlisted']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  additionalNotes: {
    type: String,
    maxlength: 500
  },
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  expectedGraduation: {
    type: Date
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0
  },
  testScores: {
    sat: Number,
    act: Number,
    gre: Number,
    gmat: Number,
    toefl: Number,
    ielts: Number
  },
  workExperience: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

// Add initial status to history when application is created
applicationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
      note: 'Application submitted'
    });
  } else if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      date: new Date()
    });
  }
  next();
});

// Method to update status with history
applicationSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    note: note,
    updatedBy: updatedBy
  });
  return this.save();
};

// Method to get current progress percentage
applicationSchema.methods.getProgressPercentage = function() {
  const stages = ['pending', 'under_review', 'interview_scheduled', 'final_review', 'accepted'];
  const currentIndex = stages.indexOf(this.status);
  if (currentIndex === -1) return 0;
  return ((currentIndex + 1) / stages.length) * 100;
};

// Duplicate static method removed (already defined above)

// Static method to get active applications (not decided yet)
applicationSchema.statics.getActiveApplications = function() {
  return this.find({ 
    status: { $nin: ['accepted', 'declined'] } 
  }).populate('user university');
};

// Index for efficient queries
applicationSchema.index({ user: 1, university: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicationDate: -1 });

// Middleware to update lastUpdated on status change (handled in main pre-save hook above)

// Post-save hook to create notifications for status changes
applicationSchema.post('save', async function(doc, next) {
  try {
    // Only create notification if status was modified and it's not a new document
    if (this.wasModified('status') && !this.isNew) {
      const Notification = require('./Notification');
      await Notification.createApplicationStatusNotification(
        doc.user,
        doc._id,
        doc.status,
        doc.university
      );
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
  next();
});

// Virtual for application age
applicationSchema.virtual('applicationAge').get(function() {
  return Math.floor((Date.now() - this.applicationDate) / (1000 * 60 * 60 * 24));
});

// Method to check if application is still active
applicationSchema.methods.isActive = function() {
  return ['pending', 'under_review', 'waitlisted'].includes(this.status);
};

// Static method to get applications by status
applicationSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('user university');
};

module.exports = mongoose.model('Application', applicationSchema);