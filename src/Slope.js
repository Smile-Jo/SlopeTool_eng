import * as THREE from 'three';
import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js';
import { showError, showWarning } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  startButton.addEventListener('click', async () => {

    // Get input values
    const baseLength = parseFloat(document.getElementById('baseLength').value / 5);
    const heightLength = parseFloat(document.getElementById('heightLength').value / 5);

    // Input value validation
    if (isNaN(baseLength) || isNaN(heightLength) || baseLength <= 0 || heightLength <= 0) {
      showWarning('Input Error', 'Please enter valid base and height values.');
      return;
    }

    // Hide input container after successful validation when starting AR
    document.querySelector('.input-container').style.display = 'none';

    // Calculate hypotenuse length
    const hypotenuseLength = Math.sqrt(baseLength * baseLength + heightLength * heightLength);

    // Initialize MindAR
    const mindarThree = new MindARThree({
      container: document.getElementById('container'),  // AR rendering container
      imageTargetSrc: './Target.mind' // Target file for image recognition
    });
    
    const { renderer, scene, camera } = mindarThree;

    try {
      // Start AR and display camera feed as background
      await mindarThree.start();
    } catch (error) {
      console.error("MindAR startup error:", error);
      
      // Provide specific error messages
      let errorTitle = "AR Initialization Failed";
      let errorMessage = "";
      
      if (error.name === 'NotFoundError' || error.message.includes('getUserMedia')) {
        errorMessage = "Cannot access camera. Please check camera permissions or run in HTTPS environment.";
      } else if (error.message.includes('Target.mind')) {
        errorMessage = "Cannot find Target.mind file. Please check the file path.";
      } else {
        errorMessage = "Cannot initialize AR system. Please try again.";
      }
      
      showError(errorTitle, errorMessage);
      document.querySelector('.input-container').style.display = 'block';
      return;
    }

    // AR objects
    // Define right triangle shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);  // First vertex
    shape.lineTo(baseLength, 0);  // Second vertex (right angle point)
    shape.lineTo(baseLength, heightLength);  // Third vertex
    shape.lineTo(0, 0);  // Close triangle

    const geometry1 = new THREE.PlaneGeometry(baseLength, 1);
    const geometry2 = new THREE.PlaneGeometry(heightLength, 1);
    const geometry3 = new THREE.PlaneGeometry(hypotenuseLength, 1); // 빗변 평면
    const geometry4 = new THREE.ShapeGeometry(shape);

    const edge1 = new THREE.EdgesGeometry(geometry1); // Calculate mesh edges
    const edge2 = new THREE.EdgesGeometry(geometry2); // Calculate mesh edges
    const edge3 = new THREE.EdgesGeometry(geometry3); // Calculate mesh edges
    const edge4 = new THREE.EdgesGeometry(geometry4); // Calculate mesh edges
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000}); // Set line thickness
    const edgeLine1 = new THREE.LineSegments(edge1, edgeMaterial); // Add line to edge
    const edgeLine2 = new THREE.LineSegments(edge2, edgeMaterial); // Add line to edge
    const edgeLine3 = new THREE.LineSegments(edge3, edgeMaterial); // Add line to edge
    const edgeLine4 = new THREE.LineSegments(edge4, edgeMaterial); // Add line to edge
    const edgeLine5 = new THREE.LineSegments(edge4, edgeMaterial); // Add line to edge

    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      opacity: 0.7,  // Set low value for higher transparency
      transparent: true // Must be set to true to apply transparency
    });
    const plane1 = new THREE.Mesh(geometry1, material);
    const plane2 = new THREE.Mesh(geometry2, material);
    const plane3 = new THREE.Mesh(geometry3, material); // 빗변 평면
    const triangle1 = new THREE.Mesh(geometry4, material);
    const triangle2 = new THREE.Mesh(geometry4, material);

    // Set plane position
    plane2.position.set(baseLength / 2, 0, heightLength / 2); // Start from end of plane1, positioned vertically
    plane2.rotation.y = THREE.MathUtils.degToRad(90); // Rotate 90 degrees along y-axis
    edgeLine2.position.set(baseLength / 2, 0, heightLength / 2); 
    edgeLine2.rotation.y = THREE.MathUtils.degToRad(90); 

    plane3.position.set(0, 0, heightLength / 2); // Position plane3 correctly
    plane3.rotation.y = -Math.atan2(heightLength, baseLength); // Hypotenuse rotation
    edgeLine3.position.set(0, 0, heightLength / 2); 
    edgeLine3.rotation.y = -Math.atan2(heightLength, baseLength); 

    triangle1.rotation.x = THREE.MathUtils.degToRad(90);
    triangle1.position.set(- baseLength / 2, 1/2, 0);
    edgeLine4.rotation.x = THREE.MathUtils.degToRad(90);
    edgeLine4.position.set(- baseLength / 2, 1/2, 0);

    triangle2.rotation.x = THREE.MathUtils.degToRad(90);
    triangle2.position.set(- baseLength / 2, -1/2, 0);
    edgeLine5.rotation.x = THREE.MathUtils.degToRad(90);
    edgeLine5.position.set(- baseLength / 2, -1/2, 0);

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(plane1);
    anchor.group.add(plane2);
    anchor.group.add(plane3);
    anchor.group.add(triangle1);
    anchor.group.add(triangle2);
    anchor.group.add(edgeLine1);
    anchor.group.add(edgeLine2);
    anchor.group.add(edgeLine3);
    anchor.group.add(edgeLine4);
    anchor.group.add(edgeLine5);

    // Start rendering loop
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  });
});
