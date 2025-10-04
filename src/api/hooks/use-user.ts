import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('travelai_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return useQuery({
    queryKey: ['user'],
    queryFn: () => user,
    enabled: !!user,
    initialData: user,
  });
}

export function updateUserOnboarding(completed: boolean) {
  const storedUser = localStorage.getItem('travelai_user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    user.onboardingCompleted = completed;
    localStorage.setItem('travelai_user', JSON.stringify(user));
  }
}
