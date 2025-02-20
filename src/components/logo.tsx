import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const Logo = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <Link 
      ref={ref}
      href="/" 
      className={cn(
        "flex items-center hover:opacity-80 transition-opacity",
        className
      )}
      {...props}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 17 17"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary-foreground fill-current"
      >
        <path d="M14.44,7.389 L9.662,2.61 L10.232,2.041 L9.315,1.122 L5.068,5.367 L5.988,6.285 L6.518,5.755 L8.473,7.709 L-0.062,16.244 L0.768,17.073 L9.301,8.539 L11.295,10.532 L10.766,11.063 L11.684,11.98 L15.938,7.727 L15.021,6.809 L14.44,7.389 Z" />
      </svg>
      <span className="ml-2 text-2xl font-bold text-primary-foreground">Lawly</span>
    </Link>
  )
)
Logo.displayName = "Logo"

export { Logo } 