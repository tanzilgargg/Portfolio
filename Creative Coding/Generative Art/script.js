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
let hue = 120;

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

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
    updateValues();
}

// Event listeners
angleSlider.addEventListener('input', updateValues);
lengthSlider.addEventListener('input', updateValues);
shrinkSlider.addEventListener('input', updateValues);
speedSlider.addEventListener('input', updateValues);
randomizeBtn.addEventListener('click', randomize);

function drawTree(x, y, length, angle, depth) {
    if (length < minBranchLength) return;

    // Calculate end point
    const endX = x + length * Math.cos(angle);
    const endY = y - length * Math.sin(angle);

    // Draw branch
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `hsl(${hue + depth * 5}, 100%, ${50 + depth * 2}%)`;
    ctx.lineWidth = Math.max(depth * 0.5, 0.5);
    ctx.stroke();

    // Recursively draw branches
    drawTree(endX, endY, length * branchShrinkFactor, angle + branchAngle, depth + 1);
    drawTree(endX, endY, length * branchShrinkFactor, angle - branchAngle, depth + 1);
}

function animate() {
    ctx.fillStyle = 'rgba(26, 26, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tree from bottom center
    drawTree(
        canvas.width / 2,
        canvas.height,
        (canvas.height * lengthSlider.value) / 100,
        Math.PI / 2,
        0
    );

    // Slowly change hue
    hue = (hue + colorSpeed) % 360;
    
    requestAnimationFrame(animate);
}

// Initialize values
updateValues();

// Start animation
animate();
