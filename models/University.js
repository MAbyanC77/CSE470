const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  type: {
    type: String,
    enum: ['Public', 'Private', 'Community'],
    required: true
  },
  establishedYear: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear()
  },
  ranking: {
    world: {
      type: Number,
      min: 1
    },
    national: {
      type: Number,
      min: 1
    }
  },
  tuitionFee: {
    undergraduate: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    graduate: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  tuitionBDT: {
    undergraduate: {
      min: Number,
      max: Number
    },
    graduate: {
      min: Number,
      max: Number
    }
  },
  livingCostBDT: {
    monthly: {
      min: Number,
      max: Number
    },
    annual: {
      min: Number,
      max: Number
    }
  },
  visaFeeBDT: {
    type: Number,
    default: 0
  },
  otherFeesBDT: {
    insurance: {
      type: Number,
      default: 0
    },
    admin: {
      type: Number,
      default: 0
    },
    application: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  logoUrl: {
    type: String,
    trim: true
  },
  programs: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'],
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    requirements: {
      gpa: Number,
      englishTest: {
        type: String,
        enum: ['IELTS', 'TOEFL', 'PTE', 'Duolingo']
      },
      minScore: Number
    },
    applicationDeadline: {
      type: Date,
      required: true
    },
    rolling: {
      type: Boolean,
      default: false
    }
  }],
  admissionRequirements: {
    gpa: {
      min: Number,
      max: Number
    },
    englishTests: [{
      test: {
        type: String,
        enum: ['IELTS', 'TOEFL', 'PTE', 'Duolingo']
      },
      minScore: Number
    }],
    standardizedTests: [{
      test: {
        type: String,
        enum: ['SAT', 'GRE', 'GMAT', 'MCAT', 'LSAT']
      },
      minScore: Number
    }]
  },
  applicationDeadlines: {
    fall: {
      early: Date,
      regular: Date,
      late: Date
    },
    spring: {
      early: Date,
      regular: Date,
      late: Date
    }
  },
  scholarships: [{
    name: String,
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    criteria: String,
    deadline: Date
  }],
  campusLife: {
    studentPopulation: Number,
    internationalStudents: Number,
    campusSize: String,
    accommodation: {
      available: Boolean,
      cost: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'USD'
        }
      }
    },
    partTimeJobOpportunities: {
      availability: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Limited', 'Poor'],
        default: 'Good'
      },
      averageHourlyWage: {
        amount: Number,
        currency: {
          type: String,
          default: 'USD'
        }
      },
      popularFields: [{
        field: String,
        description: String,
        demandLevel: {
          type: String,
          enum: ['High', 'Medium', 'Low']
        }
      }],
      workPermitInfo: {
        onCampusAllowed: {
          type: Boolean,
          default: true
        },
        offCampusAllowed: {
          type: Boolean,
          default: false
        },
        hoursPerWeek: {
          type: Number,
          default: 20
        },
        additionalInfo: String
      },
      description: {
        type: String,
        maxlength: 1000
      }
    }
  },
  contact: {
    website: String,
    email: String,
    phone: String,
    address: String
  },
  description: {
    type: String,
    maxlength: 2000
  },
  images: [{
    url: String,
    caption: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
universitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search functionality
universitySchema.index({
  name: 'text',
  country: 'text',
  city: 'text',
  'programs.name': 'text',
  description: 'text',
  tags: 'text'
});

// Index for filtering
universitySchema.index({ country: 1, type: 1, isActive: 1 });
universitySchema.index({ 'ranking.world': 1 });
universitySchema.index({ 'tuitionFee.undergraduate.min': 1, 'tuitionFee.undergraduate.max': 1 });
universitySchema.index({ 'tuitionBDT.undergraduate.min': 1, 'tuitionBDT.undergraduate.max': 1 });

module.exports = mongoose.model('University', universitySchema);