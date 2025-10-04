import { X, Star } from 'lucide-react';
import { Attraction } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttractionProposalCardProps {
  attraction: Attraction;
  onDecision: (decision: 'reject' | 1 | 2 | 3) => void;
}

export function AttractionProposalCard({ attraction, onDecision }: AttractionProposalCardProps) {
  const isRejected = attraction.status === 'rejected';
  const isRated = attraction.status === 'rated';
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
      {attraction.imageUrl && (
        <div className="relative h-32 sm:h-40 lg:h-48 overflow-hidden">
          <img
            src={attraction.imageUrl}
            alt={attraction.title}
            className="w-full h-full object-cover"
          />
          {isRated && attraction.rating && (
            <Badge className="absolute top-2 right-2 bg-warm-turquoise text-white">
              {'★'.repeat(attraction.rating)}{'☆'.repeat(3 - attraction.rating)}
            </Badge>
          )}
          {isRejected && (
            <Badge className="absolute top-2 right-2 bg-muted text-muted-foreground">
              Odrzucono
            </Badge>
          )}
          {attraction.category && !isRejected && !isRated && (
            <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur">
              {attraction.category}
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">{attraction.title}</h3>
        <p className="text-sm line-clamp-2">{attraction.description}</p>

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
                isRated && attraction.rating === stars && 'bg-warm-turquoise/10 border-warm-turquoise text-warm-turquoise'
              )}
            >
              <Star className={cn(
                'h-4 w-4',
                isRated && attraction.rating === stars && 'fill-warm-turquoise'
              )} />
              <span className="text-xs hidden sm:inline">{stars}★</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
