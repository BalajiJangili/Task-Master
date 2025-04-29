// Task icon sets by category
export const workIcons = ['💼', '📊', '📈', '📝', '📑', '📋', '📌', '📎', '🖇️', '📏', '📐', '✂️', '🔒', '🔑'];
export const homeIcons = ['🏠', '🧹', '🧼', '🧺', '🛒', '🍽️', '🍳', '🧄', '🧆', '🥗', '🛋️', '🛏️', '🪴', '🧸'];
export const healthIcons = ['🏃‍♂️', '🏋️‍♀️', '🧘‍♂️', '🍎', '💊', '🩺', '🧠', '❤️', '🫁', '🫀', '🦷', '👁️', '🧬', '🦴'];
export const educationIcons = ['📚', '📖', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '🎓', '🔬', '🔭', '🧪', '🧮'];
export const leisureIcons = ['🎮', '🎬', '🎵', '🎨', '🎭', '🎪', '🎯', '🎲', '🧩', '🎸', '🎺', '🎻', '🎷', '🥁'];

// Specific task icons for common tasks
export const specificIcons = {
  'email': { icon: '📧', class: 'task-icon-work' },
  'mail': { icon: '📧', class: 'task-icon-work' },
  'meeting': { icon: '👥', class: 'task-icon-work' },
  'call': { icon: '📞', class: 'task-icon-work' },
  'phone': { icon: '📱', class: 'task-icon-work' },
  'presentation': { icon: '🎯', class: 'task-icon-work' },
  'report': { icon: '📊', class: 'task-icon-work' },
  'project': { icon: '📋', class: 'task-icon-work' },
  'deadline': { icon: '⏰', class: 'task-icon-work' },
  'clean': { icon: '🧹', class: 'task-icon-home' },
  'laundry': { icon: '🧺', class: 'task-icon-home' },
  'grocery': { icon: '🛒', class: 'task-icon-home' },
  'cook': { icon: '🍳', class: 'task-icon-home' },
  'dishes': { icon: '🍽️', class: 'task-icon-home' },
  'exercise': { icon: '🏋️‍♀️', class: 'task-icon-health' },
  'workout': { icon: '💪', class: 'task-icon-health' },
  'run': { icon: '🏃‍♂️', class: 'task-icon-health' },
  'yoga': { icon: '🧘‍♀️', class: 'task-icon-health' },
  'meditate': { icon: '🧘‍♂️', class: 'task-icon-health' },
  'doctor': { icon: '👨‍⚕️', class: 'task-icon-health' },
  'medicine': { icon: '💊', class: 'task-icon-health' },
  'study': { icon: '📚', class: 'task-icon-education' },
  'read': { icon: '📖', class: 'task-icon-education' },
  'book': { icon: '📕', class: 'task-icon-education' },
  'homework': { icon: '📝', class: 'task-icon-education' },
  'assignment': { icon: '📝', class: 'task-icon-education' },
  'exam': { icon: '✍️', class: 'task-icon-education' },
  'test': { icon: '📝', class: 'task-icon-education' },
  'game': { icon: '🎮', class: 'task-icon-leisure' },
  'movie': { icon: '🎬', class: 'task-icon-leisure' },
  'music': { icon: '🎵', class: 'task-icon-leisure' },
  'concert': { icon: '🎸', class: 'task-icon-leisure' },
  'party': { icon: '🎉', class: 'task-icon-leisure' },
  'travel': { icon: '✈️', class: 'task-icon-leisure' },
  'vacation': { icon: '🏖️', class: 'task-icon-leisure' }
};

// Get an appropriate icon for a task based on its text
export const getTaskIcon = (task) => {
  const { text, id } = task;
  const taskText = text.toLowerCase();
  const taskId = id.toString();
  
  // Check for specific task matches first
  for (const [keyword, iconData] of Object.entries(specificIcons)) {
    if (taskText.includes(keyword)) {
      return { icon: iconData.icon, className: iconData.class };
    }
  }

  // If no specific match, determine category based on broader keywords
  let iconSet = workIcons; // default
  let categoryClass = 'task-icon-work';

  if (taskText.match(/home|clean|cook|grocery|laundry|house|room|kitchen|bathroom|garden|dishes|furniture|decorate|organize/)) {
    iconSet = homeIcons;
    categoryClass = 'task-icon-home';
  } else if (taskText.match(/health|exercise|gym|workout|doctor|medicine|yoga|run|jog|diet|fitness|wellness|nutrition|sleep|meditate/)) {
    iconSet = healthIcons;
    categoryClass = 'task-icon-health';
  } else if (taskText.match(/study|learn|read|book|course|class|school|college|university|homework|assignment|exam|test|research|paper|essay/)) {
    iconSet = educationIcons;
    categoryClass = 'task-icon-education';
  } else if (taskText.match(/game|movie|play|watch|listen|music|hobby|fun|relax|entertainment|concert|show|theater|party|festival|travel|vacation/)) {
    iconSet = leisureIcons;
    categoryClass = 'task-icon-leisure';
  }

  // Use task properties to select a consistent icon from the category
  const seed = taskText.length + taskId.length;
  const iconIndex = seed % iconSet.length;
  return { icon: iconSet[iconIndex], className: categoryClass };
};
