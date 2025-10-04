import { useEffect, useRef, memo } from 'react';
import { ChatMessage } from './ChatMessage';
import { LocationProposalCard } from '@/components/projects/LocationProposalCard';
import { AttractionProposalCard } from '@/components/trips/AttractionProposalCard';
import { Loader2 } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';

interface ChatThreadProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
  onQuickReply?: (payload: unknown) => void;
  onRetryMessage?: (messageId: string) => void;
  onLocationDecision?: (locationId: string, decision: 'reject' | 1 | 2 | 3) => void;
  onAttractionDecision?: (attractionId: string, decision: 'reject' | 1 | 2 | 3) => void;
  className?: string;
}

export const ChatThread = memo(function ChatThread({
  messages,
  isLoading = false,
  onQuickReply,
  onRetryMessage,
  onLocationDecision,
  onAttractionDecision,
  className,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
    
    return () => cancelAnimationFrame(frameId);
  }, [messages.length]);

  return (
    <div 
      className={cn('flex-1', className)}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            <ChatMessage
              message={message}
              onQuickReply={onQuickReply}
              onRetry={
                message.status === 'error'
                  ? () => onRetryMessage?.(message.id)
                  : undefined
              }
            />
            
            {message.locationProposal && (
              <div className="max-w-md mx-auto">
                <LocationProposalCard
                  location={message.locationProposal}
                  onDecision={(decision) => onLocationDecision?.(message.locationProposal!.id, decision)}
                />
              </div>
            )}
            
            {message.attractionProposal && (
              <div className="max-w-md mx-auto">
                <AttractionProposalCard
                  attraction={message.attractionProposal}
                  onDecision={(decision) => onAttractionDecision?.(message.attractionProposal!.id, decision)}
                />
              </div>
            )}
          </div>
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
    </div>
  );
});
