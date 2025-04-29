/**
 * Utility functions for task management
 */

// Format time remaining until deadline
export const getTimeRemaining = (deadline) => {
  if (!deadline) return '';
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate - now;

  if (timeDiff < 0) return '⚠️ Overdue';

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `⏳ ${days}d ${hours}h remaining`;
  if (hours > 0) return `⏳ ${hours}h ${minutes}m remaining`;
  return `⚡ ${minutes}m remaining`;
};

// Check if a deadline is urgent (within 24 hours)
export const isUrgent = (deadline) => {
  if (!deadline) return false;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate - now;
  return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000;
};

// Check if a deadline has been reached
export const checkDeadlineReached = (task) => {
  if (!task.deadline) return false;
  const now = new Date();
  const deadlineDate = new Date(task.deadline);
  return now >= deadlineDate && !task.completed;
};

// Format milliseconds to a readable time format (HH:MM:SS)
export const formatTime = (milliseconds) => {
  if (!milliseconds) return '00:00:00';

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};

// Create a new task object
export const createTaskObject = (text, deadline, priority) => ({
  id: Date.now(),
  text,
  completed: false,
  deadline: deadline || '',
  priority: priority || 'medium',
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  timeTracking: {
    status: 'not_started',
    startTime: null,
    completionTime: null,
    totalTime: 0,
    pauses: []
  }
});

// Priority order for sorting
export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// Get today's date in YYYY-MM-DD format
export const getTodayString = () => new Date().toISOString().split('T')[0];

// Get yesterday's date in YYYY-MM-DD format
export const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Calculate points earned for completing a task
export const calculatePointsEarned = (task, streak) => {
  const now = new Date();
  let pointsEarned = 10; // Base points
  
  // Bonus points for priority
  if (task.priority === 'high') {
    pointsEarned += 15;
  } else if (task.priority === 'medium') {
    pointsEarned += 10;
  } else if (task.priority === 'low') {
    pointsEarned += 5;
  }
  
  // Bonus points for completing before deadline
  if (task.deadline) {
    const deadlineDate = new Date(task.deadline);
    if (now < deadlineDate) {
      // More points the earlier it's completed
      const daysEarly = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24));
      pointsEarned += Math.min(daysEarly * 2, 20); // Cap at 20 bonus points
    }
  }
  
  // Bonus points for streak
  if (streak > 1) {
    const streakBonus = Math.min(streak * 2, 50); // Cap at 50 bonus points
    pointsEarned += streakBonus;
  }
  
  return pointsEarned;
};

// Check if a streak milestone has been reached
export const isStreakMilestone = (streak) => {
  return streak === 3 || 
         streak === 7 || 
         streak === 14 || 
         streak === 30 || 
         streak === 60 || 
         streak === 100 || 
         streak % 100 === 0;
};
