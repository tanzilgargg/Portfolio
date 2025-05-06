import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { bankerName } = await request.json()

    if (!bankerName) {
      return NextResponse.json({ message: "Banker name is required" }, { status: 400 })
    }

    // Generate a unique 6-character game code
    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create a new game in the database
    await db.createGame({
      code: gameCode,
      bankerName,
      bankBalance: 10000, // Starting bank balance
      createdAt: new Date(),
    })

    return NextResponse.json({ gameCode })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ message: "Failed to create game" }, { status: 500 })
  }
}
