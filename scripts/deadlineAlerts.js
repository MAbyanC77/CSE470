const mongoose = require('mongoose');
const cron = require('node-cron');
const UserProfile = require('../models/UserProfile');
const University = require('../models/University');
require('dotenv').config();

// Use existing MongoDB connection from server.js
// No need to connect again as connection is already established

// Function to check deadlines and create notifications
const checkDeadlines = async () => {
  try {
    console.log('🔍 Checking deadlines for all users...');
    
    // Get all users with saved programs
    const users = await UserProfile.find({
      savedPrograms: { $exists: true, $not: { $size: 0 } }
    }).populate({
      path: 'savedPrograms.universityId',
      model: 'University'
    });

    let totalNotifications = 0;

    for (const user of users) {
      const alertPreferences = user.alertPreferences || {
        emailAlerts: true,
        onsiteAlerts: true,
        notificationDays: [30, 14, 7, 1]
      };

      if (!alertPreferences.onsiteAlerts) continue;

      for (const savedProgram of user.savedPrograms) {
        const university = savedProgram.universityId;
        if (!university) continue;

        const program = university.programs.id(savedProgram.programId);
        if (!program || program.rolling) continue;

        const deadline = new Date(program.applicationDeadline);
        const today = new Date();
        const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

        // Check if we should send a notification
        if (alertPreferences.notificationDays.includes(daysUntilDeadline)) {
          // Check if notification already exists for this deadline
          const existingNotification = user.notifications.find(notification => 
            notification.type === 'deadline_alert' &&
            notification.data.universityId.toString() === university._id.toString() &&
            notification.data.programId.toString() === program._id.toString() &&
            notification.data.daysLeft === daysUntilDeadline
          );

          if (!existingNotification) {
            // Create new notification
            const notification = {
              type: 'deadline_alert',
              title: `Application Deadline Reminder`,
              message: `${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'} left to apply for ${program.name} at ${university.name}`,
              data: {
                universityId: university._id,
                programId: program._id,
                universityName: university.name,
                programName: program.name,
                deadline: deadline,
                daysLeft: daysUntilDeadline
              },
              isRead: false,
              createdAt: new Date()
            };

            user.notifications.push(notification);
            totalNotifications++;
          }
        }

        // Check for overdue deadlines
        if (daysUntilDeadline < 0) {
          const existingOverdueNotification = user.notifications.find(notification => 
            notification.type === 'deadline_overdue' &&
            notification.data.universityId.toString() === university._id.toString() &&
            notification.data.programId.toString() === program._id.toString()
          );

          if (!existingOverdueNotification) {
            const notification = {
              type: 'deadline_overdue',
              title: `Application Deadline Passed`,
              message: `The application deadline for ${program.name} at ${university.name} has passed`,
              data: {
                universityId: university._id,
                programId: program._id,
                universityName: university.name,
                programName: program.name,
                deadline: deadline,
                daysOverdue: Math.abs(daysUntilDeadline)
              },
              isRead: false,
              createdAt: new Date()
            };

            user.notifications.push(notification);
            totalNotifications++;
          }
        }
      }

      // Save user with new notifications
      if (user.isModified('notifications')) {
        await user.save();
      }
    }

    console.log(`✅ Deadline check completed. Created ${totalNotifications} new notifications for ${users.length} users.`);
  } catch (error) {
    console.error('❌ Error checking deadlines:', error);
  }
};

// Function to clean up old notifications (older than 30 days)
const cleanupOldNotifications = async () => {
  try {
    console.log('🧹 Cleaning up old notifications...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await UserProfile.updateMany(
      {},
      {
        $pull: {
          notifications: {
            createdAt: { $lt: thirtyDaysAgo },
            isRead: true
          }
        }
      }
    );

    console.log(`✅ Cleaned up old notifications. Modified ${result.modifiedCount} user profiles.`);
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
  }
};

// Schedule the deadline check to run daily at 9:00 AM BDT
cron.schedule('0 9 * * *', () => {
  console.log('⏰ Running scheduled deadline check...');
  checkDeadlines();
}, {
  timezone: 'Asia/Dhaka'
});

// Schedule cleanup to run weekly on Sunday at 2:00 AM BDT
cron.schedule('0 2 * * 0', () => {
  console.log('⏰ Running scheduled notification cleanup...');
  cleanupOldNotifications();
}, {
  timezone: 'Asia/Dhaka'
});

// Run immediately if this script is executed directly
if (require.main === module) {
  console.log('🚀 Starting deadline alert system...');
  
  // Run initial check
  checkDeadlines().then(() => {
    console.log('📅 Deadline alert system is now running. Press Ctrl+C to stop.');
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down deadline alert system...');
    mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = {
  checkDeadlines,
  cleanupOldNotifications
};