"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 3
  const { toast } = useToast()

  // Mock mode is used when WebSocket connection fails
  const [mockMode, setMockMode] = useState(false)

  const connectWebSocket = useCallback(() => {
    // Don't try to connect if we're already connecting or in mock mode
    if (isConnecting || mockMode) return

    // Get game code from localStorage
    const gameCode = localStorage.getItem("gameCode")
    if (!gameCode) return

    setIsConnecting(true)

    try {
      // Create WebSocket connection
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${wsProtocol}//${window.location.host}/api/ws?gameCode=${gameCode}`

      console.log("Connecting to WebSocket:", wsUrl)
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setIsConnected(true)
        setIsConnecting(false)
        reconnectAttempts.current = 0
        console.log("WebSocket connected")

        // Send authentication message
        const playerId = localStorage.getItem("playerId")
        const bankerName = localStorage.getItem("bankerName")

        if (playerId) {
          ws.send(
            JSON.stringify({
              type: "authenticate",
              gameCode,
              playerId,
              role: "player",
            }),
          )
        } else if (bankerName) {
          ws.send(
            JSON.stringify({
              type: "authenticate",
              gameCode,
              name: bankerName,
              role: "banker",
            }),
          )
        }
      }

      ws.onmessage = (event) => {
        setLastMessage(event)
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setIsConnecting(false)

        // If we've tried to reconnect too many times, switch to mock mode
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log("Switching to mock mode after failed reconnect attempts")
          setMockMode(true)

          // Only show toast once when switching to mock mode
          if (!mockMode) {
            toast({
              title: "Demo Mode Activated",
              description: "Using demo data since the game server is unavailable",
            })
          }
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        setIsConnecting(false)
        console.log("WebSocket disconnected")

        // Try to reconnect unless we're in mock mode
        if (!mockMode && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
          setTimeout(connectWebSocket, 2000)
        } else if (reconnectAttempts.current >= maxReconnectAttempts && !mockMode) {
          setMockMode(true)
          toast({
            title: "Demo Mode Activated",
            description: "Using demo data since the game server is unavailable",
          })
        }
      }

      setSocket(ws)
    } catch (error) {
      console.error("Error creating WebSocket:", error)
      setIsConnecting(false)

      // If we've tried to reconnect too many times, switch to mock mode
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setMockMode(true)
        toast({
          title: "Demo Mode Activated",
          description: "Using demo data since the game server is unavailable",
        })
      }
    }
  }, [toast, isConnecting, mockMode])

  useEffect(() => {
    connectWebSocket()

    // Clean up on unmount
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [connectWebSocket, socket])

  const sendMessage = useCallback(
    (message: string) => {
      if (socket && isConnected) {
        socket.send(message)
        return true
      }

      // If in mock mode, handle the message locally
      if (mockMode) {
        handleMockMessage(message, setLastMessage)
        return true
      }

      return false
    },
    [socket, isConnected, mockMode],
  )

  return { isConnected, lastMessage, sendMessage, mockMode }
}

// Function to handle messages in mock mode
function handleMockMessage(message: string, setLastMessage: Function) {
  try {
    const data = JSON.parse(message)
    const gameCode = localStorage.getItem("gameCode") || "DEMO123"
    const mockResponse: any = { type: data.type, gameCode }

    // Generate a mock response based on the message type
    switch (data.type) {
      case "transfer":
        mockResponse.playerId = data.playerId
        mockResponse.amount = data.amount
        mockResponse.newBalance = 1500 + data.amount

        // Also create a transaction event
        setTimeout(() => {
          setLastMessage({
            data: JSON.stringify({
              type: "transaction",
              gameCode,
              playerId: data.playerId,
              transaction: {
                id: `mock-${Date.now()}`,
                type: "deposit",
                amount: data.amount,
                from: "Bank",
                to: "Player",
                description: "Transfer from bank",
                timestamp: new Date().toISOString(),
              },
            }),
          } as any)
        }, 300)
        break

      case "bank_operation":
        mockResponse.newBalance = data.operation === "add" ? 10000 + data.amount : 10000 - data.amount
        break

      case "adjust_balance":
        mockResponse.playerId = data.playerId
        mockResponse.newBalance = 1500 + data.amount
        break

      case "transfer_request":
        mockResponse.requestId = `req-${Date.now()}`
        mockResponse.playerId = data.playerId
        mockResponse.playerName = localStorage.getItem("playerName") || "Player"
        mockResponse.amount = data.amount
        mockResponse.reason = data.reason
        mockResponse.timestamp = new Date().toISOString()
        break

      case "approve_transfer_request":
      case "reject_transfer_request":
        // These don't need special handling in mock mode
        return
    }

    // Send the mock response
    setTimeout(() => {
      setLastMessage({ data: JSON.stringify(mockResponse) } as any)
    }, 500)
  } catch (error) {
    console.error("Error handling mock message:", error)
  }
}
