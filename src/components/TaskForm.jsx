import React, { memo } from 'react';

const TaskForm = memo(({
  task,
  setTask,
  deadline,
  setDeadline,
  priority,
  setPriority,
  isEditing,
  addTask,
  handleKeyPress
}) => {
  return (
    <div className="input-container">
      <div className="form-header">
        <h3>{isEditing ? "✏️ Edit Task" : "🚀 Add New Task"}</h3>
        <p className="form-subtitle">Fill in the details below to {isEditing ? "update your" : "create a new"} task</p>
      </div>

      <div className="input-group">
        <div className="form-field">
          <label htmlFor="task-input">Task Description</label>
          <input
            id="task-input"
            type="text"
            placeholder={isEditing ? "Edit your task..." : "What needs to be done?"}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className="form-field">
          <label htmlFor="deadline-input">Deadline</label>
          <input
            id="deadline-input"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="priority-select">Priority Level</label>
          <select
            id="priority-select"
            className="priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟠 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
        </div>
      </div>

      <button onClick={addTask} className="add-btn">
        <span className="btn-icon">{isEditing ? "📝" : "🚀"}</span>
        <span className="btn-text">{isEditing ? "Update Task" : "Add Task"}</span>
      </button>
    </div>
  );
});

export default TaskForm;
