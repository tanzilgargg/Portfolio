"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function PlayerBalance({ balance }) {
  const [prevBalance, setPrevBalance] = useState(balance)
  const [isIncreasing, setIsIncreasing] = useState(false)
  const [isDecreasing, setIsDecreasing] = useState(false)

  useEffect(() => {
    if (balance > prevBalance) {
      setIsIncreasing(true)
      setTimeout(() => setIsIncreasing(false), 2000)
    } else if (balance < prevBalance) {
      setIsDecreasing(true)
      setTimeout(() => setIsDecreasing(false), 2000)
    }

    setPrevBalance(balance)
  }, [balance, prevBalance])

  return (
    <div className="text-center py-6">
      <p className="text-sm text-gray-500 mb-2">Your Balance</p>
      <div className="relative inline-block">
        <AnimatePresence>
          {isIncreasing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-green-500 font-medium"
            >
              +${(balance - prevBalance).toLocaleString()}
            </motion.div>
          )}

          {isDecreasing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-red-500 font-medium"
            >
              -${(prevBalance - balance).toLocaleString()}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h2
          className={`text-5xl font-bold ${isIncreasing ? "text-green-600" : isDecreasing ? "text-red-600" : "text-purple-700"}`}
          animate={{
            scale: isIncreasing || isDecreasing ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          ${balance.toLocaleString()}
        </motion.h2>
      </div>
    </div>
  )
}
