// Drawing related functionality module

// Export state variables as functions for modification
let _points = [];
let _triangleCreated = false;

// State accessors
export const state = {
  get points() { return _points; },
  get triangleCreated() { return _triangleCreated; },
  set triangleCreated(value) { _triangleCreated = value; }
};

// Add point function
export function addPoint(x, y) {
  console.log('Point added:', x, y);
  
  const highlight = document.createElement('div');
  highlight.classList.add('highlight');
  highlight.style.position = 'absolute';
  highlight.style.width = '12px';
  highlight.style.height = '12px';
  highlight.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
  highlight.style.borderRadius = '50%';
  highlight.style.border = '2px solid white';
  highlight.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';
  // Position point center exactly at grid point center
  highlight.style.top = `${y - 7.5}px`;  // Move up by half the point height
  highlight.style.left = `${x - 7.5}px`; // Move left by half the point width
  highlight.style.pointerEvents = 'none';
  highlight.style.zIndex = '15';
  // Store grid point coordinates accurately
  highlight.setAttribute('data-x', x);
  highlight.setAttribute('data-y', y);

  document.body.appendChild(highlight);
  _points.push({ x, y });
  
  console.log(`Point placed exactly at grid center: (${x}, ${y})`);

  if (_points.length === 2) {
    drawLine(_points[0], _points[1]);
  }
}

// Remove point function
export function removePoint(x, y) {
  console.log('Point removed:', x, y);
  
  const existingHighlight = document.querySelector(`.highlight[data-x="${x}"][data-y="${y}"]`);
  if (existingHighlight) {
    existingHighlight.remove();
  }
  
  _points = _points.filter(point => point.x !== x || point.y !== y);
  
  // Also remove line segments
  const existingLines = document.querySelectorAll('.connection-line, div[style*="rgba(0, 0, 255"]');
  existingLines.forEach(line => line.remove());
  
  // Restore button to initial state
  resetButtonsToInitial();
}

// Draw line segment
export function drawLine(point1, point2) {
  console.log('Draw line:', point1, point2);
  
  const line = document.createElement('div');
  line.classList.add('connection-line');
  line.style.position = 'absolute';
  line.style.backgroundColor = 'rgba(0, 0, 255, 0.8)';
  line.style.zIndex = '14';
  line.style.pointerEvents = 'none';

  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  line.style.width = `${length}px`;
  line.style.height = '3px';
  line.style.top = `${point1.y - 1.5}px`;
  line.style.left = `${point1.x}px`;
  line.style.transformOrigin = '0 50%';
  line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  
  console.log(`Line position: top=${point1.y - 1.5}, left=${point1.x}, angle=${Math.atan2(dy, dx) * 180 / Math.PI} degrees`);
  
  document.body.appendChild(line);

  // Step 1: Initialize, enable distance measurement only
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'block';
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('increaseGridButton').style.display = 'none';
  document.getElementById('decreaseGridButton').style.display = 'none';
}

// 삼각형 그리기
export function drawTriangle(point1, point2) {
  if (_triangleCreated) return;

  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  const triangle = document.createElement('div');
  triangle.style.position = 'absolute';
  triangle.style.width = '0';
  triangle.style.height = '0';
  triangle.style.borderStyle = 'none';
  triangle.style.zIndex = '13';
  triangle.style.pointerEvents = 'none';

  if (dx * dy >= 0) {
    triangle.style.borderRight = `${Math.abs(dx)}px solid transparent`;
    triangle.style.borderBottom = `${Math.abs(dy)}px solid rgba(0, 255, 0, 0.5)`;
    triangle.style.top = `${Math.min(point1.y, point2.y)}px`;
    triangle.style.left = `${Math.min(point1.x, point2.x)}px`;
  } else {
    triangle.style.borderLeft = `${Math.abs(dx)}px solid transparent`;
    triangle.style.borderBottom = `${Math.abs(dy)}px solid rgba(0, 255, 0, 0.5)`;
    triangle.style.top = `${Math.min(point1.y, point2.y)}px`;
    triangle.style.left = `${Math.min(point1.x, point2.x)}px`;
  }

  document.body.appendChild(triangle);

  // Add emphasis lines to triangle base and height
  drawBaseLine(point1, point2);
  drawHeightLine(point1, point2);

  _triangleCreated = true;

  // Step 3: Only initialization activated
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'none';
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('increaseGridButton').style.display = 'none';
  document.getElementById('decreaseGridButton').style.display = 'none';
}

// Draw base line
function drawBaseLine(point1, point2) {
  const baseLine = document.createElement('div');
  baseLine.classList.add('base-line');
  baseLine.style.position = 'absolute';
  baseLine.style.backgroundColor = 'orange';
  baseLine.style.zIndex = '14';
  baseLine.style.pointerEvents = 'none';

  const dx = point2.x - point1.x;
  const length = Math.abs(dx);

  baseLine.style.width = `${length}px`;
  baseLine.style.height = '3px';
  baseLine.style.top = `${Math.max(point1.y, point2.y)}px`;
  baseLine.style.left = `${Math.min(point1.x, point2.x)}px`;

  document.body.appendChild(baseLine);
}

// Draw height line
function drawHeightLine(point1, point2) {
  const heightLine = document.createElement('div');
  heightLine.classList.add('height-line');
  heightLine.style.position = 'absolute';
  heightLine.style.backgroundColor = 'red';
  heightLine.style.zIndex = '14';
  heightLine.style.pointerEvents = 'none';

  const dy = Math.abs(point2.y - point1.y);

  heightLine.style.width = '3px';
  heightLine.style.height = `${dy}px`;
  heightLine.style.top = `${Math.min(point1.y, point2.y)}px`;

  const lowerYPointX = point1.y < point2.y ? point1.x : point2.x;
  heightLine.style.left = `${lowerYPointX}px`;

  document.body.appendChild(heightLine);
}

// Complete reset
export function resetHighlights() {
  console.log('Reset function executed');
  
  // Remove existing elements
  document.querySelectorAll('.highlight, .triangle, .connection-line, .base-line, .height-line, div[style*="rgba(0, 255, 0, 0.5)"], div[style*="rgba(0, 0, 255"]').forEach(el => el.remove());
  
  _points.length = 0; // Initialize array
  _triangleCreated = false;

  const display = document.getElementById('dimensionDisplay');
  const infoPanel = document.getElementById('infoPanel');
  
  if (display) {
    display.style.display = 'none';
  }
  
  if (infoPanel) {
    infoPanel.style.display = 'none'; // Hide entire info-panel
  }

  resetButtonsToInitial();
}

// Button state management
export function resetButtonsToInitial() {
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'none';
  document.getElementById('triangleButton').style.display = 'none';
  document.getElementById('increaseGridButton').style.display = 'block';
  document.getElementById('decreaseGridButton').style.display = 'block';
}

// Display dimensions
export function displayDimensions(point1, point2, gridSize) {
  const dx = Math.abs(point2.x - point1.x);
  const dy = Math.abs(point2.y - point1.y);

  const display = document.getElementById('dimensionDisplay');
  const infoPanel = document.getElementById('infoPanel');
  
  if (display && infoPanel) {
    display.innerHTML = `
      Horizontal distance: <span style="color: orange;">${(dx / gridSize)}</span> 
      &nbsp;&nbsp; Vertical distance: <span style="color: red;">${(dy / gridSize)}</span>
    `;
    display.style.display = 'block';
    infoPanel.style.display = 'block'; // Show entire info-panel
  }

  // Step 2: Only initialization and triangle drawing activated
  document.getElementById('resetButton').style.display = 'block';
  document.getElementById('lengthButton').style.display = 'none';
  document.getElementById('triangleButton').style.display = 'block';
  document.getElementById('increaseGridButton').style.display = 'none';
  document.getElementById('decreaseGridButton').style.display = 'none';
}
