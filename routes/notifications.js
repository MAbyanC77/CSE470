const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get user notifications with pagination and filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      read
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    if (type) options.type = type;
    if (read !== undefined) options.read = read === 'true';

    const result = await Notification.getUserNotifications(req.user.id, options);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark specific notification as read
// @access  Private
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.read) {
      await notification.markAsRead();
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    const result = await Notification.markAsRead(req.user.id);
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/notifications/mark-read
// @desc    Mark multiple notifications as read
// @access  Private
router.patch('/mark-read', auth, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ success: false, message: 'Invalid notification IDs' });
    }

    const result = await Notification.markAsRead(req.user.id, notificationIds);
    
    res.json({
      success: true,
      message: 'Notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete specific notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/notifications
// @desc    Delete multiple notifications
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ success: false, message: 'Invalid notification IDs' });
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      user: req.user.id
    });

    res.json({
      success: true,
      message: 'Notifications deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/read
// @desc    Delete all read notifications
// @access  Private
router.delete('/read', auth, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user.id,
      read: true
    });

    res.json({
      success: true,
      message: 'Read notifications deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/notifications/test
// @desc    Create test notification (development only)
// @access  Private
router.post('/test', auth, async (req, res) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Not allowed in production' });
    }

    const { type = 'application_status_update', title, message } = req.body;

    const notification = new Notification({
      user: req.user.id,
      type: type,
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      priority: 'medium',
      data: {
        test: true
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire after 24 hours
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Test notification created',
      notification
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$read', false] }, 1, 0]
            }
          },
          byType: {
            $push: {
              type: '$type',
              read: '$read'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          unread: 1,
          read: { $subtract: ['$total', '$unread'] },
          typeBreakdown: {
            $reduce: {
              input: '$byType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [[
                      {
                        k: '$$this.type',
                        v: {
                          $add: [
                            { $ifNull: [{ $getField: { field: '$$this.type', input: '$$value' } }, 0] },
                            1
                          ]
                        }
                      }
                    ]]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      unread: 0,
      read: 0,
      typeBreakdown: {}
    };

    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;