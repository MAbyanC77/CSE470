const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Application Guides',
      'Test Preparation',
      'Visa Information',
      'Financial Planning',
      'Country Guides',
      'Document Templates',
      'Interview Preparation',
      'Scholarship Resources',
      'Academic Writing',
      'Cultural Adaptation'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: ['PDF', 'Article', 'Video', 'Template', 'Checklist', 'Guide']
  },
  content: {
    type: String,
    required: true // This can be file URL, article content, or video embed code
  },
  fileUrl: {
    type: String // For downloadable files
  },
  tags: [{
    type: String,
    trim: true
  }],
  targetAudience: {
    type: String,
    enum: ['Undergraduate', 'Graduate', 'PhD', 'All'],
    default: 'All'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  author: {
    type: String,
    default: 'EduGlobalBD Team'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ category: 1, type: 1 });
resourceSchema.index({ featured: -1, views: -1 });

module.exports = mongoose.model('Resource', resourceSchema);