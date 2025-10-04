import { useEffect, useRef, memo } from 'react';
import { ChatMessage } from './ChatMessage';
import { Loader2 } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';

interface ChatThreadProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
  onQuickReply?: (payload: unknown) => void;
  onRetryMessage?: (messageId: string) => void;
  className?: string;
}

export const ChatThread = memo(function ChatThread({
  messages,
  isLoading = false,
  onQuickReply,
  onRetryMessage,
  className,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    // Use requestAnimationFrame for better scroll timing
    const frameId = requestAnimationFrame(() => {
      if (bottomRef.current && containerRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    
    return () => cancelAnimationFrame(frameId);
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      className={cn('flex-1 overflow-y-auto px-4 py-6', className)}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onQuickReply={onQuickReply}
            onRetry={
              message.status === 'error'
                ? () => onRetryMessage?.(message.id)
                : undefined
            }
          />
        ))}

        {isLoading && (
          <div
            className="flex gap-3 mb-4 animate-slide-in-left"
            aria-label="Assistant is typing"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-sunset flex items-center justify-center shadow-sm">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-card border border-warm-coral/20 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-warm-coral/50 rounded-full animate-pulse-glow" />
                <span
                  className="w-2 h-2 bg-warm-coral/50 rounded-full animate-pulse-glow"
                  style={{ animationDelay: '0.2s' }}
                />
                <span
                  className="w-2 h-2 bg-warm-coral/50 rounded-full animate-pulse-glow"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
});
