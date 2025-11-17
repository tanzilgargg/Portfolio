// Futuristic Bloch sphere with RGB / HSV color mapping

// tiny math helpers so the rest of the code reads easier
const clamp = (value, min = -1, max = 1) => Math.min(max, Math.max(min, value));
const degToRad = (deg) => (deg * Math.PI) / 180;
const radToDeg = (rad) => (rad * 180) / Math.PI;

class BlochSphere {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.theta = Math.PI / 2;
        this.phi = 0;
        this.rotationX = 20;
        this.rotationY = 45;
        this.autoRotate = true;
        this.rotationSpeed = 0.35;
        this.mode = 'rgb';
        this.hudDirty = true;

        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            this.hudDirty = true;
        });

        // hook up mouse + keyboard before we ever draw
        this.setupEventListeners();
        // connect all the HUD sliders to internal state
        this.setupUI(ui);
        // start the animation loop
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) * 0.35;
    }

    setupUI(ui) {
        if (!ui) return;
        this.controls = ui;

        const {
            thetaControl,
            phiControl,
            collapseControl,
            tiltControl,
            spinControl,
            modeButtons,
        } = ui;

        // theta shifts us between north and south poles
        thetaControl.addEventListener('input', (e) => {
            this.theta = degToRad(parseFloat(e.target.value));
            this.autoRotate = false;
            this.hudDirty = true;
        });

        // phi spins us around the equator
        phiControl.addEventListener('input', (e) => {
            this.phi = degToRad(parseFloat(e.target.value));
            this.autoRotate = false;
            this.hudDirty = true;
        });

        // collapse slider maps straight to z (cos theta)
        collapseControl.addEventListener('input', (e) => {
            const z = clamp(parseFloat(e.target.value));
            this.theta = Math.acos(z);
            this.autoRotate = false;
            this.hudDirty = true;
        });

        // camera tilt slider affects rotationX
        tiltControl.addEventListener('input', (e) => {
            this.rotationX = parseFloat(e.target.value);
            this.autoRotate = false;
            this.hudDirty = true;
        });

        // spin slider controls rotationY
        spinControl.addEventListener('input', (e) => {
            this.rotationY = parseFloat(e.target.value);
            this.autoRotate = false;
            this.hudDirty = true;
        });

        modeButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.setMode(button.dataset.mode);
            });
        });
    }

    setMode(mode) {
        if (this.mode === mode) return;
        this.mode = mode;
        if (this.controls) {
            this.controls.modeButtons.forEach((button) => {
                button.classList.toggle('active', button.dataset.mode === mode);
            });
        }
        this.hudDirty = true;
    }

    setupEventListeners() {
        // we track dragging manually so we can rotate smoothly
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.autoRotate = false;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            this.rotationY += deltaX * 0.4;
            this.rotationX += deltaY * 0.4;
            this.rotationX = clamp(this.rotationX, -90, 90);
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.hudDirty = true;
        });

        ['mouseup', 'mouseleave'].forEach((eventName) => {
            this.canvas.addEventListener(eventName, () => {
                this.isDragging = false;
            });
        });

        // clicking the sphere sets theta/phi directly
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - this.centerX;
            const y = e.clientY - rect.top - this.centerY;
            const distance = Math.sqrt(x * x + y * y);
            if (distance > this.radius) return;

            const z = Math.sqrt(Math.max(0, this.radius * this.radius - x * x - y * y));
            const point3D = this.rotatePoint(
                [x / this.radius, y / this.radius, z / this.radius],
                -this.rotationX,
                -this.rotationY
            );

            const r = Math.hypot(point3D[0], point3D[1], point3D[2]);
            if (!r) return;

            this.theta = Math.acos(clamp(point3D[2] / r));
            this.phi = Math.atan2(point3D[1], point3D[0]);
            if (this.phi < 0) this.phi += 2 * Math.PI;
            this.hudDirty = true;
        });

        // spacebar toggles auto spin
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.autoRotate = !this.autoRotate;
            }
        });
    }

    qubitToCoordinates(theta, phi) {
        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.sin(theta) * Math.sin(phi);
        const z = Math.cos(theta);
        return [x, y, z];
    }

    // converts Bloch vector components directly into RGB channels
    mapVectorToRGB([x, y, z]) {
        const toChannel = (value) => Math.round(((value + 1) / 2) * 255);
        return {
            r: toChannel(x),
            g: toChannel(y),
            b: toChannel(z),
        };
    }

    // builds the custom HSV mapping described in the assignment
    mapVectorToHSV([x, y, z]) {
        const hueDeg = radToDeg(Math.asin(clamp(z)));
        const hue360 = ((hueDeg + 90) / 180) * 360;
        const saturationPercent = clamp(Math.sqrt(x * x + y * y), 0, 1) * 100;
        const saturationAngle = (saturationPercent / 100) * 360;
        const valueDegrees = ((clamp(x) + 1) / 2) * 180;
        const hsvRgb = this.hsvToRgb(hue360, saturationPercent / 100, valueDegrees / 180);
        return {
            hueDeg,
            hue360,
            saturationPercent,
            saturationAngle,
            valueDegrees,
            rgb: hsvRgb,
        };
    }

    // helper to convert our HSV back to RGB for rendering
    hsvToRgb(h, s, v) {
        const c = v * s;
        const hp = (h % 360) / 60;
        const x = c * (1 - Math.abs((hp % 2) - 1));
        let [r1, g1, b1] = [0, 0, 0];

        if ((0 <= hp && hp < 1) || hp === 6) [r1, g1, b1] = [c, x, 0];
        else if (1 <= hp && hp < 2) [r1, g1, b1] = [x, c, 0];
        else if (2 <= hp && hp < 3) [r1, g1, b1] = [0, c, x];
        else if (3 <= hp && hp < 4) [r1, g1, b1] = [0, x, c];
        else if (4 <= hp && hp < 5) [r1, g1, b1] = [x, 0, c];
        else if (5 <= hp && hp < 6) [r1, g1, b1] = [c, 0, x];

        const m = v - c;
        return {
            r: Math.round((r1 + m) * 255),
            g: Math.round((g1 + m) * 255),
            b: Math.round((b1 + m) * 255),
        };
    }

    // classic rotation math so we can spin the sphere
    rotatePoint(point, rotX, rotY) {
        let [x, y, z] = point;

        const radY = degToRad(rotY);
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        const radX = degToRad(rotX);
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        return [x1, y1, z2];
    }

    // project a 3D coordinate into 2D canvas space
    project3D(x, y, z) {
        const [rx, ry, rz] = this.rotatePoint([x, y, z], this.rotationX, this.rotationY);
        const scale = 1 + rz * 0.3;
        return {
            x: this.centerX + rx * this.radius * scale,
            y: this.centerY - ry * this.radius * scale,
            z: rz,
        };
    }

    // master render function called every animation frame
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.autoRotate && !this.isDragging) {
            this.rotationY = (this.rotationY + this.rotationSpeed) % 360;
            this.hudDirty = true;
        }

        this.drawColoredSphere();
        this.drawSphereGrid();
        this.drawAxes();

        const vector = this.qubitToCoordinates(this.theta, this.phi);
        const projection = this.project3D(...vector);

        const rgbColor = this.mapVectorToRGB(vector);
        const hsvColor = this.mapVectorToHSV(vector);
        const renderColor = this.mode === 'rgb' ? rgbColor : hsvColor.rgb;

        this.drawStateVector(projection, renderColor);

        if (this.hudDirty) {
            this.updateHUD(vector, rgbColor, hsvColor);
            this.hudDirty = false;
        }
    }

    // draws the highlighted state line + point
    drawStateVector(projection, color) {
        const ctx = this.ctx;
        ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.lineTo(projection.x, projection.y);
        ctx.stroke();

        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.beginPath();
        ctx.arc(projection.x, projection.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.stroke();
    }

    // paints a point cloud over the sphere to show color mapping
    drawColoredSphere() {
        const ctx = this.ctx;
        const segments = 40;

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI;
            for (let j = 0; j <= segments * 2; j++) {
                const phi = (j / (segments * 2)) * 2 * Math.PI;
                const vector = this.qubitToCoordinates(theta, phi);
                const proj = this.project3D(...vector);
                if (proj.z < -0.35) continue;

                const color =
                    this.mode === 'rgb'
                        ? this.mapVectorToRGB(vector)
                        : this.mapVectorToHSV(vector).rgb;

                const alpha = (proj.z + 1) / 2;
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.25})`;
                ctx.fillRect(proj.x, proj.y, 3, 3);
            }
        }
    }

    // draws faint latitude + longitude guides
    drawSphereGrid() {
        const ctx = this.ctx;
        const segments = 18;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;

        for (let i = 1; i < segments; i++) {
            const theta = (i / segments) * Math.PI;
            ctx.beginPath();
            let started = false;
            for (let j = 0; j <= segments * 2; j++) {
                const phi = (j / (segments * 2)) * 2 * Math.PI;
                const proj = this.project3D(...this.qubitToCoordinates(theta, phi));
                if (proj.z < -0.6) continue;
                if (!started) {
                    ctx.moveTo(proj.x, proj.y);
                    started = true;
                } else {
                    ctx.lineTo(proj.x, proj.y);
                }
            }
            ctx.stroke();
        }

        for (let i = 0; i < segments; i++) {
            const phi = (i / segments) * 2 * Math.PI;
            ctx.beginPath();
            let started = false;
            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * Math.PI;
                const proj = this.project3D(...this.qubitToCoordinates(theta, phi));
                if (proj.z < -0.6) continue;
                if (!started) {
                    ctx.moveTo(proj.x, proj.y);
                    started = true;
                } else {
                    ctx.lineTo(proj.x, proj.y);
                }
            }
            ctx.stroke();
        }
    }

    // renders the annotated X/Y/Z axes
    drawAxes() {
        const ctx = this.ctx;
        const axisLength = 1.25;
        ctx.lineWidth = 2.5;
        ctx.font = '600 16px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        this.drawAxis(ctx, [axisLength, 0, 0], 'rgba(255,120,120,0.9)', '+/−');
        this.drawAxis(ctx, [0, axisLength, 0], 'rgba(120,255,180,0.9)', '−i / +i');
        this.drawAxis(ctx, [0, 0, axisLength], 'rgba(120,160,255,0.9)', '0 → 1');
    }

    drawAxis(ctx, endpoint, color, label) {
        const end = this.project3D(...endpoint);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fillText(label, end.x + (end.x > this.centerX ? 20 : -20), end.y);
    }

    // syncs all slider readouts + color chips with the latest state
    updateHUD(vector, rgbColor, hsvColor) {
        if (!this.controls) return;

        const {
            thetaControl,
            thetaValue,
            phiControl,
            phiValue,
            collapseControl,
            collapseValue,
            tiltControl,
            tiltValue,
            spinControl,
            spinValue,
            rgbValue,
            hsvValue,
            vectorValue,
            colorChip,
        } = this.controls;

        const thetaDeg = radToDeg(this.theta);
        const phiDeg = radToDeg(this.phi);
        const z = Math.cos(this.theta);
        const spinDeg = ((this.rotationY % 360) + 360) % 360;
        const activeColor = this.mode === 'rgb' ? rgbColor : hsvColor.rgb;

        thetaControl.value = thetaDeg.toFixed(0);
        thetaValue.textContent = `${thetaDeg.toFixed(0)}°`;

        phiControl.value = ((phiDeg + 360) % 360).toFixed(0);
        phiValue.textContent = `${((phiDeg + 360) % 360).toFixed(0)}°`;

        collapseControl.value = z.toFixed(2);
        collapseValue.textContent = `z = ${z.toFixed(2)}`;

        tiltControl.value = this.rotationX.toFixed(0);
        tiltValue.textContent = `${this.rotationX.toFixed(0)}°`;

        spinControl.value = spinDeg.toFixed(0);
        spinValue.textContent = `${spinDeg.toFixed(0)}°`;

        rgbValue.textContent = `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`;

        const hueLabel = `${hsvColor.hueDeg.toFixed(1)}°`;
        const satLabel = `${hsvColor.saturationPercent.toFixed(0)}% → ${hsvColor.saturationAngle.toFixed(0)}°`;
        const valLabel = `${hsvColor.valueDegrees.toFixed(0)}°`;
        hsvValue.textContent = `H ${hueLabel} · S ${satLabel} · V ${valLabel}`;

        vectorValue.textContent = `x ${vector[0].toFixed(2)} · y ${vector[1].toFixed(2)} · z ${vector[2].toFixed(2)}`;

        colorChip.style.background = `rgb(${activeColor.r}, ${activeColor.g}, ${activeColor.b})`;
        colorChip.style.boxShadow = `0 0 25px rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.45)`;
    }

    // requestAnimationFrame loop for smooth motion
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// once the DOM is ready, grab references and boot everything up
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('blochSphere');
    const ui = {
        thetaControl: document.getElementById('thetaControl'),
        thetaValue: document.getElementById('thetaValue'),
        phiControl: document.getElementById('phiControl'),
        phiValue: document.getElementById('phiValue'),
        collapseControl: document.getElementById('collapseControl'),
        collapseValue: document.getElementById('collapseValue'),
        tiltControl: document.getElementById('tiltControl'),
        tiltValue: document.getElementById('tiltValue'),
        spinControl: document.getElementById('spinControl'),
        spinValue: document.getElementById('spinValue'),
        modeButtons: document.querySelectorAll('.mode-toggle button'),
        rgbValue: document.getElementById('rgbValue'),
        hsvValue: document.getElementById('hsvValue'),
        vectorValue: document.getElementById('vectorValue'),
        colorChip: document.getElementById('colorChip'),
    };

    new BlochSphere(canvas, ui);
});
