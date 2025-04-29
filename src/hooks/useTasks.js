import { useState, useEffect, useCallback } from 'react';
import { 
  createTaskObject, 
  PRIORITY_ORDER, 
  getTodayString, 
  getYesterdayString,
  calculatePointsEarned,
  isStreakMilestone
} from '../utils/taskUtils';
import { 
  createStatusNotification, 
  createAchievementNotification,
  sendBrowserNotification
} from '../NotificationManager';

/**
 * Custom hook for task management
 */
const useTasks = (setNotifications, setScore, setLastScoreChange, setShowScoreAnimation) => {
  // Task state
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  // Task filters
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [timeTrackingFilter, setTimeTrackingFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  
  // Task form state
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Streak tracking
  const [streak, setStreak] = useState(() => {
    const savedStreak = localStorage.getItem('userStreak');
    return savedStreak ? parseInt(savedStreak) : 0;
  });
  const [lastCompletionDate, setLastCompletionDate] = useState(() => {
    const savedDate = localStorage.getItem('lastCompletionDate');
    return savedDate || '';
  });
  
  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Save streak to localStorage
  useEffect(() => {
    localStorage.setItem('userStreak', streak.toString());
  }, [streak]);
  
  // Save last completion date to localStorage
  useEffect(() => {
    localStorage.setItem('lastCompletionDate', lastCompletionDate);
  }, [lastCompletionDate]);
  
  // Apply filters to tasks
  const filteredTasks = useCallback(() => {
    return tasks.filter(task => {
      // Status filter (completed/active)
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
  
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
  
      // Date filter
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
  
        if (!task.deadline) return false;
  
        const taskDate = new Date(task.deadline);
        if (taskDate < today || taskDate >= tomorrow) return false;
      } else if (dateFilter === 'thisWeek') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
  
        if (!task.deadline) return false;
  
        const taskDate = new Date(task.deadline);
        if (taskDate < today || taskDate >= nextWeek) return false;
      } else if (dateFilter === 'overdue') {
        const now = new Date();
  
        if (!task.deadline) return false;
  
        const taskDate = new Date(task.deadline);
        if (taskDate >= now) return false;
      }
  
      // Time tracking filter
      if (timeTrackingFilter === 'inProgress' &&
          (!task.timeTracking || task.timeTracking.status !== 'in_progress')) return false;
      if (timeTrackingFilter === 'paused' &&
          (!task.timeTracking || task.timeTracking.status !== 'paused')) return false;
      if (timeTrackingFilter === 'notStarted' &&
          (!task.timeTracking || task.timeTracking.status !== 'not_started')) return false;
  
      return true;
    }).sort((a, b) => {
      if (sortOption === 'priority') {
        return (PRIORITY_ORDER[a.priority] || 1) - (PRIORITY_ORDER[b.priority] || 1);
      } else if (sortOption === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortOption === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOption === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOption === 'timeSpent') {
        const aTime = a.timeTracking?.totalTime || 0;
        const bTime = b.timeTracking?.totalTime || 0;
        return bTime - aTime; // Most time spent first
      } else {
        // Default sorting
        if (a.completed === b.completed) {
          if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
            return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          }
          return new Date(a.deadline) - new Date(b.deadline);
        }
        return a.completed ? 1 : -1;
      }
    });
  }, [tasks, filter, priorityFilter, dateFilter, timeTrackingFilter, sortOption]);
  
  // Add or update a task
  const addTask = useCallback(() => {
    if (!task.trim()) return;

    if (isEditing && editingIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editingIndex] = {
        ...updatedTasks[editingIndex],
        text: task,
        deadline: deadline,
        priority: priority || 'medium',
        lastModified: new Date().toISOString(),
      };
      setTasks(updatedTasks);
      setIsEditing(false);
      setEditingIndex(null);
    } else {
      const newTask = createTaskObject(task, deadline, priority);
      setTasks(prevTasks => [...prevTasks, newTask]);
    }

    setTask('');
    setDeadline('');
    setPriority('medium');
  }, [task, deadline, priority, isEditing, editingIndex, tasks]);
  
  // Toggle task completion
  const toggleComplete = useCallback((index) => {
    const filtered = filteredTasks();
    const taskToToggle = filtered[index];
    
    if (!taskToToggle) return;
    
    const originalIndex = tasks.findIndex(t => t.id === taskToToggle.id);
    
    if (originalIndex === -1) return;
    
    const updatedTasks = [...tasks];
    const task = updatedTasks[originalIndex];
    const isCompleting = !task.completed;

    task.completed = isCompleting;
    task.lastModified = new Date().toISOString();

    // Handle time tracking when completing a task
    if (isCompleting && task.timeTracking) {
      const now = new Date();

      // If the task is in progress, calculate the final time
      if (task.timeTracking.status === 'in_progress') {
        const startTime = new Date(task.timeTracking.currentSessionStart);
        const sessionDuration = now - startTime;
        task.timeTracking.totalTime = (task.timeTracking.totalTime || 0) + sessionDuration;
      }

      // Update time tracking status
      task.timeTracking.status = 'completed';
      task.timeTracking.completionTime = now.toISOString();
      
      // Create completion notification
      const notification = createStatusNotification(task, 'completed');
      setNotifications(prev => [notification, ...prev]);
      
      // Send browser notification
      sendBrowserNotification(notification.title, notification.message);
      
      // Handle streak calculation
      const today = getTodayString();
      
      if (lastCompletionDate) {
        const yesterdayString = getYesterdayString();
        
        if (lastCompletionDate === today) {
          // Already completed a task today, no streak change
        } else if (lastCompletionDate === yesterdayString) {
          // Completed a task yesterday, increase streak
          const newStreak = streak + 1;
          setStreak(newStreak);
          
          // Calculate points with streak bonus
          const pointsEarned = calculatePointsEarned(task, newStreak);
          
          // Create streak milestone notifications at certain thresholds
          if (isStreakMilestone(newStreak)) {
            const notification = createAchievementNotification('streak', newStreak);
            setNotifications(prev => [notification, ...prev]);
            
            // Send browser notification
            sendBrowserNotification(notification.title, notification.message);
          }
          
          // Update score
          setScore(prevScore => prevScore + pointsEarned);
          setLastScoreChange(pointsEarned);
          setShowScoreAnimation(true);
          
          // Hide animation after 2 seconds
          setTimeout(() => {
            setShowScoreAnimation(false);
          }, 2000);
        } else {
          // Streak broken, reset to 1
          setStreak(1);
          
          // Calculate points without streak bonus
          const pointsEarned = calculatePointsEarned(task, 1);
          
          // Update score
          setScore(prevScore => prevScore + pointsEarned);
          setLastScoreChange(pointsEarned);
          setShowScoreAnimation(true);
          
          // Hide animation after 2 seconds
          setTimeout(() => {
            setShowScoreAnimation(false);
          }, 2000);
        }
      } else {
        // First task ever completed
        setStreak(1);
        
        // Calculate points without streak bonus
        const pointsEarned = calculatePointsEarned(task, 1);
        
        // Update score
        setScore(prevScore => prevScore + pointsEarned);
        setLastScoreChange(pointsEarned);
        setShowScoreAnimation(true);
        
        // Hide animation after 2 seconds
        setTimeout(() => {
          setShowScoreAnimation(false);
        }, 2000);
      }
      
      // Update last completion date
      setLastCompletionDate(today);
    }
    // If uncompleting a task that was previously completed
    else if (!isCompleting && task.timeTracking && task.timeTracking.status === 'completed') {
      task.timeTracking.status = 'not_started';
      task.timeTracking.completionTime = null;
      
      // Deduct points if uncompleting a task (but don't go below 0)
      setScore(prevScore => Math.max(0, prevScore - 10));
      setLastScoreChange(-10);
      setShowScoreAnimation(true);
      
      // Hide animation after 2 seconds
      setTimeout(() => {
        setShowScoreAnimation(false);
      }, 2000);
    }

    setTasks(updatedTasks);
  }, [filteredTasks, tasks, lastCompletionDate, streak, setNotifications, setScore, setLastScoreChange, setShowScoreAnimation]);
  
  // Remove a task
  const removeTask = useCallback((index) => {
    const filtered = filteredTasks();
    const taskToRemove = filtered[index];
    
    if (taskToRemove) {
      // Create a notification for task deletion
      const notification = createStatusNotification(taskToRemove, 'deleted');
      setNotifications(prev => [notification, ...prev]);
      
      // Remove the task by ID from the original tasks array
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToRemove.id));
    }
  }, [filteredTasks, setNotifications]);
  
  // Edit a task
  const editTask = useCallback((index) => {
    const filtered = filteredTasks();
    const taskToEdit = filtered[index];
    
    if (taskToEdit) {
      // Find the index in the original tasks array
      const originalIndex = tasks.findIndex(task => task.id === taskToEdit.id);
      
      setTask(taskToEdit.text);
      setDeadline(taskToEdit.deadline || '');
      setPriority(taskToEdit.priority || 'medium');
      setIsEditing(true);
      setEditingIndex(originalIndex);
    }
  }, [filteredTasks, tasks]);
  
  // Start time tracking for a task
  const startTimeTracking = useCallback((index) => {
    const filtered = filteredTasks();
    const taskToTrack = filtered[index];
    
    if (!taskToTrack) return;
    
    const originalIndex = tasks.findIndex(task => task.id === taskToTrack.id);
    
    if (originalIndex === -1) return;
    
    const updatedTasks = [...tasks];
    const now = new Date().toISOString();

    updatedTasks[originalIndex].timeTracking = {
      status: 'in_progress',
      startTime: now,
      currentSessionStart: now,
      totalTime: 0,
      pauses: []
    };

    setTasks(updatedTasks);
  }, [filteredTasks, tasks]);
  
  // Pause time tracking for a task
  const pauseTimeTracking = useCallback((index) => {
    const filtered = filteredTasks();
    const taskToTrack = filtered[index];
    
    if (!taskToTrack) return;
    
    const originalIndex = tasks.findIndex(task => task.id === taskToTrack.id);
    
    if (originalIndex === -1) return;
    
    const updatedTasks = [...tasks];
    const task = updatedTasks[originalIndex];

    if (task.timeTracking && task.timeTracking.status === 'in_progress') {
      const now = new Date();
      const startTime = new Date(task.timeTracking.currentSessionStart);
      const sessionDuration = now - startTime;

      // Update total time
      const totalTime = (task.timeTracking.totalTime || 0) + sessionDuration;

      // Add this pause period
      const pausePeriod = {
        start: now.toISOString(),
        end: null
      };

      task.timeTracking = {
        ...task.timeTracking,
        status: 'paused',
        totalTime,
        pauses: [...(task.timeTracking.pauses || []), pausePeriod]
      };

      setTasks(updatedTasks);
    }
  }, [filteredTasks, tasks]);
  
  // Resume time tracking for a task
  const resumeTimeTracking = useCallback((index) => {
    const filtered = filteredTasks();
    const taskToTrack = filtered[index];
    
    if (!taskToTrack) return;
    
    const originalIndex = tasks.findIndex(task => task.id === taskToTrack.id);
    
    if (originalIndex === -1) return;
    
    const updatedTasks = [...tasks];
    const task = updatedTasks[originalIndex];

    if (task.timeTracking && task.timeTracking.status === 'paused') {
      const now = new Date().toISOString();

      // Update the end time of the last pause period
      if (task.timeTracking.pauses && task.timeTracking.pauses.length > 0) {
        const lastPauseIndex = task.timeTracking.pauses.length - 1;
        task.timeTracking.pauses[lastPauseIndex].end = now;
      }

      task.timeTracking = {
        ...task.timeTracking,
        status: 'in_progress',
        currentSessionStart: now
      };

      setTasks(updatedTasks);
    }
  }, [filteredTasks, tasks]);
  
  // Clear completed tasks
  const clearCompletedTasks = useCallback(() => {
    const completedTasks = tasks.filter(task => task.completed);
    
    if (completedTasks.length > 0) {
      // Create notification for clearing completed tasks
      const notification = {
        id: Date.now(),
        type: 'status',
        title: 'Tasks Cleared',
        message: `Cleared ${completedTasks.length} completed task${completedTasks.length > 1 ? 's' : ''}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev]);
      setTasks(tasks.filter(task => !task.completed));
    }
  }, [tasks, setNotifications]);
  
  return {
    tasks,
    setTasks,
    filteredTasks: filteredTasks(),
    filter,
    setFilter,
    priorityFilter,
    setPriorityFilter,
    dateFilter,
    setDateFilter,
    timeTrackingFilter,
    setTimeTrackingFilter,
    sortOption,
    setSortOption,
    task,
    setTask,
    deadline,
    setDeadline,
    priority,
    setPriority,
    isEditing,
    setIsEditing,
    editingIndex,
    setEditingIndex,
    streak,
    addTask,
    toggleComplete,
    removeTask,
    editTask,
    startTimeTracking,
    pauseTimeTracking,
    resumeTimeTracking,
    clearCompletedTasks
  };
};

export default useTasks;
