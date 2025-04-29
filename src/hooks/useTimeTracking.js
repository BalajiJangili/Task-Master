import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for time tracking
 */
const useTimeTracking = (tasks) => {
  const [elapsedTimes, setElapsedTimes] = useState({});
  const timerRef = useRef(null);
  
  // Update elapsed times for tasks in progress
  const updateElapsedTimes = () => {
    const updatedElapsedTimes = {};
    let needsUpdate = false;

    tasks.forEach(task => {
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

    if (needsUpdate) {
      setElapsedTimes(updatedElapsedTimes);
    }
  };
  
  // Set up timer to update elapsed times
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Only set up timer if there are tasks
    if (tasks.length > 0) {
      // Set up a timer to update elapsed times every second
      timerRef.current = setInterval(updateElapsedTimes, 1000);
    }
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [tasks]);
  
  return { elapsedTimes, updateElapsedTimes };
};

export default useTimeTracking;
