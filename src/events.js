// Event handling related functionality module
import { findNearestGridPoint } from './grid.js';

// Pinch zoom related variables
let initialDistance = 0;
let currentGridSize = 50;
let isZooming = false;

// Calculate distance between two touch points
function getTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Handle pinch zoom start
export function handlePinchStart(event, getCurrentGridSize) {
  if (event.touches.length === 2) {
    isZooming = true;
    currentGridSize = getCurrentGridSize();
    initialDistance = getTouchDistance(event.touches[0], event.touches[1]);
  }
}

// Handle pinch zoom during
export function handlePinchMove(event, updateGridSizeCallback) {
  if (event.touches.length === 2 && isZooming) {
    event.preventDefault(); // Prevent default zoom behavior
    
    const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
    const scale = currentDistance / initialDistance;
    
    // Calculate new grid size (limited to 20~100 range)
    let newGridSize = Math.round(currentGridSize * scale);
    newGridSize = Math.max(20, Math.min(100, newGridSize));
    
    // Adjust to multiples of 5 (maintain consistency with existing buttons)
    newGridSize = Math.round(newGridSize / 5) * 5;
    
    updateGridSizeCallback(newGridSize);
  }
}

// Handle pinch zoom end
export function handlePinchEnd(event) {
  if (event.touches.length < 2) {
    isZooming = false;
  }
}

// Function to check if click should be blocked in control area
export function isInControlArea(x, y) {
  const controls = document.querySelector('.controls');
  const infoPanel = document.querySelector('.info-panel');
  
  if (controls) {
    const controlsRect = controls.getBoundingClientRect();
    if (x >= controlsRect.left && x <= controlsRect.right && 
        y >= controlsRect.top && y <= controlsRect.bottom) {
      return true;
    }
  }
  
  if (infoPanel) {
    const infoPanelRect = infoPanel.getBoundingClientRect();
    if (x >= infoPanelRect.left && x <= infoPanelRect.right && 
        y >= infoPanelRect.top && y <= infoPanelRect.bottom) {
      return true;
    }
  }
  
  // Also check each button individually
  const buttons = document.querySelectorAll('button');
  for (let button of buttons) {
    const buttonRect = button.getBoundingClientRect();
    if (x >= buttonRect.left && x <= buttonRect.right && 
        y >= buttonRect.top && y <= buttonRect.bottom) {
      return true;
    }
  }
  
  return false;
}

// Handle touch action
export function handleTouchAction(touchPoint, points, gridSize, addPointCallback, removePointCallback) {
  // Don't add more points if two points are already added
  if (points.length >= 2) return;

  const { touchX, touchY } = touchPoint;

  // Ignore if touched in control area
  if (isInControlArea(touchX, touchY)) {
    return;
  }

  // Set tolerance (maximum distance between touch point and grid point)
  const tolerance = 35; // Mobile tolerance

  // Find nearest grid point
  const nearestGridPoint = findNearestGridPoint(touchX, touchY);
  
  if (!nearestGridPoint) {
    return;
  }

  // Calculate distance between touch point and grid point
  const distance = Math.sqrt(
    Math.pow(touchX - nearestGridPoint.x, 2) + Math.pow(touchY - nearestGridPoint.y, 2)
  );

  // Check if within tolerance
  if (distance <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${nearestGridPoint.x}"][data-y="${nearestGridPoint.y}"]`);

    if (existingHighlight) {
      removePointCallback(nearestGridPoint.x, nearestGridPoint.y);
    } else {
      addPointCallback(nearestGridPoint.x, nearestGridPoint.y);
    }
  }
}

// Handle click action
export function handleClickAction(event, points, gridSize, addPointCallback, removePointCallback) {
  // Don't add more points if two points are already added
  if (points.length >= 2) return;

  // Get clicked position coordinates
  const clickX = event.clientX;
  const clickY = event.clientY;

  // Ignore if clicked in control area
  if (isInControlArea(clickX, clickY)) {
    return;
  }

  // Set tolerance (maximum distance between click point and grid point)
  const tolerance = 25; // Desktop tolerance

  // Find nearest grid point
  const nearestGridPoint = findNearestGridPoint(clickX, clickY);
  
  if (!nearestGridPoint) {
    return;
  }

  // Calculate distance between click point and grid point
  const distance = Math.sqrt(
    Math.pow(clickX - nearestGridPoint.x, 2) + Math.pow(clickY - nearestGridPoint.y, 2)
  );

  // Check if within tolerance
  if (distance <= tolerance) {
    const existingHighlight = document.querySelector(`.highlight[data-x="${nearestGridPoint.x}"][data-y="${nearestGridPoint.y}"]`);

    if (existingHighlight) {
      removePointCallback(nearestGridPoint.x, nearestGridPoint.y);
    } else {
      addPointCallback(nearestGridPoint.x, nearestGridPoint.y);
    }
  }
}
