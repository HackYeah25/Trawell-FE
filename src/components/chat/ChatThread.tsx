import { useEffect, useRef, memo } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatMessageSkeleton } from './ChatMessageSkeleton';
import { LocationProposalCard } from '@/components/projects/LocationProposalCard';
import { AttractionProposalCard } from '@/components/trips/AttractionProposalCard';
import { Loader2, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  remainingCount?: number;
}

export const ChatThread = memo(function ChatThread({
  messages,
  isLoading = false,
  onQuickReply,
  onRetryMessage,
  onLocationDecision,
  onAttractionDecision,
  className,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  remainingCount = 0,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousMessagesLength = useRef(messages.length);

  // Auto-scroll to bottom only for NEW messages (not when loading more)
  useEffect(() => {
    // Only scroll if messages increased (new message added, not loaded)
    const isNewMessage = messages.length > previousMessagesLength.current && !isLoadingMore;
    previousMessagesLength.current = messages.length;

    if (isNewMessage) {
      const frameId = requestAnimationFrame(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });
      
      return () => cancelAnimationFrame(frameId);
    }
  }, [messages.length, isLoadingMore]);

  return (
    <div 
      className={cn('flex-1', className)}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
        {/* Load More Button */}
        {hasMore && !isLoadingMore && (
          <div className="flex justify-center mb-6 animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              className="text-muted-foreground hover:text-foreground hover:bg-warm-coral/10"
            >
              <ChevronUp className="w-4 h-4 mr-2" />
              Load more ({remainingCount} older message{remainingCount !== 1 ? 's' : ''})
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoadingMore && (
          <div className="space-y-0">
            <ChatMessageSkeleton width="75%" />
            <ChatMessageSkeleton width="85%" />
            <ChatMessageSkeleton width="65%" />
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => {
          // Determine if this is a historical message (loaded via pagination)
          const isHistoricalMessage = hasMore || isLoadingMore || index < messages.length - 10;
          
          return (
            <div key={message.id} className="space-y-3">
              <ChatMessage
                message={message}
                onQuickReply={onQuickReply}
                onRetry={
                  message.status === 'error'
                    ? () => onRetryMessage?.(message.id)
                    : undefined
                }
                disableAnimation={isHistoricalMessage}
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
          );
        })}

        {/* Typing Indicator - Only for new messages */}
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
