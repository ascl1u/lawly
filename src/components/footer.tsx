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
      className={cn("bg-primary py-6", className)}
      {...props}
    >
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-4 text-sm text-primary-foreground/80">
            <Link 
              href="/privacy" 
              className="transition-colors hover:text-primary-foreground"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="transition-colors hover:text-primary-foreground"
            >
              Terms of Service
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-primary-foreground/80">
              © {new Date().getFullYear()} Lawly. All rights reserved.
            </span>
            <a 
              href="https://x.com/dingusmage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
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
