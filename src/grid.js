// Grid-related function module

export let gridSize = 50; // Initial grid size
let _gridPoints = []; // Grid point coordinate array

// Grid point array calculation function
function calculateGridPoints() {
  _gridPoints = [];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate all grid point coordinates and store in array
  for (let x = 0; x <= viewportWidth; x += gridSize) {
    for (let y = 0; y <= viewportHeight; y += gridSize) {
      _gridPoints.push({ x, y });
    }
  }
}

// Find nearest grid point function
export function findNearestGridPoint(touchX, touchY) {
  if (_gridPoints.length === 0) {
    calculateGridPoints();
  }

  let nearestPoint = null;
  let minDistance = Infinity;

  for (const point of _gridPoints) {
    const distance = Math.sqrt(
      Math.pow(point.x - touchX, 2) + Math.pow(point.y - touchY, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }

  return nearestPoint;
}

// Update grid-overlay background-size function
export function updateGridOverlay() {
  const gridOverlay = document.querySelector('.grid-overlay');
  if (gridOverlay) {
      gridOverlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
      gridOverlay.style.backgroundPosition = '0 0'; // Grid starts exactly at 0,0
  }
  
  // Recalculate grid points when grid size changes
  calculateGridPoints();
}

// Function to increase gridSize by 5px
export function increaseGridSize(resetCallback) {
  resetCallback();  // Reset before adjusting grid size
  if (gridSize < 100) { // Limit to 100 or below
      gridSize += 5;
      updateGridOverlay();
  }
}

// Function to decrease gridSize by 5px
export function decreaseGridSize(resetCallback) {
  resetCallback();  // Reset before adjusting grid size
  if (gridSize > 20) { // Limit to greater than 20
      gridSize -= 5;
      updateGridOverlay();
  }
}

// Function to directly set grid size (for pinch zoom)
export function setGridSize(newSize, resetCallback = null) {
  if (newSize >= 20 && newSize <= 100) {
    if (resetCallback) resetCallback(); // Reset before adjusting grid size
    gridSize = newSize;
    updateGridOverlay();
    return true;
  }
  return false;
}

// Function to return current grid size
export function getCurrentGridSize() {
  return gridSize;
}

// Initial grid point calculation (called on page load)
export function initializeGrid() {
  updateGridOverlay();
  calculateGridPoints();
  
  // Recalculate grid points on window resize
  window.addEventListener('resize', () => {
    calculateGridPoints();
  });
}
