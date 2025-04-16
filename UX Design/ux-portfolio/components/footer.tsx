import Link from "next/link"
import { Github, Linkedin, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-10 border-t border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent"
            >
              Tanzil.
            </Link>
            <p className="text-sm text-gray-400 mt-2">Designing future-ready experiences</p>
          </div>

          <div className="flex space-x-6">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-purple-500/10 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Tanzil. All rights reserved.</p>
          <p className="mt-2">Designed and built with passion and precision.</p>
        </div>
      </div>
    </footer>
  )
}
