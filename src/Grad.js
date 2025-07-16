// Main slope measurement app
import { startCamera } from './camera.js';
import { 
  state,
  addPoint, 
  removePoint, 
  drawTriangle, 
  resetHighlights, 
  displayDimensions 
} from './drawing.js';
import { gridSize, updateGridOverlay, increaseGridSize, decreaseGridSize, initializeGrid, setGridSize, getCurrentGridSize } from './grid.js';
import { handleTouchAction, handleClickAction, handlePinchStart, handlePinchMove, handlePinchEnd } from './events.js';

// Touch event state
let touchStartTime = 0;
let touchStartPoint = null;

// Camera state management
let cameraInitialized = false;
let eventListenersAdded = false;

// Initialize on page load
window.addEventListener('load', async () => {
  initializeGrid();  // Initialize grid (including grid point calculation)
  setupButtonEvents(); // Set up button events first
  
  try {
    await startCamera();
    cameraInitialized = true;
    setupTouchEvents(); // Set up touch events only on camera success
  } catch (error) {
    console.error('Camera initialization failed:', error);
    cameraInitialized = false;
    // Don't set up touch events on camera failure
  }
});

// Event listener setup function
function setupEventListeners() {
  // Button event listeners
  setupButtonEvents();
  
  // Touch/click event listeners (only on camera success)
  if (cameraInitialized) {
    setupTouchEvents();
  }
}

// Set up button events
function setupButtonEvents() {
  const buttons = {
    reset: document.getElementById('resetButton'),
    triangle: document.getElementById('triangleButton'),
    length: document.getElementById('lengthButton'),
    increaseGrid: document.getElementById('increaseGridButton'),
    decreaseGrid: document.getElementById('decreaseGridButton')
  };

  // Reset button
  if (buttons.reset) {
    addButtonEventListeners(buttons.reset, (e) => {
      e.stopPropagation();
      e.preventDefault();
      resetHighlights();
    });
  }

  // Triangle button
  if (buttons.triangle) {
    addButtonEventListeners(buttons.triangle, (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (state.points.length >= 2) {
        drawTriangle(state.points[0], state.points[1]);
      }
    });
  }

  // Distance measurement button
  if (buttons.length) {
    addButtonEventListeners(buttons.length, (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (state.points.length >= 2) {
        displayDimensions(state.points[0], state.points[1], gridSize);
      }
    });
  }

  // Grid increase button
  if (buttons.increaseGrid) {
    addButtonEventListeners(buttons.increaseGrid, (e) => {
      e.stopPropagation();
      e.preventDefault();
      increaseGridSize(resetHighlights);
    });
  }

  // Grid decrease button
  if (buttons.decreaseGrid) {
    addButtonEventListeners(buttons.decreaseGrid, (e) => {
      e.stopPropagation();
      e.preventDefault();
      decreaseGridSize(resetHighlights);
    });
  }
}

// Helper function to add both click and touch events to buttons
function addButtonEventListeners(button, handler) {
  button.addEventListener('click', handler);
  button.addEventListener('touchend', handler);
}

// Set up touch/click events
function setupTouchEvents() {
  if (eventListenersAdded) {
    return; // Prevent duplicates if already added
  }
  
  // Add event listeners only to canvas or video area
  const targetElement = document.getElementById('overlay-canvas') || document.getElementById('video') || document;
  
  // Touch events (mobile)
  targetElement.addEventListener('touchstart', handleTouch, { passive: false });
  targetElement.addEventListener('touchmove', handleTouchMove, { passive: false });
  targetElement.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  // Click events (desktop)
  targetElement.addEventListener('click', handleClick);
  
  eventListenersAdded = true;
}

// Handle touch start
function handleTouch(event) {
  event.preventDefault();
  
  // Handle pinch zoom
  if (event.touches.length === 2) {
    handlePinchStart(event, getCurrentGridSize);
    return;
  }
  
  // Handle single touch
  touchStartTime = Date.now();
  
  const touch = event.touches[0];
  touchStartPoint = {
    touchX: touch.clientX,
    touchY: touch.clientY
  };
}

// Handle touch move
function handleTouchMove(event) {
  // Handle pinch zoom
  if (event.touches.length === 2) {
    handlePinchMove(event, (newSize) => {
      setGridSize(newSize, resetHighlights);
    });
  }
}

// Handle touch end
function handleTouchEnd(event) {
  // Handle pinch zoom end
  handlePinchEnd(event);
  
  const touchEndTime = Date.now();
  const touchDuration = touchEndTime - touchStartTime;
  
  // Only handle short single touches (ignore long press or multi-touch)
  if (touchDuration < 300 && touchStartPoint && event.touches.length === 0) {
    handleTouchAction(touchStartPoint, state.points, gridSize, addPoint, removePoint);
  }
}

// Handle click
function handleClick(event) {
  handleClickAction(event, state.points, gridSize, addPoint, removePoint);
}
