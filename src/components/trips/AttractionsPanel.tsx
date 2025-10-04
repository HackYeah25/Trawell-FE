import { memo } from 'react';
import { MapPin } from 'lucide-react';
import { AttractionCard } from './AttractionCard';
import type { Attraction } from '@/types';

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
            <AttractionCard
              key={attraction.id}
              attraction={attraction}
              onDecision={onDecision}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
