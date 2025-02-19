import { Shield, AlertTriangle, MessageSquareText, Clock } from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "Instant Summaries",
    description: "Save hours of reading with AI-generated overviews of complex legal documents.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Alerts",
    description: "Automatically identify potential risks and get actionable advice on critical clauses.",
  },
  {
    icon: MessageSquareText,
    title: "Ask Questions",
    description: "Get plain-English explanations for any part of your legal documents.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your documents are encrypted and automatically deleted after 24 hours.",
  },
]

export function Features() {
  return (
    <div className="py-24 bg-primary">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-secondary/20">
                <feature.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground">{feature.title}</h3>
              <p className="text-primary-foreground/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}