import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    content: "Lawly saved me thousands in legal fees by helping me understand my contracts before signing.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Michael Chen",
    role: "Startup Founder",
    content: "The risk analysis feature caught several concerning clauses that I would have missed.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    name: "Emily Rodriguez",
    role: "Freelance Consultant",
    content: "I use Lawly for all my client agreements now. It's like having a lawyer in my pocket.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function Testimonials() {
  return (
    <div className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">
          What Our Users Say
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-primary">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-secondary/20 text-secondary">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-primary-foreground">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-primary-foreground/80">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-primary-foreground/80">
                  {testimonial.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}