"use client"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeftRight, Clock, LogOut } from "lucide-react"
import TransactionList from "@/components/transaction-list"
import PlayerBalance from "@/components/player-balance"
import { useWebSocket } from "@/hooks/use-websocket"

export default function PlayerDashboard() {
  const [playerName, setPlayerName] = useState("")
  const [gameCode, setGameCode] = useState("")
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { lastMessage, sendMessage } = useWebSocket()

  useEffect(() => {
    // Check if player is logged in
    const storedName = localStorage.getItem("playerName")
    const storedGameCode = localStorage.getItem("gameCode")
    const playerId = localStorage.getItem("playerId")

    if (!storedName || !storedGameCode || !playerId) {
      router.push("/join")
      return
    }

    setPlayerName(storedName)
    setGameCode(storedGameCode)

    // Fetch initial player data
    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`/api/player-data?playerId=${playerId}&gameCode=${storedGameCode}`)

        if (response.ok) {
          const data = await response.json()
          setBalance(data.balance)
          setTransactions(data.transactions)
        } else {
          // If API fails, use demo data
          console.log("Using demo data due to API error")

          // Demo data
          setBalance(1500)
          setTransactions([
            {
              id: "tx1",
              type: "deposit",
              amount: 200,
              from: "Bank",
              to: storedName,
              description: "Starting balance",
              timestamp: new Date().toISOString(),
            },
            {
              id: "tx2",
              type: "withdrawal",
              amount: 50,
              from: storedName,
              to: "Bank",
              description: "Property purchase",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching player data:", error)

        // Use demo data on error
        setBalance(1500)
        setTransactions([
          {
            id: "tx1",
            type: "deposit",
            amount: 200,
            from: "Bank",
            to: storedName,
            description: "Starting balance",
            timestamp: new Date().toISOString(),
          },
          {
            id: "tx2",
            type: "withdrawal",
            amount: 50,
            from: storedName,
            to: "Bank",
            description: "Property purchase",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayerData()
  }, [router, toast])

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data)

        if (data.type === "balance_update" && data.playerId === localStorage.getItem("playerId")) {
          setBalance(data.newBalance)
          toast({
            title: "Balance Updated",
            description: `Your balance is now $${data.newBalance}`,
          })
        } else if (data.type === "transaction" && data.playerId === localStorage.getItem("playerId")) {
          setTransactions((prev) => [data.transaction, ...prev])
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }
  }, [lastMessage, toast])

  const handleLogout = () => {
    localStorage.removeItem("playerName")
    localStorage.removeItem("gameCode")
    localStorage.removeItem("playerId")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 flex items-center justify-center">
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
    <main className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Monofuesto</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/20 text-white border-0">
                Game: {gameCode}
              </Badge>
            </div>
          </div>
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

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 bg-gradient-to-r from-pink-500 to-purple-600">
                <AvatarFallback>{playerName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{playerName}</CardTitle>
                <CardDescription>Player</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PlayerBalance balance={balance} />
          </CardContent>
        </Card>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-white/20 text-white">
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-white/90 data-[state=active]:text-purple-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="transfer"
              className="data-[state=active]:bg-white/90 data-[state=active]:text-purple-700"
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Request Transfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl">Transaction History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={transactions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfer">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl">Request Transfer</CardTitle>
                <CardDescription>Request funds from the banker</CardDescription>
              </CardHeader>
              <CardContent>
                <RequestTransferForm playerId={localStorage.getItem("playerId")} gameCode={gameCode} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function RequestTransferForm({ playerId, gameCode }) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { sendMessage } = useWebSocket()

  const handleSubmit = async (e) => {
    e.preventDefault()

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
      // Send request via WebSocket
      sendMessage(
        JSON.stringify({
          type: "transfer_request",
          playerId,
          gameCode,
          amount: Number(amount),
          reason: reason || "Transfer request",
        }),
      )

      toast({
        title: "Request Sent",
        description: "Your transfer request has been sent to the banker",
      })

      // Reset form
      setAmount("")
      setReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="reason">Reason (Optional)</Label>
        <Input
          id="reason"
          placeholder="Why do you need these funds?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending Request..." : "Send Request"}
      </Button>
    </form>
  )
}
