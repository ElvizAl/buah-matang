import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  testimonial: {
    name: string
    comment: string
  }
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="mb-4 italic">{testimonial.comment}</p>
      <p className="font-semibold">{testimonial.name}</p>
    </Card>
  )
}