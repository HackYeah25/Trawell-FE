import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  useProject,
  useProjectMessages,
  useSendProjectMessage,
  useProjectLocationSuggestions,
  useCreateTripFromLocation,
} from '@/api/hooks/use-projects';
import { toast } from 'sonner';
import { initialProjectQuestions } from '@/lib/mock-data';
import type { ChatMessage } from '@/types';

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  const { data: project } = useProject(projectId!);
  const { data: messagesData } = useProjectMessages(projectId!);
  const { data: locationSuggestions } = useProjectLocationSuggestions(projectId!);
  const sendMessageMutation = useSendProjectMessage();
  const createTripMutation = useCreateTripFromLocation();

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
      toast.error('Nie udało się wysłać wiadomości');
    }
  };

  const handleCreateTrip = async (locationId: string) => {
    if (!projectId) return;

    try {
      const result = await createTripMutation.mutateAsync({
        projectId,
        selectedLocationId: locationId,
      });

      toast.success('Podróż utworzona!');
      navigate(`/app/trips/${result.tripId}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Nie udało się utworzyć podróży');
    }
  };

  if (!projectId || !project) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold truncate">{project.title}</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Projekt podróży · {new Date(project.createdAt).toLocaleDateString('pl-PL')}
            </p>
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

          {/* Location Suggestions - Above Composer */}
          {showLocationSuggestions && (
            <div className="border-t border-border bg-muted/30 p-3 md:p-4 flex-shrink-0 overflow-y-auto max-h-[40vh]">
              <div className="max-w-4xl mx-auto space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm md:text-base">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Proponowane lokalizacje
                </h3>

                <div className="grid gap-2 md:gap-3 sm:grid-cols-2">
                  {locationSuggestions.map((location) => (
                    <Card
                      key={location.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                    >
                      <CardHeader className="p-3 md:p-4">
                        <CardTitle className="text-sm md:text-base">
                          {location.name}, {location.country}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 md:p-4 md:pt-0 space-y-2 md:space-y-3">
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                          {location.teaser}
                        </p>
                        <Button
                          onClick={() => handleCreateTrip(location.id)}
                          disabled={createTripMutation.isPending}
                          className="w-full"
                          size="sm"
                        >
                          Utwórz podróż
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Composer - Always at bottom */}
          <div className="flex-shrink-0">
            <Composer
              onSend={handleSendMessage}
              disabled={sendMessageMutation.isPending}
              placeholder="Opisz swoje oczekiwania..."
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
