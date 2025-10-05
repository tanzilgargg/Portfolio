class Particle {
  constructor(x, y, hue) {
    this.x = x
    this.y = y

    // Random direction and speed
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 1.5 + 0.5
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed

    this.hue = hue
    this.life = 1
    this.maxLife = Math.random() * 60 + 60
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.life -= 1 / this.maxLife

    // Gentle attraction toward center
    const dx = -this.x * 0.001
    const dy = -this.y * 0.001
    this.vx += dx
    this.vy += dy
  }

  display(segments) {
    if (this.life <= 0) return

    const alpha = this.life * 180
    window.stroke(this.hue, 80, 90, alpha)
    window.strokeWeight(2)

    // Draw particle in all symmetrical positions
    for (let i = 0; i < segments; i++) {
      window.push()
      window.rotate(((Math.PI * 2) / segments) * i)
      window.point(this.x, this.y)
      window.point(this.x, -this.y)
      window.pop()
    }
  }

  isDead() {
    return this.life <= 0
  }
}

// Available messaging platforms
const platforms = ["WhatsApp", "Discord", "Telegram", "Instagram", "Messenger", "Slack", "Twitter", "iMessage", "SMS"]

// User input data
let platformData = []
let messageCount = 0
let dailyMessages = 0

// Animation state
let rotation = 0
const particles = []

function addPlatform() {
  const platformsList = document.getElementById("platforms-list")
  const platformId = Date.now()

  const platformItem = document.createElement("div")
  platformItem.className = "platform-item"
  platformItem.id = `platform-${platformId}`

  platformItem.innerHTML = `
    <select class="platform-select" data-id="${platformId}">
      ${platforms.map((p) => `<option value="${p}">${p}</option>`).join("")}
    </select>
    <input 
      type="number" 
      class="platform-input" 
      data-id="${platformId}"
      min="0" 
      value="0" 
      placeholder="0"
    >
    <button class="remove-platform-btn" onclick="removePlatform(${platformId})">×</button>
  `

  platformsList.appendChild(platformItem)

  platformData.push({ id: platformId, platform: platforms[0], count: 0 })

  // Update platform data when user changes selection or count
  const select = platformItem.querySelector(".platform-select")
  const input = platformItem.querySelector(".platform-input")

  select.addEventListener("change", (e) => {
    const data = platformData.find((p) => p.id === platformId)
    if (data) data.platform = e.target.value
  })

  input.addEventListener("input", (e) => {
    const data = platformData.find((p) => p.id === platformId)
    if (data) {
      data.count = Number.parseInt(e.target.value) || 0
      updateTotalMessages()
    }
  })
}

function removePlatform(platformId) {
  const platformItem = document.getElementById(`platform-${platformId}`)
  if (platformItem) {
    platformItem.remove()
    platformData = platformData.filter((p) => p.id !== platformId)
    updateTotalMessages()
  }
}

function updateTotalMessages() {
  messageCount = platformData.reduce((sum, p) => sum + p.count, 0)
  document.getElementById("total-messages").textContent = messageCount
}

function updateDailyMessages() {
  dailyMessages = Number.parseInt(document.getElementById("daily-messages").value) || 0
  document.getElementById("daily-messages-display").textContent = dailyMessages
}

function setup() {
  const canvas = window.createCanvas(window.windowWidth, window.windowHeight)
  canvas.parent("canvas-container")
  window.colorMode(window.HSB, 360, 100, 100, 255)

  document.getElementById("add-platform-btn").addEventListener("click", addPlatform)
  document.getElementById("daily-messages").addEventListener("input", updateDailyMessages)

  addPlatform()
}

function draw() {
  // Fade effect creates particle trails
  window.background(0, 0, 0, 25)

  // Calculate visual parameters based on message counts
  const totalVisualInput = messageCount + dailyMessages * 10
  const segments = window.map(totalVisualInput, 0, 1000, 4, 16)
  const segmentsRounded = Math.round(window.constrain(segments, 4, 16))
  const rotationSpeed = window.map(totalVisualInput, 0, 1000, 0.001, 0.012)
  const particleDensity = window.map(totalVisualInput, 0, 1000, 0.2, 6)
  const baseHue = (totalVisualInput / 1000) * 360

  rotation += rotationSpeed

  // Center and rotate canvas
  window.push()
  window.translate(window.width / 2, window.height / 2)
  window.rotate(rotation)

  // Spawn particles based on message count
  if (Math.random() < particleDensity / 60) {
    const radius = Math.random() * 150 + 50
    const angle = Math.random() * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const hue = (baseHue + Math.random() * 60 - 30 + 360) % 360
    particles.push(new Particle(x, y, hue))
  }

  // Spawn additional particles for daily messages
  if (dailyMessages > 0 && Math.random() < dailyMessages / 100) {
    const radius = Math.random() * 200 + 30
    const angle = Math.random() * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const hue = (baseHue + Math.random() * 120 - 60 + 360) % 360
    particles.push(new Particle(x, y, hue))
  }

  // Update and display all particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update()
    particles[i].display(segmentsRounded)

    if (particles[i].isDead()) {
      particles.splice(i, 1)
    }
  }

  // Draw connecting lines between nearby particles
  window.noFill()
  for (let i = 0; i < Math.min(particles.length, 50); i++) {
    const p1 = particles[i]
    for (let j = i + 1; j < Math.min(particles.length, 50); j++) {
      const p2 = particles[j]
      const distance = window.dist(p1.x, p1.y, p2.x, p2.y)

      if (distance < 150) {
        const alpha = window.map(distance, 0, 150, 100, 0) * Math.min(p1.life, p2.life)
        const hue = (p1.hue + p2.hue) / 2

        // Draw curved lines in all symmetrical positions
        for (let k = 0; k < segmentsRounded; k++) {
          window.push()
          window.rotate(((Math.PI * 2) / segmentsRounded) * k)

          window.stroke(hue, 70, 85, alpha)
          window.strokeWeight(1)

          window.bezier(
            p1.x,
            p1.y,
            p1.x + p1.vx * 20,
            p1.y + p1.vy * 20,
            p2.x + p2.vx * 20,
            p2.y + p2.vy * 20,
            p2.x,
            p2.y,
          )

          window.bezier(
            p1.x,
            -p1.y,
            p1.x + p1.vx * 20,
            -(p1.y + p1.vy * 20),
            p2.x + p2.vx * 20,
            -(p2.y + p2.vy * 20),
            p2.x,
            -p2.y,
          )

          window.pop()
        }
      }
    }
  }

  window.pop()

  updateUI(segmentsRounded, rotationSpeed)
}

function updateUI(segments, rotSpeed) {
  document.getElementById("symmetry").textContent = segments
  document.getElementById("rotation-speed").textContent = (rotSpeed * 1000).toFixed(1)
  document.getElementById("particle-count").textContent = particles.length
  document.getElementById("daily-messages-display").textContent = dailyMessages
}

function windowResized() {
  window.resizeCanvas(window.windowWidth, window.windowHeight)
}