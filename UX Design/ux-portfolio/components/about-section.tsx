"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type TimelineItem = {
  year: string
  title: string
  description: string
  icon: string
}

const timeline: TimelineItem[] = [
  {
    year: "2023",
    title: "Senior UX Designer at TechFuture",
    description: "Leading design for flagship products and mentoring junior designers.",
    icon: "💼",
  },
  {
    year: "2021",
    title: "UX Designer at DesignLab",
    description: "Worked on user research and interface design for mobile applications.",
    icon: "🎨",
  },
  {
    year: "2020",
    title: "UX/UI Certificate",
    description: "Completed advanced certification in user experience and interface design.",
    icon: "🎓",
  },
  {
    year: "2019",
    title: "Design Intern at CreativeTech",
    description: "Assisted in user research and creating wireframes for web applications.",
    icon: "🚀",
  },
]

const skills = [
  "User Research",
  "Wireframing",
  "Prototyping",
  "Usability Testing",
  "Information Architecture",
  "Interaction Design",
  "Visual Design",
  "Design Systems",
  "Figma",
  "Adobe XD",
  "Sketch",
  "HTML/CSS",
]

export function AboutSection() {
  return (
    <section id="about" className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
          About Me
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          UX Designer with a passion for creating intuitive and engaging digital experiences.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25"></div>
            <div className="relative aspect-square overflow-hidden rounded-lg border border-purple-500/20">
              <Image src="/placeholder.svg?height=600&width=600" alt="Profile" fill className="object-cover" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4">Hi there! I'm Tanzil</h3>
          <p className="text-gray-300 mb-6">
            I'm a UX designer passionate about creating human-centered digital experiences that solve real problems.
            With a background in both design and psychology, I bring a unique perspective to understanding user needs
            and translating them into intuitive interfaces.
          </p>
          <p className="text-gray-300 mb-6">
            My approach combines rigorous research with creative problem-solving to design products that are not only
            visually appealing but also functional and accessible. I believe in designing with empathy and always
            putting the user first.
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
            <Download className="mr-2 h-4 w-4" /> Download Resume
          </Button>
        </motion.div>
      </div>

      <div className="mt-20">
        <h3 className="text-2xl font-bold mb-8 text-center">My Journey</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8"}`}>
                  <div className="mb-1 text-sm text-purple-400">{item.year}</div>
                  <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                  <p className="text-gray-300">{item.description}</p>
                </div>
                <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <span>{item.icon}</span>
                </div>
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h3 className="text-2xl font-bold mb-8 text-center">Skills & Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <span>{skill}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
