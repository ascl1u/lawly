import { Loader2 } from 'lucide-react'

export default function SuccessLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-bold mb-2">Processing Your Subscription</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Please wait while we finalize your subscription. This should only take a moment...
      </p>
    </div>
  )
} 