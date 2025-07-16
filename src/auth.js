// Authentication-related functions module
import { auth, signInWithGooglePopup, signInWithGoogleRedirect, getRedirectResultHandler, logOut } from './firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { showError, showSuccess } from './alerts.js';

// DOM elements
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loginSection = document.getElementById('loginSection');
const userSection = document.getElementById('userSection');
const userInfo = document.getElementById('userInfo');
const authenticatedFeatures = document.getElementById('authenticatedFeatures');

// Set up authentication state listener on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Simply check redirect result like React example
  try {
    const result = await getRedirectResultHandler();
    if (result) {
      console.log('Redirect login successful:', result.user.displayName);
    }
  } catch (error) {
    console.error('Redirect login error:', error);
  }
  
  // Authentication state change detection (same method as React example)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User logged in:', user.displayName);
      showUserSection(user);
    } else {
      console.log('User logged out');
      showLoginSection();
    }
  });

  // Login button event
  if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
  }

  // Logout button event
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
});

// Login handling (force account selection for Safari)
async function handleLogin() {
  try {
    // Additional handling to force account selection in Safari
    console.log('Login attempt - force display account selection screen');
    
    // First try popup method (same as React example)
    console.log('Attempting popup login');
    const result = await signInWithGooglePopup();
    console.log('Login successful:', result.user.displayName);
  } catch (error) {
    console.error('Popup login failed:', error);
    
    // Try redirect if popup is blocked or on mobile
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      try {
        console.log('Popup failed - retry with redirect method (force account selection)');
        await signInWithGoogleRedirect();
      } catch (redirectError) {
        console.error('Redirect login also failed:', redirectError);
        showError('Login Failed', 'Login failed. Please check your internet connection.');
      }
    } else {
      let errorMessage = 'Login failed.';
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Please check your network connection.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for authentication.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google login is not enabled.';
      }
      showError('Login Failed', errorMessage);
    }
  }
}

async function handleLogout() {
  try {
    // Only perform Firebase logout (keep Google account in browser)
    await logOut();
    console.log('Firebase logout successful');
  } catch (error) {
    console.error('Logout failed:', error);
    showError('Logout Failed', 'Logout failed. Please try again.');
  }
}

// Show user section
function showUserSection(user) {
  console.log('Show user section:', user.displayName);
  if (loginSection) loginSection.style.display = 'none';
  if (userSection) userSection.style.display = 'block';
  if (userInfo) userInfo.textContent = `👤 ${user.displayName}`;
  if (authenticatedFeatures) authenticatedFeatures.style.display = 'block';
}

// Show login section
function showLoginSection() {
  console.log('Show login section');
  if (loginSection) loginSection.style.display = 'block';
  if (userSection) userSection.style.display = 'none';
  if (authenticatedFeatures) authenticatedFeatures.style.display = 'none';
}

// Get current user info (for use in other pages)
export function getCurrentUser() {
  return auth.currentUser;
}

// Check authentication state (for use in other pages)
export function checkAuthState() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
