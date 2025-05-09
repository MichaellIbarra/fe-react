
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { useToast } from "@/hooks/use-toast"; // For login error feedback


interface AuthContextType {
  currentUser: User | null;
  isAuthLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
  switchUserProfile: (userId: string) => void; // For demo profile switching in UserNav
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers: User[] = [
  { id: 'super1', name: 'Admin General', email: 'admin@eduassist.com', role: 'superuser', avatarSeed: 'admin@eduassist.com', passwordHint: 'super1' },
  { id: 'normal1', name: 'Profesor Ejemplo', email: 'profesor@eduassist.com', role: 'normal', avatarSeed: 'profesor@eduassist.com', passwordHint: 'normal1' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserInternal] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { toast } = useToast();


  useEffect(() => {
    // Attempt to load user from localStorage on initial client render
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          setCurrentUserInternal(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user:", e);
          localStorage.removeItem('currentUser'); // Clear invalid stored user
        }
      }
      setIsAuthLoading(false); // Done loading
    }
  }, []);

  useEffect(() => {
    // Persist currentUser to localStorage whenever it changes
    if (typeof window !== 'undefined' && !isAuthLoading) { // Only save after initial load determined
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, [currentUser, isAuthLoading]);

  const login = async (email: string, passwordAttempt: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const userToLogin = defaultUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHint === passwordAttempt
    );
    if (userToLogin) {
      setCurrentUserInternal(userToLogin);
      return true;
    }
    // Toast for login failure is handled in LoginPage
    return false;
  };

  const logout = () => {
    setCurrentUserInternal(null);
    // localStorage removal is handled by the useEffect for currentUser when it becomes null
  };

  const switchUserProfile = (userId: string) => {
    const userToSwitchTo = defaultUsers.find(u => u.id === userId);
    if (userToSwitchTo) {
      setCurrentUserInternal(userToSwitchTo);
    } else {
        toast({ variant: "destructive", title: "Error", description: "Perfil no encontrado."});
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthLoading, login, logout, switchUserProfile, availableUsers: defaultUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
