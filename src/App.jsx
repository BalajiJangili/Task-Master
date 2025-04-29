import { useState, useEffect, useRef } from 'react';
import './App.css';
import './task-list-header.css';
import VoiceAssistant from './VoiceAssistant';
import Lightmode from './Lightmode';
import TaskAutomation from './TaskAutomation';
import TaskFilters from './components/TaskFilters';
import { initTilt3D, updateTilt3D } from './Tilt3D';
import Cube3D from './Cube3D';
import ScoreDisplay from './ScoreDisplay';
import Notifications from './Notifications';
import {
  checkDeadlineNotifications,
  createStatusNotification,
  createAchievementNotification,
  sendBrowserNotification
} from './NotificationManager';


function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [timeTrackingFilter, setTimeTrackingFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [elapsedTimes, setElapsedTimes] = useState({});
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem('userScore');
    return savedScore ? parseInt(savedScore) : 0;
  });
  const [streak, setStreak] = useState(() => {
    const savedStreak = localStorage.getItem('userStreak');
    return savedStreak ? parseInt(savedStreak) : 0;
  });
  const [lastCompletionDate, setLastCompletionDate] = useState(() => {
    const savedDate = localStorage.getItem('lastCompletionDate');
    return savedDate || '';
  });
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState(0);
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });
  const timerRef = useRef(null);
  const notificationCheckRef = useRef(null);
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('userScore', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('userStreak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('lastCompletionDate', lastCompletionDate);
  }, [lastCompletionDate]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Initialize 3D tilt effect after component mounts
  useEffect(() => {
    // Wait for DOM to be fully rendered
    setTimeout(() => {
      initTilt3D();
    }, 500);
  }, []);

  // Listen for level up events
  useEffect(() => {
    const handleLevelUp = (event) => {
      const { level } = event.detail;

      // Create level up notification
      const notification = createAchievementNotification('level_up', level);
      setNotifications(prev => [notification, ...prev]);

      // Send browser notification
      sendBrowserNotification(notification.title, notification.message);
    };

    window.addEventListener('levelUp', handleLevelUp);

    return () => {
      window.removeEventListener('levelUp', handleLevelUp);
    };
  }, []);

  // Update 3D tilt effect when tasks change
  useEffect(() => {
    // Wait for DOM to update
    setTimeout(() => {
      updateTilt3D();
    }, 100);
  }, [tasks]);

  // Check for notifications
  useEffect(() => {
    // Check for deadline notifications
    const checkNotifications = () => {
      // Check for deadline notifications
      const { notifications: deadlineNotifications, updatedTasks: tasksWithDeadlineNotifications } =
        checkDeadlineNotifications([...tasks]);

      // Update tasks with notification flags
      if (deadlineNotifications.length > 0) {
        setTasks(tasksWithDeadlineNotifications);
      }

      // Add new notifications
      if (deadlineNotifications.length > 0) {
        // Add to notifications state
        setNotifications(prev => [...deadlineNotifications, ...prev]);

        // Send browser notifications
        deadlineNotifications.forEach(notification => {
          sendBrowserNotification(notification.title, notification.message);
        });
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

  // Function to trigger vibration
  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      // Vibrate pattern: vibrate for 300ms, pause for 100ms, vibrate for 500ms
      navigator.vibrate([300, 100, 500]);
    }
  };

  // Function to check if a task deadline has just been reached
  const checkDeadlineReached = (task) => {
    if (!task.deadline || task.completed) return false;

    const now = new Date();
    const deadlineDate = new Date(task.deadline);

    // Check if the deadline is within the last minute
    const timeDiff = now - deadlineDate;
    return timeDiff >= 0 && timeDiff < 60000; // Within the last minute
  };

  // Timer effect for updating elapsed times and checking deadlines
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set up a timer to update elapsed times every second
    timerRef.current = setInterval(() => {
      const updatedElapsedTimes = {};
      let needsUpdate = false;
      let deadlineReached = false;

      tasks.forEach((task) => {
        // Check for reached deadlines
        if (checkDeadlineReached(task)) {
          deadlineReached = true;
        }

        // Update time tracking
        if (task.timeTracking && task.timeTracking.status === 'in_progress') {
          const startTime = new Date(task.timeTracking.currentSessionStart).getTime();
          const now = new Date().getTime();
          const previousTime = task.timeTracking.totalTime || 0;
          const currentElapsed = now - startTime;
          updatedElapsedTimes[task.id] = previousTime + currentElapsed;
          needsUpdate = true;
        } else if (task.timeTracking && task.timeTracking.totalTime) {
          updatedElapsedTimes[task.id] = task.timeTracking.totalTime;
        }
      });

      // Trigger vibration if a deadline was reached
      if (deadlineReached) {
        triggerVibration();
      }

      if (needsUpdate) {
        setElapsedTimes(updatedElapsedTimes);
      }
    }, 1000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [tasks]);

  const getTimeRemaining = (deadline) => {
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

  // Generate task icon based on task properties
  const getTaskIcon = (task) => {
    // Define specific task-related icons
    const specificIcons = {
      // Work related
      meeting: { icon: '📅', class: 'task-icon-meeting' }, // calendar
      email: { icon: '📧', class: 'task-icon-email' }, // envelope
      call: { icon: '📞', class: 'task-icon-call' }, // telephone
      report: { icon: '📊', class: 'task-icon-work' }, // chart
      presentation: { icon: '📄', class: 'task-icon-work' }, // document
      project: { icon: '💼', class: 'task-icon-work' }, // briefcase
      deadline: { icon: '⏰', class: 'task-icon-work' }, // alarm clock
      client: { icon: '👤', class: 'task-icon-work' }, // person
      interview: { icon: '💬', class: 'task-icon-work' }, // speech bubble
      review: { icon: '🔍', class: 'task-icon-work' }, // magnifying glass

      // Home related
      clean: { icon: '🧹', class: 'task-icon-home' }, // broom
      laundry: { icon: '🧺', class: 'task-icon-home' }, // basket
      grocery: { icon: '🛒', class: 'task-icon-home' }, // shopping cart
      cook: { icon: '🍳', class: 'task-icon-home' }, // cooking
      dishes: { icon: '🍽️', class: 'task-icon-home' }, // fork and knife
      repair: { icon: '🔧', class: 'task-icon-home' }, // wrench
      garden: { icon: '🌱', class: 'task-icon-home' }, // plant
      trash: { icon: '🗑️', class: 'task-icon-home' }, // trash
      pet: { icon: '🐶', class: 'task-icon-home' }, // dog
      furniture: { icon: '🛋️', class: 'task-icon-home' }, // bed

      // Health related
      exercise: { icon: '🏃‍♂️', class: 'task-icon-exercise' }, // running
      yoga: { icon: '🧘‍♀️', class: 'task-icon-health' }, // yoga
      medicine: { icon: '💊', class: 'task-icon-health' }, // pill
      doctor: { icon: '🏀', class: 'task-icon-health' }, // stethoscope
      sleep: { icon: '💤', class: 'task-icon-health' }, // zzz
      water: { icon: '💧', class: 'task-icon-health' }, // droplet
      meal: { icon: '🥗', class: 'task-icon-health' }, // salad
      vitamin: { icon: '🍎', class: 'task-icon-health' }, // apple
      dentist: { icon: '🦷', class: 'task-icon-health' }, // tooth
      therapy: { icon: '🧠', class: 'task-icon-health' }, // brain

      // Education related
      study: { icon: '📚', class: 'task-icon-study' }, // books
      read: { icon: '📖', class: 'task-icon-education' }, // book
      write: { icon: '✏️', class: 'task-icon-education' }, // pencil
      homework: { icon: '📝', class: 'task-icon-education' }, // memo
      exam: { icon: '🎓', class: 'task-icon-education' }, // graduation cap
      research: { icon: '🔬', class: 'task-icon-education' }, // microscope
      language: { icon: '🌐', class: 'task-icon-education' }, // globe
      math: { icon: '🧮', class: 'task-icon-education' }, // abacus
      science: { icon: '🧪', class: 'task-icon-education' }, // test tube
      history: { icon: '📜', class: 'task-icon-education' }, // scroll

      // Leisure related
      game: { icon: '🎮', class: 'task-icon-leisure' }, // game controller
      movie: { icon: '🎬', class: 'task-icon-leisure' }, // clapper board
      music: { icon: '🎶', class: 'task-icon-leisure' }, // music notes
      art: { icon: '🎨', class: 'task-icon-leisure' }, // palette
      travel: { icon: '✈️', class: 'task-icon-leisure' }, // airplane
      hike: { icon: '🚶‍♂️', class: 'task-icon-leisure' }, // person walking
      party: { icon: '🎉', class: 'task-icon-leisure' }, // party popper
      restaurant: { icon: '🍴', class: 'task-icon-leisure' }, // fork and knife
      concert: { icon: '🎷', class: 'task-icon-leisure' }, // saxophone
      book: { icon: '📕', class: 'task-icon-leisure' }, // closed book
    };

    // Fallback icon categories
    const workIcons = ['💼', '📊', '📈', '🖥️', '📱', '📝', '📑', '📋', '📁', '📂'];
    const homeIcons = ['🏠', '🧹', '🧺', '🛒', '🍽️', '🔨', '🛴', '🧰', '🧼', '🧴'];
    const healthIcons = ['🏃‍♂️', '🧘‍♀️', '💊', '🥗', '🥦', '💉', '🩺', '🧠', '❤️', '💪'];
    const educationIcons = ['📚', '🎓', '✏️', '📖', '🔬', '🧪', '🧮', '🔍', '📔', '🎯'];
    const leisureIcons = ['🎮', '🎬', '🎨', '🎭', '🎧', '📺', '🎸', '🎪', '🏖️', '🎠'];

    // Get task text
    const taskText = task.text || '';
    const taskId = task.id || '';
    const text = taskText.toLowerCase();

    // First try to match specific keywords for precise icons
    for (const [keyword, iconData] of Object.entries(specificIcons)) {
      if (text.includes(keyword)) {
        return { icon: iconData.icon, className: iconData.class };
      }
    }

    // If no specific match, determine category based on broader keywords
    let iconSet = workIcons; // default
    let categoryClass = 'task-icon-work';

    if (text.match(/home|clean|cook|grocery|laundry|house|room|kitchen|bathroom|garden|dishes|furniture|decorate|organize/)) {
      iconSet = homeIcons;
      categoryClass = 'task-icon-home';
    } else if (text.match(/health|exercise|gym|workout|doctor|medicine|yoga|run|jog|diet|fitness|wellness|nutrition|sleep|meditate/)) {
      iconSet = healthIcons;
      categoryClass = 'task-icon-health';
    } else if (text.match(/study|learn|read|book|course|class|school|college|university|homework|assignment|exam|test|research|paper|essay/)) {
      iconSet = educationIcons;
      categoryClass = 'task-icon-education';
    } else if (text.match(/game|movie|play|watch|listen|music|hobby|fun|relax|entertainment|concert|show|theater|party|festival|travel|vacation/)) {
      iconSet = leisureIcons;
      categoryClass = 'task-icon-leisure';
    }

    // Use task properties to select a consistent icon from the category
    const seed = taskText.length + taskId.length;
    const iconIndex = seed % iconSet.length;
    return { icon: iconSet[iconIndex], className: categoryClass };
  };

  const isUrgent = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000;
  };

  // Format milliseconds to a readable time format (HH:MM:SS)
  const formatTime = (milliseconds) => {
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

  // Start time tracking for a task
  const startTimeTracking = (index) => {
    // Get the task from the filtered tasks
    const taskToTrack = filteredTasks[index];

    if (!taskToTrack) return;

    // Find the index in the original tasks array
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
  };

  // Pause time tracking for a task
  const pauseTimeTracking = (index) => {
    // Get the task from the filtered tasks
    const taskToTrack = filteredTasks[index];

    if (!taskToTrack) return;

    // Find the index in the original tasks array
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
  };

  // Resume time tracking for a task
  const resumeTimeTracking = (index) => {
    // Get the task from the filtered tasks
    const taskToTrack = filteredTasks[index];

    if (!taskToTrack) return;

    // Find the index in the original tasks array
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
  };

  const addTask = () => {
    if (!task.trim()) return;

    if (isEditing && editingIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editingIndex] = {
        ...updatedTasks[editingIndex],
        text: task,
        deadline: deadline,
        priority: priority || 'medium', // Add default value,
        lastModified: new Date().toISOString(),
      };
      setTasks(updatedTasks);
      setIsEditing(false);
      setEditingIndex(null);
    } else {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: task,
          completed: false,
          deadline: deadline,
          priority: priority || 'medium', // Add default value,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          timeTracking: {
            status: 'not_started',
            startTime: null,
            completionTime: null,
            totalTime: 0,
            pauses: []
          }
        }
      ]);
    }

    setTask('');
    setDeadline('');
    setPriority('medium');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask();
    }
  };

  // Notification handlers
  const dismissNotification = (id) => {
    // Remove the notification with the specified id
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const dismissAllNotifications = () => {
    // Clear all notifications
    setNotifications([]);
  };

  const toggleComplete = (index) => {
    // Get the task from the filtered tasks
    const taskToToggle = filteredTasks[index];

    if (!taskToToggle) return;

    // Find the index in the original tasks array
    const originalIndex = tasks.findIndex(task => task.id === taskToToggle.id);

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

      // Award points based on task priority and deadline
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

      // Handle streak calculation
      const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format

      if (lastCompletionDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        if (lastCompletionDate === today) {
          // Already completed a task today, no streak change
        } else if (lastCompletionDate === yesterdayString) {
          // Completed a task yesterday, increase streak
          const newStreak = streak + 1;
          setStreak(newStreak);

          // Bonus points for streak
          const streakBonus = Math.min(newStreak * 2, 50); // Cap at 50 bonus points
          pointsEarned += streakBonus;

          // Create streak milestone notifications at certain thresholds
          if (newStreak === 3 || newStreak === 7 || newStreak === 14 ||
              newStreak === 30 || newStreak === 60 || newStreak === 100 ||
              newStreak % 100 === 0) {
            const notification = createAchievementNotification('streak', newStreak);
            setNotifications(prev => [notification, ...prev]);

            // Send browser notification
            sendBrowserNotification(notification.title, notification.message);
          }
        } else {
          // Streak broken, reset to 1
          setStreak(1);
        }
      } else {
        // First task ever completed
        setStreak(1);
      }

      // Update last completion date
      setLastCompletionDate(today);

      // Update score
      setScore(prevScore => prevScore + pointsEarned);
      setLastScoreChange(pointsEarned);
      setShowScoreAnimation(true);

      // Hide animation after 2 seconds
      setTimeout(() => {
        setShowScoreAnimation(false);
      }, 2000);
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
  };

  const removeTask = (index) => {
    // Get the task from the filtered tasks
    const taskToRemove = filteredTasks[index];

    if (taskToRemove) {
      // Remove the task by ID from the original tasks array
      setTasks(tasks.filter(task => task.id !== taskToRemove.id));

      // Create a notification for task deletion
      const notification = createStatusNotification(taskToRemove, 'deleted');
      setNotifications(prev => [notification, ...prev]);
    }
  };

  const editTask = (index) => {
    // Get the task from the filtered tasks
    const taskToEdit = filteredTasks[index];

    if (taskToEdit) {
      // Find the index in the original tasks array
      const originalIndex = tasks.findIndex(task => task.id === taskToEdit.id);

      setTask(taskToEdit.text);
      setDeadline(taskToEdit.deadline || '');
      setPriority(taskToEdit.priority || 'medium');
      setIsEditing(true);
      setEditingIndex(originalIndex);
    }
  };

  // Apply multiple filters to tasks
  const filteredTasks = tasks.filter(task => {
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
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
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
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return a.completed ? 1 : -1;
    }
  });
  const handleVoiceAddTask = ({ text, deadline, priority }) => {
    setTasks([
      ...tasks,
      {
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
      }
    ]);
  };

  const handleVoiceToggleTask = (taskText) => {
    const task = tasks.find(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (task) {
      // Find the index in the filtered tasks array
      const filteredIndex = filteredTasks.findIndex(t => t.id === task.id);
      if (filteredIndex !== -1) {
        toggleComplete(filteredIndex);
      }
    }
  };

  const handleVoiceDeleteTask = (taskText) => {
    const task = tasks.find(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (task) {
      // Find the index in the filtered tasks array
      const filteredIndex = filteredTasks.findIndex(t => t.id === task.id);
      if (filteredIndex !== -1) {
        removeTask(filteredIndex);
      }
    }
  };

  const handleVoiceEditTask = (taskIdentifier, newText) => {
    const taskIndex = tasks.findIndex(t =>
      t.text.toLowerCase().includes(taskIdentifier.toLowerCase())
    );
    if (taskIndex !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        text: newText,
        lastModified: new Date().toISOString()
      };
      setTasks(updatedTasks);
    }
  };

  const handleVoiceSetPriority = (taskText, priority) => {
    const taskIndex = tasks.findIndex(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (taskIndex !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        priority,
        lastModified: new Date().toISOString()
      };
      setTasks(updatedTasks);
    }
  };

  const handleVoiceSetDeadline = (taskText, deadline) => {
    const taskIndex = tasks.findIndex(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (taskIndex !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        deadline,
        lastModified: new Date().toISOString()
      };
      setTasks(updatedTasks);
    }
  };

  const handleVoiceStartTimeTracking = (taskText) => {
    const taskIndex = tasks.findIndex(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (taskIndex !== -1) {
      startTimeTracking(taskIndex);
    }
  };

  const handleVoicePauseTimeTracking = (taskText) => {
    const taskIndex = tasks.findIndex(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (taskIndex !== -1) {
      pauseTimeTracking(taskIndex);
    }
  };

  const handleVoiceResumeTimeTracking = (taskText) => {
    const taskIndex = tasks.findIndex(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (taskIndex !== -1) {
      resumeTimeTracking(taskIndex);
    }
  };

  const handleVoiceSortTasks = (sortOption) => {
    setSortOption(sortOption);
  };

  const handleVoiceFilterByPriority = (priority) => {
    setPriorityFilter(priority);
  };

  const handleVoiceFilterByDate = (dateFilter) => {
    setDateFilter(dateFilter);
  };

  const handleVoiceFilterByTimeTracking = (timeTrackingFilter) => {
    setTimeTrackingFilter(timeTrackingFilter);
  };

  const handleVoiceClearFilters = () => {
    setFilter('all');
    setPriorityFilter('all');
    setDateFilter('all');
    setTimeTrackingFilter('all');
    setSortOption('default');
  };

  const handleAutomatedTask = ({ text, deadline, automated }) => {
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text,
        completed: false,
        deadline,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        automated: automated || false,
        priority: 'medium',
        timeTracking: {
          status: 'not_started',
          startTime: null,
          completionTime: null,
          totalTime: 0,
          pauses: []
        }
      }
    ]);
  };

  return (
    <div>
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      <ScoreDisplay
        score={score}
        streak={streak}
        showAnimation={showScoreAnimation}
        pointsChange={lastScoreChange}
      />
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
        <Notifications
          notifications={notifications}
          onDismiss={dismissNotification}
          onDismissAll={dismissAllNotifications}
        />
      </div>
      <Cube3D size={60} color="#FF5722" position="top-right" />
      <Cube3D size={40} color="#03A9F4" position="bottom-left" />
      <div className="app">
      <Lightmode theme={theme} onThemeChange={setTheme} />

      <h1>🚀 Task Master</h1>
      <TaskAutomation onAddTask={handleAutomatedTask} />

      <TaskFilters
        filter={filter}
        setFilter={setFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        timeTrackingFilter={timeTrackingFilter}
        setTimeTrackingFilter={setTimeTrackingFilter}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />

      <div className="input-container">
        <div className="input-group">
          <input
            type="text"
            placeholder={isEditing ? "✏️ Edit task..." : "🚀 Add new task..."}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
           <select
          className="priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
        </div>
        <button onClick={addTask} className="add-btn">
          {isEditing ? "📝 Update Task" : "🚀 Add Task"}
        </button>
      </div>

      <div className="task-list-header">
        <h2>Your Tasks</h2>
        {tasks.some(task => task.completed) && (
          <button
            onClick={() => {
              const completedTasks = tasks.filter(task => task.completed);
              setTasks(tasks.filter(task => !task.completed));

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
            }}
            className="clear-completed-btn"
          >
            🧹 Clear Completed
          </button>
        )}
      </div>

      <ul className="task-list">
        {filteredTasks.map((task, index) => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? "completed" : ""} ${
              task.deadline && new Date(task.deadline) < new Date() ? "overdue" : ""
            } ${isUrgent(task.deadline) ? "urgent" : ""}
            ${task.timeTracking && task.timeTracking.status === 'in_progress' ? "in-progress" : ""}
            ${task.timeTracking && task.timeTracking.status === 'paused' ? "paused" : ""}
            ${checkDeadlineReached(task) ? "deadline-reached" : ""}
            priority-${task.priority}||'medium'}-border`}
            data-index={index}
          >
            {/* Task Header Section */}
            <div className="task-header">
              <div className="task-header-left">
                <div className="task-icon-container">
                  {(() => {
                    const iconData = getTaskIcon(task);
                    return (
                      <div className={`task-icon ${iconData.className}`}>
                        {iconData.icon}
                      </div>
                    );
                  })()}
                </div>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(index)}
                  className="task-checkbox"
                />
                <span className="task-text">{task.text}</span>
              </div>
              <div className="task-header-right">
                {task.priority && (
                  <span className={`priority-indicator priority-${task.priority}`}>
                    {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Task Details Section */}
            <div className="task-details-container">
              <div className="task-info-section">
                {task.deadline && (
                  <div className="task-info-item">
                    <span className="info-label">Deadline:</span>
                    <span className={`deadline-text ${isUrgent(task.deadline) ? "urgent" : ""}`}>
                      {getTimeRemaining(task.deadline)}
                    </span>
                  </div>
                )}
                {task.timeTracking && (
                  <div className="task-info-item">
                    <span className="info-label">Time:</span>
                    <span className="time-tracking-display">
                      {formatTime(elapsedTimes[task.id] || task.timeTracking.totalTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Task Actions Section */}
            <div className="task-actions">
              <div className="task-actions-row">
                {/* Time Tracking Button */}
                {!task.completed && (
                  <>
                    {(!task.timeTracking || task.timeTracking.status === 'not_started') && (
                      <button onClick={() => startTimeTracking(index)} className="action-btn start-btn">
                        ▶️ Start
                      </button>
                    )}
                    {task.timeTracking && task.timeTracking.status === 'in_progress' && (
                      <button onClick={() => pauseTimeTracking(index)} className="action-btn pause-btn">
                        ⏸️ Pause
                      </button>
                    )}
                    {task.timeTracking && task.timeTracking.status === 'paused' && (
                      <button onClick={() => resumeTimeTracking(index)} className="action-btn resume-btn">
                        ▶️ Resume
                      </button>
                    )}
                  </>
                )}

                {/* Edit Button */}
                <button onClick={() => editTask(index)} className="action-btn edit-btn">
                  ✏️ Edit
                </button>

                {/* Delete Button */}
                <button onClick={() => removeTask(index)} className="action-btn delete-btn">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <div className="empty-state">
          <p>🚀 Your task list is empty. Time to add your first task!</p>
        </div>
      )}
      <VoiceAssistant
        onAddTask={handleVoiceAddTask}
        onToggleTask={handleVoiceToggleTask}
        onDeleteTask={handleVoiceDeleteTask}
        onFilterChange={setFilter}
        onEditTask={handleVoiceEditTask}
        onSetPriority={handleVoiceSetPriority}
        onSetDeadline={handleVoiceSetDeadline}
        onStartTimeTracking={handleVoiceStartTimeTracking}
        onPauseTimeTracking={handleVoicePauseTimeTracking}
        onResumeTimeTracking={handleVoiceResumeTimeTracking}
        onSortTasks={handleVoiceSortTasks}
        onFilterByPriority={handleVoiceFilterByPriority}
        onFilterByDate={handleVoiceFilterByDate}
        onFilterByTimeTracking={handleVoiceFilterByTimeTracking}
        onClearFilters={handleVoiceClearFilters}
      />

    </div>
    </div>
  );
}

export default App;