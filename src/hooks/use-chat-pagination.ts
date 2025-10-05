import { useState, useMemo, useCallback, useEffect } from 'react';
import type { ChatMessage } from '@/types';

interface UseChatPaginationOptions {
  allMessages: ChatMessage[];
  pageSize?: number;
}

interface UseChatPaginationReturn {
  displayedMessages: ChatMessage[];
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  remainingCount: number;
  reset: () => void;
}

export function useChatPagination({
  allMessages,
  pageSize = 10,
}: UseChatPaginationOptions): UseChatPaginationReturn {
  const [displayedCount, setDisplayedCount] = useState(() => Math.min(pageSize, allMessages.length || 0));
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset displayedCount when allMessages changes significantly (e.g., new conversation)
  useEffect(() => {
    if (allMessages.length <= pageSize) {
      setDisplayedCount(allMessages.length);
    }
  }, [allMessages.length, pageSize]);


  const displayedMessages = useMemo(() => {
    // For now, always show all messages to debug the issue
    const messages = allMessages;
    
    console.log('displayedMessages calculated (showing all):', { 
      allMessagesLength: allMessages.length, 
      displayedCount, 
      messagesLength: messages.length,
      lastMessage: messages[messages.length - 1]?.markdown?.substring(0, 50),
      allMessages: allMessages.map(m => ({ id: m.id, role: m.role, markdown: m.markdown?.substring(0, 30) }))
    });
    return messages;
  }, [allMessages, displayedCount]);

  // Update displayedCount when allMessages changes
  useEffect(() => {
    if (allMessages.length > displayedCount) {
      const newDisplayedCount = Math.min(allMessages.length, displayedCount + pageSize);
      console.log('Updating displayedCount from', displayedCount, 'to', newDisplayedCount);
      setDisplayedCount(newDisplayedCount);
    }
  }, [allMessages.length, displayedCount, pageSize]);

  const remainingCount = useMemo(() => {
    return Math.max(0, allMessages.length - displayedCount);
  }, [allMessages.length, displayedCount]);

  const hasMore = remainingCount > 0;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate loading delay for smooth skeleton display
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + pageSize, allMessages.length));
      setIsLoadingMore(false);
    }, 400);
  }, [isLoadingMore, hasMore, pageSize, allMessages.length]);

  const reset = useCallback(() => {
    setDisplayedCount(pageSize);
    setIsLoadingMore(false);
  }, [pageSize]);

  return {
    displayedMessages,
    hasMore,
    isLoadingMore,
    loadMore,
    remainingCount,
    reset,
  };
}
