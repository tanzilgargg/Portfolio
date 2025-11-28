// ============================================
// MESSAGE DATA SYSTEM
// ============================================

const platforms = ["WhatsApp", "Discord", "Instagram", "Class/Work Chat", "SMS", "Telegram"]
let platformData = []
let dailyMessages = 0
const messageHistory = [] // Store message objects with timestamps

// Platform color mapping
const platformColors = {
  WhatsApp: { hue: 142, saturation: 70 },
  Discord: { hue: 235, saturation: 65 },
  Instagram: { hue: 330, saturation: 75 },
  "Class/Work Chat": { hue: 200, saturation: 60 },
  SMS: { hue: 50, saturation: 70 },
  Telegram: { hue: 195, saturation: 70 },
}

// ============================================
// TYPOGRAPHY SYSTEM - LIVING ARCHITECTURE
// ============================================

class SpatialGrid {
  constructor(cellSize = 50) {
    this.cellSize = cellSize
    this.grid = new Map()
  }

  getCellKey(x, y) {
    const col = Math.floor(x / this.cellSize)
    const row = Math.floor(y / this.cellSize)
    return `${col},${row}`
  }

  add(element) {
    const key = this.getCellKey(element.finalX, element.finalY)
    if (!this.grid.has(key)) {
      this.grid.set(key, [])
    }
    this.grid.get(key).push(element)
  }

  getNearby(x, y) {
    const nearby = []
    const col = Math.floor(x / this.cellSize)
    const row = Math.floor(y / this.cellSize)

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const key = `${col + i},${row + j}`
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key))
        }
      }
    }
    return nearby
  }

  clear() {
    this.grid.clear()
  }
}

const spatialGrid = new SpatialGrid(80)

class TypographyElement {
  constructor(text, platform, intensity = 1) {
    this.text = text
    this.platform = platform
    this.intensity = intensity
    this.age = 0

    // Position and movement (will be initialized in display method)
    this.initialized = false
    this.x = 0
    this.y = 0
    this.finalX = 0
    this.finalY = 0

    this.width = 0
    this.height = 0

    // Typography deformation - subtle, matching musical style
    this.stretchX = 1
    this.stretchY = 1
    this.bendAmount = 0
    this.rotation = 0
    this.finalRotation = 0

    // Visual properties
    const colorData = platformColors[platform] || { hue: 200, saturation: 70 }
    this.hue = colorData.hue
    this.saturation = colorData.saturation
    this.brightness = 60 + intensity * 40
    this.size = 12 + intensity * 8

    // Animation state - gentle settling motion
    this.animationPhase = Math.random() * Math.PI * 2
    this.settleSpeed = 0.02
    this.settled = false
  }

  update(globalIntensity, overflowLevel) {
    this.age++

    // Gentle settling animation - elements move to final position
    if (!this.settled) {
      this.animationPhase += this.settleSpeed
      const settleProgress = Math.min(1, this.age / 60) // Settle over 60 frames

      // Interpolate to final position
      this.x = this.x + (this.finalX - this.x) * 0.1
      this.y = this.y + (this.finalY - this.y) * 0.1
      this.rotation = this.rotation + (this.finalRotation - this.rotation) * 0.1

      // Subtle deformation based on platform style
      if (this.platform === "WhatsApp") {
        this.bendAmount = Math.sin(this.animationPhase) * 0.1 * (1 - settleProgress)
      } else if (this.platform === "Discord") {
        this.stretchX = 1 + Math.sin(this.animationPhase * 2) * 0.1 * (1 - settleProgress)
      } else if (this.platform === "Instagram") {
        this.stretchY = 1 + Math.cos(this.animationPhase * 1.5) * 0.15 * (1 - settleProgress)
      }

      if (settleProgress >= 1) {
        this.settled = true
        this.x = this.finalX
        this.y = this.finalY
        this.rotation = this.finalRotation
      }
    }

    // Maintain intensity
    this.intensity = 0.5 + globalIntensity * 0.5
    this.brightness = 50 + this.intensity * 50
  }

  calculateBounds() {
    // textSize and textWidth are p5.js functions, assumed to be available in the p5.js environment
    textSize(this.size * this.stretchY)
    const w = textWidth(this.text)
    const h = this.size * this.stretchY * 1.2

    // Account for rotation by using bounding box that contains rotated rectangle
    const cos = Math.abs(Math.cos(this.finalRotation))
    const sin = Math.abs(Math.sin(this.finalRotation))
    this.width = w * cos + h * sin
    this.height = h * cos + w * sin
  }

  overlaps(other) {
    const dx = this.finalX - other.finalX
    const dy = this.finalY - other.finalY
    const minDist = (this.width + other.width) / 2 + (this.height + other.height) / 2
    return Math.sqrt(dx * dx + dy * dy) < minDist * 0.5
  }

  initializePosition() {
    // width and height are p5.js global variables, assumed to be available in the p5.js environment
    const centerX = width / 2
    const centerY = height / 2

    // Calculate text bounds first
    // textSize and textWidth are p5.js functions
    textSize(this.size * this.stretchY)
    const w = textWidth(this.text)
    const h = this.size * this.stretchY * 1.2

    // Set final rotation first
    if (this.platform === "WhatsApp") {
      this.finalRotation = (Math.random() - 0.5) * 0.2
    } else if (this.platform === "Discord") {
      this.finalRotation = (Math.random() - 0.5) * 0.4
    } else if (this.platform === "Instagram") {
      this.finalRotation = (Math.random() - 0.5) * 0.3
    } else {
      this.finalRotation = (Math.random() - 0.5) * 0.15
    }
    this.rotation = this.finalRotation + (Math.random() - 0.5) * 0.5

    // Calculate bounding box with rotation
    this.calculateBounds()

    // Try multiple layout strategies
    const elementIndex = typographyElements.length
    let bestX,
      bestY,
      bestScore = Number.NEGATIVE_INFINITY
    const attempts = 50

    for (let attempt = 0; attempt < attempts; attempt++) {
      let candidateX, candidateY

      // Use different layout patterns based on attempt number
      if (attempt < 20) {
        // Spiral layout from center
        const goldenAngle = Math.PI * (3 - Math.sqrt(5))
        const radius = Math.sqrt(elementIndex + attempt) * 25 + 50
        const angle = (elementIndex + attempt) * goldenAngle
        candidateX = centerX + Math.cos(angle) * radius
        candidateY = centerY + Math.sin(angle) * radius
      } else if (attempt < 35) {
        // Grid-based layout with jitter
        const cols = Math.ceil(Math.sqrt(elementIndex + 1))
        const index = elementIndex + (attempt - 20)
        const col = index % cols
        const row = Math.floor(index / cols)
        const spacing = 120
        const gridWidth = cols * spacing
        const gridHeight = Math.ceil(elementIndex / cols) * spacing
        candidateX = centerX - gridWidth / 2 + col * spacing + (Math.random() - 0.5) * 40
        candidateY = centerY - gridHeight / 2 + row * spacing + (Math.random() - 0.5) * 40
      } else {
        // Random placement as fallback
        const maxRadius = Math.min(width, height) * 0.45
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * maxRadius
        candidateX = centerX + Math.cos(angle) * radius
        candidateY = centerY + Math.sin(angle) * radius
      }

      // Keep within bounds with padding
      const padding = Math.max(this.width, this.height) / 2 + 20
      candidateX = Math.max(padding, Math.min(width - padding, candidateX))
      candidateY = Math.max(padding, Math.min(height - padding, candidateY))

      // Check for collisions with nearby elements
      const nearby = spatialGrid.getNearby(candidateX, candidateY)
      let hasCollision = false
      let minDistance = Number.POSITIVE_INFINITY

      for (const other of nearby) {
        if (!other.initialized) continue

        const dx = candidateX - other.finalX
        const dy = candidateY - other.finalY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = (this.width + other.width) / 2 + (this.height + other.height) / 2 + 15

        if (dist < minDist) {
          hasCollision = true
          break
        }
        minDistance = Math.min(minDistance, dist)
      }

      if (!hasCollision) {
        // Score based on distance from center and neighbors
        const distFromCenter = Math.sqrt(Math.pow(candidateX - centerX, 2) + Math.pow(candidateY - centerY, 2))
        const centerScore = 1 - distFromCenter / (Math.min(width, height) / 2)
        const neighborScore = nearby.length > 0 ? minDistance / 200 : 0.5
        const score = centerScore * 0.6 + neighborScore * 0.4

        if (score > bestScore) {
          bestScore = score
          bestX = candidateX
          bestY = candidateY
        }
      }
    }

    // Use best position found, or fallback to far edge if all collide
    if (bestScore > Number.NEGATIVE_INFINITY) {
      this.finalX = bestX
      this.finalY = bestY
    } else {
      // Last resort: place at random edge position
      const edge = Math.floor(Math.random() * 4)
      const padding = 50
      switch (edge) {
        case 0: // top
          this.finalX = padding + Math.random() * (width - padding * 2)
          this.finalY = padding
          break
        case 1: // right
          this.finalX = width - padding
          this.finalY = padding + Math.random() * (height - padding * 2)
          break
        case 2: // bottom
          this.finalX = padding + Math.random() * (width - padding * 2)
          this.finalY = height - padding
          break
        case 3: // left
          this.finalX = padding
          this.finalY = padding + Math.random() * (height - padding * 2)
          break
      }
    }

    // Start position slightly offset for animation
    this.x = this.finalX + (Math.random() - 0.5) * 100
    this.y = this.finalY + (Math.random() - 0.5) * 100

    this.initialized = true

    // Add to spatial grid
    spatialGrid.add(this)
  }

  display() {
    // Initialize position on first display (when width/height are available)
    if (!this.initialized) {
      this.initializePosition()
    }

    // Permanent display - no fading
    const currentHue = this.hue
    const alpha = 200 + this.intensity * 55 // Slightly transparent but visible

    // push, translate, rotate, textAlign, fill, noStroke, text, pop are p5.js functions
    push()
    translate(this.x, this.y)
    rotate(this.rotation)

    // Draw text with deformation matching musical style
    textAlign(CENTER, CENTER)
    textSize(this.size * this.stretchY)
    fill(currentHue, this.saturation, this.brightness, alpha)
    noStroke()

    // Apply bending effect for WhatsApp style
    if (this.platform === "WhatsApp" && Math.abs(this.bendAmount) > 0.01) {
      this.drawBentText()
    } else {
      text(this.text, 0, 0)
    }

    pop()
  }

  drawBentText() {
    const chars = this.text.split("")
    const charWidth = this.size * 0.6
    const totalWidth = chars.length * charWidth
    const startX = -totalWidth / 2

    chars.forEach((char, i) => {
      const t = i / chars.length
      const offsetX = startX + i * charWidth
      const offsetY = Math.sin(t * Math.PI * 2 + this.animationPhase) * this.bendAmount * 20
      // text is a p5.js function
      text(char, offsetX, offsetY)
    })
  }

  isDead() {
    return false // Elements never die - they accumulate
  }
}

// ============================================
// GENERATIVE PIANO MUSIC SYSTEM
// ============================================

// Calm key progressions - C Major and A Minor only
const calmProgressions = {
  cMajor: {
    chords: [
      [0, 4, 7],
      [5, 9, 12],
      [7, 11, 14],
      [0, 4, 7],
    ], // C, F, G, C
    root: 0, // C
    scale: [0, 2, 4, 5, 7, 9, 11], // C Major scale
    key: "C Major",
  },
  aMinor: {
    chords: [
      [9, 12, 16],
      [14, 17, 21],
      [16, 19, 23],
      [9, 12, 16],
    ], // Am, Dm, G, Am
    root: 9, // A
    scale: [0, 2, 3, 5, 7, 8, 10], // A Minor scale (relative to A)
    key: "A Minor",
  },
}

// Repeating motifs for each platform style
const platformMotifs = {
  WhatsApp: [0, 4, 7, 4], // C-E-G-E pattern
  Discord: [0, 2, 0], // C-D-C pattern
  Instagram: [0, 4, 7, 11, 7, 4], // C-E-G-B-G-E arpeggio
  "Class/Work Chat": [0, 5, 0], // C-F-C pattern
}

// Platform to piano style mapping
const platformPianoStyles = {
  WhatsApp: "warmChords",
  Discord: "staccatoTaps",
  Instagram: "melodicArpeggios",
  "Class/Work Chat": "minimalRhythmic",
  SMS: "warmChords", // SMS uses warm chords
  Telegram: "warmChords", // Telegram uses warm chords
}

class PianoMusicSystem {
  constructor() {
    this.audioContext = null
    this.isEnabled = false
    this.volume = 0.3
    this.isRecording = false
    this.recorder = null
    this.recordedChunks = []
    this.masterGain = null
    this.reverbNode = null
    this.recordingDestination = null

    // Music parameters - calm and cohesive
    this.currentProgression = calmProgressions.cMajor // Default to C Major
    this.currentChordIndex = 0
    this.tempo = 80 // Calm tempo (60-100 BPM range)
    this.messageQueue = []
    this.lastMessageTime = 0
    this.messageDensity = 0

    // Motif tracking for each platform
    this.platformMotifIndices = {}
    Object.keys(platformMotifs).forEach((platform) => {
      this.platformMotifIndices[platform] = 0
    })

    // Limited pitch range: C3 to C5 (2 octaves)
    this.baseFreq = 130.81 // C3
    this.maxPitchOffset = 24 // 2 octaves = 24 semitones

    // To keep track of active notes for potential stopAllSounds implementation
    this.activeNotes = new Set()
  }

  async init() {
    try {
      // window is a global object in browser environments
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create reverb for atmospheric sound
      this.reverbNode = this.audioContext.createConvolver()
      // Create simple reverb impulse response
      const reverbLength = this.audioContext.sampleRate * 2
      const impulse = this.audioContext.createBuffer(2, reverbLength, this.audioContext.sampleRate)
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel)
        for (let i = 0; i < reverbLength; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2)
        }
      }
      this.reverbNode.buffer = impulse

      // Create master gain node
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = this.volume

      // Setup recording destination (split signal)
      this.recordingDestination = this.audioContext.createMediaStreamDestination()

      // Connect: masterGain -> reverb -> destination and recording
      this.masterGain.connect(this.reverbNode)
      this.reverbNode.connect(this.audioContext.destination)
      this.masterGain.connect(this.recordingDestination)

      // Update time-based progression
      this.updateTimeProgression()

      return true
    } catch (e) {
      console.error("Audio context initialization failed:", e)
      return false
    }
  }

  updateTimeProgression() {
    const hour = new Date().getHours()
    // Use C Major for morning/afternoon, A Minor for evening/night
    if (hour >= 6 && hour < 18) {
      this.currentProgression = calmProgressions.cMajor
    } else {
      this.currentProgression = calmProgressions.aMinor
    }
    this.currentChordIndex = 0
  }

  enable() {
    if (!this.audioContext) {
      this.init().then((success) => {
        if (success) {
          this.isEnabled = true
          this.startRecording()
        }
      })
    } else {
      this.isEnabled = true
      this.startRecording()
    }
  }

  disable() {
    this.isEnabled = false
    this.stopRecording()
    this.stopAllSounds()
  }

  setVolume(value) {
    this.volume = value / 100
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume
    }
  }

  startRecording() {
    if (!this.audioContext || this.isRecording) return

    try {
      // Ensure we have a valid stream
      if (!this.recordingDestination || !this.recordingDestination.stream) {
        this.recordingDestination = this.audioContext.createMediaStreamDestination()
        // Reconnect masterGain to include the new destination
        if (this.masterGain) {
          this.masterGain.connect(this.recordingDestination)
        }
      }

      this.recorder = new MediaRecorder(this.recordingDestination.stream, {
        mimeType: "audio/webm;codecs=opus",
      })
      this.recordedChunks = []

      this.recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.recorder.onstop = () => {
        // Recording stopped
      }

      this.recorder.start(1000) // Collect data every second
      this.isRecording = true
    } catch (e) {
      console.error("Recording failed:", e)
      // Fallback: try without codec specification
      try {
        this.recorder = new MediaRecorder(this.recordingDestination.stream)
        this.recordedChunks = []
        this.recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.recordedChunks.push(event.data)
          }
        }
        this.recorder.start(1000)
        this.isRecording = true
      } catch (e2) {
        console.error("Recording fallback failed:", e2)
      }
    }
  }

  stopRecording() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop()
      this.isRecording = false
    }
  }

  exportAudio() {
    return new Promise((resolve) => {
      if (this.recordedChunks.length === 0) {
        alert("No audio recorded yet. Enable music and let some messages play first.")
        resolve()
        return
      }

      const wasRecording = this.isRecording
      this.stopRecording()

      // Wait for recorder to finish
      setTimeout(() => {
        const blob = new Blob(this.recordedChunks, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        const date = new Date().toISOString().split("T")[0]
        const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-")
        a.href = url
        a.download = `digital-presence-piano-${date}-${time}.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        URL.revokeObjectURL(url)

        // Clear chunks and restart if music is still enabled
        this.recordedChunks = []
        if (this.isEnabled && wasRecording) {
          setTimeout(() => this.startRecording(), 500)
        }

        resolve()
      }, 100)
    })
  }

  // Calculate tempo and density based on message frequency - keep it calm
  updateTempoAndDensity(messageCount, timeSinceLastMessage) {
    // Tempo increases gently with message frequency (60-100 BPM - calm range)
    const tempoBoost = Math.min(20, messageCount * 0.2)
    this.tempo = Math.min(100, Math.max(60, 80 + tempoBoost))

    // Density (0-1) based on recent activity
    if (timeSinceLastMessage < 1000) {
      this.messageDensity = Math.min(1, this.messageDensity + 0.1)
    } else {
      this.messageDensity = Math.max(0, this.messageDensity - 0.01)
    }
  }

  // Play piano for a specific platform with typography style - using motifs and calm keys
  playMessage(platform, intensity = 1, typographyStyle = null) {
    if (!this.isEnabled || !this.audioContext) return

    const style = platformPianoStyles[platform] || "warmChords"
    const now = this.audioContext.currentTime

    // Update time progression periodically
    if (Math.random() < 0.05) {
      this.updateTimeProgression()
    }

    // Get motif for this platform
    const motif = platformMotifs[platform] || platformMotifs["WhatsApp"]
    const motifIndex = this.platformMotifIndices[platform] || 0
    const motifNote = motif[motifIndex % motif.length]

    // Advance motif index for next time
    this.platformMotifIndices[platform] = (motifIndex + 1) % motif.length

    // Get current chord
    const chord = this.currentProgression.chords[this.currentChordIndex]

    // Calculate frequency from motif note, staying in limited pitch range
    // Map motif note to chord note, then add octave offset
    const chordNote = chord[motifNote % chord.length]
    const octaveOffset = Math.floor(motifNote / chord.length) * 12
    const pitchOffset = Math.min(this.maxPitchOffset, chordNote + octaveOffset)
    const frequency = this.baseFreq * Math.pow(2, pitchOffset / 12)

    // Play the appropriate piano style with soft velocities
    switch (style) {
      case "warmChords":
        this.playWarmChords(frequency, intensity, chord)
        break
      case "staccatoTaps":
        this.playStaccatoTaps(frequency, intensity)
        break
      case "melodicArpeggios":
        this.playMelodicArpeggios(frequency, intensity, chord)
        break
      case "minimalRhythmic":
        this.playMinimalRhythmic(frequency, intensity)
        break
    }

    // Advance chord progression slowly and smoothly
    if (Math.random() < 0.15) {
      this.currentChordIndex = (this.currentChordIndex + 1) % this.currentProgression.chords.length
    }

    this.lastMessageTime = Date.now()
  }

  // WhatsApp: Soft warm chords with gentle sustain
  playWarmChords(frequency, intensity, chord) {
    const now = this.audioContext.currentTime
    const duration = 2.0 + intensity * 0.5 // Longer, more sustained

    // Play full chord with warm, rich tone - soft velocities
    chord.forEach((noteOffset, i) => {
      const noteFreq = frequency * Math.pow(2, (noteOffset - chord[0]) / 12)

      for (let harmonic = 0; harmonic < 2; harmonic++) {
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        const filter = this.audioContext.createBiquadFilter()

        osc.frequency.value = noteFreq * (1 + harmonic * 0.5)
        osc.type = harmonic === 0 ? "sine" : "triangle"

        // Warm, mellow filter
        filter.type = "lowpass"
        filter.frequency.value = 1800 - harmonic * 200
        filter.Q.value = 0.7

        // Very gentle attack, long sustain, gentle release
        const attackTime = 0.2
        const decayTime = 0.4
        const sustainLevel = 0.5 / (harmonic + 1)
        const releaseTime = 0.8

        // Soft velocity: reduce by 40%
        const softVolume = this.volume * 0.6

        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime((softVolume * intensity * 0.08) / (harmonic + 1), now + attackTime)
        gain.gain.linearRampToValueAtTime(softVolume * intensity * sustainLevel, now + attackTime + decayTime)
        gain.gain.setValueAtTime(softVolume * intensity * sustainLevel, now + duration - releaseTime)
        gain.gain.linearRampToValueAtTime(0, now + duration)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain)

        osc.start(now)
        osc.stop(now + duration)
        this.activeNotes.add(osc) // Track active oscillator
        osc.onended = () => this.activeNotes.delete(osc)
      }
    })
  }

  // Discord: Short staccato taps - soft and rhythmic
  playStaccatoTaps(frequency, intensity) {
    const now = this.audioContext.currentTime
    const duration = 0.12 // Short, crisp
    const tapCount = 2 + Math.floor(intensity)

    for (let tap = 0; tap < tapCount; tap++) {
      const tapTime = now + tap * 0.1

      const osc = this.audioContext.createOscillator()
      const gain = this.audioContext.createGain()
      const filter = this.audioContext.createBiquadFilter()

      osc.frequency.value = frequency
      osc.type = "sine"

      filter.type = "lowpass"
      filter.frequency.value = 2000
      filter.Q.value = 2

      // Soft, quick attack and decay
      const attackTime = 0.005
      const decayTime = 0.08

      // Soft velocity
      const softVolume = this.volume * 0.5

      gain.gain.setValueAtTime(0, tapTime)
      gain.gain.linearRampToValueAtTime(softVolume * intensity * 0.15, tapTime + attackTime)
      gain.gain.exponentialRampToValueAtTime(0.001, tapTime + attackTime + decayTime)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain)

      osc.start(tapTime)
      osc.stop(tapTime + duration)
      this.activeNotes.add(osc) // Track active oscillator
      osc.onended = () => this.activeNotes.delete(osc)
    }
  }

  // Instagram: Light melodic arpeggios - gentle and flowing
  playMelodicArpeggios(frequency, intensity, chord) {
    const now = this.audioContext.currentTime
    const arpeggioNotes = chord.slice(0, 3) // Use first 3 notes for simplicity
    const noteDuration = 0.25 + intensity * 0.1

    arpeggioNotes.forEach((noteOffset, i) => {
      const noteTime = now + i * noteDuration * 0.7
      const noteFreq = frequency * Math.pow(2, (noteOffset - chord[0]) / 12)

      for (let harmonic = 0; harmonic < 2; harmonic++) {
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        const filter = this.audioContext.createBiquadFilter()

        osc.frequency.value = noteFreq * (1 + harmonic * 0.5)
        osc.type = harmonic === 0 ? "sine" : "triangle"

        // Bright but gentle filter
        filter.type = "lowpass"
        filter.frequency.value = 3000 - harmonic * 300
        filter.Q.value = 1

        // Gentle attack, smooth sustain
        const attackTime = 0.05
        const decayTime = 0.15
        const sustainLevel = 0.4 / (harmonic + 1)

        // Soft velocity
        const softVolume = this.volume * 0.65

        gain.gain.setValueAtTime(0, noteTime)
        gain.gain.linearRampToValueAtTime((softVolume * intensity * 0.12) / (harmonic + 1), noteTime + attackTime)
        gain.gain.linearRampToValueAtTime(softVolume * intensity * sustainLevel, noteTime + attackTime + decayTime)
        gain.gain.linearRampToValueAtTime(0, noteTime + noteDuration)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain)

        osc.start(noteTime)
        osc.stop(noteTime + noteDuration)
        this.activeNotes.add(osc) // Track active oscillator
        osc.onended = () => this.activeNotes.delete(osc)
      }
    })
  }

  // Class/Work: Minimal rhythmic notes - very soft and simple
  playMinimalRhythmic(frequency, intensity) {
    const now = this.audioContext.currentTime
    const duration = 0.5 + intensity * 0.2

    // Single, clean note with minimal processing
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    osc.frequency.value = frequency
    osc.type = "sine"

    // Clean, minimal filter
    filter.type = "lowpass"
    filter.frequency.value = 1200
    filter.Q.value = 1

    // Very gentle attack and decay
    const attackTime = 0.1
    const decayTime = 0.3
    const sustainLevel = 0.25
    const releaseTime = 0.2

    // Very soft velocity
    const softVolume = this.volume * 0.5

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(softVolume * intensity * 0.1, now + attackTime)
    gain.gain.linearRampToValueAtTime(softVolume * intensity * sustainLevel, now + attackTime + decayTime)
    gain.gain.setValueAtTime(softVolume * intensity * sustainLevel, now + duration - releaseTime)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)
    this.activeNotes.add(osc) // Track active oscillator
    osc.onended = () => this.activeNotes.delete(osc)
  }

  stopAllSounds() {
    this.activeNotes.forEach((osc) => {
      try {
        osc.stop()
      } catch (e) {
        // Ignore errors if already stopped
      }
    })
    this.activeNotes.clear()
  }

  cleanup() {
    // This method is called periodically.
    // We can remove notes that have naturally finished to prevent memory leaks if needed.
    // However, current implementation uses osc.stop() which should handle cleanup.
    // If a more complex system of scheduled notes were used, this would be important.
  }
}

// ============================================
// MAIN SYSTEM
// ============================================

const typographyElements = []
const pianoMusicSystem = new PianoMusicSystem()
const maxElements = 50 // Limit for visual balance
let frameCount = 0
let totalMessageCount = 0

// p5.js setup
function setup() {
  // createCanvas, windowWidth, windowHeight, colorMode, textFont are p5.js functions/variables
  const canvas = createCanvas(windowWidth, windowHeight)
  canvas.parent("canvas-container")
  colorMode(HSB, 360, 100, 100, 255)
  // Font will be loaded from Google Fonts, fallback to system font
  if (typeof textFont === "function") {
    textFont("Orbitron, monospace")
  }

  // Initialize piano music system
  pianoMusicSystem.init()

  // Setup UI
  setupUI()

  // Add initial platform
  addPlatform()
}

function draw() {
  frameCount++

  // Calculate global intensity and overflow
  const totalMessages = platformData.reduce((sum, p) => sum + p.count, 0) + dailyMessages
  const globalIntensity = Math.min(totalMessages / 100, 1)
  const elementCount = typographyElements.length
  const overflowLevel = Math.max(0, (elementCount - maxElements) / maxElements)

  // Background - subtle fade to allow accumulation
  // background is a p5.js function
  const bgHue = (200 + globalIntensity * 40) % 360
  const bgSaturation = 10 + globalIntensity * 15
  background(bgHue, bgSaturation, 3, 15) // Very subtle fade for accumulation effect

  spatialGrid.clear()
  typographyElements.forEach((element) => {
    if (element.initialized) {
      spatialGrid.add(element)
    }
  })

  // Update and display all typography elements (they accumulate, never removed)
  typographyElements.forEach((element) => {
    element.update(globalIntensity, overflowLevel)
    element.display()
  })

  // Generate new elements from messages
  processMessages(globalIntensity, overflowLevel)

  // Update UI
  updateUI(totalMessages, elementCount, globalIntensity, overflowLevel)

  // Update tempo and density based on message frequency
  const timeSinceLastMessage = Date.now() - pianoMusicSystem.lastMessageTime
  pianoMusicSystem.updateTempoAndDensity(totalMessages, timeSinceLastMessage)

  // Cleanup music system
  if (frameCount % 60 === 0) {
    pianoMusicSystem.cleanup()
  }
}

function processMessages(globalIntensity, overflowLevel) {
  // Process platform messages
  platformData.forEach((platform) => {
    if (platform.count > 0 && Math.random() < 0.02) {
      const sampleTexts = generateSampleTexts(platform.platform)
      const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
      const intensity = 0.5 + Math.random() * 0.5

      if (typographyElements.length < maxElements * 1.5) {
        const element = new TypographyElement(text, platform.platform, intensity)
        typographyElements.push(element)

        // Trigger piano music with typography style information
        if (pianoMusicSystem.isEnabled) {
          const typographyStyle = {
            size: element.size,
            brightness: element.brightness,
            intensity: element.intensity,
            platform: platform.platform,
          }
          pianoMusicSystem.playMessage(platform.platform, intensity, typographyStyle)
        }
      }

      platform.count = Math.max(0, platform.count - 1)
    }
  })

  // Process daily messages
  if (dailyMessages > 0 && Math.random() < 0.01) {
    const platforms = Object.keys(platformColors)
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)]
    const sampleTexts = generateSampleTexts(randomPlatform)
    const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    const intensity = 0.7 + Math.random() * 0.3

    if (typographyElements.length < maxElements * 1.5) {
      const element = new TypographyElement(text, randomPlatform, intensity)
      typographyElements.push(element)

      if (pianoMusicSystem.isEnabled) {
        const typographyStyle = {
          size: element.size,
          brightness: element.brightness,
          intensity: element.intensity,
          platform: randomPlatform,
        }
        pianoMusicSystem.playMessage(randomPlatform, intensity, typographyStyle)
      }
    }

    dailyMessages = Math.max(0, dailyMessages - 1)
  }
}

function generateSampleTexts(platform) {
  const samples = {
    WhatsApp: ["hey", "lol", "brb", "ttyl", "omw", "👍", "😊", "sure", "ok", "thanks"],
    Discord: ["gg", "lfg", "afk", "pog", "based", "no cap", "fr", "w", "L"],
    Instagram: ["❤️", "🔥", "✨", "period", "slay", "vibes", "mood", "facts"],
    "Class/Work Chat": ["meeting", "deadline", "review", "update", "asap", "fyi", "cc", "follow-up"],
    SMS: ["ok", "yes", "no", "thanks", "call me", "later", "👍"],
    Telegram: ["sent", "read", "typing...", "online", "offline"],
  }
  return samples[platform] || ["message", "text", "chat"]
}

function applyGlitchOverlay(overflowLevel) {
  const overlay = document.getElementById("glitch-overlay")
  const intensity = Math.min(overflowLevel, 1)
  overlay.style.opacity = intensity * 0.3
  overlay.style.filter = `hue-rotate(${overflowLevel * 60}deg) saturate(${1 + overflowLevel})`
}

// ============================================
// UI FUNCTIONS
// ============================================

function setupUI() {
  // Add platform button
  document.getElementById("add-platform-btn").addEventListener("click", addPlatform)

  // Daily messages input
  document.getElementById("daily-messages").addEventListener("input", (e) => {
    dailyMessages = Number.parseInt(e.target.value) || 0
  })

  // Music toggle
  document.getElementById("audio-toggle").addEventListener("click", () => {
    if (pianoMusicSystem.isEnabled) {
      pianoMusicSystem.disable()
      document.getElementById("audio-toggle").textContent = "Enable Music"
      document.getElementById("audio-controls").style.display = "none"
    } else {
      pianoMusicSystem.enable()
      document.getElementById("audio-toggle").textContent = "Disable Music"
      document.getElementById("audio-controls").style.display = "block"
    }
  })

  // Volume slider
  document.getElementById("volume-slider").addEventListener("input", (e) => {
    pianoMusicSystem.setVolume(e.target.value)
  })

  // Export audio button
  const exportBtn = document.getElementById("export-audio-btn")
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      pianoMusicSystem.exportAudio()
    })
  }

  // Export image button
  const exportImageBtn = document.getElementById("export-image-btn")
  if (exportImageBtn) {
    exportImageBtn.addEventListener("click", () => {
      exportTypographyArtwork()
    })
  }
}

function addPlatform() {
  const container = document.getElementById("platforms-container")
  const platformId = Date.now()

  const platformItem = document.createElement("div")
  platformItem.className = "platform-item"
  platformItem.id = `platform-${platformId}`

  platformItem.innerHTML = `
    <select class="platform-select" data-id="${platformId}">
      ${platforms.map((p) => `<option value="${p}">${p}</option>`).join("")}
    </select>
    <input type="number" class="platform-input" data-id="${platformId}" min="0" value="0" placeholder="0">
    <button class="remove-btn" onclick="removePlatform(${platformId})">×</button>
  `

  container.appendChild(platformItem)

  const data = { id: platformId, platform: platforms[0], count: 0 }
  platformData.push(data)

  const select = platformItem.querySelector(".platform-select")
  const input = platformItem.querySelector(".platform-input")

  select.addEventListener("change", (e) => {
    data.platform = e.target.value
  })

  input.addEventListener("input", (e) => {
    data.count = Number.parseInt(e.target.value) || 0
  })
}

function removePlatform(platformId) {
  const item = document.getElementById(`platform-${platformId}`)
  if (item) item.remove()
  platformData = platformData.filter((p) => p.id !== platformId)
}

function updateUI(totalMessages, elementCount, intensity, overflowLevel) {
  totalMessageCount = totalMessages
  document.getElementById("total-messages").textContent = totalMessages
  document.getElementById("active-elements").textContent = elementCount
  document.getElementById("intensity").textContent = Math.round(intensity * 100) + "%"

  const overflowStatus = document.getElementById("overflow-status")
  if (overflowLevel > 0.5) {
    overflowStatus.textContent = "CRITICAL"
    overflowStatus.className = "metric-value critical"
  } else if (overflowLevel > 0.2) {
    overflowStatus.textContent = "ELEVATED"
    overflowStatus.className = "metric-value warning"
  } else {
    overflowStatus.textContent = "STABLE"
    overflowStatus.className = "metric-value"
  }

  // Update tempo display if it exists
  const tempoDisplay = document.getElementById("tempo-display")
  if (tempoDisplay && pianoMusicSystem.tempo) {
    tempoDisplay.textContent = Math.round(pianoMusicSystem.tempo) + " BPM"
  }
}

function windowResized() {
  // resizeCanvas, windowWidth, windowHeight are p5.js functions/variables
  resizeCanvas(windowWidth, windowHeight)
}

// ============================================
// IMAGE EXPORT FUNCTION
// ============================================

function exportTypographyArtwork() {
  if (typographyElements.length === 0) {
    alert("No typography artwork to export yet. Add some messages first!")
    return
  }

  // Create a temporary canvas for high-quality export
  const exportCanvas = document.createElement("canvas")
  // width and height are p5.js global variables
  exportCanvas.width = width
  exportCanvas.height = height
  const exportCtx = exportCanvas.getContext("2d")

  // Fill with background
  // HSB to RGB conversion based on the background calculation in draw()
  const bgHue = 200 // Assuming a base hue for background consistency
  const bgSaturation = 10
  const bgBrightness = 3
  const alpha = 0.15

  const h = bgHue / 360
  const s = bgSaturation / 100
  const v = bgBrightness / 100

  const c = v * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = v - c

  let r, g, b
  const h6 = h * 6
  if (h6 < 1) {
    r = c
    g = x
    b = 0
  } else if (h6 < 2) {
    r = x
    g = c
    b = 0
  } else if (h6 < 3) {
    r = 0
    g = c
    b = x
  } else if (h6 < 4) {
    r = 0
    g = x
    b = c
  } else if (h6 < 5) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  exportCtx.fillStyle = `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, ${alpha})`
  exportCtx.fillRect(0, 0, width, height)

  // Draw all typography elements
  typographyElements.forEach((element) => {
    if (!element.initialized) return

    exportCtx.save()
    exportCtx.translate(element.finalX, element.finalY)
    exportCtx.rotate(element.finalRotation)

    // Set text properties
    // textFont is assumed to be set globally for the canvas
    exportCtx.font = `${element.size * element.stretchY}px Orbitron, monospace`
    exportCtx.textAlign = "center"
    exportCtx.textBaseline = "middle"

    // Convert HSB to RGB for canvas
    const h = element.hue / 360
    const s = element.saturation / 100
    const v = element.brightness / 100
    const alpha = 0.8 // Elements are more opaque than background

    const c = v * s
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
    const m = v - c

    let r, g, b
    const h6 = h * 6
    if (h6 < 1) {
      r = c
      g = x
      b = 0
    } else if (h6 < 2) {
      r = x
      g = c
      b = 0
    } else if (h6 < 3) {
      r = 0
      g = c
      b = x
    } else if (h6 < 4) {
      r = 0
      g = x
      b = c
    } else if (h6 < 5) {
      r = x
      g = 0
      b = c
    } else {
      r = c
      g = 0
      b = x
    }

    exportCtx.fillStyle = `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, ${alpha})`
    // fillText is a standard Canvas API function
    exportCtx.fillText(element.text, 0, 0)

    exportCtx.restore()
  })

  // Convert to blob and download
  exportCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]
    const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-")
    a.href = url
    a.download = `digital-presence-artwork-${date}-${time}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, "image/png")
}
