import { memo } from 'react';
import { Check, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Attraction } from '@/types';
import { cn } from '@/lib/utils';

interface AttractionsPanelProps {
  attractions: Attraction[];
  onDecision: (attractionId: string, decision: 'accept' | 'reject') => void;
  disabled?: boolean;
}

export const AttractionsPanel = memo(function AttractionsPanel({
  attractions,
  onDecision,
  disabled = false,
}: AttractionsPanelProps) {
  if (attractions.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border bg-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Proponowane atrakcje</h3>
        </div>

        <div className="space-y-3">
          {attractions.map((attraction) => (
            <Card
              key={attraction.id}
              className={cn(
                'overflow-hidden transition-all',
                attraction.decision === 'accepted' && 'border-success bg-success/5',
                attraction.decision === 'rejected' && 'opacity-50'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base">{attraction.title}</CardTitle>
                    {attraction.category && (
                      <Badge variant="secondary" className="mt-2">
                        {attraction.category}
                      </Badge>
                    )}
                  </div>

                  {attraction.decision ? (
                    <Badge
                      variant={attraction.decision === 'accepted' ? 'default' : 'secondary'}
                      className={cn(
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDecision(attraction.id, 'accept')}
                        disabled={disabled}
                        className="bg-success/10 border-success hover:bg-success hover:text-success-foreground"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Akceptuj
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDecision(attraction.id, 'reject')}
                        disabled={disabled}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Odrzuć
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  {attraction.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
});
