// ===== APP DATA STRUCTURE =====
const apps = [
  {
    name: "MaplePay",
    category: "finance",
    tags: ["no-tax", "local-first"],
    openSource: false,
    hasSurveillance: false,
    avoidsTax: true,
    description: "A Canadian payment app that keeps your money in Canada instead of sending it through US companies.",
    impact: "Your payments stay in Canada, no middleman taking a cut",
    details:
      "MaplePay is an idea for a payment app that skips Apple Pay and Google Pay completely. Instead, it connects directly to Canadian banks and uses Interac to move money around. No foreign companies involved, no extra fees, just straight-up Canadian banking. Think of it like e-Transfer but way more powerful.",
    jailbreakEffects: [
      "Dodges the 30% app store tax that Apple and Google charge",
      "Your payment data stays in Canadian banks, not Silicon Valley servers",
      "Supports actual Canadian infrastructure instead of feeding tech monopolies",
      "You can send money directly to friends without a platform taking a cut",
    ],
    politicalContext:
      "Right now, app stores force every purchase to go through their payment systems and take 30% off the top. That's billions of dollars leaving Canada every year. Anti-circumvention laws make it illegal to build alternatives. MaplePay imagines what we could do if those rules didn't exist.",
    indicators: {
      platformLockInReduced: 85,
      surveillanceReduced: 60,
      localEconomicBenefit: 90,
    },
  },
  {
    name: "TrueNorth News",
    category: "news",
    tags: ["open-source", "no-surveillance"],
    openSource: true,
    hasSurveillance: false,
    avoidsTax: false,
    description:
      "A news app that shows you Canadian journalism without algorithms deciding what you see or tracking what you read.",
    impact: "No algorithm controlling your news feed, no tracking your reading habits",
    details:
      "TrueNorth News is a concept for a news reader that pulls from Canadian news sources without any sketchy algorithms messing with what you see. It's open-source, so anyone can check the code and make sure there's no hidden tracking. You control your own feed—not Facebook, not Google, just you.",
    jailbreakEffects: [
      "Gets rid of algorithm manipulation that decides what news you see",
      "No tracking pixels following you around while you read",
      "Money goes directly to Canadian journalists, not platform middlemen",
      "Transparent system where you understand why you're seeing each story",
    ],
    politicalContext:
      "Facebook and Google control what news most Canadians see. They use mysterious algorithms that care more about keeping you scrolling than showing you truth. Plus they make money off Canadian journalism without paying fairly. TrueNorth imagines news without the manipulation.",
    indicators: {
      platformLockInReduced: 70,
      surveillanceReduced: 95,
      localEconomicBenefit: 75,
    },
  },
  {
    name: "RepairRight Toolkit",
    category: "tools",
    tags: ["open-source", "no-surveillance"],
    openSource: true,
    hasSurveillance: false,
    avoidsTax: false,
    description:
      "Tools to fix your own stuff—phones, laptops, even tractors—without needing permission from the company that made it.",
    impact: "Fix your own devices without manufacturer permission or expensive repairs",
    details:
      "RepairRight Toolkit gives you everything you need to repair your own electronics: diagnostic tools, step-by-step guides, and community knowledge. It includes ways around manufacturer lockouts, whether you're replacing your phone screen or fixing farm equipment. Under current law, this would be illegal to use.",
    jailbreakEffects: [
      "Lets you repair and modify devices you actually own",
      "Gets around authentication systems companies use to block repairs",
      "Access to diagnostic codes and repair docs companies keep secret",
      "Community-shared knowledge instead of depending on overpriced repair shops",
    ],
    politicalContext:
      "Anti-circumvention laws make it illegal to bypass digital locks, even to fix stuff you bought and own. Manufacturers use this to force you into their expensive repair programs. RepairRight imagines a world where you actually own what you pay for.",
    indicators: {
      platformLockInReduced: 95,
      surveillanceReduced: 80,
      localEconomicBenefit: 85,
    },
  },
  {
    name: "CanadaConnect",
    category: "social",
    tags: ["open-source", "no-surveillance", "no-tax"],
    openSource: true,
    hasSurveillance: false,
    avoidsTax: true,
    description:
      "A social network that runs on Canadian servers with zero tracking, no ads, and no algorithm deciding what you see.",
    impact: "Social media without being tracked, manipulated, or sold to advertisers",
    details:
      "CanadaConnect is a concept for social media that doesn't suck. It uses open protocols so your data stays on Canadian servers. You choose your own moderation rules, there's no algorithmic timeline messing with your head, and absolutely zero ads or tracking. Just actual human connection.",
    jailbreakEffects: [
      "Completely eliminates the surveillance business model",
      "Can't track you across different websites and apps",
      "Your social data stays in Canada under Canadian privacy laws",
      "No algorithm trying to make you angry or addicted for profit",
    ],
    politicalContext:
      "Facebook, Instagram, and Twitter run massive surveillance operations tracking Canadians everywhere online. They profit from addiction-optimizing algorithms and selling your data. CanadaConnect imagines social media as a public service, not a spy machine.",
    indicators: {
      platformLockInReduced: 90,
      surveillanceReduced: 100,
      localEconomicBenefit: 70,
    },
  },
  {
    name: "OpenElection",
    category: "civic",
    tags: ["open-source", "no-surveillance"],
    openSource: true,
    hasSurveillance: false,
    avoidsTax: false,
    description:
      "Voting and civic tools with open-source code you can verify yourself, with no corporation controlling it.",
    impact: "Democratic participation without corporate control or data mining",
    details:
      "OpenElection is a concept for democratic tools: secure polling, virtual town halls, candidate info, and voting coordination. All the code is public so anyone can audit it, all data stays in Canada, and no corporation gets to control how democracy works.",
    jailbreakEffects: [
      "Removes corporate control from civic technology",
      "Transparent, auditable systems everyone can verify",
      "Prevents data extraction from democratic participation",
      "Public infrastructure instead of private profit",
    ],
    politicalContext:
      "Political campaigns depend on Facebook and Google to reach voters, giving these corporations huge influence over democracy. They extract data from civic participation and sell it. OpenElection imagines civic technology as a public utility.",
    indicators: {
      platformLockInReduced: 85,
      surveillanceReduced: 100,
      localEconomicBenefit: 60,
    },
  },
  {
    name: "LibreBanking",
    category: "finance",
    tags: ["open-source", "no-tax"],
    openSource: true,
    hasSurveillance: false,
    avoidsTax: true,
    description:
      "Open banking tools that let you build your own financial apps without paying fees to fintech middlemen.",
    impact: "Build your own money management tools without platform fees",
    details:
      "LibreBanking gives you open APIs to connect directly to Canadian banks. Build your own budgeting apps, payment tools, and financial dashboards without paying fees to fintech companies. Your data stays between you and your bank—no intermediaries snooping or charging fees.",
    jailbreakEffects: [
      "Skips proprietary fintech platforms and their fees",
      "Direct connection to banking infrastructure",
      "Prevents financial intermediaries from harvesting your data",
      "Local financial innovation without platform gatekeeping",
    ],
    politicalContext:
      "Banks and fintech companies control access to your own financial data and charge fees for basic tools that should be yours by right. Open banking is more limited in Canada than Europe. LibreBanking imagines full control over your own money data.",
    indicators: {
      platformLockInReduced: 80,
      surveillanceReduced: 75,
      localEconomicBenefit: 85,
    },
  },
  {
    name: "HealthDataOwn",
    category: "civic",
    tags: ["open-source", "no-surveillance"],
    openSource: true,
    hasSurveillance: false,
    avoidsTax: false,
    description:
      "You control your own health records and decide who gets to see them—not insurance companies or tech platforms.",
    impact: "Your health data can't be mined by insurance or tech companies",
    details:
      "HealthDataOwn is an idea for managing your own health records. You control who sees what, you choose what to share with doctors, and no corporation can mine your medical data to deny you coverage or jack up your rates based on algorithm predictions.",
    jailbreakEffects: [
      "Stops insurance companies from mining your health data",
      "Blocks tech platforms from accessing medical records",
      "You're in control of your sensitive health information",
      "Take your health data anywhere, no vendor lock-in",
    ],
    politicalContext:
      "Health data is increasingly controlled by private platforms that sell insights to insurance and pharma companies. Data breaches expose your most sensitive information. HealthDataOwn imagines health data as a human right, not a commodity to be sold.",
    indicators: {
      platformLockInReduced: 75,
      surveillanceReduced: 95,
      localEconomicBenefit: 65,
    },
  },
  {
    name: "FarmOS Canada",
    category: "tools",
    tags: ["open-source", "no-surveillance"],
    openSource: true,
    hasSurveillance: false,
    avoidsTax: false,
    description:
      "Farm management software that works with any equipment and doesn't send your farm data to corporate servers.",
    impact: "Farmers aren't locked into one equipment manufacturer",
    details:
      "FarmOS Canada is a concept for farm software that works with any equipment, not just one brand. It handles crop planning, equipment diagnostics, and yield tracking without sending your farm data to corporate servers where it gets sold to commodities traders.",
    jailbreakEffects: [
      "Gets around equipment manufacturer software locks",
      "Prevents corporations from extracting and selling agricultural data",
      "Farmers can repair and modify their own equipment",
      "Agricultural independence from platform control",
    ],
    politicalContext:
      "John Deere and others use software locks to prevent farmers from fixing their own tractors. They extract farm data and sell insights to markets. Anti-circumvention law makes bypassing these locks illegal. FarmOS imagines farming without digital feudalism.",
    indicators: {
      platformLockInReduced: 90,
      surveillanceReduced: 85,
      localEconomicBenefit: 80,
    },
  },
  {
    name: "AlgoWatch",
    category: "civic",
    tags: ["open-source", "no-surveillance"],
    openSource: true,
    hasSurveillance: false,
    avoidsTax: false,
    description:
      "Tools to understand and audit the algorithms that make decisions about your life—from credit scores to what content you see.",
    impact: "Makes secret algorithms transparent so you can challenge unfair decisions",
    details:
      "AlgoWatch gives you tools to understand algorithmic decision-making. See why you were shown certain content, denied credit, or flagged by automated moderation. It reverses the surveillance: instead of companies watching you, you watch the algorithms.",
    jailbreakEffects: [
      "Makes secret algorithmic decisions transparent",
      "Audit AI systems that affect your life",
      "Identify bias and unfairness in automated systems",
      "Evidence to challenge algorithmic decisions that hurt you",
    ],
    politicalContext:
      "Algorithms make decisions about credit, jobs, content visibility, and more—but they're black boxes protected by corporate secrecy. You can't fight decisions you can't understand. AlgoWatch imagines a right to algorithmic transparency.",
    indicators: {
      platformLockInReduced: 70,
      surveillanceReduced: 90,
      localEconomicBenefit: 55,
    },
  },
]

// ===== STATE =====
let currentCategory = "all"
let openSourceOnly = false
let noSurveillanceOnly = false
let noTaxOnly = false

// ===== RENDER APPS =====
function renderApps() {
  const appGrid = document.getElementById("appGrid")
  appGrid.innerHTML = ""

  const filteredApps = apps.filter((app) => {
    // Category filter
    if (currentCategory !== "all" && app.category !== currentCategory) {
      return false
    }

    // Open source filter
    if (openSourceOnly && !app.openSource) {
      return false
    }

    // No surveillance filter (hide apps WITH surveillance)
    if (noSurveillanceOnly && app.hasSurveillance) {
      return false
    }

    // No tax filter
    if (noTaxOnly && !app.avoidsTax) {
      return false
    }

    return true
  })

  if (filteredApps.length === 0) {
    appGrid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #999; font-size: 1.1rem;">No apps match your current filters. Try adjusting your selection.</p>'
    return
  }

  filteredApps.forEach((app, index) => {
    const card = document.createElement("div")
    card.className = "app-card"

    const icon = app.name.charAt(0).toUpperCase()

    const tagHTML = app.tags
      .map((tag) => {
        const tagClass =
          tag === "open-source"
            ? "open-source"
            : tag === "no-tax"
              ? "no-tax"
              : tag === "no-surveillance"
                ? "no-surveillance"
                : ""
        const tagText =
          tag === "open-source"
            ? "Open Source"
            : tag === "no-tax"
              ? "Avoids 30% Tax"
              : tag === "no-surveillance"
                ? "Blocks Surveillance"
                : tag === "local-first"
                  ? "Local-First"
                  : tag
        return `<span class="tag ${tagClass}">${tagText}</span>`
      })
      .join("")

    const categoryName = {
      finance: "Finance & Payments",
      news: "News & Media",
      tools: "Tools & Repair",
      social: "Social & Communication",
      civic: "Civic & Public",
    }[app.category]

    card.innerHTML = `
      <div class="app-icon">${icon}</div>
      <h3 class="app-name">${app.name}</h3>
      <div class="app-category">${categoryName}</div>
      <div class="app-tags">${tagHTML}</div>
      <p class="app-description">${app.description}</p>
      <div class="app-impact">💡 ${app.impact}</div>
      <button class="view-details-btn" data-index="${index}">View Details</button>
    `

    appGrid.appendChild(card)
  })

  // Add event listeners to view details buttons
  document.querySelectorAll(".view-details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = Number.parseInt(e.target.getAttribute("data-index"))
      openModal(filteredApps[index])
    })
  })
}

// ===== MODAL FUNCTIONS =====
function openModal(app) {
  const modal = document.getElementById("modalOverlay")
  document.body.classList.add("no-scroll")

  // Populate modal content
  document.getElementById("modalAppName").textContent = app.name
  const categoryName = {
    finance: "Finance & Payments",
    news: "News & Media",
    tools: "Tools & Repair",
    social: "Social & Communication",
    civic: "Civic & Public",
  }[app.category]
  document.getElementById("modalAppCategory").textContent = categoryName
  document.getElementById("modalAppDetails").textContent = app.details

  // Jailbreak effects
  const effectsList = document.getElementById("modalJailbreakEffects")
  effectsList.innerHTML = app.jailbreakEffects.map((effect) => `<li>${effect}</li>`).join("")

  // Political context
  document.getElementById("modalPoliticalContext").textContent = app.politicalContext

  // Indicators
  const indicatorsContainer = document.getElementById("modalIndicators")
  indicatorsContainer.innerHTML = `
    <div class="indicator">
      <div class="indicator-label">
        <span>Platform Lock-In Reduced</span>
        <span>${app.indicators.platformLockInReduced}%</span>
      </div>
      <div class="indicator-bar">
        <div class="indicator-fill" style="width: ${app.indicators.platformLockInReduced}%"></div>
      </div>
    </div>
    <div class="indicator">
      <div class="indicator-label">
        <span>Surveillance Reduced</span>
        <span>${app.indicators.surveillanceReduced}%</span>
      </div>
      <div class="indicator-bar">
        <div class="indicator-fill" style="width: ${app.indicators.surveillanceReduced}%"></div>
      </div>
    </div>
    <div class="indicator">
      <div class="indicator-label">
        <span>Local Economic Benefit Increased</span>
        <span>${app.indicators.localEconomicBenefit}%</span>
      </div>
      <div class="indicator-bar">
        <div class="indicator-fill" style="width: ${app.indicators.localEconomicBenefit}%"></div>
      </div>
    </div>
  `

  modal.classList.add("active")
}

function closeModal() {
  const modal = document.getElementById("modalOverlay")
  modal.classList.remove("active")
  document.body.classList.remove("no-scroll")
}

// ===== EVENT LISTENERS =====

// Category filters
document.getElementById("categoryFilters").addEventListener("click", (e) => {
  if (e.target.classList.contains("filter-btn")) {
    // Update active state
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    e.target.classList.add("active")

    // Update current category
    currentCategory = e.target.getAttribute("data-category")
    renderApps()
  }
})

// Toggle filters
document.getElementById("openSourceFilter").addEventListener("change", (e) => {
  openSourceOnly = e.target.checked
  renderApps()
})

document.getElementById("noSurveillanceFilter").addEventListener("change", (e) => {
  noSurveillanceOnly = e.target.checked
  renderApps()
})

document.getElementById("noTaxFilter").addEventListener("change", (e) => {
  noTaxOnly = e.target.checked
  renderApps()
})

// Modal controls
document.getElementById("modalClose").addEventListener("click", closeModal)
document.getElementById("closeModalBtn").addEventListener("click", closeModal)

document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalOverlay")) {
    closeModal()
  }
})

// Keyboard accessibility - ESC key closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("modalOverlay")
    if (modal.classList.contains("active")) {
      closeModal()
    }
  }
})

// Mobile navigation toggle functionality
document.getElementById("navToggle").addEventListener("click", () => {
  const navMenu = document.querySelector(".nav-menu")
  navMenu.classList.toggle("active")
})

// Smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
      // Close mobile menu if open
      const navMenu = document.querySelector(".nav-menu")
      if (navMenu.classList.contains("active")) {
        navMenu.classList.remove("active")
      }
    }
  })
})

// ===== INITIALIZE =====
renderApps()
