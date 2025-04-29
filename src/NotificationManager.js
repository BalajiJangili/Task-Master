// Notification types
export const NOTIFICATION_TYPES = {
  DEADLINE: 'deadline',
  STATUS: 'status',
  ACHIEVEMENT: 'achievement'
};

// Create a new notification
export const createNotification = (type, title, message) => {
  return {
    id: Date.now(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
};

// Check for deadline notifications
export const checkDeadlineNotifications = (tasks) => {
  const notifications = [];
  const now = new Date();

  tasks.forEach(task => {
    if (task.completed || !task.deadline) return;

    const deadlineDate = new Date(task.deadline);
    const timeDiff = deadlineDate - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Task is due today
    if (daysDiff === 0 && !task.notifiedToday) {
      notifications.push(
        createNotification(
          NOTIFICATION_TYPES.DEADLINE,
          'Task Due Today',
          `"${task.text}" is due today!`
        )
      );
      task.notifiedToday = true;
    }
    // Task is overdue
    else if (daysDiff < 0 && !task.notifiedOverdue) {
      notifications.push(
        createNotification(
          NOTIFICATION_TYPES.DEADLINE,
          'Task Overdue',
          `"${task.text}" is overdue!`
        )
      );
      task.notifiedOverdue = true;
    }
  });

  return { notifications, updatedTasks: tasks };
};

// Create status change notifications
export const createStatusNotification = (task, status) => {
  let title, message;

  switch (status) {
    case 'completed':
      title = 'Task Completed';
      message = `You've completed "${task.text}"!`;
      break;
    case 'deleted':
      title = 'Task Deleted';
      message = `"${task.text}" has been deleted.`;
      break;
    default:
      title = 'Task Updated';
      message = `"${task.text}" has been updated.`;
  }

  return createNotification(NOTIFICATION_TYPES.STATUS, title, message);
};

// Create achievement notifications
export const createAchievementNotification = (achievement, value) => {
  let title, message;

  switch (achievement) {
    case 'streak':
      title = 'Streak Achievement';
      message = `You've maintained a ${value}-day streak!`;
      break;
    case 'level_up':
      title = 'Level Up!';
      message = `You've reached level ${value}!`;
      break;
    default:
      title = 'Achievement';
      message = 'You\'ve unlocked a new achievement!';
  }

  return createNotification(NOTIFICATION_TYPES.ACHIEVEMENT, title, message);
};

// Send browser notification
export const sendBrowserNotification = (title, message) => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, { body: message });
    return true;
  }

  return false;
};
