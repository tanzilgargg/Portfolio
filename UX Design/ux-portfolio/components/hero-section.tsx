"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TypewriterEffect } from "@/components/typewriter-effect"

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: {
      x: number
      y: number
      radius: number
      color: string
      velocity: { x: number; y: number }
    }[] = []

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

    const animate = () => {
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

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const words = [
    {
      text: "Hi,",
    },
    {
      text: "I'm",
    },
    {
      text: "Tanzil.",
    },
    {
      text: "I",
    },
    {
      text: "design",
    },
    {
      text: "future-ready",
      className: "text-purple-500 dark:text-purple-500",
    },
    {
      text: "experiences.",
      className: "text-pink-500 dark:text-pink-500",
    },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-30"></canvas>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <TypewriterEffect words={words} className="text-4xl sm:text-5xl md:text-6xl font-bold" />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
        >
          UX Designer specializing in creating intuitive digital experiences that bridge the gap between human needs and
          technological possibilities.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
          >
            <Link href="#projects">
              View My Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-purple-500 text-white hover:bg-purple-950/20">
            <Link href="#about">About Me</Link>
          </Button>
        </motion.div>
      </div>
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center items-start p-1"
        >
          <motion.div
            animate={{
              y: [0, 6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
            className="w-1 h-1 bg-white rounded-full"
          ></motion.div>
        </motion.div>
      </div>
    </section>
  )
}
