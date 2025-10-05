const video = document.getElementById('input');
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

let running = true;
let cursor = { x: canvas.width/2, y: canvas.height/2, visible: false };
let clicked = false;
let clickCooldown = 0; // frames
let square = { x: 380, y: 210, w: 200, h: 120, on: false };
let particles = [];
let rippleEffect = null;
let time = 0;

// New feature states
let accessibilityMode = false;
let gestureHistory = [];
let onboardingStep = 0;
let onboardingComplete = false;
let idleTimer = 0;
let idleThreshold = 300; // 5 seconds at 60fps
let cursorStyle = 'default'; // 'default', 'emoji', 'trail', 'shape'
let ghostTrail = [];
let errorFrames = 0;
let errorThreshold = 30; // 0.5 seconds
let soundEnabled = true;
let snapEnabled = true;
let privacyMode = false;
let peaceGestureDetected = false;
let peaceGestureTimer = 0;
let peaceGestureCooldown = 0;

const PINCH_THRESHOLD = 0.04; // normalized distance (~4% of frame diag)
const SMOOTHING = 0.25;       // 0..1 (higher = snappier, lower = smoother)

// Map normalized [0..1] to canvas pixels
function toCanvasXY(normX, normY) {
  return { x: normX * canvas.width, y: normY * canvas.height };
}

function lerp(a, b, t) { return a + (b - a) * t; }

// Particle system for visual effects
class Particle {
  constructor(x, y, color = '#4ade80') {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 1.0;
    this.decay = 0.02;
    this.color = color;
    this.size = Math.random() * 3 + 1;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vx *= 0.98;
    this.vy *= 0.98;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Ripple effect for interactions
class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = 60;
    this.life = 1.0;
    this.decay = 0.05;
  }
  
  update() {
    this.radius += 2;
    this.life -= this.decay;
  }
  
  draw(ctx) {
    if (this.life <= 0) return;
    
    ctx.save();
    ctx.globalAlpha = this.life * 0.6;
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// Ghost trail point
class GhostPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 1.0;
    this.decay = 0.02;
  }
  
  update() {
    this.life -= this.decay;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life * 0.3;
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Sound feedback
function playClickSound() {
  if (!soundEnabled) return;
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Visual flash effect
function flashScreen() {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    pointer-events: none;
    animation: flash 0.1s ease-out;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flash {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(flash);
  
  setTimeout(() => {
    document.body.removeChild(flash);
    document.head.removeChild(style);
  }, 100);
}

// Snap to target detection
function checkSnapToTarget(cursorX, cursorY, targetX, targetY, targetW, targetH) {
  const centerX = targetX + targetW / 2;
  const centerY = targetY + targetH / 2;
  const distance = Math.hypot(cursorX - centerX, cursorY - centerY);
  const snapRadius = 50;
  
  if (distance < snapRadius) {
    const snapStrength = 1 - (distance / snapRadius);
    cursor.x = lerp(cursor.x, centerX, snapStrength * 0.3);
    cursor.y = lerp(cursor.y, centerY, snapStrength * 0.3);
    return true;
  }
  return false;
}

// Peace gesture detection (index + middle finger extended)
function detectPeaceGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;
  
  // In MediaPipe, Y coordinates are inverted (0 is top, 1 is bottom)
  // So extended fingers have LOWER Y values (closer to 0)
  
  // Check if index and middle fingers are extended while others are down
  const indexExtended = landmarks[8].y < landmarks[6].y; // index tip above PIP
  const middleExtended = landmarks[12].y < landmarks[10].y; // middle tip above PIP
  
  // Make ring and pinky detection less strict (they might be partially extended)
  const ringDown = landmarks[16].y > landmarks[14].y - 0.05; // ring tip below or near PIP
  const pinkyDown = landmarks[20].y > landmarks[18].y - 0.05; // pinky tip below or near PIP
  
  // Thumb can be in any position for peace gesture
  const thumbExtended = landmarks[4].y < landmarks[3].y; // thumb tip above thumb IP
  
  // Peace gesture: index and middle extended, ring and pinky down, thumb can be either
  return indexExtended && middleExtended && ringDown && pinkyDown;
}

function draw() {
  time += 0.016;
  
  // Clear with subtle gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#0a0c10');
  gradient.addColorStop(1, '#1a1d29');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Privacy mode overlay
  if (privacyMode) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔒 Privacy Mode Active', canvas.width/2, canvas.height/2);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('Make peace gesture (✌️) to resume', canvas.width/2, canvas.height/2 + 40);
    requestAnimationFrame(draw);
    return;
  }

  // Add animated background particles
  if (Math.random() < 0.1) {
    particles.push(new Particle(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
    ));
  }

  // Update and draw particles
  particles = particles.filter(particle => {
    particle.update();
    particle.draw(ctx);
    return particle.life > 0;
  });

  // Update and draw ghost trail
  ghostTrail = ghostTrail.filter(point => {
    point.update();
    point.draw(ctx);
    return point.life > 0;
  });

  // Add new ghost trail point if cursor is visible
  if (cursor.visible) {
    ghostTrail.push(new GhostPoint(cursor.x, cursor.y));
    if (ghostTrail.length > 20) ghostTrail.shift(); // Limit trail length
  }

  // Accessibility mode adjustments
  const squareSize = accessibilityMode ? { w: square.w * 1.5, h: square.h * 1.5 } : { w: square.w, h: square.h };
  const squarePos = accessibilityMode ? 
    { x: square.x - (squareSize.w - square.w) / 2, y: square.y - (squareSize.h - square.h) / 2 } : 
    { x: square.x, y: square.y };

  // Enhanced target square with gradient and glow
  const squareGradient = ctx.createLinearGradient(squarePos.x, squarePos.y, squarePos.x + squareSize.w, squarePos.y + squareSize.h);
  if (square.on) {
    squareGradient.addColorStop(0, accessibilityMode ? '#22c55e' : '#4ade80');
    squareGradient.addColorStop(1, accessibilityMode ? '#16a34a' : '#22c55e');
  } else {
    squareGradient.addColorStop(0, accessibilityMode ? '#1d4ed8' : '#3b82f6');
    squareGradient.addColorStop(1, accessibilityMode ? '#1e40af' : '#1d4ed8');
  }
  
  // Add glow effect
  ctx.shadowColor = square.on ? (accessibilityMode ? '#22c55e' : '#4ade80') : (accessibilityMode ? '#1d4ed8' : '#3b82f6');
  ctx.shadowBlur = accessibilityMode ? 30 : 20;
  ctx.fillStyle = squareGradient;
  ctx.fillRect(squarePos.x, squarePos.y, squareSize.w, squareSize.h);
  ctx.shadowBlur = 0;
  
  // Add border with subtle animation
  ctx.strokeStyle = square.on ? (accessibilityMode ? '#22c55e' : '#4ade80') : (accessibilityMode ? '#1d4ed8' : '#3b82f6');
  ctx.lineWidth = accessibilityMode ? 4 : 2;
  ctx.strokeRect(squarePos.x, squarePos.y, squareSize.w, squareSize.h);
  
  // Enhanced text with better styling
  ctx.fillStyle = accessibilityMode ? '#000000' : '#ffffff';
  ctx.font = accessibilityMode ? 'bold 24px Inter, sans-serif' : 'bold 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(square.on ? 'ON' : 'OFF', squarePos.x + squareSize.w/2, squarePos.y + squareSize.h/2 + (accessibilityMode ? 8 : 6));

  // Snap to target effect
  if (snapEnabled && cursor.visible) {
    const snapped = checkSnapToTarget(cursor.x, cursor.y, squarePos.x, squarePos.y, squareSize.w, squareSize.h);
    if (snapped) {
      // Draw magnetic pull effect
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cursor.x, cursor.y);
      ctx.lineTo(squarePos.x + squareSize.w/2, squarePos.y + squareSize.h/2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Enhanced cursor with different styles
  if (cursor.visible) {
    const pulse = Math.sin(time * 8) * 0.1 + 0.9;
    const cursorSize = accessibilityMode ? 20 : 12;
    
    if (cursorStyle === 'emoji') {
      // Emoji cursor
      ctx.font = `${cursorSize * 2}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('👆', cursor.x, cursor.y + cursorSize);
    } else if (cursorStyle === 'shape') {
      // Triangle cursor
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(cursor.x, cursor.y - cursorSize);
      ctx.lineTo(cursor.x - cursorSize, cursor.y + cursorSize);
      ctx.lineTo(cursor.x + cursorSize, cursor.y + cursorSize);
      ctx.closePath();
      ctx.fill();
    } else {
      // Default cursor with pulsing effect
      // Outer glow
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, (25 + (accessibilityMode ? 10 : 0)) * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
      ctx.lineWidth = accessibilityMode ? 5 : 3;
      ctx.stroke();
      
      // Inner cursor
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, cursorSize * pulse, 0, Math.PI * 2);
      ctx.fillStyle = accessibilityMode ? '#22c55e' : '#4ade80';
      ctx.fill();
      
      // Center dot
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, accessibilityMode ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  // Enhanced click effect with ripple
  if (clicked) {
    rippleEffect = new Ripple(cursor.x, cursor.y);
    clicked = false;
  }
  
  if (rippleEffect) {
    rippleEffect.update();
    rippleEffect.draw(ctx);
    if (rippleEffect.life <= 0) {
      rippleEffect = null;
    }
  }

  // Error feedback overlay
  if (errorFrames > errorThreshold) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ Hand Not Detected', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('Please position your hand in front of the camera', canvas.width/2, canvas.height/2 + 20);
  }

  // Idle detection overlay
  if (idleTimer > idleThreshold) {
    const fadeAlpha = Math.min((idleTimer - idleThreshold) / 60, 0.8); // Fade over 1 second
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💤 Rest Mode', canvas.width/2, canvas.height/2);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Move your hand to resume', canvas.width/2, canvas.height/2 + 30);
  }

  // Onboarding overlay
  if (!onboardingComplete) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 Hand Cursor Setup', canvas.width/2, 100);
    
    const steps = [
      'Step 1: Position your hand in front of the camera',
      'Step 2: Make sure your hand is well-lit and visible',
      'Step 3: Try pinching to interact with the target'
    ];
    
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText(steps[onboardingStep], canvas.width/2, canvas.height/2);
    
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('Press SPACE to continue', canvas.width/2, canvas.height/2 + 50);
  }

  // Enhanced watermark with better typography
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '14px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Hand as Cursor — MediaPipe Hands', 20, canvas.height - 20);

  // Feature indicators
  if (accessibilityMode) {
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.fillRect(canvas.width - 200, 20, 180, 30);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♿ Accessibility Mode', canvas.width - 110, 40);
  }

  // Peace gesture debug indicator
  if (peaceGestureDetected) {
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.fillRect(canvas.width - 200, 60, 180, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✌️ Peace Gesture Detected', canvas.width - 110, 80);
  }

  requestAnimationFrame(draw);
}

// MediaPipe setup
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,        // fastest
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});
hands.onResults(onResults);

let camera;
async function startCamera() {
  camera = new Camera(video, {
    onFrame: async () => { if (running) await hands.send({image: video}); },
    width: 960, height: 540
  });
  camera.start().catch(err => {
    console.error(err);
    alert('Camera failed to start. Check permissions or use https.');
  });
}

function onResults(results) {
  const landmarksList = results.multiHandLandmarks || [];
  
  // Reset error frames when hand is detected
  if (landmarksList.length > 0) {
    errorFrames = 0;
    idleTimer = 0;
  } else {
    errorFrames++;
    idleTimer++;
    cursor.visible = false;
    return;
  }

  // Use first detected hand
  const lm = landmarksList[0];

  // Peace gesture detection for privacy mode
  if (peaceGestureCooldown > 0) {
    peaceGestureCooldown--;
  }
  
  if (detectPeaceGesture(lm) && peaceGestureCooldown === 0) {
    if (!peaceGestureDetected) {
      peaceGestureDetected = true;
      peaceGestureTimer = 0;
    }
    peaceGestureTimer++;
    
    if (peaceGestureTimer > 30) { // Hold for 0.5 seconds
      privacyMode = !privacyMode;
      peaceGestureTimer = 0;
      peaceGestureCooldown = 60; // 1 second cooldown
      console.log('Privacy mode toggled:', privacyMode ? 'ON' : 'OFF');
    }
  } else {
    if (peaceGestureDetected) {
      // Reset timer when gesture is lost
      peaceGestureTimer = 0;
    }
    peaceGestureDetected = false;
  }

  // Landmarks are normalized [0..1]
  const idxTip = lm[8];   // index finger tip
  const thumbTip = lm[4]; // thumb tip

  const idx = toCanvasXY(idxTip.x, idxTip.y);
  cursor.x = lerp(cursor.x, idx.x, SMOOTHING);
  cursor.y = lerp(cursor.y, idx.y, SMOOTHING);
  cursor.visible = true;

  // Track gesture history for swipe detection
  gestureHistory.push({ x: cursor.x, time: Date.now() });
  if (gestureHistory.length > 10) gestureHistory.shift();

  // Detect swipe gestures
  if (gestureHistory.length >= 5) {
    const recent = gestureHistory.slice(-5);
    const deltaX = recent[recent.length - 1].x - recent[0].x;
    const deltaTime = recent[recent.length - 1].time - recent[0].time;
    
    if (Math.abs(deltaX) > 100 && deltaTime < 500) { // Swipe detected
      if (deltaX > 0) {
        console.log('Swipe right detected');
        // Trigger next action
      } else {
        console.log('Swipe left detected');
        // Trigger back action
      }
    }
  }

  // Pinch detection (use normalized distance in the original space)
  const dx = (idxTip.x - thumbTip.x);
  const dy = (idxTip.y - thumbTip.y);
  const pinchDist = Math.hypot(dx, dy);

  if (clickCooldown > 0) clickCooldown--;

  // Long pinch for accessibility mode toggle
  if (pinchDist < PINCH_THRESHOLD) {
    if (clickCooldown === 0) {
      // Regular click
      const squareSize = accessibilityMode ? { w: square.w * 1.5, h: square.h * 1.5 } : { w: square.w, h: square.h };
      const squarePos = accessibilityMode ? 
        { x: square.x - (squareSize.w - square.w) / 2, y: square.y - (squareSize.h - square.h) / 2 } : 
        { x: square.x, y: square.y };

      // Toggle square if cursor overlaps
      if (cursor.x >= squarePos.x && cursor.x <= squarePos.x + squareSize.w &&
          cursor.y >= squarePos.y && cursor.y <= squarePos.y + squareSize.h) {
        square.on = !square.on;
        
        // Add particle burst effect
        for (let i = 0; i < 15; i++) {
          particles.push(new Particle(
            cursor.x + (Math.random() - 0.5) * 20,
            cursor.y + (Math.random() - 0.5) * 20,
            square.on ? '#4ade80' : '#3b82f6'
          ));
        }
        
        // Sound and visual feedback
        playClickSound();
        flashScreen();
      }
      clicked = true;
      clickCooldown = 12;
    }
  } else if (pinchDist < PINCH_THRESHOLD * 1.5) {
    // Long pinch detection for accessibility mode
    if (clickCooldown === 0) {
      accessibilityMode = !accessibilityMode;
      clickCooldown = 60; // Longer cooldown for mode toggle
    }
  }
}

// Enhanced keyboard controls
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (!onboardingComplete) {
      onboardingStep++;
      if (onboardingStep >= 3) {
        onboardingComplete = true;
      }
    } else {
      running = !running;
    }
  }
  
  // Cursor style cycling
  if (e.code === 'KeyC') {
    const styles = ['default', 'emoji', 'shape'];
    const currentIndex = styles.indexOf(cursorStyle);
    cursorStyle = styles[(currentIndex + 1) % styles.length];
  }
  
  // Toggle features
  if (e.code === 'KeyA') accessibilityMode = !accessibilityMode;
  if (e.code === 'KeyS') soundEnabled = !soundEnabled;
  if (e.code === 'KeyN') snapEnabled = !snapEnabled;
  if (e.code === 'KeyP') privacyMode = !privacyMode;
});

startCamera();
requestAnimationFrame(draw);
