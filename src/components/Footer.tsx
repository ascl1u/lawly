import * as React from "react"
import Link from "next/link"
import { Twitter } from "lucide-react"
import { cn } from "@/lib/utils"

const Footer = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => {
  return (
    <footer
      ref={ref}
      className={cn("bg-gray-900 py-6", className)}
      {...props}
    >
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-4 text-sm text-muted-foreground">
            <Link 
              href="/privacy" 
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Lawly. All rights reserved.
            </span>
            <a 
              href="https://x.com/dingusmage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
})
Footer.displayName = "Footer"

export { Footer } 