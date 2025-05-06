import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { bankerName, gameCode } = await request.json()

    if (!bankerName || !gameCode) {
      return NextResponse.json({ message: "Banker name and game code are required" }, { status: 400 })
    }

    // Check if game exists
    const game = await db.getGame(gameCode)

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    // Update banker name if different
    if (game.bankerName !== bankerName) {
      await db.updateGame(gameCode, { bankerName })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining as banker:", error)
    return NextResponse.json({ message: "Failed to join as banker" }, { status: 500 })
  }
}
