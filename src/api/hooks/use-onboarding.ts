import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { OnboardingQuestion, OnboardingAnswerResponse } from '@/types';

export function useOnboardingQuestions() {
  return useQuery({
    queryKey: ['profiling', 'questions'],
    queryFn: () => apiClient.get<OnboardingQuestion[]>('/profiling/questions'),
    staleTime: Infinity, // Questions don't change
  });
}

export function useStartProfiling() {
  return useMutation({
    mutationFn: (userId?: string) =>
      apiClient.post<{
        session: { session_id: string };
        first_message: string;
        websocket_url: string;
      }>('/profiling/start', { user_id: userId }),
  });
}

export interface WSMessage {
  type: 'message' | 'token' | 'progress' | 'validation' | 'complete' | 'thinking';
  conversation_id: string;
  role?: 'user' | 'assistant';
  content?: string;
  token?: string;
  current_question?: number;
  total_questions?: number;
  completeness?: number;
  current_question_id?: string;
  question_id?: string;
  status?: 'insufficient' | 'sufficient' | 'complete';
  feedback?: string;
  profile_id?: string;
  message?: string;
}

interface UseProfilingWebSocketOptions {
  sessionId: string | null;
  onMessage?: (message: WSMessage) => void;
  onToken?: (token: string) => void;
  onProgress?: (progress: {
    current: number;
    total: number;
    completeness: number;
  }) => void;
  onValidation?: (validation: {
    questionId: string;
    status: string;
    feedback?: string;
  }) => void;
  onComplete?: (data: { profileId: string; completeness: number }) => void;
  onThinking?: () => void;
}

export function useProfilingWebSocket({
  sessionId,
  onMessage,
  onToken,
  onProgress,
  onValidation,
  onComplete,
  onThinking,
}: UseProfilingWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (!sessionId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/api/profiling/ws/${sessionId}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data: WSMessage = JSON.parse(event.data);

      switch (data.type) {
        case 'message':
          onMessage?.(data);
          break;
        case 'token':
          if (data.token) onToken?.(data.token);
          break;
        case 'progress':
          if (
            data.current_question !== undefined &&
            data.total_questions !== undefined &&
            data.completeness !== undefined
          ) {
            onProgress?.({
              current: data.current_question,
              total: data.total_questions,
              completeness: data.completeness,
            });
          }
          break;
        case 'validation':
          if (data.question_id && data.status) {
            onValidation?.({
              questionId: data.question_id,
              status: data.status,
              feedback: data.feedback,
            });
          }
          break;
        case 'complete':
          if (data.profile_id !== undefined && data.completeness !== undefined) {
            onComplete?.({
              profileId: data.profile_id,
              completeness: data.completeness,
            });
          }
          break;
        case 'thinking':
          onThinking?.();
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      wsRef.current = null;
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
    };

    wsRef.current = ws;
  }, [sessionId, onMessage, onToken, onProgress, onValidation, onComplete, onThinking]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendAnswer = useCallback((answer: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'user_answer',
          answer,
        })
      );
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { sendAnswer, disconnect };
}

export function useAnswerQuestion() {
  return useMutation({
    mutationFn: (data: { questionId: string; answerText: string }) =>
      apiClient.post<OnboardingAnswerResponse>('/onboarding/answer', data),
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { createInitialProject: boolean }) =>
      apiClient.post<{ projectId: string }>('/onboarding/complete', data),
    onSuccess: () => {
      // Update user's onboarding status in localStorage
      const storedUser = localStorage.getItem('travelai_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.onboardingCompleted = true;
        localStorage.setItem('travelai_user', JSON.stringify(user));
      }

      // Invalidate cache to trigger re-render
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
