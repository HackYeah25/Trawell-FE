import { memo, useState, useEffect } from 'react';
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
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const getAvatarColor = (name?: string) => {
    if (!name) return 'bg-warm-turquoise';
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-gradient-to-br from-warm-coral to-warm-coral/80',
      'bg-gradient-to-br from-warm-turquoise to-warm-turquoise/80',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-amber-500 to-amber-600',
    ];
    return colors[hash % colors.length];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Track if this is a new message that should be animated
  useEffect(() => {
    if (message.role === 'assistant' && message.markdown) {
      // Check if this message was just added by comparing its ID
      const isNewMessage = !message.id.startsWith('initial-') && !message.id.startsWith('iguana-');
      setShouldAnimate(isNewMessage);
    }
  }, [message.id, message.role, message.markdown]);
  
  // Typing animation for assistant messages - only one at a time
  useEffect(() => {
    if (message.role === 'assistant' && message.markdown && shouldAnimate) {
      // Check if there's already a typing animation in progress
      const existingTypingElements = document.querySelectorAll('[data-is-typing="true"]');
      
      if (existingTypingElements.length > 0) {
        // Wait for existing animations to finish
        const checkInterval = setInterval(() => {
          const stillTyping = document.querySelectorAll('[data-is-typing="true"]');
          if (stillTyping.length === 0) {
            clearInterval(checkInterval);
            startTyping();
          }
        }, 100);
        
        return () => clearInterval(checkInterval);
      } else {
        startTyping();
      }
    } else {
      setDisplayedText(message.markdown || '');
      setIsTyping(false);
    }
    
    function startTyping() {
      setIsTyping(true);
      setDisplayedText('');
      
      let currentIndex = 0;
      const text = message.markdown || '';
      const typingSpeed = 15; // ms per character
      
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          if (currentIndex < text.length) {
            setDisplayedText(text.slice(0, currentIndex + 1));
            currentIndex++;
          } else {
            setIsTyping(false);
            clearInterval(interval);
          }
        }, typingSpeed);
        
        return () => clearInterval(interval);
      }, 300); // Initial delay
      
      return () => clearTimeout(timer);
    }
  }, [message.markdown, message.role, shouldAnimate]);

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isOtherUser = isUser && message.userName; // Message from another user in group chat

  return (
    <div
      className={cn(
        'flex mb-6',
        isUser && !isOtherUser ? 'justify-end' : 'justify-start'
      )}
      role="article"
      aria-label={`${message.role} message`}
    >
      <div 
        className={cn(
          'flex gap-3 w-full max-w-2xl',
          isUser && !isOtherUser && 'flex-row-reverse'
        )}
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shadow-sm',
              isOtherUser 
                ? cn('text-white text-xs font-semibold', getAvatarColor(message.userName))
                : isUser
                  ? 'bg-warm-turquoise'
                  : isSystem 
                    ? 'bg-muted' 
                    : 'bg-gradient-sunset'
            )}
            aria-hidden="true"
          >
            {isOtherUser ? (
              getInitials(message.userName!)
            ) : isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
          {isOtherUser && (
            <p className="text-xs font-medium text-muted-foreground text-center">
              {message.userName}
            </p>
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          
          <div
            className={cn(
              'rounded-2xl px-4 py-3 shadow-sm',
              isUser && !isOtherUser
                ? 'bg-gradient-sunset text-white shadow-warm'
                : 'bg-card text-card-foreground border border-warm-coral/20'
            )}
            data-is-typing={isTyping ? 'true' : 'false'}
          >
          {message.markdown && (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-0 prose-ul:my-0 prose-ol:my-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {displayedText}
              </ReactMarkdown>
              {isTyping && (
                <span className="inline-block w-1 h-4 ml-1 bg-warm-coral animate-pulse align-middle" />
              )}
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
          <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Quick replies">
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
      </div>
    </div>
  );
});
