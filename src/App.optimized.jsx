import { useState, useEffect, useCallback } from 'react';
import './App.css';
import './task-list-header.css';
import VoiceAssistant from './VoiceAssistant';
import Lightmode from './Lightmode';
import TaskAutomation from './TaskAutomation';
import { initTilt3D, updateTilt3D } from './Tilt3D';
import Cube3D from './Cube3D';
import ScoreDisplay from './ScoreDisplay';
import Notifications from './Notifications';

// Components
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';

// Hooks
import useTasks from './hooks/useTasks';
import useTimeTracking from './hooks/useTimeTracking';
import useNotifications from './hooks/useNotifications';
import useScore from './hooks/useScore';

// Utils
import { getTaskIcon } from './utils/taskIcons';
import { createTaskObject } from './utils/taskUtils';

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });
  
  // Score management
  const { 
    score, 
    setScore, 
    showScoreAnimation, 
    setShowScoreAnimation, 
    lastScoreChange, 
    setLastScoreChange 
  } = useScore();
  
  // Notifications management
  const { 
    notifications, 
    setNotifications, 
    dismissNotification, 
    dismissAllNotifications 
  } = useNotifications([]);
  
  // Task management
  const { 
    tasks, 
    setTasks, 
    filteredTasks, 
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
    streak,
    addTask, 
    toggleComplete, 
    removeTask, 
    editTask, 
    startTimeTracking, 
    pauseTimeTracking, 
    resumeTimeTracking, 
    clearCompletedTasks 
  } = useTasks(setNotifications, setScore, setLastScoreChange, setShowScoreAnimation);
  
  // Time tracking
  const { elapsedTimes } = useTimeTracking(tasks);
  
  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Initialize 3D tilt effect after component mounts
  useEffect(() => {
    // Wait for DOM to be fully rendered
    setTimeout(() => {
      initTilt3D();
    }, 500);
  }, []);
  
  // Update 3D tilt effect when tasks change
  useEffect(() => {
    // Wait for DOM to update
    setTimeout(() => {
      updateTilt3D();
    }, 100);
  }, [tasks]);
  
  // Handle key press for adding tasks
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask();
    }
  }, [addTask]);
  
  // Voice assistant handlers
  const handleVoiceAddTask = useCallback(({ text, deadline, priority }) => {
    const newTask = createTaskObject(text, deadline, priority);
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, [setTasks]);
  
  const handleVoiceToggleTask = useCallback((taskText) => {
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
  }, [tasks, filteredTasks, toggleComplete]);
  
  const handleVoiceDeleteTask = useCallback((taskText) => {
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
  }, [tasks, filteredTasks, removeTask]);
  
  const handleVoiceEditTask = useCallback((taskIdentifier, newText) => {
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
  }, [tasks, setTasks]);
  
  const handleVoiceSetPriority = useCallback((taskText, priority) => {
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
  }, [tasks, setTasks]);
  
  const handleVoiceSetDeadline = useCallback((taskText, deadline) => {
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
  }, [tasks, setTasks]);
  
  const handleVoiceStartTimeTracking = useCallback((taskText) => {
    const task = tasks.find(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (task) {
      const filteredIndex = filteredTasks.findIndex(t => t.id === task.id);
      if (filteredIndex !== -1) {
        startTimeTracking(filteredIndex);
      }
    }
  }, [tasks, filteredTasks, startTimeTracking]);
  
  const handleVoicePauseTimeTracking = useCallback((taskText) => {
    const task = tasks.find(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (task) {
      const filteredIndex = filteredTasks.findIndex(t => t.id === task.id);
      if (filteredIndex !== -1) {
        pauseTimeTracking(filteredIndex);
      }
    }
  }, [tasks, filteredTasks, pauseTimeTracking]);
  
  const handleVoiceResumeTimeTracking = useCallback((taskText) => {
    const task = tasks.find(t =>
      t.text.toLowerCase().includes(taskText.toLowerCase())
    );
    if (task) {
      const filteredIndex = filteredTasks.findIndex(t => t.id === task.id);
      if (filteredIndex !== -1) {
        resumeTimeTracking(filteredIndex);
      }
    }
  }, [tasks, filteredTasks, resumeTimeTracking]);
  
  const handleVoiceSortTasks = useCallback((sortOption) => {
    setSortOption(sortOption);
  }, [setSortOption]);
  
  const handleVoiceFilterByPriority = useCallback((priority) => {
    setPriorityFilter(priority);
  }, [setPriorityFilter]);
  
  const handleVoiceFilterByDate = useCallback((dateFilter) => {
    setDateFilter(dateFilter);
  }, [setDateFilter]);
  
  const handleVoiceFilterByTimeTracking = useCallback((timeTrackingFilter) => {
    setTimeTrackingFilter(timeTrackingFilter);
  }, [setTimeTrackingFilter]);
  
  const handleVoiceClearFilters = useCallback(() => {
    setFilter('all');
    setPriorityFilter('all');
    setDateFilter('all');
    setTimeTrackingFilter('all');
    setSortOption('default');
  }, [setFilter, setPriorityFilter, setDateFilter, setTimeTrackingFilter, setSortOption]);
  
  const handleAutomatedTask = useCallback(({ text, deadline, automated }) => {
    const newTask = {
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
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, [setTasks]);
  
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

        <TaskForm 
          task={task}
          setTask={setTask}
          deadline={deadline}
          setDeadline={setDeadline}
          priority={priority}
          setPriority={setPriority}
          isEditing={isEditing}
          addTask={addTask}
          handleKeyPress={handleKeyPress}
        />

        <TaskList 
          tasks={filteredTasks}
          elapsedTimes={elapsedTimes}
          toggleComplete={toggleComplete}
          editTask={editTask}
          removeTask={removeTask}
          startTimeTracking={startTimeTracking}
          pauseTimeTracking={pauseTimeTracking}
          resumeTimeTracking={resumeTimeTracking}
          clearCompletedTasks={clearCompletedTasks}
          getTaskIcon={getTaskIcon}
        />

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
