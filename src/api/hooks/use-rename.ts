import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Brainstorm, Trip } from '@/types';

export function useRenameProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; title: string }) =>
      apiClient.patch<Brainstorm>(`/brainstorms/${data.projectId}`, { title: data.title }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['Brainstorm', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['brainstorms'] });
    },
  });
}

export function useRenameTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { tripId: string; title: string }) =>
      apiClient.patch<Trip>(`/trips/${data.tripId}`, { title: data.title }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
