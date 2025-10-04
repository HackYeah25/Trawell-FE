import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Pencil, Check, X, Share2 } from 'lucide-react';
import { ChatMessageSkeleton } from '@/components/chat/ChatMessageSkeleton';
import { AppShell } from '@/components/layout/AppShell';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useProject,
  useProjectMessages,
  useSendProjectMessage,
  useProjectLocationSuggestions,
  useCreateTripFromLocation,
  useProjectParticipants,
} from '@/api/hooks/use-projects';
import { useRenameProject } from '@/api/hooks/use-rename';
import { useTrips } from '@/api/hooks/use-trips';
import { initialProjectQuestions } from '@/lib/mock-data';
import { ShareCodeDialog } from '@/components/projects/ShareCodeDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChatPagination } from '@/hooks/use-chat-pagination';
import { saveChatHistory, loadChatHistory } from '@/lib/chat-storage';
import type { ChatMessage, Location } from '@/types';

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: project } = useProject(projectId!);
  const { data: messagesData } = useProjectMessages(projectId!);
  const { data: locationSuggestions } = useProjectLocationSuggestions(projectId!);
  const { data: trips } = useTrips();
  const { data: participants } = useProjectParticipants(projectId!, !!project?.shareCode);
  const sendMessageMutation = useSendProjectMessage();
  const createTripMutation = useCreateTripFromLocation();
  const renameMutation = useRenameProject();

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

  // Auto-redirect to trip if this shared project already has one
  useEffect(() => {
    if (project?.isShared && trips && trips.length > 0) {
      const existingTrip = trips.find(trip => trip.projectId === projectId);
      if (existingTrip) {
        navigate(`/app/trips/${existingTrip.id}`);
      }
    }
  }, [project, trips, projectId, navigate]);

  // Load chat history from localStorage or initialize with first question
  useEffect(() => {
    if (projectId) {
      const stored = loadChatHistory(`project-${projectId}`);
      if (stored && stored.length > 0) {
        setLocalMessages(stored);
      } else {
        // Initialize with first question
        setLocalMessages([initialProjectQuestions[0]]);
      }
    }
  }, [projectId]);

  // Save to localStorage on every message change
  useEffect(() => {
    if (projectId && localMessages.length > 0) {
      saveChatHistory(`project-${projectId}`, localMessages);
    }
  }, [projectId, localMessages]);

  const handleSaveTitle = async () => {
    if (!projectId || !editedTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await renameMutation.mutateAsync({
        projectId,
        title: editedTitle.trim(),
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error renaming project:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle(project?.title || '');
  };

  const handleSendMessage = async (text: string) => {
    if (!projectId) return;

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
        markdown: 'Świetnie! Rozumiem Twoje preferencje. Pracuję nad znalezieniem idealnych miejsc dla Ciebie. ✨',
        createdAt: new Date().toISOString(),
      };

      setTimeout(() => {
        setLocalMessages((prev) => [...prev, aiResponse]);
      }, 500);

      // Every 3 user messages, add a location proposal
      const userMessageCount = localMessages.filter(m => m.role === 'user').length + 1;
      if (locationSuggestions && userMessageCount % 3 === 0) {
        const unusedLocations = locationSuggestions.filter(loc => 
          !localMessages.some(msg => msg.locationProposal?.id === loc.id)
        );

        if (unusedLocations.length > 0) {
          const nextLocation = unusedLocations[0];
          const proposalMessage: ChatMessage = {
            id: `loc-proposal-${Date.now()}`,
            role: 'assistant',
            markdown: 'Mam dla Ciebie propozycję destynacji! 🌍',
            locationProposal: { ...nextLocation, status: 'pending' },
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

  const handleLocationDecision = (locationId: string, decision: 'reject' | 1 | 2 | 3) => {
    setLocalMessages((prev) =>
      prev.map((msg) => {
        if (msg.locationProposal?.id === locationId) {
          return {
            ...msg,
            locationProposal: {
              ...msg.locationProposal,
              rating: decision === 'reject' ? null : decision,
              status: decision === 'reject' ? 'rejected' : 'rated',
            },
          };
        }
        return msg;
      })
    );

    // Mock API call
    console.log(`Location ${locationId} decision: ${decision}`);

    // If rated with 3 stars, offer to create trip
    if (decision === 3) {
      setTimeout(() => {
        const confirmMessage: ChatMessage = {
          id: `create-trip-${Date.now()}`,
          role: 'assistant',
          markdown: '🎉 Świetny wybór! Czy chcesz stworzyć podróż do tego miejsca?',
          quickReplies: [
            { id: 'create-yes', label: 'Tak, utwórz podróż!', payload: locationId },
          ],
          createdAt: new Date().toISOString(),
        };
        setLocalMessages((prev) => [...prev, confirmMessage]);
      }, 800);
    }
  };

  const handleQuickReply = (payload: unknown) => {
    if (typeof payload === 'string') {
      // Create trip from location ID
      handleCreateTrip(payload);
    }
  };

  const handleCreateTrip = async (locationId: string) => {
    if (!projectId || createTripMutation.isPending) return;

    try {
      const result = await createTripMutation.mutateAsync({
        projectId,
        selectedLocationId: locationId,
      });

      navigate(`/app/trips/${result.tripId}`);
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  if (!projectId || !project) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="space-y-4 w-full max-w-3xl px-4">
            <ChatMessageSkeleton width="75%" />
            <ChatMessageSkeleton width="85%" />
            <ChatMessageSkeleton width="65%" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-warm-coral/20 bg-card/80 backdrop-blur-md p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent truncate">
                    {project.title}
                  </h1>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-warm-coral/10"
                    onClick={() => {
                      setEditedTitle(project.title);
                      setIsEditingTitle(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {project.shareCode && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-warm-coral/10"
                      onClick={() => setShareDialogOpen(true)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Travel Project · {new Date(project.createdAt).toLocaleDateString('en-US')}
              </p>
            </div>
          </div>
        </div>

        {/* Chat and Composer Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Thread */}
          <div className="flex-1 overflow-y-auto h-0 pb-6">
            <ChatThread
              messages={displayedMessages}
              isLoading={sendMessageMutation.isPending}
              onLocationDecision={handleLocationDecision}
              onQuickReply={handleQuickReply}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
              remainingCount={remainingCount}
              className={isMobile ? 'pb-24' : ''}
            />
          </div>

          {/* Composer - Always visible */}
          <Composer
            onSend={handleSendMessage}
            disabled={sendMessageMutation.isPending}
            placeholder="Opisz swoje oczekiwania..."
          />
        </div>
      </div>

      {project.shareCode && (
        <ShareCodeDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          shareCode={project.shareCode}
          participants={participants}
        />
      )}
    </AppShell>
  );
}
