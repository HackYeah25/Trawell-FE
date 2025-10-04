import { X, Star } from 'lucide-react';
import { Location } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LocationProposalCardProps {
  location: Location;
  onDecision: (decision: 'reject' | 1 | 2 | 3) => void;
}

export function LocationProposalCard({ location, onDecision }: LocationProposalCardProps) {
  const isRejected = location.status === 'rejected';
  const isRated = location.status === 'rated';
  const isDisabled = isRejected || isRated;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 animate-fade-in',
        isRejected && 'opacity-50 grayscale',
        isRated && 'border-warm-turquoise shadow-warm ring-1 ring-warm-turquoise/20',
        !isDisabled && 'hover:scale-[1.02]'
      )}
    >
      {/* Image */}
      {location.imageUrl && (
        <div className="relative h-32 sm:h-40 lg:h-48 overflow-hidden">
          <img
            src={location.imageUrl}
            alt={location.name}
            className="w-full h-full object-cover"
          />
          {isRated && location.rating && (
            <Badge className="absolute top-2 right-2 bg-warm-turquoise text-white">
              {'★'.repeat(location.rating)}{'☆'.repeat(3 - location.rating)}
            </Badge>
          )}
          {isRejected && (
            <Badge className="absolute top-2 right-2 bg-muted text-muted-foreground">
              Odrzucono
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{location.name}</h3>
          <p className="text-sm text-muted-foreground">{location.country}</p>
        </div>
        <p className="text-sm">{location.teaser}</p>

        {/* Bottom Bar */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isDisabled}
            onClick={() => onDecision('reject')}
            className={cn(
              'flex-col gap-1 h-auto py-2',
              isRejected && 'bg-muted'
            )}
          >
            <X className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">Odrzuć</span>
          </Button>

          {[1, 2, 3].map((stars) => (
            <Button
              key={stars}
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => onDecision(stars as 1 | 2 | 3)}
              className={cn(
                'flex-col gap-1 h-auto py-2',
                isRated && location.rating === stars && 'bg-warm-turquoise/10 border-warm-turquoise text-warm-turquoise'
              )}
            >
              <Star className={cn(
                'h-4 w-4',
                isRated && location.rating === stars && 'fill-warm-turquoise'
              )} />
              <span className="text-xs hidden sm:inline">{stars}★</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
