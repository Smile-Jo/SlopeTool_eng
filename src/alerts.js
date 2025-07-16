// User-friendly alert message module using SweetAlert2
import Swal from 'sweetalert2';

// Common configuration
const commonConfig = {
  heightAuto: false,
  customClass: {
    container: 'swal-container-fixed'
  }
};

// Success message
export function showSuccess(title, text = '') {
  return Swal.fire({
    ...commonConfig,
    icon: 'success',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#4CAF50',
    timer: 3000,
    timerProgressBar: true
  });
}

// Error message
export function showError(title, text = '') {
  return Swal.fire({
    ...commonConfig,
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#f44336'
  });
}

// Warning message
export function showWarning(title, text = '') {
  return Swal.fire({
    ...commonConfig,
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ff9800'
  });
}

// Info message
export function showInfo(title, text = '') {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#2196F3'
  });
}

// Confirmation dialog
export function showConfirm(title, text = '', confirmText = 'OK', cancelText = 'Cancel') {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#2196F3',
    cancelButtonColor: '#6c757d'
  });
}

// Loading message
export function showLoading(title = 'Processing...') {
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

// Toast message (small notification)
export function showToast(title, icon = 'success') {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: icon,
    title: title
  });
}
