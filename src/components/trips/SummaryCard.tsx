import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Cloud,
  Shield,
  DollarSign,
  Plane,
  Users,
  FileText,
  Globe,
  Hotel,
  Utensils,
  Palmtree,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TripSummarySection, SummaryCategory, Attraction } from '@/types';

const categoryIcons: Record<SummaryCategory, typeof Cloud> = {
  Pogoda: Cloud,
  Weather: Cloud,
  Bezpieczeństwo: Shield,
  Safety: Shield,
  'Budżet/koszty': DollarSign,
  Budget: DollarSign,
  'Transport/Dojezdność': Plane,
  Transport: Plane,
  'Sezonowość/Tłok': Users,
  Formalności: FileText,
  'Kultura/Obyczaje': Globe,
  Noclegi: Hotel,
  Jedzenie: Utensils,
  'Aktywności/atrakcje': Palmtree,
  Attractions: Palmtree,
};

interface SummaryCardProps {
  section: TripSummarySection;
  attractions?: Attraction[];
}

export const SummaryCard = memo(function SummaryCard({ section, attractions }: SummaryCardProps) {
  const Icon = categoryIcons[section.category] || FileText;
  const isAttractionsSection = section.category === 'Attractions';
  const acceptedAttractions = attractions?.filter(a => a.status === 'rated' && a.rating && a.rating >= 2) || [];

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-warm border-warm-coral/20">
      <CardHeader className="bg-gradient-to-r from-warm-coral/10 to-warm-turquoise/10 border-b border-warm-coral/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-sunset flex items-center justify-center flex-shrink-0 shadow-warm">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{section.category}</p>
            </div>
          </div>

          {section.important && (
            <Badge variant="destructive" className="flex-shrink-0">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Important
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isAttractionsSection && acceptedAttractions.length > 0 ? (
          <div className="space-y-4">
            {acceptedAttractions.map((attraction) => (
              <div 
                key={attraction.id} 
                className="flex gap-4 p-3 rounded-lg border border-warm-coral/20 hover:bg-warm-coral/5 transition-colors"
              >
                {attraction.imageUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={attraction.imageUrl} 
                      alt={attraction.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base mb-1">{attraction.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{attraction.description}</p>
                  {attraction.category && (
                    <Badge variant="secondary" className="text-xs">
                      {attraction.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.markdown}</ReactMarkdown>
          </div>
        )}

        {section.tags && section.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {section.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
