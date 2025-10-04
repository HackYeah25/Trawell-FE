import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { AttractionsPanel } from '@/components/trips/AttractionsPanel';
import { Button } from '@/components/ui/button';
import {
  useTrip,
  useTripMessages,
  useSendTripMessage,
  useTripAttractions,
  useAttractionDecision,
} from '@/api/hooks/use-trips';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types';

export default function TripView() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const { data: trip } = useTrip(tripId!);
  const { data: messagesData } = useTripMessages(tripId!);
  const { data: attractions } = useTripAttractions(tripId!);
  const sendMessageMutation = useSendTripMessage();
  const attractionDecisionMutation = useAttractionDecision();

  // Flatten paginated messages
  useEffect(() => {
    if (messagesData) {
      const allMessages =
        messagesData.pages.flatMap((page) => page.messages).reverse() || [];
      setLocalMessages(allMessages);
    }
  }, [messagesData]);


  const handleSendMessage = async (text: string) => {
    if (!tripId) return;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      markdown: text,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setLocalMessages((prev) => [...prev, tempMessage]);

    try {
      const newMessages = await sendMessageMutation.mutateAsync({
        tripId,
        text,
      });

      setLocalMessages((prev) =>
        prev.filter((m) => m.id !== tempMessage.id).concat(newMessages)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? { ...m, status: 'error' } : m))
      );
      toast.error('Nie udało się wysłać wiadomości');
    }
  };

  const handleAttractionDecision = async (
    attractionId: string,
    decision: 'accept' | 'reject'
  ) => {
    if (!tripId) return;

    try {
      await attractionDecisionMutation.mutateAsync({
        tripId,
        attractionId,
        decision,
      });

      toast.success(
        decision === 'accept' ? 'Atrakcja zaakceptowana' : 'Atrakcja odrzucona'
      );
    } catch (error) {
      console.error('Error making decision:', error);
      toast.error('Nie udało się zapisać decyzji');
    }
  };

  if (!tripId || !trip) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/app/projects/${trip.projectId}`)}
              className="mb-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do projektu
            </Button>
            <h1 className="text-2xl font-bold">{trip.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {trip.locationName} · {new Date(trip.createdAt).toLocaleDateString('pl-PL')}
            </p>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatThread
            messages={localMessages}
            isLoading={sendMessageMutation.isPending}
          />
          
          {attractions && attractions.length > 0 && (
            <AttractionsPanel
              attractions={attractions}
              onDecision={handleAttractionDecision}
              disabled={attractionDecisionMutation.isPending}
            />
          )}

          <Composer
            onSend={handleSendMessage}
            disabled={sendMessageMutation.isPending}
            placeholder="Opisz swoje preferencje..."
          />
        </div>
      </div>
    </AppShell>
  );
}
