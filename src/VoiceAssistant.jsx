
import { useState, useEffect } from 'react';

const VoiceAssistant = ({
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onFilterChange,
  onEditTask,
  onSetPriority,
  onSetDeadline,
  onStartTimeTracking,
  onPauseTimeTracking,
  onResumeTimeTracking,
  onSortTasks,
  onFilterByPriority,
  onFilterByDate,
  onFilterByTimeTracking,
  onClearFilters
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleCommand(command);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = (command) => {
    console.log('Received command:', command);

    // Theme commands
    if (command.includes('switch theme') || command.includes('change theme')) {
      const theme = document.documentElement.getAttribute('data-theme');
      const newTheme = theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      speak(`Switched to ${newTheme} theme`);
    }
    else if (command.includes('dark mode')) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      speak('Dark mode activated');
    }
    else if (command.includes('light mode')) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      speak('Light mode activated');
    }

    // Add task commands
    else if (command.includes('add task') || command.includes('new task') || command.includes('create task')) {
      const taskText = command.replace(/(add task|new task|create task)/i, '').trim();
      if (taskText) {
        // Check for priority in the command
        let priority = 'medium';
        if (taskText.includes('high priority')) {
          priority = 'high';
        } else if (taskText.includes('medium priority')) {
          priority = 'medium';
        } else if (taskText.includes('low priority')) {
          priority = 'low';
        }

        // Check for deadline in the command
        let deadline = '';
        const dateRegex = /(today|tomorrow|next week|in \d+ days?)/i;
        const dateMatch = taskText.match(dateRegex);

        if (dateMatch) {
          const dateText = dateMatch[0].toLowerCase();
          const now = new Date();

          if (dateText === 'today') {
            deadline = now.toISOString().split('T')[0] + 'T23:59';
          } else if (dateText === 'tomorrow') {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            deadline = tomorrow.toISOString().split('T')[0] + 'T23:59';
          } else if (dateText === 'next week') {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            deadline = nextWeek.toISOString().split('T')[0] + 'T23:59';
          } else if (dateText.includes('in')) {
            const daysMatch = dateText.match(/\d+/);
            if (daysMatch) {
              const days = parseInt(daysMatch[0]);
              const futureDate = new Date(now);
              futureDate.setDate(futureDate.getDate() + days);
              deadline = futureDate.toISOString().split('T')[0] + 'T23:59';
            }
          }
        }

        // Clean up the task text by removing priority and deadline info
        let cleanTaskText = taskText
          .replace(/(high|medium|low) priority/i, '')
          .replace(dateRegex, '')
          .trim();

        onAddTask({
          text: cleanTaskText,
          deadline: deadline,
          priority: priority
        });

        speak(`Added new ${priority} priority task: ${cleanTaskText}${deadline ? ' with deadline' : ''}`);
      } else {
        speak("Please specify a task to add");
      }
    }

    // Complete task commands
    else if (command.includes('complete task') || command.includes('mark done') || command.includes('finish task')) {
      const taskText = command.replace(/(complete task|mark done|finish task)/i, '').trim();
      onToggleTask(taskText);
      speak(`Marked task as complete: ${taskText}`);
    }

    // Delete task commands
    else if (command.includes('delete task') || command.includes('remove task')) {
      const taskText = command.replace(/(delete task|remove task)/i, '').trim();
      onDeleteTask(taskText);
      speak(`Deleted task: ${taskText}`);
    }

    // Edit task commands
    else if (command.includes('edit task') || command.includes('update task') || command.includes('change task')) {
      const commandText = command.replace(/(edit task|update task|change task)/i, '').trim();

      // Extract task identifier (the part before "to")
      const parts = commandText.split(' to ');
      if (parts.length >= 2) {
        const taskIdentifier = parts[0].trim();
        const newText = parts[1].trim();

        if (onEditTask) {
          onEditTask(taskIdentifier, newText);
          speak(`Updated task: ${taskIdentifier} to ${newText}`);
        } else {
          speak("Edit functionality is not available");
        }
      } else {
        speak("Please specify what to edit the task to. For example, 'edit task buy milk to buy almond milk'");
      }
    }

    // Set priority commands
    else if (command.includes('set priority') || command.includes('change priority')) {
      const commandText = command.replace(/(set priority|change priority)/i, '').trim();
      const priorityMatch = commandText.match(/(high|medium|low)\s+priority\s+for\s+(.+)/i);

      if (priorityMatch && priorityMatch.length >= 3) {
        const priority = priorityMatch[1].toLowerCase();
        const taskText = priorityMatch[2].trim();

        if (onSetPriority) {
          onSetPriority(taskText, priority);
          speak(`Set ${priority} priority for task: ${taskText}`);
        } else {
          speak("Priority setting functionality is not available");
        }
      } else {
        speak("Please specify the priority and task. For example, 'set high priority for buy groceries'");
      }
    }

    // Set deadline commands
    else if (command.includes('set deadline') || command.includes('add deadline')) {
      const commandText = command.replace(/(set deadline|add deadline)/i, '').trim();
      const deadlineMatch = commandText.match(/(today|tomorrow|next week|in \d+ days?)\s+for\s+(.+)/i);

      if (deadlineMatch && deadlineMatch.length >= 3) {
        const dateText = deadlineMatch[1].toLowerCase();
        const taskText = deadlineMatch[2].trim();
        const now = new Date();
        let deadline = '';

        if (dateText === 'today') {
          deadline = now.toISOString().split('T')[0] + 'T23:59';
        } else if (dateText === 'tomorrow') {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          deadline = tomorrow.toISOString().split('T')[0] + 'T23:59';
        } else if (dateText === 'next week') {
          const nextWeek = new Date(now);
          nextWeek.setDate(nextWeek.getDate() + 7);
          deadline = nextWeek.toISOString().split('T')[0] + 'T23:59';
        } else if (dateText.includes('in')) {
          const daysMatch = dateText.match(/\d+/);
          if (daysMatch) {
            const days = parseInt(daysMatch[0]);
            const futureDate = new Date(now);
            futureDate.setDate(futureDate.getDate() + days);
            deadline = futureDate.toISOString().split('T')[0] + 'T23:59';
          }
        }

        if (deadline && onSetDeadline) {
          onSetDeadline(taskText, deadline);
          speak(`Set deadline to ${dateText} for task: ${taskText}`);
        } else {
          speak("Deadline setting functionality is not available");
        }
      } else {
        speak("Please specify the deadline and task. For example, 'set deadline tomorrow for buy groceries'");
      }
    }

    // Time tracking commands
    else if (command.includes('start task') || command.includes('begin task')) {
      const taskText = command.replace(/(start task|begin task)/i, '').trim();
      if (taskText && onStartTimeTracking) {
        onStartTimeTracking(taskText);
        speak(`Started time tracking for task: ${taskText}`);
      } else {
        speak("Please specify a task to start or time tracking functionality is not available");
      }
    }
    else if (command.includes('pause task') || command.includes('stop task')) {
      const taskText = command.replace(/(pause task|stop task)/i, '').trim();
      if (taskText && onPauseTimeTracking) {
        onPauseTimeTracking(taskText);
        speak(`Paused time tracking for task: ${taskText}`);
      } else {
        speak("Please specify a task to pause or time tracking functionality is not available");
      }
    }
    else if (command.includes('resume task') || command.includes('continue task')) {
      const taskText = command.replace(/(resume task|continue task)/i, '').trim();
      if (taskText && onResumeTimeTracking) {
        onResumeTimeTracking(taskText);
        speak(`Resumed time tracking for task: ${taskText}`);
      } else {
        speak("Please specify a task to resume or time tracking functionality is not available");
      }
    }

    // Filter commands
    else if (command.includes('show') || command.includes('filter')) {
      // Status filters
      if (command.includes('all tasks')) {
        onFilterChange('all');
        speak('Showing all tasks');
      } else if (command.includes('active tasks')) {
        onFilterChange('active');
        speak('Showing active tasks');
      } else if (command.includes('completed tasks')) {
        onFilterChange('completed');
        speak('Showing completed tasks');
      }
      // Priority filters
      else if (command.includes('high priority') && onFilterByPriority) {
        onFilterByPriority('high');
        speak('Showing high priority tasks');
      } else if (command.includes('medium priority') && onFilterByPriority) {
        onFilterByPriority('medium');
        speak('Showing medium priority tasks');
      } else if (command.includes('low priority') && onFilterByPriority) {
        onFilterByPriority('low');
        speak('Showing low priority tasks');
      }
      // Date filters
      else if (command.includes('due today') && onFilterByDate) {
        onFilterByDate('today');
        speak('Showing tasks due today');
      } else if (command.includes('due this week') && onFilterByDate) {
        onFilterByDate('thisWeek');
        speak('Showing tasks due this week');
      } else if (command.includes('overdue') && onFilterByDate) {
        onFilterByDate('overdue');
        speak('Showing overdue tasks');
      } else if (command.includes('no due date') && onFilterByDate) {
        onFilterByDate('noDueDate');
        speak('Showing tasks with no due date');
      }
      // Time tracking filters
      else if (command.includes('in progress') && onFilterByTimeTracking) {
        onFilterByTimeTracking('inProgress');
        speak('Showing tasks in progress');
      } else if (command.includes('paused') && onFilterByTimeTracking) {
        onFilterByTimeTracking('paused');
        speak('Showing paused tasks');
      } else if (command.includes('not started') && onFilterByTimeTracking) {
        onFilterByTimeTracking('notStarted');
        speak('Showing tasks not started');
      } else {
        speak("I'm not sure which tasks to show. Try saying 'show all tasks' or 'show active tasks'.");
      }
    }

    // Sort commands
    else if (command.includes('sort') && onSortTasks) {
      if (command.includes('by priority')) {
        onSortTasks('priority');
        speak('Sorting tasks by priority');
      } else if (command.includes('by deadline')) {
        onSortTasks('deadline');
        speak('Sorting tasks by deadline');
      } else if (command.includes('by newest')) {
        onSortTasks('newest');
        speak('Sorting tasks by newest first');
      } else if (command.includes('by oldest')) {
        onSortTasks('oldest');
        speak('Sorting tasks by oldest first');
      } else if (command.includes('by time spent')) {
        onSortTasks('timeSpent');
        speak('Sorting tasks by time spent');
      } else {
        speak("I'm not sure how to sort. Try saying 'sort by priority' or 'sort by deadline'.");
      }
    }

    // Clear filters command
    else if ((command.includes('clear filters') || command.includes('reset filters')) && onClearFilters) {
      onClearFilters();
      speak('Cleared all filters');
    }

    // Help command
    else if (command.includes('help') || command.includes('what can you do')) {
      speak(`
        Here are some of the available commands:

        Task Management:
        - Add task [description] with [priority] priority due [deadline]
        - Complete task [description]
        - Delete task [description]
        - Edit task [old description] to [new description]
        - Set [priority] priority for [task description]
        - Set deadline [date] for [task description]

        Time Tracking:
        - Start task [description]
        - Pause task [description]
        - Resume task [description]

        Filtering and Sorting:
        - Show all tasks
        - Show active tasks
        - Show completed tasks
        - Show high priority tasks
        - Show tasks due today
        - Show tasks in progress
        - Sort by priority
        - Sort by deadline
        - Clear filters

        Theme:
        - Switch theme
        - Dark mode
        - Light mode
      `);
    }

    else {
      speak("Sorry, I didn't understand that command. Say 'help' for available commands.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      try {
        recognition?.start();
        setIsListening(true);
        speak("I'm listening");
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    }
  };

  return (
    <div className="voice-assistant">
      <div className="voice-assistant-container">
        <button
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          title="Voice Assistant"
        >
          {isListening ? '🎤 Listening...' : '🎤'}
        </button>
        <div className="voice-assistant-tooltip">
          <div className="tooltip-content">
            <h3>🔊 Voice Assistant</h3>
            <p>Click the microphone and try saying:</p>
            <ul>
              <li>"Add task buy groceries with high priority due tomorrow"</li>
              <li>"Start task write report"</li>
              <li>"Complete task read emails"</li>
              <li>"Show high priority tasks"</li>
              <li>"Sort by deadline"</li>
              <li>Say "help" for more commands</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;