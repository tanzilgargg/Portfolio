// This is a mock database implementation
// In a real application, you would use a proper database like SQLite or Firebase

import { v4 as uuidv4 } from "uuid"

// In-memory storage
const games = new Map()
const players = new Map()
const transactions = new Map()
const transferRequests = new Map()

export const db = {
  // Game operations
  createGame: async (game) => {
    games.set(game.code, game)
    return game
  },

  getGame: async (code) => {
    return games.get(code) || null
  },

  updateGame: async (code, updates) => {
    const game = games.get(code)
    if (!game) return null

    const updatedGame = { ...game, ...updates }
    games.set(code, updatedGame)
    return updatedGame
  },

  // Player operations
  addPlayer: async (player) => {
    const key = `${player.gameCode}:${player.id}`
    players.set(key, player)
    return player
  },

  getPlayer: async (id, gameCode) => {
    const key = `${gameCode}:${id}`
    return players.get(key) || null
  },

  updatePlayer: async (id, gameCode, updates) => {
    const key = `${gameCode}:${id}`
    const player = players.get(key)
    if (!player) return null

    const updatedPlayer = { ...player, ...updates }
    players.set(key, updatedPlayer)
    return updatedPlayer
  },

  getGamePlayers: async (gameCode) => {
    const gamePlayers = []
    for (const [key, player] of players.entries()) {
      if (key.startsWith(`${gameCode}:`)) {
        gamePlayers.push(player)
      }
    }
    return gamePlayers
  },

  // Transaction operations
  addTransaction: async (transaction) => {
    const id = uuidv4()
    const newTransaction = {
      id,
      timestamp: new Date(),
      ...transaction,
    }

    transactions.set(id, newTransaction)
    return newTransaction
  },

  getPlayerTransactions: async (playerId, gameCode) => {
    const playerTransactions = []
    for (const transaction of transactions.values()) {
      if (
        transaction.gameCode === gameCode &&
        (transaction.playerId === playerId ||
          transaction.fromPlayerId === playerId ||
          transaction.toPlayerId === playerId)
      ) {
        playerTransactions.push(transaction)
      }
    }
    return playerTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  getGameTransactions: async (gameCode) => {
    const gameTransactions = []
    for (const transaction of transactions.values()) {
      if (transaction.gameCode === gameCode) {
        gameTransactions.push(transaction)
      }
    }
    return gameTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  // Transfer request operations
  addTransferRequest: async (request) => {
    const id = uuidv4()
    const newRequest = {
      requestId: id,
      timestamp: new Date(),
      ...request,
    }

    transferRequests.set(id, newRequest)
    return newRequest
  },

  getTransferRequests: async (gameCode) => {
    const gameRequests = []
    for (const request of transferRequests.values()) {
      if (request.gameCode === gameCode) {
        gameRequests.push(request)
      }
    }
    return gameRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  removeTransferRequest: async (requestId) => {
    transferRequests.delete(requestId)
  },
}

// Initialize with some sample data for development
const initSampleData = () => {
  // Sample game
  const gameCode = "DEMO123"
  db.createGame({
    code: gameCode,
    bankerName: "Festival Master",
    bankBalance: 10000,
    createdAt: new Date(),
  })

  // Sample players
  const player1 = {
    id: "player1",
    gameCode,
    name: "Alice",
    balance: 1500,
    joinedAt: new Date(),
  }

  const player2 = {
    id: "player2",
    gameCode,
    name: "Bob",
    balance: 1800,
    joinedAt: new Date(),
  }

  db.addPlayer(player1)
  db.addPlayer(player2)

  // Sample transactions
  db.addTransaction({
    gameCode,
    type: "deposit",
    amount: 200,
    playerId: "player1",
    from: "Bank",
    description: "Passing GO",
  })

  db.addTransaction({
    gameCode,
    type: "withdrawal",
    amount: 150,
    playerId: "player2",
    to: "Bank",
    description: "Property purchase",
  })

  // Sample transfer request
  db.addTransferRequest({
    gameCode,
    playerId: "player1",
    playerName: "Alice",
    amount: 300,
    reason: "Festival ticket purchase",
  })
}

// Initialize sample data
initSampleData()
