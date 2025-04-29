import React, { useState } from 'react';
import './Notifications.css';

const Notifications = ({
  notifications,
  onDismiss,
  onDismissAll
}) => {
  const [expanded, setExpanded] = useState(false);

  // Get notification badge count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-container">
      <div
        className="notifications-icon"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {expanded && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button
                className="clear-all-btn"
                onClick={onDismissAll}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                >
                  <div className="notification-icon">
                    {notification.type === 'deadline' && '⏰'}
                    {notification.type === 'status' && '📋'}
                    {notification.type === 'achievement' && '🏆'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {formatTimeAgo(notification.timestamp)}
                    </div>
                  </div>
                  <button
                    className="dismiss-btn"
                    onClick={() => onDismiss(notification.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export default Notifications;
