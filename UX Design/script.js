document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer
  document.getElementById("currentYear").textContent = new Date().getFullYear()

  // Typewriter effect
  const typewriterText = "Hi, I'm Tanzil. I design future-ready experiences."
  const typewriterElement = document.getElementById("typewriter")
  let i = 0
  const typeSpeed = 100

  function typeWriter() {
    if (i < typewriterText.length) {
      // Add color to specific words
      if (i === typewriterText.indexOf("future-ready")) {
        const span = document.createElement("span")
        span.style.color = "#a855f7"
        span.textContent = "future-ready"
        typewriterElement.appendChild(span)
        i += "future-ready".length
      } else if (i === typewriterText.indexOf("experiences.")) {
        const span = document.createElement("span")
        span.style.color = "#ec4899"
        span.textContent = "experiences."
        typewriterElement.appendChild(span)
        i += "experiences.".length
      } else {
        typewriterElement.innerHTML += typewriterText.charAt(i)
        i++
      }
      setTimeout(typeWriter, typeSpeed)
    }
  }

  setTimeout(typeWriter, 1000)

  // Particle animation
  const canvas = document.getElementById("particles")
  const ctx = canvas.getContext("2d")

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles = []
  const colors = ["#9333ea", "#ec4899", "#06b6d4"]

  for (let i = 0; i < 50; i++) {
    const radius = Math.random() * 2 + 0.5
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
      },
    })
  }

  function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach((particle) => {
      particle.x += particle.velocity.x
      particle.y += particle.velocity.y

      if (particle.x < 0 || particle.x > canvas.width) {
        particle.velocity.x = -particle.velocity.x
      }

      if (particle.y < 0 || particle.y > canvas.height) {
        particle.velocity.y = -particle.velocity.y
      }

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.fill()
    })
  }

  animate()

  // Handle window resize for canvas
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  // Header scroll effect
  const header = document.querySelector(".header")
  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }
  })

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle")
  const menuClose = document.querySelector(".menu-close")
  const mobileMenu = document.querySelector(".mobile-menu")
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link")

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("active")
    document.body.style.overflow = "hidden"
  })

  menuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("active")
    document.body.style.overflow = ""
  })

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active")
      document.body.style.overflow = ""
    })
  })

  // Contact form handling
  const contactForm = document.getElementById("contactForm")
  const formSuccess = document.getElementById("formSuccess")

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Simulate form submission
    contactForm.style.opacity = "0.5"
    contactForm.style.pointerEvents = "none"

    setTimeout(() => {
      contactForm.style.display = "none"
      formSuccess.classList.add("active")

      // Reset form
      contactForm.reset()

      // Reset after 5 seconds for demo purposes
      setTimeout(() => {
        formSuccess.classList.remove("active")
        contactForm.style.display = "block"
        contactForm.style.opacity = "1"
        contactForm.style.pointerEvents = "auto"
      }, 5000)
    }, 1500)
  })

  // Project card animations
  const projectCards = document.querySelectorAll(".project-card")

  projectCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px)"
      card.style.boxShadow = "0 0 20px rgba(168, 85, 247, 0.5)"
    })

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)"
      card.style.boxShadow = "none"
    })
  })
})
