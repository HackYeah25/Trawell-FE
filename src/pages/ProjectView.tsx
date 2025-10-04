import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Loader2, Pencil, Check, X, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/layout/AppShell';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import type { ChatMessage } from '@/types';

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const [showLocationButton, setShowLocationButton] = useState(false);
  const [showLocations, setShowLocations] = useState(false);

  const { data: project } = useProject(projectId!);
  const { data: messagesData } = useProjectMessages(projectId!);
  const { data: locationSuggestions } = useProjectLocationSuggestions(projectId!);
  const { data: trips } = useTrips();
  const { data: participants } = useProjectParticipants(projectId!, !!project?.shareCode);
  const sendMessageMutation = useSendProjectMessage();
  const createTripMutation = useCreateTripFromLocation();
  const renameMutation = useRenameProject();

  // Auto-redirect to trip if this shared project already has one
  useEffect(() => {
    if (project?.isShared && trips && trips.length > 0) {
      const existingTrip = trips.find(trip => trip.projectId === projectId);
      if (existingTrip) {
        navigate(`/app/trips/${existingTrip.id}`);
      }
    }
  }, [project, trips, projectId, navigate]);

  // Initialize with questions and flatten paginated messages
  useEffect(() => {
    if (messagesData && locationSuggestions !== undefined) {
      const allMessages =
        messagesData.pages.flatMap((page) => page.messages).reverse() || [];
      
      // If project has location suggestions, skip chat and show locations directly
      if (locationSuggestions && locationSuggestions.length > 0) {
        setShowLocations(true);
        setAnsweredQuestions(initialProjectQuestions.length);
        setLocalMessages(allMessages);
      } else if (allMessages.length === 0) {
        // If no messages yet, show initial questions
        setLocalMessages(initialProjectQuestions.slice(0, 1)); // Start with first question
      } else {
        setLocalMessages(allMessages);
      }
    }
  }, [messagesData, locationSuggestions]);

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

    // If still showing initial questions, add next question
    if (answeredQuestions < initialProjectQuestions.length) {
      const nextIndex = answeredQuestions + 1;
      
      setTimeout(() => {
        setLocalMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempMessage.id);
          const userMsg = { ...tempMessage, status: undefined };
          
          if (nextIndex < initialProjectQuestions.length) {
            return [...filtered, userMsg, initialProjectQuestions[nextIndex]];
          } else {
            // All questions answered, show button to view locations
            const completionMessage: ChatMessage = {
              id: 'show-locations',
              role: 'assistant',
              markdown:
                '✨ Great! Based on your preferences, I have some amazing destinations for you.\n\nReady to explore?',
              createdAt: new Date().toISOString(),
              quickReplies: [
                {
                  id: 'view-destinations',
                  label: 'View Destinations',
                  payload: 'view',
                },
              ],
            };
            setShowLocationButton(true);
            return [...filtered, userMsg, completionMessage];
          }
        });
        setAnsweredQuestions(nextIndex);
      }, 500);
      
      return;
    }

    // Regular message flow
    try {
      const newMessages = await sendMessageMutation.mutateAsync({
        projectId,
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
          <Loader2 className="w-8 h-8 animate-spin text-warm-coral" />
        </div>
      </AppShell>
    );
  }

  const showLocationSuggestions = 
    showLocations &&
    answeredQuestions >= initialProjectQuestions.length && 
    locationSuggestions && 
    locationSuggestions.length > 0;

  // Get existing trip locations for this project
  const existingTripLocationIds = trips
    ?.filter(trip => trip.projectId === projectId)
    .map(trip => trip.locationId) || [];

  // Hide composer when conversation ends (all questions answered)
  const shouldShowComposer = answeredQuestions < initialProjectQuestions.length && !showLocationButton;

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
          <div className="flex-1 overflow-y-auto h-0">
            <ChatThread
              messages={localMessages}
              isLoading={sendMessageMutation.isPending}
              onQuickReply={(payload) => {
                if (payload === 'view') {
                  setShowLocations(true);
                }
              }}
              className={isMobile && shouldShowComposer ? 'pb-24' : ''}
            />
          </div>

          {/* Location Suggestions - Full Screen */}
          {showLocationSuggestions && (
            <div className="absolute inset-0 bg-background z-10 overflow-y-auto">
              <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
                <h2 className="text-2xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-warm-coral" />
                  Suggested Destinations
                </h2>
                <p className="text-muted-foreground">
                  Choose a destination to start planning your trip
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {locationSuggestions
                    .sort((a, b) => {
                      // Sort locations without trips first
                      const aHasTrip = existingTripLocationIds.includes(a.id);
                      const bHasTrip = existingTripLocationIds.includes(b.id);
                      if (aHasTrip && !bHasTrip) return 1;
                      if (!aHasTrip && bHasTrip) return -1;
                      return 0;
                    })
                    .map((location) => {
                    const hasTrip = existingTripLocationIds.includes(location.id);
                    const isCreating = createTripMutation.isPending && createTripMutation.variables?.selectedLocationId === location.id;
                    
                    return (
                      <Card
                        key={location.id}
                        className={cn(
                          "transition-all overflow-hidden group border-warm-coral/20",
                          hasTrip && "opacity-50 cursor-not-allowed",
                          !hasTrip && "cursor-pointer hover:shadow-warm",
                          isCreating && "opacity-50"
                        )}
                      >
                        {location.imageUrl && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={location.imageUrl}
                              alt={location.name}
                              className={cn(
                                "w-full h-full object-cover transition-transform duration-300",
                                !hasTrip && "group-hover:scale-105",
                                hasTrip && "grayscale"
                              )}
                            />
                          </div>
                        )}
                        <CardHeader className="p-4">
                          <CardTitle className={cn("text-lg", hasTrip && "text-muted-foreground")}>
                            {location.name}, {location.country}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                          <p className={cn("text-sm line-clamp-2", hasTrip ? "text-muted-foreground/70" : "text-muted-foreground")}>
                            {location.teaser}
                          </p>
                          <Button
                            onClick={() => !hasTrip && handleCreateTrip(location.id)}
                            disabled={createTripMutation.isPending || hasTrip}
                            className={cn(
                              "w-full shadow-warm border-0",
                              hasTrip 
                                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                                : "bg-gradient-sunset hover:opacity-90 text-white"
                            )}
                          >
                            {hasTrip ? (
                              'Trip Created'
                            ) : isCreating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              'Create Trip'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Composer - Only show during initial questions */}
          {shouldShowComposer && (
            <Composer
              onSend={handleSendMessage}
              disabled={sendMessageMutation.isPending}
              placeholder="Describe your expectations..."
            />
          )}
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
