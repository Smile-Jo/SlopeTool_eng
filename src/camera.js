// Camera-related function module
import { showError } from './alerts.js';

// Start camera - mobile optimized
export async function startCamera() {
  try {
    let stream;
    
    // Check mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check user media support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('This browser does not support camera functionality.');
    }
    
    try {
      // 1st attempt: Force rear camera setting on mobile
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: isMobile ? 1280 : 1920 },
          height: { ideal: isMobile ? 720 : 1080 }
        }
      };
      
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Rear camera connection successful (exact environment)');
    } catch (error) {
      console.log('1st attempt failed, trying 2nd attempt...', error);
      
      try {
        // 2nd attempt: Try with ideal mode
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: isMobile ? 1280 : 1920 },
            height: { ideal: isMobile ? 720 : 1080 }
          }
        });
        console.log('Rear camera connection successful (ideal environment)');
      } catch (error2) {
        console.log('2nd attempt failed, trying with device list...', error2);
        
        try {
          // 3rd attempt: Select rear camera through device list
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          console.log('Available camera list:', videoDevices);

          // Find rear camera (search with more diverse keywords)
          const backCamera = videoDevices.find(device => {
            const label = device.label.toLowerCase();
            return label.includes('back') || 
                   label.includes('rear') || 
                   label.includes('environment') ||
                   label.includes('camera2') ||
                   label.includes('0') ||
                   (!label.includes('front') && !label.includes('user') && !label.includes('facing'));
          }) || videoDevices[videoDevices.length - 1]; // Try last camera

          if (backCamera && backCamera.deviceId) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: backCamera.deviceId },
                width: { ideal: isMobile ? 1280 : 1920 },
                height: { ideal: isMobile ? 720 : 1080 }
              }
            });
            console.log('Rear camera connection successful (deviceId):', backCamera.label);
          } else {
            throw new Error('Cannot find rear camera');
          }
        } catch (error3) {
          console.log('3rd attempt failed, using default camera...', error3);
          
          // 4th attempt: Access camera with minimal settings
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
          console.log('Default camera connection successful');
        }
      }
    }

    const videoElement = document.getElementById('video');
    if (videoElement) {
      videoElement.srcObject = stream;
      
      // Set attributes for mobile autoplay
      videoElement.setAttribute('playsinline', 'true');
      videoElement.setAttribute('autoplay', 'true');
      videoElement.setAttribute('muted', 'true');
      videoElement.muted = true; // Allow autoplay with mute
      
      // Wait for video load completion then attempt playback
      return new Promise((resolve, reject) => {
        const playVideo = async () => {
          try {
            await videoElement.play();
            console.log('Video playback successful');
            resolve();
          } catch (e) {
            console.warn('Video autoplay failed (user interaction required):', e);
            // Retry after user interaction
            const userInteractionHandler = async () => {
              try {
                await videoElement.play();
                console.log('Video playback successful after user interaction');
                resolve();
              } catch (retryError) {
                console.error('Playback failed even after user interaction:', retryError);
                reject(retryError);
              }
            };

            document.body.addEventListener('touchstart', userInteractionHandler, { once: true });
            document.body.addEventListener('click', userInteractionHandler, { once: true });
          }
        };

        videoElement.addEventListener('loadedmetadata', () => {
          console.log('Video metadata loading complete');
          console.log('Video size:', videoElement.videoWidth, 'x', videoElement.videoHeight);
          playVideo();
        }, { once: true });

        videoElement.addEventListener('canplay', () => {
          console.log('Video ready for playback');
          playVideo();
        }, { once: true });

        // Immediate playback attempt (for already loaded cases)
        if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA state
          playVideo();
        }
      });
    }
    
    // Camera info log
    const track = stream.getVideoTracks()[0];
    if (track) {
      const settings = track.getSettings();
      console.log('Current camera settings:', settings);
      console.log('Camera label:', track.label);
      console.log('Camera facing mode:', settings.facingMode);
    }
    
  } catch (error) {
    console.error('Camera access error:', error);
    
    let errorTitle = "Camera Access Failed";
    let errorMessage = "";
    
    if (error.name === 'NotAllowedError') {
      errorMessage = "Camera permission was denied. Please allow camera permission in browser settings.";
    } else if (error.name === 'NotFoundError') {
      errorMessage = "Camera not found. Please check if camera is connected.";
    } else if (error.name === 'NotSupportedError') {
      errorMessage = "Browser does not support camera. Please try a different browser.";
    } else {
      errorMessage = `Cannot access camera. Error: ${error.message}`;
    }
    
    showError(errorTitle, errorMessage);
  }
}
