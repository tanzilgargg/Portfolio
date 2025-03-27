const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Get UI elements
const angleSlider = document.getElementById('angleSlider');
const lengthSlider = document.getElementById('lengthSlider');
const shrinkSlider = document.getElementById('shrinkSlider');
const speedSlider = document.getElementById('speedSlider');
const randomizeBtn = document.getElementById('randomize');

// Value display elements
const angleValue = document.getElementById('angleValue');
const lengthValue = document.getElementById('lengthValue');
const shrinkValue = document.getElementById('shrinkValue');
const speedValue = document.getElementById('speedValue');

// Tree parameters
let minBranchLength = 5;
let branchAngle = Math.PI / 6;
let branchShrinkFactor = 0.67;
let colorSpeed = 0.5;
let hue = 180; // Start with cyan for main tree
let hue2 = 300; // Purple for left tree
let hue3 = 60; // Yellow for right tree

// Particle system
const particles = [];
const particleCount = 100;

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// Audio analysis parameters
let audioContext;
let analyser;
let dataArray;
let audioSource;
let isAudioActive = false;

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Audio setup
async function setupAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioSource = audioContext.createMediaStreamSource(stream);
        audioSource.connect(analyser);
        isAudioActive = true;
    } catch (error) {
        console.error('Error accessing audio:', error);
        isAudioActive = false;
    }
}

function updateValues() {
    branchAngle = (angleSlider.value * Math.PI) / 180;
    branchShrinkFactor = shrinkSlider.value / 100;
    colorSpeed = speedSlider.value / 10;
    
    // Update display values
    angleValue.textContent = angleSlider.value + '°';
    lengthValue.textContent = lengthSlider.value + '%';
    shrinkValue.textContent = branchShrinkFactor.toFixed(2);
    speedValue.textContent = colorSpeed.toFixed(1);
}

function randomize() {
    angleSlider.value = Math.floor(Math.random() * 90);
    lengthSlider.value = Math.floor(Math.random() * 40) + 10;
    shrinkSlider.value = Math.floor(Math.random() * 40) + 50;
    speedSlider.value = Math.floor(Math.random() * 20);
    hue = Math.random() * 360;
    hue2 = (hue + 120) % 360;
    hue3 = (hue + 240) % 360;
    updateValues();
}

// Event listeners
angleSlider.addEventListener('input', updateValues);
lengthSlider.addEventListener('input', updateValues);
shrinkSlider.addEventListener('input', updateValues);
speedSlider.addEventListener('input', updateValues);
randomizeBtn.addEventListener('click', randomize);

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawTree(x, y, length, angle, depth, treeHue) {
    if (length < minBranchLength) return;

    // Calculate end point
    const endX = x + length * Math.cos(angle);
    const endY = y - length * Math.sin(angle);

    // Draw glow effect
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 - depth * 0.01})`;
    ctx.lineWidth = Math.max(depth * 2, 2);
    ctx.stroke();

    // Draw main branch
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `hsl(${treeHue + depth * 5}, 100%, ${50 + depth * 2}%)`;
    ctx.lineWidth = Math.max(depth * 0.5, 0.5);
    ctx.stroke();

    // Recursively draw branches
    drawTree(endX, endY, length * branchShrinkFactor, angle + branchAngle, depth + 1, treeHue);
    drawTree(endX, endY, length * branchShrinkFactor, angle - branchAngle, depth + 1, treeHue);
}

function animate() {
    // Create fade effect
    ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid();

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Update tree parameters based on audio
    if (isAudioActive) {
        analyser.getByteFrequencyData(dataArray);
        
        // Use average frequency to affect tree parameters
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        // Map audio intensity to tree parameters
        const audioIntensity = average / 255; // Normalize to 0-1
        
        // Modify tree parameters based on audio
        branchAngle = (angleSlider.value * Math.PI / 180) * (1 + audioIntensity * 0.5);
        branchShrinkFactor = (shrinkSlider.value / 100) * (1 + audioIntensity * 0.3);
        colorSpeed = (speedSlider.value / 10) * (1 + audioIntensity * 2);
    }

    // Draw trees
    const treeHeight = (canvas.height * lengthSlider.value) / 100;
    
    // Left tree (purple)
    drawTree(
        canvas.width * 0.25,
        canvas.height,
        treeHeight * 0.8,
        Math.PI / 2,
        0,
        hue2
    );

    // Center tree (cyan)
    drawTree(
        canvas.width / 2,
        canvas.height,
        treeHeight,
        Math.PI / 2,
        0,
        hue
    );

    // Right tree (yellow)
    drawTree(
        canvas.width * 0.75,
        canvas.height,
        treeHeight * 0.8,
        Math.PI / 2,
        0,
        hue3
    );

    // Slowly change hues
    hue = (hue + colorSpeed) % 360;
    hue2 = (hue2 + colorSpeed) % 360;
    hue3 = (hue3 + colorSpeed) % 360;
    
    requestAnimationFrame(animate);
}

// Initialize values and audio
updateValues();
setupAudio();

// Start animation
animate();
