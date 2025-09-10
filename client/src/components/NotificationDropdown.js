import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationIcon,
    getNotificationColor
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.type === 'application_status_update' && notification.applicationId) {
      return `/application-progress/${notification.applicationId}`;
    }
    return null;
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner-small"></div>
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notifications-icon">📭</span>
                <p>No notifications yet</p>
                <small>You'll see updates about your applications here</small>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => {
                const link = getNotificationLink(notification);
                const NotificationContent = (
                  <div 
                    className={`notification-item ${
                      notification.read ? 'read' : 'unread'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-content">
                      <div className="notification-icon-wrapper">
                        <span 
                          className="notification-type-icon"
                          style={{ color: getNotificationColor(notification.type) }}
                        >
                          {getNotificationIcon(notification.type)}
                        </span>
                        {!notification.read && (
                          <span className="unread-dot"></span>
                        )}
                      </div>
                      
                      <div className="notification-text">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="delete-notification"
                      onClick={(e) => handleDeleteNotification(e, notification._id)}
                      aria-label="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                );

                return link ? (
                  <Link 
                    key={notification._id}
                    to={link}
                    className="notification-link"
                  >
                    {NotificationContent}
                  </Link>
                ) : (
                  <div key={notification._id}>
                    {NotificationContent}
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-footer">
              <Link 
                to="/notifications" 
                className="view-all-link"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;