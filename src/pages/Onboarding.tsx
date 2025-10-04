import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserOnboarding } from '@/api/hooks/use-user';
import { Plane, Loader2 } from 'lucide-react';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import {
  useOnboardingQuestions,
  useAnswerQuestion,
  useCompleteOnboarding,
} from '@/api/hooks/use-onboarding';
import type { ChatMessage } from '@/types';

export default function Onboarding() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: questions, isLoading: questionsLoading } = useOnboardingQuestions();
  const answerMutation = useAnswerQuestion();
  const completeMutation = useCompleteOnboarding();

  // Initialize with welcome message and first question
  useEffect(() => {
    if (questions && questions.length > 0 && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'system',
        markdown:
          '# Witaj w TravelAI! 🌍\n\nPomogę Ci zaplanować wymarzoną podróż. Zanim zaczniemy, odpowiedz na kilka pytań, które pozwolą mi lepiej poznać Twoje preferencje.',
        createdAt: new Date().toISOString(),
      };

      const firstQuestion: ChatMessage = {
        id: questions[0].id,
        role: 'assistant',
        markdown: questions[0].markdownQuestion,
        createdAt: new Date().toISOString(),
      };

      setMessages([welcomeMessage, firstQuestion]);
    }
  }, [questions, messages.length]);

  const handleSendMessage = async (text: string) => {
    if (!questions || currentQuestionIndex >= questions.length) return;

    const currentQuestion = questions[currentQuestionIndex];

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      markdown: text,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Send answer to backend
      const response = await answerMutation.mutateAsync({
        questionId: currentQuestion.id,
        answerText: text,
      });

      // Update user message status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      // Handle response
      if (response.status === 'needs_clarification' && response.followupMarkdown) {
        // Backend asks for clarification
        const followupMessage: ChatMessage = {
          id: `followup-${Date.now()}`,
          role: 'assistant',
          markdown: response.followupMarkdown,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, followupMessage]);
      } else {
        // Move to next question or complete
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex < questions.length) {
          const nextQuestion: ChatMessage = {
            id: questions[nextIndex].id,
            role: 'assistant',
            markdown: questions[nextIndex].markdownQuestion,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, nextQuestion]);
          setCurrentQuestionIndex(nextIndex);
        } else {
          // All questions answered - complete onboarding
          const thankYouMessage: ChatMessage = {
            id: 'complete',
            role: 'assistant',
            markdown:
              '✅ Świetnie! Mam wszystko, czego potrzebuję.\n\nTworzę Twój pierwszy projekt podróży...',
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, thankYouMessage]);

          // Complete onboarding
          const result = await completeMutation.mutateAsync({
            createInitialProject: true,
          });

          // Mark user as onboarded
          updateUserOnboarding(true);

          // Redirect to first project
          navigate(`/app/projects/${result.projectId}`);
        }
      }
    } catch (error) {
      console.error('Error answering question:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
      console.error('Failed to send answer');
    }
  };

  if (questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sky">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-ocean flex items-center justify-center">
            <Plane className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Przygotowuję pytania...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-sky">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-ocean flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Onboarding</h1>
              <p className="text-sm text-muted-foreground">
                Pytanie {Math.min(currentQuestionIndex + 1, questions?.length || 0)} z{' '}
                {questions?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <ChatThread
          messages={messages}
          isLoading={answerMutation.isPending || completeMutation.isPending}
          className="flex-1"
        />

        <Composer
          onSend={handleSendMessage}
          disabled={
            answerMutation.isPending ||
            completeMutation.isPending ||
            currentQuestionIndex >= (questions?.length || 0)
          }
          placeholder="Twoja odpowiedź..."
        />
      </div>
    </div>
  );
}
