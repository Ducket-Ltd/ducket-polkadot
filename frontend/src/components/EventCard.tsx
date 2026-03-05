import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Shield } from 'lucide-react'
import { formatDate, formatDOT } from '@/lib/utils'
import type { MockEvent } from '@/data/mockEvents'

interface EventCardProps {
  event: MockEvent
}

export function EventCard({ event }: EventCardProps) {
  const lowestPrice = Math.min(...event.tiers.map(t => t.price))

  return (
    <Link to={`/event/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              {event.maxResalePercentage}% cap
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}, {event.city}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="font-semibold text-primary">{formatDOT(lowestPrice)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
