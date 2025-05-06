import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { playerName, gameCode } = await request.json()

    if (!playerName || !gameCode) {
      return NextResponse.json({ message: "Player name and game code are required" }, { status: 400 })
    }

    // Check if game exists
    const game = await db.getGame(gameCode)

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    // Generate a unique player ID
    const playerId = uuidv4()

    // Add player to the game
    await db.addPlayer({
      id: playerId,
      gameCode,
      name: playerName,
      balance: 1500, // Starting player balance
      joinedAt: new Date(),
    })

    // Notify all connected clients about the new player
    // This will be handled by the WebSocket server

    return NextResponse.json({ playerId })
  } catch (error) {
    console.error("Error joining game:", error)
    return NextResponse.json({ message: "Failed to join game" }, { status: 500 })
  }
}
