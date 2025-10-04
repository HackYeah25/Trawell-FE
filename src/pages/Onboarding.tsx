import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Loader2 } from 'lucide-react';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import {
  useOnboardingQuestions,
  useStartProfiling,
  useProfilingWebSocket,
  useCompleteOnboarding,
} from '@/api/hooks/use-onboarding';
import type { ChatMessage } from '@/types';

export default function Onboarding() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const streamingMessageIdRef = useRef<string | null>(null);

  const { data: questions, isLoading: questionsLoading } = useOnboardingQuestions();
  const startProfilingMutation = useStartProfiling();
  const completeMutation = useCompleteOnboarding();

  // WebSocket handlers
  const { sendAnswer } = useProfilingWebSocket({
    sessionId,
    onMessage: (message) => {
      if (message.role === 'assistant' && message.content) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          markdown: message.content,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentStreamingMessage('');
        streamingMessageIdRef.current = null;
      }
    },
    onToken: (token) => {
      setCurrentStreamingMessage((prev) => prev + token);
      if (!streamingMessageIdRef.current) {
        streamingMessageIdRef.current = `streaming-${Date.now()}`;
      }
    },
    onProgress: (progress) => {
      setCurrentQuestion(progress.current);
      setTotalQuestions(progress.total);
    },
    onValidation: (validation) => {
      console.log('Validation:', validation);
    },
    onComplete: async (data) => {
      console.log('Profiling complete:', data);
      // Complete onboarding
      const result = await completeMutation.mutateAsync({
        createInitialProject: true,
      });
      navigate(`/app/projects/${result.projectId}`);
    },
    onThinking: () => {
      setIsThinking(true);
      setTimeout(() => setIsThinking(false), 500);
    },
  });

  // Start profiling session
  useEffect(() => {
    if (!sessionId && !startProfilingMutation.isPending) {
      startProfilingMutation.mutate(undefined, {
        onSuccess: (data) => {
          setSessionId(data.session.session_id);
          setTotalQuestions(questions?.length || 0);

          // Add welcome message
          const welcomeMessage: ChatMessage = {
            id: 'welcome',
            role: 'system',
            markdown: data.first_message,
            createdAt: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        },
      });
    }
  }, [sessionId, startProfilingMutation, questions]);

  const handleSendMessage = async (text: string) => {
    if (!sessionId) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      markdown: text,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMessage]);

    // Send via WebSocket
    sendAnswer(text);
  };

  if (questionsLoading || startProfilingMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-coral/5 via-warm-turquoise/5 to-warm-sand">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-sunset flex items-center justify-center shadow-warm">
            <Plane className="w-8 h-8 text-white animate-pulse" />
          </div>
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-warm-coral" />
          <p className="mt-4 text-muted-foreground">Preparing your travel profile...</p>
        </div>
      </div>
    );
  }

  // Combine messages with streaming message
  const displayMessages = [...messages];
  if (currentStreamingMessage && streamingMessageIdRef.current) {
    displayMessages.push({
      id: streamingMessageIdRef.current,
      role: 'assistant',
      markdown: currentStreamingMessage,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-warm-coral/5 via-warm-turquoise/5 to-warm-sand">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <div className="p-6 border-b border-warm-coral/20 bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-sunset flex items-center justify-center shadow-warm">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-pacifico bg-gradient-sunset bg-clip-text text-transparent">
                Let's Plan Your Trip
              </h1>
              <p className="text-sm text-muted-foreground">
                Question {Math.min(currentQuestion, totalQuestions)} of {totalQuestions}
              </p>
            </div>
          </div>
        </div>

        <ChatThread
          messages={displayMessages}
          isLoading={isThinking || completeMutation.isPending}
          className="flex-1"
        />

        <Composer
          onSend={handleSendMessage}
          disabled={isThinking || completeMutation.isPending || !sessionId}
          placeholder="Your answer..."
        />
      </div>
    </div>
  );
}
