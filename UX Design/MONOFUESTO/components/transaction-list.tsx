import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft, CreditCard, Banknote } from "lucide-react"

export default function TransactionList({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  )
}

function TransactionItem({ transaction }) {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case "deposit":
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      case "withdrawal":
        return <ArrowUpRight className="h-5 w-5 text-red-500" />
      case "transfer":
        return <CreditCard className="h-5 w-5 text-blue-500" />
      default:
        return <Banknote className="h-5 w-5 text-gray-500" />
    }
  }

  const getTransactionColor = () => {
    switch (transaction.type) {
      case "deposit":
        return "text-green-600"
      case "withdrawal":
        return "text-red-600"
      case "transfer":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getTransactionAmount = () => {
    const amount = transaction.amount.toLocaleString()
    return transaction.type === "deposit" ? `+$${amount}` : `-$${amount}`
  }

  const getTransactionDescription = () => {
    switch (transaction.type) {
      case "deposit":
        return `Received from ${transaction.from || "Bank"}`
      case "withdrawal":
        return `Paid to ${transaction.to || "Bank"}`
      case "transfer":
        return `Transfer ${transaction.from ? `from ${transaction.from}` : ""} ${transaction.to ? `to ${transaction.to}` : ""}`
      default:
        return transaction.description || "Transaction"
    }
  }

  return (
    <Card className="bg-white/50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              {getTransactionIcon()}
            </div>
            <div>
              <p className="font-medium">{getTransactionDescription()}</p>
              <p className="text-xs text-gray-500">
                {transaction.timestamp
                  ? formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })
                  : "Just now"}
              </p>
            </div>
          </div>
          <p className={`font-semibold ${getTransactionColor()}`}>{getTransactionAmount()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
