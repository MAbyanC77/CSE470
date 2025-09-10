const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'application_status_update',
      'deadline_reminder',
      'interview_scheduled',
      'document_required',
      'acceptance',
      'rejection',
      'waitlist',
      'scholarship_update',
      'system_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    sparse: true // Only for application-related notifications
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    sparse: true // Only for university-related notifications
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {} // Additional data specific to notification type
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index for automatic cleanup
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, applicationId: 1 });

// Static method to create application status update notification
NotificationSchema.statics.createApplicationStatusNotification = async function(application, oldStatus, newStatus, note) {
  const statusMessages = {
    'pending': 'Your application is being reviewed',
    'under_review': 'Your application is currently under review by the admissions committee',
    'interview_scheduled': 'An interview has been scheduled for your application',
    'final_review': 'Your application is in the final review stage',
    'accepted': 'Congratulations! Your application has been accepted',
    'declined': 'Your application status has been updated',
    'waitlisted': 'You have been placed on the waitlist'
  };

  const statusTitles = {
    'pending': 'Application Submitted',
    'under_review': 'Application Under Review',
    'interview_scheduled': 'Interview Scheduled',
    'final_review': 'Final Review Stage',
    'accepted': 'Application Accepted! 🎉',
    'declined': 'Application Decision',
    'waitlisted': 'Waitlisted'
  };

  const notificationType = newStatus === 'accepted' ? 'acceptance' : 
                          newStatus === 'declined' ? 'rejection' :
                          newStatus === 'waitlisted' ? 'waitlist' :
                          newStatus === 'interview_scheduled' ? 'interview_scheduled' :
                          'application_status_update';

  const priority = newStatus === 'accepted' || newStatus === 'declined' ? 'high' :
                  newStatus === 'interview_scheduled' ? 'high' :
                  newStatus === 'waitlisted' ? 'medium' : 'medium';

  let message = statusMessages[newStatus] || 'Your application status has been updated';
  if (note) {
    message += `. Note: ${note}`;
  }

  const notification = new this({
    user: application.user,
    type: notificationType,
    title: statusTitles[newStatus] || 'Application Update',
    message: message,
    applicationId: application._id,
    universityId: application.university,
    priority: priority,
    data: {
      oldStatus: oldStatus,
      newStatus: newStatus,
      universityName: application.university?.name,
      subject: application.subject,
      note: note
    },
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Expire after 90 days
  });

  return await notification.save();
};

// Static method to create deadline reminder notification
NotificationSchema.statics.createDeadlineReminder = async function(userId, university, deadline, daysUntil) {
  const urgencyLevel = daysUntil <= 1 ? 'urgent' :
                      daysUntil <= 3 ? 'high' :
                      daysUntil <= 7 ? 'medium' : 'low';

  const title = daysUntil === 0 ? 'Application Deadline Today!' :
               daysUntil === 1 ? 'Application Deadline Tomorrow!' :
               `Application Deadline in ${daysUntil} days`;

  const message = daysUntil === 0 ? 
    `The application deadline for ${university.name} is today. Don't miss out!` :
    `The application deadline for ${university.name} is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}. Make sure to submit your application on time.`;

  const notification = new this({
    user: userId,
    type: 'deadline_reminder',
    title: title,
    message: message,
    universityId: university._id,
    priority: urgencyLevel,
    data: {
      universityName: university.name,
      deadline: deadline,
      daysUntil: daysUntil
    },
    expiresAt: new Date(deadline.getTime() + 7 * 24 * 60 * 60 * 1000) // Expire 7 days after deadline
  });

  return await notification.save();
};

// Static method to mark notifications as read
NotificationSchema.statics.markAsRead = async function(userId, notificationIds) {
  const query = { user: userId, read: false };
  if (notificationIds && notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }
  
  return await this.updateMany(query, { read: true, readAt: new Date() });
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user: userId, read: false });
};

// Static method to get user notifications with pagination
NotificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = null,
    read = null
  } = options;

  const query = { user: userId };
  if (type) query.type = type;
  if (read !== null) query.read = read;

  const notifications = await this.find(query)
    .populate('applicationId', 'university subject status')
    .populate('universityId', 'name city country logoUrl')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    notifications,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

// Instance method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Pre-save middleware to populate university name if not provided
NotificationSchema.pre('save', async function(next) {
  if (this.isNew && this.universityId && !this.data.universityName) {
    try {
      const University = mongoose.model('University');
      const university = await University.findById(this.universityId).select('name');
      if (university) {
        this.data.universityName = university.name;
      }
    } catch (error) {
      console.error('Error populating university name:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);