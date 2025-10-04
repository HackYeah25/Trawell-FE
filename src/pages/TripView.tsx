import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { AttractionsPanel } from '@/components/trips/AttractionsPanel';
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

  // Check if there are pending attractions (without decisions)
  const hasPendingAttractions = attractions?.some(a => !a.decision) || false;

  return (
    <AppShell>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold truncate">{trip.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                {trip.locationName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                {new Date(trip.createdAt).toLocaleDateString('pl-PL')}
              </span>
            </div>
          </div>
        </div>

        {/* Content - Chat or Attractions */}
        <div className="flex-1 flex flex-col min-h-0">
          {hasPendingAttractions ? (
            <div className="flex-1 overflow-y-auto">
              <AttractionsPanel
                attractions={attractions || []}
                onDecision={handleAttractionDecision}
                disabled={attractionDecisionMutation.isPending}
              />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-hidden">
                <ChatThread
                  messages={localMessages}
                  isLoading={sendMessageMutation.isPending}
                />
              </div>
              
              <div className="flex-shrink-0">
                <Composer
                  onSend={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  placeholder="Opisz swoje preferencje..."
                />
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
