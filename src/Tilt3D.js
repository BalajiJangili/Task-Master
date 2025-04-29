// 3D Tilt Effect for Task Items

// Handle mouse movement over task item
function handleMouseMove(e) {
  const item = e.currentTarget;
  const rect = item.getBoundingClientRect();

  // Calculate mouse position relative to the item
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Calculate the percentage position
  const xPercent = x / rect.width;
  const yPercent = y / rect.height;

  // Calculate the tilt angle (maximum 15 degrees)
  const maxTilt = 15;
  const xTilt = (xPercent - 0.5) * maxTilt;
  const yTilt = (0.5 - yPercent) * maxTilt;

  // Apply the 3D transform
  item.style.transform = `
    perspective(1000px)
    rotateX(${yTilt}deg)
    rotateY(${xTilt}deg)
    translateZ(10px)
    scale3d(1.02, 1.02, 1.02)
  `;

  // Add a smooth transition for better visual effect
  item.style.transition = 'transform 0.1s ease-out';

  // Add a dynamic shadow based on tilt
  item.style.boxShadow = `
    ${-xTilt}px ${-yTilt}px 20px rgba(0, 0, 0, 0.2),
    0 10px 20px rgba(0, 0, 0, 0.1)
  `;

  // Add a highlight effect based on mouse position
  const highlight = item.querySelector('.task-highlight') || createHighlight(item);
  highlight.style.background = `radial-gradient(
    circle at ${xPercent * 100}% ${yPercent * 100}%,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(255, 255, 255, 0) 50%
  )`;
}

// Handle mouse leave event
function handleMouseLeave(e) {
  const item = e.currentTarget;

  // Reset the transform with a smooth transition
  item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale3d(1, 1, 1)';
  item.style.transition = 'transform 0.5s ease-out';
  item.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';

  // Reset the highlight
  const highlight = item.querySelector('.task-highlight');
  if (highlight) {
    highlight.style.background = 'none';
  }
}

// Create a highlight element for the task item
function createHighlight(item) {
  const highlight = document.createElement('div');
  highlight.className = 'task-highlight';
  highlight.style.position = 'absolute';
  highlight.style.top = '0';
  highlight.style.left = '0';
  highlight.style.width = '100%';
  highlight.style.height = '100%';
  highlight.style.pointerEvents = 'none';
  highlight.style.zIndex = '1';
  highlight.style.borderRadius = 'inherit';
  item.appendChild(highlight);
  return highlight;
}

export const initTilt3D = () => {
  // Select all task items
  const taskItems = document.querySelectorAll('.task-item');

  // Add event listeners to each task item
  taskItems.forEach(item => {
    // Add mouse move event listener
    item.addEventListener('mousemove', handleMouseMove);

    // Add mouse leave event listener to reset the tilt
    item.addEventListener('mouseleave', handleMouseLeave);
  });
};

// Function to update tilt effect when new tasks are added
export const updateTilt3D = () => {
  // Remove existing event listeners
  const taskItems = document.querySelectorAll('.task-item');
  taskItems.forEach(item => {
    item.removeEventListener('mousemove', handleMouseMove);
    item.removeEventListener('mouseleave', handleMouseLeave);
  });

  // Re-initialize the tilt effect
  initTilt3D();
};
