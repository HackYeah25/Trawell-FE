import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { AttractionsPanel } from '@/components/trips/AttractionsPanel';
import { SummaryCard } from '@/components/trips/SummaryCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  useTrip,
  useTripMessages,
  useSendTripMessage,
  useTripAttractions,
  useAttractionDecision,
  useTripSummary,
} from '@/api/hooks/use-trips';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types';

export default function TripView() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'attractions' | 'summary'>('chat');

  const { data: trip } = useTrip(tripId!);
  const { data: messagesData } = useTripMessages(tripId!);
  const { data: attractions } = useTripAttractions(tripId!);
  const { data: summary } = useTripSummary(tripId!);
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

  // Auto-switch to attractions tab when available
  useEffect(() => {
    if (attractions && attractions.length > 0 && activeTab === 'chat') {
      setActiveTab('attractions');
    }
  }, [attractions, activeTab]);

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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-border px-4 bg-card/30">
            <div className="max-w-4xl mx-auto">
              <TabsList>
                <TabsTrigger value="chat">Czat</TabsTrigger>
                <TabsTrigger
                  value="attractions"
                  disabled={!attractions || attractions.length === 0}
                >
                  Atrakcje
                  {attractions && attractions.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                      {attractions.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="summary" disabled={!summary}>
                  Podsumowanie
                  {summary && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-success text-success-foreground text-xs">
                      ✓
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
            <ChatThread
              messages={localMessages}
              isLoading={sendMessageMutation.isPending}
            />
            <Composer
              onSend={handleSendMessage}
              disabled={sendMessageMutation.isPending}
              placeholder="Opisz swoje preferencje..."
            />
          </TabsContent>

          <TabsContent value="attractions" className="flex-1 overflow-y-auto m-0 p-4">
            <div className="max-w-4xl mx-auto">
              <AttractionsPanel
                attractions={attractions || []}
                onDecision={handleAttractionDecision}
                disabled={attractionDecisionMutation.isPending}
              />
            </div>
          </TabsContent>

          <TabsContent value="summary" className="flex-1 overflow-y-auto m-0 p-4 bg-gradient-sky">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Podsumowanie podróży</h2>
                <p className="text-muted-foreground">
                  Wszystkie najważniejsze informacje w jednym miejscu
                </p>
              </div>

              {summary?.sections.map((section, index) => (
                <SummaryCard key={index} section={section} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
