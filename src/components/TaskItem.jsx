import React, { memo } from 'react';
import { formatTime, getTimeRemaining, isUrgent, checkDeadlineReached } from '../utils/taskUtils';

const TaskItem = memo(({ 
  task, 
  index, 
  elapsedTime,
  toggleComplete, 
  editTask, 
  removeTask,
  startTimeTracking,
  pauseTimeTracking,
  resumeTimeTracking,
  getTaskIcon
}) => {
  return (
    <li
      key={task.id}
      className={`task-item ${task.completed ? "completed" : ""} ${
        task.deadline && new Date(task.deadline) < new Date() ? "overdue" : ""
      } ${isUrgent(task.deadline) ? "urgent" : ""}
      ${task.timeTracking && task.timeTracking.status === 'in_progress' ? "in-progress" : ""}
      ${task.timeTracking && task.timeTracking.status === 'paused' ? "paused" : ""}
      ${checkDeadlineReached(task) ? "deadline-reached" : ""}
      priority-${task.priority || 'medium'}-border`}
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
                {formatTime(elapsedTime || task.timeTracking.totalTime)}
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
  );
});

export default TaskItem;
