import React, { memo } from 'react';
import TaskItem from './TaskItem';

const TaskList = memo(({ 
  tasks, 
  elapsedTimes,
  toggleComplete, 
  editTask, 
  removeTask,
  startTimeTracking,
  pauseTimeTracking,
  resumeTimeTracking,
  clearCompletedTasks,
  getTaskIcon
}) => {
  const hasCompletedTasks = tasks.some(task => task.completed);
  
  return (
    <>
      <div className="task-list-header">
        <h2>Your Tasks</h2>
        {hasCompletedTasks && (
          <button 
            onClick={clearCompletedTasks} 
            className="clear-completed-btn"
          >
            🧹 Clear Completed
          </button>
        )}
      </div>
      
      <ul className="task-list">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            elapsedTime={elapsedTimes[task.id]}
            toggleComplete={toggleComplete}
            editTask={editTask}
            removeTask={removeTask}
            startTimeTracking={startTimeTracking}
            pauseTimeTracking={pauseTimeTracking}
            resumeTimeTracking={resumeTimeTracking}
            getTaskIcon={getTaskIcon}
          />
        ))}
      </ul>
      
      {tasks.length === 0 && (
        <div className="empty-state">
          <p>🚀 Your task list is empty. Time to add your first task!</p>
        </div>
      )}
    </>
  );
});

export default TaskList;
