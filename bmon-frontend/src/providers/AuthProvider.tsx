'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<{ sub: string; nombre: string; email: string; rol: string }>('/auth/me');
      return { id: data.sub, nombre: data.nombre, email: data.email, rol: data.rol } as User;
    },
    enabled: !!Cookies.get('bmon_token'),
    retry: false,
  });

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ access_token: string }>('/auth/login', { email, password });
    Cookies.set('bmon_token', data.access_token, { expires: 7 });
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    router.push('/dashboard');
  };

  const logout = () => {
    Cookies.remove('bmon_token');
    queryClient.clear();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
