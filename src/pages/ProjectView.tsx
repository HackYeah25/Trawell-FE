import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
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
import type { ChatMessage } from '@/types';

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const { data: project } = useProject(projectId!);
  const { data: messagesData } = useProjectMessages(projectId!);
  const { data: locationSuggestions } = useProjectLocationSuggestions(projectId!);
  const sendMessageMutation = useSendProjectMessage();
  const createTripMutation = useCreateTripFromLocation();

  // Flatten paginated messages
  useEffect(() => {
    if (messagesData) {
      const allMessages =
        messagesData.pages.flatMap((page) => page.messages).reverse() || [];
      setLocalMessages(allMessages);
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

    try {
      const newMessages = await sendMessageMutation.mutateAsync({
        projectId,
        text,
      });

      // Remove temp message and add real messages
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

  return (
    <AppShell>
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app')}
              className="mb-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót
            </Button>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Projekt podróży · {new Date(project.createdAt).toLocaleDateString('pl-PL')}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatThread
            messages={localMessages}
            isLoading={sendMessageMutation.isPending}
          />

          {/* Location Suggestions */}
          {locationSuggestions && locationSuggestions.length > 0 && (
            <div className="border-t border-border bg-muted/30 p-4">
              <div className="max-w-4xl mx-auto space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Proponowane lokalizacje
                </h3>

                <div className="grid gap-3 md:grid-cols-2">
                  {locationSuggestions.map((location) => (
                    <Card
                      key={location.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                    >
                      <CardHeader>
                        <CardTitle className="text-base">
                          {location.name}, {location.country}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{location.teaser}</p>
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

          <Composer
            onSend={handleSendMessage}
            disabled={sendMessageMutation.isPending}
            placeholder="Opisz swoje oczekiwania..."
          />
        </div>
      </div>
    </AppShell>
  );
}
