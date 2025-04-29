import { useState } from 'react';

const TaskAutomation = ({ onAddTask }) => {
  const [automationRules, setAutomationRules] = useState(() => {
    const savedRules = localStorage.getItem('automationRules');
    return savedRules ? JSON.parse(savedRules) : [];
  });
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    frequency: 'daily',
    time: '',
    taskText: '',
    deadline: '1', // days
    isActive: true
  });

  const frequencies = {
    daily: 1,
    weekly: 7,
    monthly: 30
  };

  const saveRule = () => {
    if (!newRule.name || !newRule.taskText || !newRule.time) return;

    const updatedRules = [...automationRules, { ...newRule, id: Date.now() }];
    setAutomationRules(updatedRules);
    localStorage.setItem('automationRules', JSON.stringify(updatedRules));
    setShowModal(false);
    setNewRule({
      name: '',
      frequency: 'daily',
      time: '',
      taskText: '',
      deadline: '1',
      isActive: true
    });
  };

  const toggleRule = (ruleId) => {
    const updatedRules = automationRules.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    );
    setAutomationRules(updatedRules);
    localStorage.setItem('automationRules', JSON.stringify(updatedRules));
  };

  const deleteRule = (ruleId) => {
    const updatedRules = automationRules.filter(rule => rule.id !== ruleId);
    setAutomationRules(updatedRules);
    localStorage.setItem('automationRules', JSON.stringify(updatedRules));
  };

  // Check and create automated tasks
  const checkAutomation = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    automationRules.forEach(rule => {
      if (!rule.isActive) return;

      if (rule.time === currentTime) {
        const deadlineDate = new Date(now);
        deadlineDate.setDate(deadlineDate.getDate() + parseInt(rule.deadline));

        onAddTask({
          text: rule.taskText,
          deadline: deadlineDate.toISOString(),
          automated: true
        });
      }
    });
  };

  // Run automation check every minute
  setInterval(checkAutomation, 60000);

  return (
    <div className="task-automation">
      <button 
        className="automation-btn"
        onClick={() => setShowModal(true)}
      >
        🤖 Task Automation
      </button>

      {showModal && (
        <div className="automation-modal">
          <div className="modal-content">
            <h2>Create Automation Rule</h2>
            <input
              type="text"
              placeholder="Rule Name"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            />
            <select
              value={newRule.frequency}
              onChange={(e) => setNewRule({ ...newRule, frequency: e.target.value })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <input
              type="time"
              value={newRule.time}
              onChange={(e) => setNewRule({ ...newRule, time: e.target.value })}
            />
            <input
              type="text"
              placeholder="Task Text"
              value={newRule.taskText}
              onChange={(e) => setNewRule({ ...newRule, taskText: e.target.value })}
            />
            <input
              type="number"
              placeholder="Deadline (days)"
              value={newRule.deadline}
              min="1"
              onChange={(e) => setNewRule({ ...newRule, deadline: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={saveRule}>Save Rule</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="automation-rules">
        {automationRules.map(rule => (
          <div key={rule.id} className="automation-rule">
            <div className="rule-header">
              <h3>{rule.name}</h3>
              <div className="rule-actions">
                <button
                  className={`toggle-btn ${rule.isActive ? 'active' : ''}`}
                  onClick={() => toggleRule(rule.id)}
                >
                  {rule.isActive ? '✅' : '❌'}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteRule(rule.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
            <p>Task: {rule.taskText}</p>
            <p>Frequency: {rule.frequency} at {rule.time}</p>
            <p>Deadline: {rule.deadline} days</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskAutomation;