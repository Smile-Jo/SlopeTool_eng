// Image upload function module
import { checkAuthState } from './auth.js';
import { uploadImage, addImageData } from './firebaseConfig.js';
import { showError, showSuccess, showWarning, showLoading, showConfirm } from './alerts.js';

// DOM elements
let authCheck, uploadForm, uploadButton, cancelButton, imageFile, imagePreview, uploadProgress, progressFill;

// Page load initialization
document.addEventListener('DOMContentLoaded', async () => {
  // DOM element references
  authCheck = document.getElementById('authCheck');
  uploadForm = document.getElementById('uploadForm');
  uploadButton = document.getElementById('uploadButton');
  cancelButton = document.getElementById('cancelButton');
  imageFile = document.getElementById('imageFile');
  imagePreview = document.getElementById('imagePreview');
  uploadProgress = document.getElementById('uploadProgress');
  progressFill = document.getElementById('progressFill');

  // Check authentication status
  await checkUserAuth();
  
  // Set up event listeners
  setupEventListeners();
});

// Check user authentication status
async function checkUserAuth() {
  try {
    const user = await checkAuthState();
    
    if (user) {
      // Authenticated user
      authCheck.style.display = 'none';
      uploadForm.style.display = 'block';
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

// Set up event listeners
function setupEventListeners() {
  // File selection preview
  if (imageFile) {
    imageFile.addEventListener('change', handleFileSelect);
  }

  // Form submission
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleFormSubmit);
  }

  // Cancel button
  if (cancelButton) {
    cancelButton.addEventListener('click', handleCancel);
  }
}

// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  
  if (file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showWarning('File Size Exceeded', 'File size must be 5MB or less.');
      imageFile.value = '';
      imagePreview.innerHTML = '';
      return;
    }

    // Check image file format
    if (!file.type.startsWith('image/')) {
      showWarning('Invalid File Format', 'Only image files can be uploaded.');
      imageFile.value = '';
      imagePreview.innerHTML = '';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.innerHTML = `
        <img src="${e.target.result}" alt="미리보기" class="preview-image">
        <p class="file-info">Filename: ${file.name}</p>
        <p class="file-info">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
      `;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.innerHTML = '';
  }
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  
  // Collect form data
  const formData = new FormData(event.target);
  const userName = formData.get('userName').trim();
  const grade = formData.get('grade');
  const classNumber = formData.get('classNumber');
  const description = formData.get('description').trim();
  const file = formData.get('imageFile');

  // Validation check
  if (!userName || !grade || !classNumber || !file) {
    showWarning('Input Field Check', 'Please fill in all required fields.');
    return;
  }

  try {
    // Show upload progress
    showUploadProgress();
    
    // Generate filename (add timestamp to prevent duplicates)
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${grade}grade_${classNumber}class_${userName}.${fileExtension}`;
    const filePath = `images/${fileName}`;

    // Upload image to Firebase Storage
    console.log('Image upload started:', fileName);
    const imageUrl = await uploadImage(file, filePath);
    console.log('Image upload completed:', imageUrl);

    // Save image info to Firestore
    const imageData = {
      fileName: fileName,
      originalName: file.name,
      userName: userName,
      grade: parseInt(grade),
      classNumber: parseInt(classNumber),
      description: description,
      imageUrl: imageUrl,
      filePath: filePath,
      timestamp: new Date(),
      fileSize: file.size
    };

    console.log('Image data save started');
    await addImageData(imageData);
    console.log('Image data save completed');

    // Success message and redirect
    await showSuccess('Upload Complete', 'Image uploaded successfully!');
    window.location.href = './imageList.html';

  } catch (error) {
    console.error('Upload failed:', error);
    showError('Upload Failed', 'Upload failed. Please try again.');
    hideUploadProgress();
  }
}

// Handle cancel button
async function handleCancel() {
  const result = await showConfirm(
    'Cancel Writing',
    'All content being written will be lost. Do you want to continue?',
    'Yes, Cancel',
    'No'
  );
  
  if (result.isConfirmed) {
    window.location.href = './index.html';
  }
}

// Show upload progress
function showUploadProgress() {
  uploadForm.style.display = 'none';
  uploadProgress.style.display = 'block';
  
  // Progress bar animation (simulation)
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress > 90) {
      progress = 90;
      clearInterval(interval);
    }
    progressFill.style.width = `${progress}%`;
  }, 200);
}

// Hide upload progress
function hideUploadProgress() {
  uploadProgress.style.display = 'none';
  uploadForm.style.display = 'block';
  progressFill.style.width = '0%';
}
