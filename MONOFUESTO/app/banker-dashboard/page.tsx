"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Banknote, ArrowLeftRight, Clock, LogOut, Plus, Minus, Users, Copy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TransactionList from "@/components/transaction-list"
import { useWebSocket } from "@/hooks/use-websocket"

export default function BankerDashboard() {
  const [bankerName, setBankerName] = useState("")
  const [gameCode, setGameCode] = useState("")
  const [bankBalance, setBankBalance] = useState(10000)
  const [players, setPlayers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [transferRequests, setTransferRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { lastMessage, sendMessage } = useWebSocket()

  useEffect(() => {
    // Check if banker is logged in
    const storedName = localStorage.getItem("bankerName")
    const storedGameCode = localStorage.getItem("gameCode")

    if (!storedName || !storedGameCode) {
      router.push("/banker")
      return
    }

    setBankerName(storedName)
    setGameCode(storedGameCode)

    // Fetch initial game data
    const fetchGameData = async () => {
      try {
        const response = await fetch(`/api/game-data?gameCode=${storedGameCode}`)

        if (response.ok) {
          const data = await response.json()
          setBankBalance(data.bankBalance)
          setPlayers(data.players)
          setTransactions(data.transactions)
          setTransferRequests(data.transferRequests || [])
        } else {
          // If API fails, use demo data
          console.log("Using demo data due to API error")

          // Demo data
          setBankBalance(10000)
          setPlayers([
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
          ])
          setTransactions([
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
              timestamp: new Date().toISOString(),
            },
          ])
          setTransferRequests([
            {
              requestId: "req1",
              playerId: "player1",
              playerName: "Alice",
              amount: 300,
              reason: "Festival ticket purchase",
              timestamp: new Date().toISOString(),
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching game data:", error)

        // Use demo data on error
        setBankBalance(10000)
        setPlayers([
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
        ])
        setTransactions([
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
            timestamp: new Date().toISOString(),
          },
        ])
        setTransferRequests([
          {
            requestId: "req1",
            playerId: "player1",
            playerName: "Alice",
            amount: 300,
            reason: "Festival ticket purchase",
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGameData()
  }, [router, toast])

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data)

        if (data.type === "player_joined" && data.gameCode === gameCode) {
          setPlayers((prev) => [...prev, data.player])
          toast({
            title: "Player Joined",
            description: `${data.player.name} has joined the game`,
          })
        } else if (data.type === "bank_balance_update" && data.gameCode === gameCode) {
          setBankBalance(data.newBalance)
        } else if (data.type === "transaction" && data.gameCode === gameCode) {
          setTransactions((prev) => [data.transaction, ...prev])
        } else if (data.type === "transfer_request" && data.gameCode === gameCode) {
          setTransferRequests((prev) => [data, ...prev])
          toast({
            title: "Transfer Request",
            description: `${data.playerName} requested $${data.amount}`,
          })
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }
  }, [lastMessage, gameCode, toast])

  const handleCopyGameCode = () => {
    navigator.clipboard.writeText(gameCode)
    toast({
      title: "Game Code Copied",
      description: "Game code copied to clipboard",
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("bankerName")
    localStorage.removeItem("gameCode")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <CardContent>
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-48 bg-gray-300 rounded mb-4"></div>
              <div className="h-8 w-32 bg-gray-300 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Monofuesto Bank</h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-white/20 text-white border-0 cursor-pointer"
                onClick={handleCopyGameCode}
              >
                Game Code: {gameCode} <Copy className="h-3 w-3 ml-1" />
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/20 text-white border-0">
              <Users className="h-4 w-4 mr-1" /> {players.length} Players
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/20 text-white border-0 hover:bg-white/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit Game
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-orange-600">
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{bankerName}</CardTitle>
                  <CardDescription>Banker</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-1">Bank Balance</p>
                <h2 className="text-4xl font-bold text-green-600">${bankBalance.toLocaleString()}</h2>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage funds and players</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FundTransferForm players={players} gameCode={gameCode} sendMessage={sendMessage} toast={toast} />
                <BankOperationsForm
                  gameCode={gameCode}
                  bankBalance={bankBalance}
                  sendMessage={sendMessage}
                  toast={toast}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 bg-white/20 text-white">
            <TabsTrigger
              value="players"
              className="data-[state=active]:bg-white/90 data-[state=active]:text-purple-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Players
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-white/90 data-[state=active]:text-purple-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-white/90 data-[state=active]:text-purple-700"
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Requests
              {transferRequests.length > 0 && <Badge className="ml-2 bg-red-500">{transferRequests.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle>Players</CardTitle>
                <CardDescription>All players in the game</CardDescription>
              </CardHeader>
              <CardContent>
                <PlayersList players={players} gameCode={gameCode} sendMessage={sendMessage} toast={toast} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All game transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={transactions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle>Transfer Requests</CardTitle>
                <CardDescription>Pending requests from players</CardDescription>
              </CardHeader>
              <CardContent>
                <TransferRequestList
                  requests={transferRequests}
                  players={players}
                  gameCode={gameCode}
                  sendMessage={sendMessage}
                  setTransferRequests={setTransferRequests}
                  toast={toast}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function FundTransferForm({ players, gameCode, sendMessage, toast }) {
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTransfer = async (e) => {
    e.preventDefault()

    if (!selectedPlayer) {
      toast({
        title: "Error",
        description: "Please select a player",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Send transfer via WebSocket
      sendMessage(
        JSON.stringify({
          type: "transfer",
          gameCode,
          playerId: selectedPlayer,
          amount: Number(amount),
          source: "bank",
        }),
      )

      toast({
        title: "Transfer Successful",
        description: `$${amount} transferred to player`,
      })

      // Reset form
      setSelectedPlayer("")
      setAmount("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to transfer funds. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleTransfer} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="player">Transfer To Player</Label>
        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
          <SelectTrigger id="player">
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        disabled={isSubmitting}
      >
        <Banknote className="h-4 w-4 mr-2" />
        {isSubmitting ? "Processing..." : "Transfer Funds"}
      </Button>
    </form>
  )
}

function BankOperationsForm({ gameCode, bankBalance, sendMessage, toast }) {
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Send bank operation via WebSocket
      sendMessage(
        JSON.stringify({
          type: "bank_operation",
          gameCode,
          operation: "add",
          amount: Number(amount),
        }),
      )

      toast({
        title: "Funds Added",
        description: `$${amount} added to bank`,
      })

      // Reset form
      setAmount("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add funds. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      })
      return
    }

    if (Number(amount) > bankBalance) {
      toast({
        title: "Insufficient Funds",
        description: "Bank doesn't have enough funds",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Send bank operation via WebSocket
      sendMessage(
        JSON.stringify({
          type: "bank_operation",
          gameCode,
          operation: "remove",
          amount: Number(amount),
        }),
      )

      toast({
        title: "Funds Removed",
        description: `$${amount} removed from bank`,
      })

      // Reset form
      setAmount("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove funds. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bankAmount">Amount ($)</Label>
        <Input
          id="bankAmount"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={handleAddFunds}
          className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
          disabled={isSubmitting}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>

        <Button
          type="button"
          onClick={handleRemoveFunds}
          className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
          disabled={isSubmitting}
        >
          <Minus className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </div>
    </div>
  )
}

function PlayersList({ players, gameCode, sendMessage, toast }) {
  const handleAdjustBalance = (playerId, amount) => {
    if (isNaN(Number(amount)) || Number(amount) === 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid non-zero amount",
        variant: "destructive",
      })
      return
    }

    // Send adjustment via WebSocket
    sendMessage(
      JSON.stringify({
        type: "adjust_balance",
        gameCode,
        playerId,
        amount: Number(amount),
      }),
    )

    toast({
      title: "Balance Adjusted",
      description: `Player balance adjusted by $${amount}`,
    })
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No players have joined yet</p>
        <p className="text-sm mt-2">Share the game code with players to join</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {players.map((player) => (
        <Card key={player.id} className="bg-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-gradient-to-r from-pink-500 to-purple-600">
                  <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-gray-500">Balance: ${player.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => {
                    const amount = prompt(`Enter amount to add to ${player.name}'s balance:`)
                    if (amount) handleAdjustBalance(player.id, Math.abs(Number(amount)))
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    const amount = prompt(`Enter amount to deduct from ${player.name}'s balance:`)
                    if (amount) handleAdjustBalance(player.id, -Math.abs(Number(amount)))
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TransferRequestList({ requests, players, gameCode, sendMessage, setTransferRequests, toast }) {
  const handleApprove = (requestId, playerId, amount) => {
    // Send approval via WebSocket
    sendMessage(
      JSON.stringify({
        type: "approve_transfer_request",
        gameCode,
        requestId,
        playerId,
        amount,
      }),
    )

    // Remove request from list
    setTransferRequests((prev) => prev.filter((req) => req.requestId !== requestId))

    toast({
      title: "Request Approved",
      description: `Transfer of $${amount} approved`,
    })
  }

  const handleReject = (requestId) => {
    // Send rejection via WebSocket
    sendMessage(
      JSON.stringify({
        type: "reject_transfer_request",
        gameCode,
        requestId,
      }),
    )

    // Remove request from list
    setTransferRequests((prev) => prev.filter((req) => req.requestId !== requestId))

    toast({
      title: "Request Rejected",
      description: "Transfer request rejected",
    })
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No pending transfer requests</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const player = players.find((p) => p.id === request.playerId)
        return (
          <Card key={request.requestId} className="bg-white/50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-gradient-to-r from-pink-500 to-purple-600">
                      <AvatarFallback>{player?.name.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{player?.name || "Unknown Player"}</p>
                      <p className="text-sm text-gray-500">Requested: ${request.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleApprove(request.requestId, request.playerId, request.amount)}
                    >
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleReject(request.requestId)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {request.reason && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                    <p>
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
