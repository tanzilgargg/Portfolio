import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Card className="w-full bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Monofuesto
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl mt-2">Festival-Themed E-Banking System</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <Link href="/join" className="w-full">
                <Button className="w-full h-24 text-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0 shadow-lg">
                  Join as Player
                </Button>
              </Link>
              <Link href="/banker" className="w-full">
                <Button className="w-full h-24 text-xl bg-gradient-to-r from-purple-500 to-yellow-500 hover:from-purple-600 hover:to-yellow-600 border-0 shadow-lg">
                  Enter as Banker
                </Button>
              </Link>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-2">Connect multiple devices for a seamless gaming experience</p>
              <p className="text-sm text-gray-500">Manage funds, transfer money, and track transactions in real-time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
