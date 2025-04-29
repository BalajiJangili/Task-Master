import { useState, useEffect, useRef } from 'react';
import './App.css';
import { initTilt3D, updateTilt3D } from './Tilt3D';
import Cube3D from './Cube3D';

function App3D() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete project report", completed: false, priority: "high" },
    { id: 2, text: "Buy groceries", completed: false, priority: "medium" },
    { id: 3, text: "Go for a run", completed: false, priority: "low" }
  ]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');

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

  const addTask = () => {
    if (newTask.trim() === '') return;

    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      priority: priority
    };

    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="app">
      <Cube3D size={60} color="#7f5af0" position="top-right" />
      <Cube3D size={40} color="#2cb67d" position="bottom-left" />

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

      <h1>✨ 3D Task Manager</h1>

      <div className="input-container">
        <div className="input-group">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="priority-select"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <button className="add-btn" onClick={addTask}>
          Add Task
        </button>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`}
          >
            <div className="task-content">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
                className="task-checkbox"
              />
              <span className="task-text">{task.text}</span>
            </div>

            <div className="task-actions">
              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App3D;
