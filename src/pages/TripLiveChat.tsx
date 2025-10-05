import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Radio } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/api/hooks/use-trips';
import { useTripLiveMessages, useSendLiveMessage } from '@/api/hooks/use-trip-live-chat';
import { saveChatHistory, loadChatHistory } from '@/lib/chat-storage';
import { useChatPagination } from '@/hooks/use-chat-pagination';
import type { ChatMessage } from '@/types';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'live-welcome',
  role: 'assistant',
  markdown: 'Hi! I\'m your real-time travel assistant. I\'m here to help you during your trip with immediate, practical advice.\n\nAsk me anything:\n- Restaurant recommendations nearby\n- Transportation and directions\n- What to do right now\n- Emergency help\n- Local tips and insights',
  createdAt: new Date().toISOString(),
};

export default function TripLiveChat() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { data: trip } = useTrip(tripId!);
  const { data: messagesData } = useTripLiveMessages(tripId!);
  const sendMessageMutation = useSendLiveMessage();

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

  // Auto-scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Load chat history from localStorage or API
  useEffect(() => {
    if (tripId) {
      const stored = loadChatHistory(`trip-live-${tripId}`);
      if (stored && stored.length > 0) {
        setLocalMessages(stored);
      } else if (messagesData && messagesData.length > 0) {
        setLocalMessages(messagesData);
      } else {
        setLocalMessages([INITIAL_MESSAGE]);
      }
    }
  }, [tripId, messagesData]);

  // Save to localStorage on every message change
  useEffect(() => {
    if (tripId && localMessages.length > 0) {
      saveChatHistory(`trip-live-${tripId}`, localMessages);
    }
  }, [tripId, localMessages]);

  // Auto-scroll when messages change or sending state changes
  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [localMessages, isSending, scrollToBottom]);

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
    setIsSending(true);

    try {
      // Send via API
      const newMessages = await sendMessageMutation.mutateAsync({ tripId, text });
      
      // Update with successful message
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? { ...m, status: undefined } : m))
      );

      // Add new messages from API response
      if (newMessages && newMessages.length > 0) {
        setLocalMessages((prev) => [...prev, ...newMessages]);
      }

      setIsSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? { ...m, status: 'error' } : m))
      );
      setIsSending(false);
    }
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
        {/* Header */}
        <div className="border-b border-warm-coral/20 bg-card/80 backdrop-blur-md p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/app/trips/${tripId}`)}
                className="hover:bg-warm-coral/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent truncate">
                    {trip.title}
                  </h1>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <Radio className="w-3 h-3 text-red-600" />
                    <span className="text-xs font-semibold text-red-600">Live</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Real-time Travel Assistant
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat and Composer Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Thread */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto h-0 pb-6">
            <ChatThread
              messages={displayedMessages}
              isLoading={isSending}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
              remainingCount={remainingCount}
            />
          </div>

          {/* Composer */}
          <Composer
            onSend={handleSendMessage}
            disabled={isSending}
            placeholder="Ask me anything about your trip..."
          />
        </div>
      </div>
    </AppShell>
  );
}
