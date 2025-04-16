"use client"

import { useEffect, useState } from "react"
import { motion, stagger, useAnimate, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

export function TypewriterEffect({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
}) {
  const [scope, animate] = useAnimate()
  const isInView = useInView(scope)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (isInView && !started) {
      setStarted(true)
      const wordsArray = words.map((word) => word.text)
      const textToType = wordsArray.join(" ")

      const letterAnimation = async () => {
        await animate(
          "span",
          {
            display: "inline-block",
            opacity: 1,
          },
          {
            duration: 0.05,
            delay: stagger(0.05),
            ease: "easeInOut",
          },
        )
      }

      letterAnimation()
    }
  }, [isInView, animate, started, words])

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {words.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.split("").map((char, index) => (
                <motion.span
                  initial={{
                    opacity: 0,
                    display: "none",
                  }}
                  key={`char-${index}`}
                  className={cn(word.className)}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          )
        })}
      </motion.div>
    )
  }

  return (
    <div className={cn("flex items-center", className)}>
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        className={cn("inline-block h-[1em] w-[4px] bg-pink-500 ml-1", cursorClassName)}
      ></motion.span>
    </div>
  )
}
