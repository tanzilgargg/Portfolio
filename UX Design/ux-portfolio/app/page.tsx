import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <Navigation />
        <main>
          <HeroSection />
          <ProjectsSection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </div>
  )
}
