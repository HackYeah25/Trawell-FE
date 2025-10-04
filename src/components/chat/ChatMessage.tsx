import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatMessage as ChatMessageType } from '@/types';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickReply?: (payload: unknown) => void;
  onRetry?: () => void;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  onQuickReply,
  onRetry,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isUser ? 'justify-end animate-slide-in-right' : 'justify-start animate-slide-in-left'
      )}
      role="article"
      aria-label={`${message.role} message`}
    >
      {!isUser && (
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm',
            isSystem ? 'bg-muted' : 'bg-gradient-sunset'
          )}
          aria-hidden="true"
        >
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn('flex flex-col gap-2 max-w-[80%] md:max-w-[70%]')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'bg-gradient-sunset text-white shadow-warm'
              : 'bg-card text-card-foreground border border-warm-coral/20'
          )}
        >
          {message.markdown && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.markdown}
              </ReactMarkdown>
            </div>
          )}

          {message.status === 'error' && (
            <div className="flex items-center gap-2 mt-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Failed to send message</span>
              {onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                  className="ml-auto hover:bg-warm-coral/10"
                >
                  Try again
                </Button>
              )}
            </div>
          )}
        </div>

        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick replies">
            {message.quickReplies.map((reply) => (
              <Button
                key={reply.id}
                variant="outline"
                size="sm"
                onClick={() => onQuickReply?.(reply.payload)}
                className="bg-card hover:bg-warm-coral/10 border-warm-coral/20"
              >
                {reply.label}
              </Button>
            ))}
          </div>
        )}

        {message.uiHints?.map((hint, index) => (
          <div key={index} className="mt-2">
            {hint.type === 'choices' && (
              <div className="flex flex-col gap-2">
                {hint.options.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() => onQuickReply?.(option.value)}
                    className="justify-start bg-card hover:bg-warm-coral/10 border-warm-coral/20"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-warm-turquoise flex items-center justify-center shadow-sm"
          aria-hidden="true"
        >
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
});
