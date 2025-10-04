import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Loader2, Pencil, Check, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { TripTabs } from '@/components/trips/TripTabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChatPagination } from '@/hooks/use-chat-pagination';
import {
  useTrip,
  useTripMessages,
  useSendTripMessage,
  useTripAttractions,
  useAttractionDecision,
  useTripSummary,
} from '@/api/hooks/use-trips';
import { useRenameTrip } from '@/api/hooks/use-rename';
import { SummaryCard } from '@/components/trips/SummaryCard';
import { saveChatHistory, loadChatHistory } from '@/lib/chat-storage';
import type { ChatMessage } from '@/types';

export default function TripView() {
  const { tripId } = useParams<{ tripId: string }>();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('chat');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const isMobile = useIsMobile();

  const { data: trip } = useTrip(tripId!);
  const { data: messagesData } = useTripMessages(tripId!);
  const { data: attractions } = useTripAttractions(tripId!);
  const { data: summary } = useTripSummary(tripId!);
  const sendMessageMutation = useSendTripMessage();
  const attractionDecisionMutation = useAttractionDecision();
  const renameMutation = useRenameTrip();

  // Pagination for chat messages
  const {
    displayedMessages,
    hasMore,
    isLoadingMore,
    loadMore,
    remainingCount,
  } = useChatPagination({
    allMessages: localMessages,
    pageSize: 10,
  });

  // Load chat history from localStorage or initialize with welcome message
  useEffect(() => {
    if (tripId) {
      const stored = loadChatHistory(`trip-${tripId}`);
      if (stored && stored.length > 0) {
        setLocalMessages(stored);
      } else {
        // Initialize with welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          markdown: `Welcome to trip planning! 🌟 I'll help you create the perfect plan. Tell me what you're looking for?`,
          createdAt: new Date().toISOString(),
        };
        setLocalMessages([welcomeMessage]);
      }
    }
  }, [tripId]);

  // Save to localStorage on every message change
  useEffect(() => {
    if (tripId && localMessages.length > 0) {
      saveChatHistory(`trip-${tripId}`, localMessages);
    }
  }, [tripId, localMessages]);

  const handleSaveTitle = async () => {
    if (!tripId || !editedTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await renameMutation.mutateAsync({
        tripId,
        title: editedTitle.trim(),
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error renaming trip:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle(trip?.title || '');
  };

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
      // Mock API call with delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update with successful message
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? { ...m, status: undefined } : m))
      );

      // Add AI response
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        markdown: 'Rozumiem! Szukam dla Ciebie najlepszych atrakcji. 🎯',
        createdAt: new Date().toISOString(),
      };

      setTimeout(() => {
        setLocalMessages((prev) => [...prev, aiResponse]);
      }, 500);

      // Every 4 user messages, add an attraction proposal
      const userMessageCount = localMessages.filter(m => m.role === 'user').length + 1;
      if (attractions && userMessageCount % 4 === 0) {
        const unusedAttractions = attractions.filter(attr =>
          !localMessages.some(msg => msg.attractionProposal?.id === attr.id)
        );

        if (unusedAttractions.length > 0) {
          const nextAttraction = unusedAttractions[0];
          const proposalMessage: ChatMessage = {
            id: `attr-proposal-${Date.now()}`,
            role: 'assistant',
            markdown: 'Sprawdź tę atrakcję! 🎯',
            attractionProposal: { ...nextAttraction, status: 'pending' },
            createdAt: new Date().toISOString(),
          };

          setTimeout(() => {
            setLocalMessages((prev) => [...prev, proposalMessage]);
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? { ...m, status: 'error' } : m))
      );
    }
  };

  const handleAttractionDecision = (attractionId: string, decision: 'reject' | 1 | 2 | 3) => {
    setLocalMessages((prev) =>
      prev.map((msg) => {
        if (msg.attractionProposal?.id === attractionId) {
          return {
            ...msg,
            attractionProposal: {
              ...msg.attractionProposal,
              rating: decision === 'reject' ? null : decision,
              status: decision === 'reject' ? 'rejected' : 'rated',
            },
          };
        }
        return msg;
      })
    );

    // Mock API call
    console.log(`Attraction ${attractionId} decision: ${decision}`);

    // Add AI acknowledgment
    const acknowledgment = decision === 'reject' 
      ? 'Rozumiem, poszukam innych opcji. 👍'
      : `Świetnie! Oceniłeś to na ${decision} gwiazdki. ⭐`;

    setTimeout(() => {
      const ackMessage: ChatMessage = {
        id: `ack-${Date.now()}`,
        role: 'assistant',
        markdown: acknowledgment,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, ackMessage]);
    }, 600);
  };

  if (!tripId || !trip) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-warm-coral" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header - Fixed */}
        <div className="border-b border-warm-coral/20 bg-card/80 backdrop-blur-md p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="text-xl md:text-2xl font-bold"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-xl md:text-2xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent truncate">
                  {trip.title}
                </h1>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-warm-coral/10"
                  onClick={() => {
                    setEditedTitle(trip.title);
                    setIsEditingTitle(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-warm-coral" />
                {trip.locationName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                {new Date(trip.createdAt).toLocaleDateString('en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs and Content - Flex container */}
        <div className="flex-1 flex flex-col min-h-0">
          <TripTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            chatContent={
              <div className="flex-1 flex flex-col min-h-0">
                {/* Chat Thread - Scrollable */}
                <div className="flex-1 overflow-y-auto pb-6">
                  <ChatThread
                    messages={displayedMessages}
                    isLoading={sendMessageMutation.isPending}
                    onAttractionDecision={handleAttractionDecision}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={loadMore}
                    remainingCount={remainingCount}
                  />
                </div>

                {/* Composer - Fixed at bottom */}
                <div className="flex-shrink-0">
                  <Composer
                    onSend={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                    placeholder="Opisz swoje preferencje..."
                  />
                </div>
              </div>
            }
            summaryContent={
              summary ? (
                <div className="max-w-4xl mx-auto space-y-6 pb-6">
                  {summary.sections.map((section, index) => (
                    <SummaryCard
                      key={index}
                      section={section}
                      attractions={attractions}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-warm-coral mx-auto" />
                    <p className="text-muted-foreground">Generating summary...</p>
                  </div>
                </div>
              )
            }
          />
        </div>
      </div>
    </AppShell>
  );
}
