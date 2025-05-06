"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function BankerPage() {
  const [bankerName, setBankerName] = useState("")
  const [gameCode, setGameCode] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bankerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/create-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bankerName }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("bankerName", bankerName)
        localStorage.setItem("gameCode", data.gameCode)
        toast({
          title: "Game Created",
          description: `Your game code is: ${data.gameCode}`,
        })
        router.push("/banker-dashboard")
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create game",
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
      setIsCreating(false)
    }
  }

  const handleJoinAsAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bankerName.trim() || !gameCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter both your name and game code",
        variant: "destructive",
      })
      return
    }

    setIsJoining(true)

    try {
      const response = await fetch("/api/join-as-banker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bankerName, gameCode }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("bankerName", bankerName)
        localStorage.setItem("gameCode", gameCode)
        router.push("/banker-dashboard")
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to join as banker",
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
      setIsJoining(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Monofuesto Banker</CardTitle>
          <CardDescription className="text-center">Create or join a game as the banker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bankerName">Your Name</Label>
              <Input
                id="bankerName"
                placeholder="Enter your name"
                value={bankerName}
                onChange={(e) => setBankerName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={handleCreateGame}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create New Game"}
              </Button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-600">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameCode">Game Code</Label>
                <Input
                  id="gameCode"
                  placeholder="Enter existing game code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                />
              </div>

              <Button
                onClick={handleJoinAsAdmin}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Join Existing Game"}
              </Button>
            </div>

            <div className="text-center mt-4">
              <Button variant="link" onClick={() => router.push("/")} className="text-gray-600">
                Back to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
