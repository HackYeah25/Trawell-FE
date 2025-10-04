import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Loader2, Pencil, Check, X } from 'lucide-react';
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
} from '@/api/hooks/use-projects';
import { useRenameProject } from '@/api/hooks/use-rename';
import { initialProjectQuestions } from '@/lib/mock-data';
import { ShareCodeDisplay } from '@/components/projects/ShareCodeDisplay';
import type { ChatMessage } from '@/types';

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const { data: project } = useProject(projectId!);
  const { data: messagesData } = useProjectMessages(projectId!);
  const { data: locationSuggestions } = useProjectLocationSuggestions(projectId!);
  const sendMessageMutation = useSendProjectMessage();
  const createTripMutation = useCreateTripFromLocation();
  const renameMutation = useRenameProject();

  // Initialize with questions and flatten paginated messages
  useEffect(() => {
    if (messagesData) {
      const allMessages =
        messagesData.pages.flatMap((page) => page.messages).reverse() || [];
      
      // If no messages yet, show initial questions
      if (allMessages.length === 0) {
        setLocalMessages(initialProjectQuestions.slice(0, 1)); // Start with first question
      } else {
        setLocalMessages(allMessages);
      }
    }
  }, [messagesData]);

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
            // All questions answered, trigger location suggestions
            return [...filtered, userMsg];
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
    answeredQuestions >= initialProjectQuestions.length && 
    locationSuggestions && 
    locationSuggestions.length > 0;

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
                <div className="flex items-center gap-2 group">
                  <h1 className="text-xl md:text-2xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent truncate">
                    {project.title}
                  </h1>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-warm-coral/10"
                    onClick={() => {
                      setEditedTitle(project.title);
                      setIsEditingTitle(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Travel Project · {new Date(project.createdAt).toLocaleDateString('en-US')}
              </p>
            </div>

            {/* Share Code Display for Shared Projects */}
            {project.isShared && project.shareCode && (
              <ShareCodeDisplay shareCode={project.shareCode} />
            )}
          </div>
        </div>

        {/* Chat and Composer Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Thread */}
          <div className="flex-1 overflow-hidden">
            <ChatThread
              messages={localMessages}
              isLoading={sendMessageMutation.isPending}
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
                  {locationSuggestions.map((location) => {
                    const isCreating = createTripMutation.isPending && createTripMutation.variables?.selectedLocationId === location.id;
                    
                    return (
                      <Card
                        key={location.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-warm overflow-hidden group border-warm-coral/20",
                          isCreating && "opacity-50"
                        )}
                      >
                        {location.imageUrl && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={location.imageUrl}
                              alt={location.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">
                            {location.name}, {location.country}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {location.teaser}
                          </p>
                          <Button
                            onClick={() => handleCreateTrip(location.id)}
                            disabled={createTripMutation.isPending}
                            className="w-full bg-gradient-sunset hover:opacity-90 text-white shadow-warm border-0"
                          >
                            {isCreating ? (
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

          {/* Composer - Always at bottom */}
          <div className="flex-shrink-0">
            <Composer
              onSend={handleSendMessage}
              disabled={sendMessageMutation.isPending}
              placeholder="Describe your expectations..."
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
