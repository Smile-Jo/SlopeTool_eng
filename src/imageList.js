// Image list function module
import { checkAuthState } from './auth.js';
import { getImageList, deleteImageData, deleteImage } from './firebaseConfig.js';
import { showSuccess, showError, showConfirm, showToast } from './alerts.js';

// DOM elements
let authCheck, filterSection, loadingSection, imageListSection, emptyMessage;
let gradeFilter, classFilter, sortOrder, refreshButton, imageGrid, imageCount;
let imageModal, closeModal, modalImageContainer, modalImageInfo, deleteImageButton, copyUrlButton;
let pagination, prevPage, nextPage, pageNumbers;

// Global variables
let allImages = [];
let currentImageData = null;
let filteredImages = [];
let currentPage = 1;
const imagesPerPage = 15;

// Page load initialization
document.addEventListener('DOMContentLoaded', async () => {
  // DOM element reference
  initializeDOMElements();
  
  // Check authentication status
  await checkUserAuth();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load image list
  await loadImageList();
});

// DOM element initialization
function initializeDOMElements() {
  authCheck = document.getElementById('authCheck');
  filterSection = document.getElementById('filterSection');
  loadingSection = document.getElementById('loadingSection');
  imageListSection = document.getElementById('imageListSection');
  emptyMessage = document.getElementById('emptyMessage');
  
  gradeFilter = document.getElementById('gradeFilter');
  classFilter = document.getElementById('classFilter');
  sortOrder = document.getElementById('sortOrder');
  refreshButton = document.getElementById('refreshButton');
  imageGrid = document.getElementById('imageGrid');
  imageCount = document.getElementById('imageCount');
  
  imageModal = document.getElementById('imageModal');
  closeModal = document.getElementById('closeModal');
  modalImageContainer = document.getElementById('modalImageContainer');
  modalImageInfo = document.getElementById('modalImageInfo');
  deleteImageButton = document.getElementById('deleteImageButton');
  copyUrlButton = document.getElementById('copyUrlButton');
  
  // Pagination elements
  pagination = document.getElementById('pagination');
  prevPage = document.getElementById('prevPage');
  nextPage = document.getElementById('nextPage');
  pageNumbers = document.getElementById('pageNumbers');
}

// Check user authentication status
async function checkUserAuth() {
  try {
    const user = await checkAuthState();
    
    if (user) {
      // Authenticated user
      authCheck.style.display = 'none';
      filterSection.style.display = 'block';
      console.log('Authenticated user:', user.displayName);
    } else {
      // Unauthenticated user
      authCheck.innerHTML = `
        <div class="auth-required">
          <p>Login is required to use this feature.</p>
          <a href="./index.html" class="auth-button">Go to Main Page</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Authentication status check failed:', error);
    authCheck.innerHTML = `
      <div class="auth-error">
        <p>Unable to verify authentication status.</p>
        <a href="./index.html" class="auth-button">Go to Main Page</a>
      </div>
    `;
  }
}

// Event listener setup
function setupEventListeners() {
  // Filter change event
  if (gradeFilter) gradeFilter.addEventListener('change', applyFilters);
  if (classFilter) classFilter.addEventListener('change', applyFilters);
  if (sortOrder) sortOrder.addEventListener('change', applyFilters);
  
  // Refresh button
  if (refreshButton) refreshButton.addEventListener('click', loadImageList);
  
  // Modal related events
  if (closeModal) closeModal.addEventListener('click', closeImageModal);
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) closeImageModal();
    });
  }
  if (deleteImageButton) deleteImageButton.addEventListener('click', handleDeleteImage);
  if (copyUrlButton) copyUrlButton.addEventListener('click', handleCopyUrl);
  
  // Pagination events
  if (prevPage) prevPage.addEventListener('click', () => goToPage(currentPage - 1));
  if (nextPage) nextPage.addEventListener('click', () => goToPage(currentPage + 1));
  
  // Close modal with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeImageModal();
  });
}

// Load image list
async function loadImageList() {
  try {
    showLoading();
    
    console.log('Image list loading started');
    allImages = await getImageList();
    console.log('Number of loaded images:', allImages.length);
    
    hideLoading();
    applyFilters();
    
  } catch (error) {
    console.error('Image list loading failed:', error);
    hideLoading();
    showErrorMessage('Failed to load image list.');
  }
}

// Apply filters
function applyFilters() {
  let filtered = [...allImages];
  
  // Grade filter
  const selectedGrade = gradeFilter?.value;
  if (selectedGrade) {
    filtered = filtered.filter(img => img.grade === parseInt(selectedGrade));
  }
  
  // Class filter
  const selectedClass = classFilter?.value;
  if (selectedClass) {
    filtered = filtered.filter(img => img.classNumber === parseInt(selectedClass));
  }
  
  // Sorting
  const sortBy = sortOrder?.value || 'newest';
  switch (sortBy) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.timestamp.seconds * 1000) - new Date(a.timestamp.seconds * 1000));
      break;
    case 'oldest':
      filtered.sort((a, b) => new Date(a.timestamp.seconds * 1000) - new Date(b.timestamp.seconds * 1000));
      break;
    case 'name':
      filtered.sort((a, b) => a.userName.localeCompare(b.userName));
      break;
    case 'grade':
      filtered.sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
      break;
  }
  
  filteredImages = filtered;
  currentPage = 1; // Go to first page when filter changes
  displayCurrentPage();
}

// Display current page
function displayCurrentPage() {
  if (filteredImages.length === 0) {
    showEmptyMessage();
    return;
  }
  
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = filteredImages.slice(startIndex, endIndex);
  
  // Display image count
  imageCount.textContent = `Total ${filteredImages.length} images (${currentPage}/${totalPages} pages)`;
  
  // Create image grid
  imageGrid.innerHTML = currentImages.map(image => createImageCard(image)).join('');
  
  // Image card click event
  const imageCards = imageGrid.querySelectorAll('.image-card');
  imageCards.forEach((card, index) => {
    const actualIndex = startIndex + index;
    card.addEventListener('click', () => openImageModal(filteredImages[actualIndex]));
  });
  
  // Update pagination
  updatePagination(totalPages);
  
  showImageList();
}

// Update pagination
function updatePagination(totalPages) {
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  
  pagination.style.display = 'flex';
  
  // Previous/Next button state
  prevPage.disabled = currentPage === 1;
  nextPage.disabled = currentPage === totalPages;
  
  // Generate page numbers
  pageNumbers.innerHTML = '';
  
  // Calculate page number range to display
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  // Add 1 if start page is not 1
  if (startPage > 1) {
    addPageNumber(1);
    if (startPage > 2) {
      addEllipsis();
    }
  }
  
  // Page numbers in current range
  for (let i = startPage; i <= endPage; i++) {
    addPageNumber(i);
  }
  
  // Add total page count if end page is not total page count
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      addEllipsis();
    }
    addPageNumber(totalPages);
  }
}

// Add page number buttons
function addPageNumber(pageNum) {
  const pageButton = document.createElement('span');
  pageButton.className = `page-number ${pageNum === currentPage ? 'active' : ''}`;
  pageButton.textContent = pageNum;
  pageButton.addEventListener('click', () => goToPage(pageNum));
  pageNumbers.appendChild(pageButton);
}

// Add ellipsis indicator
function addEllipsis() {
  const ellipsis = document.createElement('span');
  ellipsis.className = 'page-number';
  ellipsis.textContent = '...';
  ellipsis.style.cursor = 'default';
  ellipsis.style.pointerEvents = 'none';
  pageNumbers.appendChild(ellipsis);
}

// Navigate to specific page
function goToPage(pageNum) {
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  if (pageNum < 1 || pageNum > totalPages) return;
  
  currentPage = pageNum;
  displayCurrentPage();
  
  // Scroll to top when page changes
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Create image card
function createImageCard(image) {
  const uploadDate = new Date(image.timestamp.seconds * 1000).toLocaleDateString('ko-KR');
  const fileSize = (image.fileSize / 1024 / 1024).toFixed(2);
  
  return `
    <div class="image-card" data-id="${image.id}">
      <div class="image-thumbnail">
        <img src="${image.imageUrl}" alt="${image.originalName}" loading="lazy">
      </div>
      <div class="image-info">
        <h3 class="image-title">${image.userName}</h3>
        <p class="image-details">Grade ${image.grade} Class ${image.classNumber}</p>
        <p class="image-date">${uploadDate}</p>
        <p class="image-size">${fileSize} MB</p>
        ${image.description ? `<p class="image-description">${image.description}</p>` : ''}
      </div>
    </div>
  `;
}

// Open image modal
function openImageModal(imageData) {
  currentImageData = imageData;
  
  const uploadDate = new Date(imageData.timestamp.seconds * 1000).toLocaleString('ko-KR');
  const fileSize = (imageData.fileSize / 1024 / 1024).toFixed(2);
  
  // Display image loading status
  modalImageContainer.innerHTML = `
    <div style="color: white; text-align: center;">Loading image...</div>
  `;
  
  // Create and load image
  const img = new Image();
  img.onload = function() {
    modalImageContainer.innerHTML = `
      <img src="${imageData.imageUrl}" alt="${imageData.originalName}" class="modal-image">
    `;
  };
  img.onerror = function() {
    modalImageContainer.innerHTML = `
      <div style="color: white; text-align: center; padding: 20px;">
        <p>Cannot load image.</p>
        <p>URL: ${imageData.imageUrl}</p>
      </div>
    `;
  };
  img.src = imageData.imageUrl;
  
  modalImageInfo.innerHTML = `
    <h3>${imageData.userName}</h3>
    <p><strong>Grade/Class:</strong> Grade ${imageData.grade} Class ${imageData.classNumber}</p>
    <p><strong>Upload Time:</strong> ${uploadDate}</p>
    <p><strong>File Name:</strong> ${imageData.originalName}</p>
    <p><strong>File Size:</strong> ${fileSize} MB</p>
    ${imageData.description ? `<p><strong>설명:</strong> ${imageData.description}</p>` : ''}
    <p><strong>Image URL:</strong> <span class="url-text">${imageData.imageUrl}</span></p>
  `;
  
  imageModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Close image modal
function closeImageModal() {
  imageModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  currentImageData = null;
}

// Handle image deletion
async function handleDeleteImage() {
  if (!currentImageData) return;
  
  const result = await showConfirm(
    'Delete Image', 
    `Do you want to delete ${currentImageData.userName}'s image?\nThis action cannot be undone.`,
    'Delete',
    'Cancel'
  );
  
  if (!result.isConfirmed) {
    return;
  }
  
  try {
    console.log('Image deletion started:', currentImageData.fileName);
    
    // Delete image file from Storage
    await deleteImage(currentImageData.filePath);
    console.log('Image deletion completed from Storage');
    
    // Delete image data from Firestore
    await deleteImageData(currentImageData.id);
    console.log('Data deletion completed from Firestore');
    
    showSuccess('Deletion Complete', 'Image has been successfully deleted.');
    closeImageModal();
    
    // Refresh list (maintain current page, adjust if page is out of range)
    await loadImageList();
    
    // If current page exceeds total pages, go to last page
    const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
    if (currentPage > totalPages) {
      currentPage = Math.max(1, totalPages);
    }
    displayCurrentPage();
    
  } catch (error) {
    console.error('Image deletion failed:', error);
    showError('Deletion Failed', 'Failed to delete image. Please try again.');
  }
}

// Handle URL copy
function handleCopyUrl() {
  if (!currentImageData) return;
  
  navigator.clipboard.writeText(currentImageData.imageUrl).then(() => {
    showToast('URL has been copied to clipboard!', 'success');
  }).catch(err => {
    console.error('URL copy failed:', err);
    // Alternative method
    const textArea = document.createElement('textarea');
    textArea.value = currentImageData.imageUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('URL has been copied to clipboard!', 'success');
  });
}

// UI state management functions
function showLoading() {
  hideAllSections();
  loadingSection.style.display = 'block';
}

function hideLoading() {
  loadingSection.style.display = 'none';
}

function showImageList() {
  hideAllSections();
  imageListSection.style.display = 'block';
}

function showEmptyMessage() {
  hideAllSections();
  emptyMessage.style.display = 'block';
}

function showErrorMessage(message) {
  hideAllSections();
  emptyMessage.innerHTML = `
    <p>${message}</p>
    <button onclick="location.reload()" class="refresh-button">Try Again</button>
  `;
  emptyMessage.style.display = 'block';
}

function hideAllSections() {
  imageListSection.style.display = 'none';
  emptyMessage.style.display = 'none';
}
