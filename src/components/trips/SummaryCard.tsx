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
import type { TripSummarySection, SummaryCategory } from '@/types';

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
}

export const SummaryCard = memo(function SummaryCard({ section }: SummaryCardProps) {
  const Icon = categoryIcons[section.category] || FileText;

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
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.markdown}</ReactMarkdown>
        </div>

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
