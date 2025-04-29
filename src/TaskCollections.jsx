import React from 'react';

const TaskCollections = ({ tasks }) => {
  // Helper function to get today's date at midnight for comparison
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Helper function to get tomorrow's date at midnight
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  // Organize tasks into collections
  const organizeTaskCollections = () => {
    const today = getToday();
    const tomorrow = getTomorrow();
    const collections = {
      urgent: [],
      dueToday: [],
      dueTomorrow: [],
      upcoming: [],
      highPriority: [],
      noDueDate: []
    };

    tasks.forEach(task => {
      if (task.completed) return; // Skip completed tasks

      const deadlineDate = task.deadline ? new Date(task.deadline) : null;
      
      // Check for high priority tasks
      if (task.priority === 'high') {
        collections.highPriority.push(task);
      }

      // Organize by due date
      if (!deadlineDate) {
        collections.noDueDate.push(task);
      } else {
        deadlineDate.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today) {
          collections.urgent.push(task);
        } else if (deadlineDate.getTime() === today.getTime()) {
          collections.dueToday.push(task);
        } else if (deadlineDate.getTime() === tomorrow.getTime()) {
          collections.dueTomorrow.push(task);
        } else {
          collections.upcoming.push(task);
        }
      }
    });

    return collections;
  };

  const collections = organizeTaskCollections();

  const renderTaskList = (tasks) => {
    return tasks.map(task => (
      <div key={task.id} className="collection-task-item">
        <span className={`priority-dot priority-${task.priority}`}></span>
        <span className="task-text">{task.text}</span>
        {task.deadline && (
          <span className="task-deadline">
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
    ));
  };

  return (
    <div className="task-collections">
      {collections.urgent.length > 0 && (
        <div className="collection urgent-collection">
          <h3>⚠️ Urgent</h3>
          {renderTaskList(collections.urgent)}
        </div>
      )}

      {collections.highPriority.length > 0 && (
        <div className="collection priority-collection">
          <h3>🔥 High Priority</h3>
          {renderTaskList(collections.highPriority)}
        </div>
      )}

      {collections.dueToday.length > 0 && (
        <div className="collection today-collection">
          <h3>📅 Due Today</h3>
          {renderTaskList(collections.dueToday)}
        </div>
      )}

      {collections.dueTomorrow.length > 0 && (
        <div className="collection tomorrow-collection">
          <h3>⏰ Due Tomorrow</h3>
          {renderTaskList(collections.dueTomorrow)}
        </div>
      )}

      {collections.upcoming.length > 0 && (
        <div className="collection upcoming-collection">
          <h3>📆 Upcoming</h3>
          {renderTaskList(collections.upcoming)}
        </div>
      )}

      {collections.noDueDate.length > 0 && (
        <div className="collection no-date-collection">
          <h3>📌 No Due Date</h3>
          {renderTaskList(collections.noDueDate)}
        </div>
      )}
    </div>
  );
};

export default TaskCollections;