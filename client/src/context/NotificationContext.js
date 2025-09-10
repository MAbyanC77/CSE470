import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
        const unread = response.data.notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/notifications/mark-all-read', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification for new status updates
      if (notification.type === 'application_status_update') {
        toast.info(`📋 ${notification.title}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_status_update':
        return '📋';
      case 'deadline_reminder':
        return '⏰';
      case 'interview_scheduled':
        return '🎤';
      case 'document_required':
        return '📄';
      case 'acceptance':
        return '🎉';
      case 'rejection':
        return '📝';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application_status_update':
        return '#007bff';
      case 'deadline_reminder':
        return '#ffc107';
      case 'interview_scheduled':
        return '#17a2b8';
      case 'document_required':
        return '#fd7e14';
      case 'acceptance':
        return '#28a745';
      case 'rejection':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    getNotificationIcon,
    getNotificationColor
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;