import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Brainstorm, ChatMessage, Location } from '@/types';

export function useBrainstorms() {
  return useQuery({
    queryKey: ['brainstorms'],
    queryFn: () => apiClient.get<Brainstorm[]>('/brainstorms'),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['Brainstorm', projectId],
    queryFn: () => apiClient.get<Brainstorm>(`/brainstorms/${projectId}`),
    enabled: !!projectId,
  });
}

export function useProjectMessages(projectId: string) {
  return useInfiniteQuery({
    queryKey: ['Brainstorm', projectId, 'messages'],
    queryFn: ({ pageParam = null }) => {
      const params = pageParam ? `?cursor=${pageParam}` : '';
      return apiClient.get<{ messages: ChatMessage[]; nextCursor: string | null }>(
        `/brainstorms/${projectId}/messages${params}`
      );
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    enabled: !!projectId,
  });
}

export function useSendProjectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; text: string }) =>
      apiClient.post<ChatMessage[]>(
        `/brainstorms/${data.projectId}/messages`,
        { text: data.text }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['Brainstorm', variables.projectId, 'messages'],
      });
    },
  });
}

export function useProjectLocationSuggestions(projectId: string) {
  return useQuery({
    queryKey: ['Brainstorm', projectId, 'locations', 'suggestions'],
    queryFn: () =>
      apiClient.get<Location[]>(`/brainstorms/${projectId}/locations/suggestions`),
    enabled: !!projectId,
  });
}

export function useCreateTripFromLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; selectedLocationId: string }) =>
      apiClient.post<{ tripId: string }>(
        `/brainstorms/${data.projectId}/locations`,
        { selectedLocationId: data.selectedLocationId }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title?: string; seedFromOnboarding?: boolean; isShared?: boolean }) =>
      apiClient.post<{ id: string; shareCode?: string }>('/brainstorms', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorms'] });
    },
  });
}

export function useJoinProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { shareCode: string }) =>
      apiClient.post<{ projectId: string }>('/brainstorms/join', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brainstorms'] });
    },
  });
}
