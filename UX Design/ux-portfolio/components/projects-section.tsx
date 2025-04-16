"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Project = {
  id: number
  title: string
  description: string
  tags: string[]
  image: string
  link: string
}

const projects: Project[] = [
  {
    id: 1,
    title: "FinTech Mobile App Redesign",
    description:
      "Redesigned a financial app to improve user engagement and simplify complex transactions, resulting in a 40% increase in daily active users.",
    tags: ["UX Research", "UI Design", "Prototyping"],
    image: "/placeholder.svg?height=600&width=800",
    link: "#",
  },
  {
    id: 2,
    title: "E-commerce User Experience Optimization",
    description:
      "Conducted user research and implemented UX improvements that increased conversion rates by 25% and reduced cart abandonment.",
    tags: ["User Testing", "Information Architecture", "Wireframing"],
    image: "/placeholder.svg?height=600&width=800",
    link: "#",
  },
  {
    id: 3,
    title: "Healthcare Portal Redesign",
    description:
      "Created an accessible and intuitive interface for patients to manage appointments, view medical records, and communicate with healthcare providers.",
    tags: ["Accessibility", "User Research", "UI Design"],
    image: "/placeholder.svg?height=600&width=800",
    link: "#",
  },
  {
    id: 4,
    title: "Smart Home Control System",
    description:
      "Designed a unified interface for controlling various smart home devices, focusing on simplicity and intuitive interactions.",
    tags: ["IoT", "Interaction Design", "Prototyping"],
    image: "/placeholder.svg?height=600&width=800",
    link: "#",
  },
]

export function ProjectsSection() {
  const [activeProject, setActiveProject] = useState<number | null>(null)

  return (
    <section id="projects" className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
          Featured Projects
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Explore my recent work where I've applied user-centered design principles to solve complex problems and create
          intuitive experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -5 }}
            onMouseEnter={() => setActiveProject(project.id)}
            onMouseLeave={() => setActiveProject(null)}
          >
            <Card className="overflow-hidden bg-black/40 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 h-full">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <Button
                  asChild
                  variant="ghost"
                  className="p-0 h-auto text-pink-500 hover:text-pink-400 hover:bg-transparent"
                >
                  <a href={project.link} className="flex items-center gap-2">
                    View Case Study <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button asChild variant="outline" className="border-purple-500 text-white hover:bg-purple-950/20">
          <a href="#" className="flex items-center gap-2">
            View All Projects <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  )
}
