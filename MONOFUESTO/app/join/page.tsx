"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function JoinPage() {
  const [playerName, setPlayerName] = useState("")
  const [gameCode, setGameCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!playerName.trim() || !gameCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter both your name and game code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/join-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerName, gameCode }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("playerName", playerName)
        localStorage.setItem("gameCode", gameCode)
        localStorage.setItem("playerId", data.playerId)
        router.push("/player-dashboard")
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to join game",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Join Monofuesto Game</CardTitle>
          <CardDescription className="text-center">Enter your details to join the festival</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="playerName">Your Festival Name</Label>
              <Input
                id="playerName"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameCode">Game Code</Label>
              <Input
                id="gameCode"
                placeholder="Enter game code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? "Joining..." : "Join Game"}
            </Button>

            <div className="text-center mt-4">
              <Button variant="link" onClick={() => router.push("/")} className="text-gray-600">
                Back to Home
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
