import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameCode = searchParams.get("gameCode")

    if (!gameCode) {
      return NextResponse.json({ message: "Game code is required" }, { status: 400 })
    }

    // Check if we're in a preview environment
    const isPreview = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development"

    if (isPreview) {
      // Return mock data for preview
      return NextResponse.json({
        bankBalance: 10000,
        players: [
          {
            id: "player1",
            name: "Alice",
            balance: 1500,
            joinedAt: new Date().toISOString(),
          },
          {
            id: "player2",
            name: "Bob",
            balance: 1800,
            joinedAt: new Date().toISOString(),
          },
        ],
        transactions: [
          {
            id: "tx1",
            type: "deposit",
            amount: 200,
            from: "Bank",
            to: "Alice",
            description: "Passing GO",
            timestamp: new Date().toISOString(),
          },
          {
            id: "tx2",
            type: "withdrawal",
            amount: 150,
            from: "Bob",
            to: "Bank",
            description: "Property purchase",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        transferRequests: [
          {
            requestId: "req1",
            playerId: "player1",
            playerName: "Alice",
            amount: 300,
            reason: "Festival ticket purchase",
            timestamp: new Date().toISOString(),
          },
        ],
      })
    }

    // Get game data
    const game = await db.getGame(gameCode)

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    // Get all players in the game
    const players = await db.getGamePlayers(gameCode)

    // Get all transactions in the game
    const transactions = await db.getGameTransactions(gameCode)

    // Get all transfer requests in the game
    const transferRequests = await db.getTransferRequests(gameCode)

    return NextResponse.json({
      bankBalance: game.bankBalance,
      players,
      transactions,
      transferRequests,
    })
  } catch (error) {
    console.error("Error fetching game data:", error)
    return NextResponse.json({ message: "Failed to fetch game data" }, { status: 500 })
  }
}
