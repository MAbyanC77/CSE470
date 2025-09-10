const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  degreeLevel: {
    type: String,
    enum: ['UG', 'Masters', 'PhD'],
    required: true
  },
  fields: [{
    type: String,
    required: true
  }],
  meritBased: {
    type: Boolean,
    default: false
  },
  needBased: {
    type: Boolean,
    default: false
  },
  minGPA: {
    type: Number,
    min: 0,
    max: 4.0
  },
  incomeMaxBDT: {
    type: Number,
    min: 0
  },
  ieltsMin: {
    type: Number,
    min: 0,
    max: 9.0
  },
  toeflMin: {
    type: Number,
    min: 0,
    max: 120
  },
  greMin: {
    type: Number,
    min: 0,
    max: 340
  },
  coveragePercent: {
    type: Number,
    min: 0,
    max: 100
  },
  amountBDT: {
    type: Number,
    min: 0
  },
  stipendMonthlyBDT: {
    type: Number,
    min: 0,
    default: 0
  },
  applicationFeeBDT: {
    type: Number,
    min: 0,
    default: 0
  },
  deadline: {
    type: Date
  },
  rolling: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: 2000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
scholarshipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient querying
scholarshipSchema.index({ country: 1, isActive: 1 });
scholarshipSchema.index({ degreeLevel: 1, isActive: 1 });
scholarshipSchema.index({ fields: 1, isActive: 1 });
scholarshipSchema.index({ minGPA: 1, isActive: 1 });
scholarshipSchema.index({ rolling: 1, deadline: 1, isActive: 1 });
scholarshipSchema.index({ university: 1, isActive: 1 });
scholarshipSchema.index({ meritBased: 1, needBased: 1, isActive: 1 });
scholarshipSchema.index({ amountBDT: -1, coveragePercent: -1, isActive: 1 });

// Text search index
scholarshipSchema.index({
  name: 'text',
  description: 'text',
  fields: 'text'
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);