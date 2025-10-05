import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface BrainstormSession {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  isShared: boolean;
}

export interface BrainstormMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface BrainstormSessionDetail {
  session_id: string;
  title: string;
  messages: BrainstormMessage[];
  createdAt: string;
  updatedAt: string;
  mode: string;
}

// List all brainstorm sessions
export function useBrainstormSessions() {
  return useQuery({
    queryKey: ['brainstorm', 'sessions'],
    queryFn: async () => {
      const response = await apiClient.get<{ sessions: BrainstormSession[] }>('/brainstorm/sessions');
      return response.sessions;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get single brainstorm session
export function useBrainstormSession(sessionId: string | null) {
  return useQuery({
    queryKey: ['brainstorm', 'session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await apiClient.get<BrainstormSessionDetail>(`/brainstorm/sessions/${sessionId}`);
      return response;
    },
    enabled: !!sessionId,
  });
}

// Create new brainstorm session
export function useCreateBrainstormSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: string) => {
      const response = await apiClient.post<{
        session_id: string;
        title: string;
        first_message: string;
        websocket_url: string;
      }>('/brainstorm/sessions', { title });
      return response;
    },
    onSuccess: () => {
      // Invalidate sessions list to refetch
      queryClient.invalidateQueries({ queryKey: ['brainstorm', 'sessions'] });
    },
  });
}

// Delete brainstorm session
export function useDeleteBrainstormSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.delete(`/brainstorm/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorm', 'sessions'] });
    },
  });
}

// WebSocket message types
export interface BrainstormWSMessage {
  type: 'message' | 'token' | 'thinking' | 'complete' | 'error';
  conversation_id?: string;
  role?: 'user' | 'assistant';
  content?: string;
  token?: string;
  message?: string;
}

interface UseBrainstormWebSocketOptions {
  sessionId: string | null;
  onMessage?: (message: BrainstormWSMessage) => void;
  onToken?: (token: string) => void;
  onThinking?: () => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function useBrainstormWebSocket({
  sessionId,
  onMessage,
  onToken,
  onThinking,
  onComplete,
  onError,
}: UseBrainstormWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string | null>(sessionId);

  // Update sessionId ref when it changes
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Store callbacks in refs to avoid reconnections
  const handlersRef = useRef({ onMessage, onToken, onThinking, onComplete, onError });

  useEffect(() => {
    handlersRef.current = { onMessage, onToken, onThinking, onComplete, onError };
  }, [onMessage, onToken, onThinking, onComplete, onError]);

  const connect = useCallback(() => {
    const currentSessionId = sessionIdRef.current;
    console.log('Brainstorm WS connect() called, sessionId:', currentSessionId);

    if (!currentSessionId) {
      console.warn('No sessionId, skipping WebSocket connection');
      return;
    }

    // Don't create new connection if one already exists and is open or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connected or connecting, skipping');
      return;
    }

    // Prevent concurrent connection attempts
    if (isConnectingRef.current) {
      console.log('Already connecting, skipping');
      return;
    }

    isConnectingRef.current = true;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/api/brainstorm/ws/${currentSessionId}`;

    console.log('Creating new WebSocket connection to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Brainstorm WebSocket connected');
      isConnectingRef.current = false;
    };

    ws.onmessage = (event) => {
      const data: BrainstormWSMessage = JSON.parse(event.data);
      const handlers = handlersRef.current;

      // Debug log (skip tokens to avoid spam)
      if (data.type !== 'token') {
        console.log('Brainstorm WS message:', data.type, data);
      }

      switch (data.type) {
        case 'message':
          handlers.onMessage?.(data);
          break;
        case 'token':
          if (data.token) handlers.onToken?.(data.token);
          break;
        case 'thinking':
          handlers.onThinking?.();
          break;
        case 'complete':
          handlers.onComplete?.();
          break;
        case 'error':
          handlers.onError?.(data.message || 'Unknown error');
          break;
        default:
          console.warn('Unknown WS message type:', data.type);
      }
    };

    ws.onerror = (error) => {
      console.error('Brainstorm WebSocket error:', error);
      isConnectingRef.current = false;
    };

    ws.onclose = (event) => {
      console.log('Brainstorm WebSocket disconnected', event.code, event.reason);
      wsRef.current = null;
      isConnectingRef.current = false;
      
      // Only auto-reconnect on unexpected disconnects
      if (event.code !== 1000 && event.code !== 1008) {
        console.log('Will attempt reconnect in 3 seconds...');
        reconnectTimeoutRef.current = window.setTimeout(() => connect(), 3000);
      }
    };

    wsRef.current = ws;
  }, []); // No dependencies - uses sessionIdRef which is stable

  const disconnect = useCallback(() => {
    console.log('Disconnecting WebSocket...');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client closing connection');
      wsRef.current = null;
    }
    isConnectingRef.current = false;
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending message via WebSocket:', text);
      wsRef.current.send(
        JSON.stringify({
          type: 'message',
          content: text,
        })
      );
    } else {
      console.error('WebSocket not ready. State:', wsRef.current?.readyState);
    }
  }, []);

  useEffect(() => {
    console.log('useBrainstormWebSocket useEffect triggered, sessionId:', sessionId);
    
    if (!sessionId) {
      console.log('No sessionId, skipping connection');
      return;
    }

    // Connect to the new session
    connect();

    // Cleanup: disconnect when component unmounts or sessionId changes
    return () => {
      console.log('useBrainstormWebSocket cleanup - unmounting or sessionId changed to:', sessionId);
      disconnect();
    };
  }, [sessionId, connect, disconnect]);

  return { sendMessage, disconnect };
}
