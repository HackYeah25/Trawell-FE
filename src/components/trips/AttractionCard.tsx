import { memo } from 'react';
import { Check, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Attraction } from '@/types';
import { cn } from '@/lib/utils';

interface AttractionCardProps {
  attraction: Attraction;
  onDecision: (attractionId: string, decision: 'accept' | 'reject') => void;
  disabled?: boolean;
}

export const AttractionCard = memo(function AttractionCard({
  attraction,
  onDecision,
  disabled = false,
}: AttractionCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        attraction.decision === 'accepted' && 'border-success bg-success/5',
        attraction.decision === 'rejected' && 'opacity-50'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base break-words">{attraction.title}</CardTitle>
              {attraction.category && (
                <Badge variant="secondary" className="mt-2">
                  {attraction.category}
                </Badge>
              )}
            </div>
          </div>

          {attraction.decision ? (
            <Badge
              variant={attraction.decision === 'accepted' ? 'default' : 'secondary'}
              className={cn(
                'w-fit',
                attraction.decision === 'accepted' && 'bg-success text-success-foreground'
              )}
            >
              {attraction.decision === 'accepted' ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Zaakceptowano
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Odrzucono
                </>
              )}
            </Badge>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecision(attraction.id, 'accept')}
                disabled={disabled}
                className="bg-success/10 border-success hover:bg-success hover:text-success-foreground w-full sm:w-auto"
              >
                <Check className="w-4 h-4 mr-1" />
                Akceptuj
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecision(attraction.id, 'reject')}
                disabled={disabled}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-1" />
                Odrzuć
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-sm break-words">
          {attraction.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
});
