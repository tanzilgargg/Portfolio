import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get("playerId")
    const gameCode = searchParams.get("gameCode")

    if (!playerId || !gameCode) {
      return NextResponse.json({ message: "Player ID and game code are required" }, { status: 400 })
    }

    // Check if we're in a preview environment
    const isPreview = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development"

    if (isPreview) {
      // Return mock data for preview
      return NextResponse.json({
        balance: 1500,
        transactions: [
          {
            id: "tx1",
            type: "deposit",
            amount: 200,
            from: "Bank",
            to: "Player",
            description: "Starting balance",
            timestamp: new Date().toISOString(),
          },
          {
            id: "tx2",
            type: "withdrawal",
            amount: 50,
            from: "Player",
            to: "Bank",
            description: "Property purchase",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      })
    }

    // Get player data
    const player = await db.getPlayer(playerId, gameCode)

    if (!player) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 })
    }

    // Get player's transactions
    const transactions = await db.getPlayerTransactions(playerId, gameCode)

    return NextResponse.json({
      balance: player.balance,
      transactions,
    })
  } catch (error) {
    console.error("Error fetching player data:", error)
    return NextResponse.json({ message: "Failed to fetch player data" }, { status: 500 })
  }
}
