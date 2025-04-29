import { useState, useEffect, useRef } from 'react';
import { checkDeadlineNotifications } from '../NotificationManager';

/**
 * Custom hook for notifications
 */
const useNotifications = (tasks) => {
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });

  const notificationCheckRef = useRef(null);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Check for deadline notifications
  useEffect(() => {
    const checkNotifications = () => {
      // Check for deadline notifications
      const { notifications: deadlineNotifications, updatedTasks: tasksWithDeadlineNotifications } =
        checkDeadlineNotifications([...tasks]);

      // Add new notifications
      if (deadlineNotifications.length > 0) {
        setNotifications(prev => [...deadlineNotifications, ...prev]);
      }
    };

    // Run immediately
    checkNotifications();

    // Set up interval to check every minute
    notificationCheckRef.current = setInterval(checkNotifications, 60000);

    return () => {
      if (notificationCheckRef.current) {
        clearInterval(notificationCheckRef.current);
      }
    };
  }, [tasks]);

  // Dismiss a notification
  const dismissNotification = (id) => {
    // Remove the notification with the specified id
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  // Dismiss all notifications
  const dismissAllNotifications = () => {
    // Clear all notifications
    setNotifications([]);
  };

  return {
    notifications,
    setNotifications,
    dismissNotification,
    dismissAllNotifications
  };
};

export default useNotifications;
