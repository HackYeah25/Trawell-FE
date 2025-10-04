import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Loader2, Pencil, Check, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { AttractionsPanel } from '@/components/trips/AttractionsPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import type { ChatMessage } from '@/types';

// Define the post-attraction questions (2 hardcoded questions for trips)
const postAttractionQuestions: ChatMessage[] = [
  {
    id: 'paq1',
    role: 'assistant',
    markdown: '**Question 1/2:** Do you have preferences for accommodation location? (Example: near city center, secluded, with mountain views)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'paq2',
    role: 'assistant',
    markdown: '**Question 2/2:** What are your food preferences? (Example: all inclusive, breakfast only, self-catering)',
    createdAt: new Date().toISOString(),
  },
];

export default function TripView() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [answeredPostQuestions, setAnsweredPostQuestions] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const { data: trip } = useTrip(tripId!);
  const { data: messagesData } = useTripMessages(tripId!);
  const { data: attractions } = useTripAttractions(tripId!);
  const { data: summary } = useTripSummary(tripId!);
  const sendMessageMutation = useSendTripMessage();
  const attractionDecisionMutation = useAttractionDecision();
  const renameMutation = useRenameTrip();

  // Flatten paginated messages and detect post-attraction phase
  useEffect(() => {
    if (messagesData) {
      const allMessages =
        messagesData.pages.flatMap((page) => page.messages).reverse() || [];
      
      // Check if we've entered post-attraction questions phase
      const hasAllDecisions = attractions?.every(a => a.decision);
      const lastMessage = allMessages[allMessages.length - 1];
      
      if (hasAllDecisions && allMessages.length > 0) {
        // Check if we need to start post-attraction questions
        const hasPostQuestions = postAttractionQuestions.some(q => 
          allMessages.some(m => m.id === q.id)
        );
        
        if (!hasPostQuestions) {
          // Add first post-attraction question
          setLocalMessages([...allMessages, postAttractionQuestions[0]]);
          return;
        }
      }
      
      setLocalMessages(allMessages);
    }
  }, [messagesData, attractions]);


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

    // If still showing post-attraction questions, add next question
    if (answeredPostQuestions < postAttractionQuestions.length) {
      const nextIndex = answeredPostQuestions + 1;
      
      setTimeout(() => {
        setLocalMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempMessage.id);
          const userMsg = { ...tempMessage, status: undefined };
          
          if (nextIndex < postAttractionQuestions.length) {
            return [...filtered, userMsg, postAttractionQuestions[nextIndex]];
          } else {
            // All post-attraction questions answered, show summary
            setShowSummary(true);
            return [...filtered, userMsg];
          }
        });
        setAnsweredPostQuestions(nextIndex);
      }, 500);
      
      return;
    }

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
      console.error('Failed to send message');
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

      // Decision saved successfully
    } catch (error) {
      console.error('Error making decision:', error);
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

  // Check if there are pending attractions (without decisions)
  const hasPendingAttractions = attractions?.some(a => !a.decision) || false;

  return (
    <AppShell>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
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

        {/* Content - Attractions, Summary or Chat */}
        <div className="flex-1 flex flex-col min-h-0">
          {hasPendingAttractions ? (
            <div className="flex-1 overflow-y-auto">
              <AttractionsPanel
                attractions={attractions || []}
                onDecision={handleAttractionDecision}
                disabled={attractionDecisionMutation.isPending}
              />
            </div>
          ) : showSummary && summary ? (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                <h2 className="text-2xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent mb-6">
                  Trip Summary
                </h2>
                {summary.sections.map((section, index) => (
                  <SummaryCard key={index} section={section} />
                ))}
              </div>
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
                  placeholder="Describe your preferences..."
                />
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
