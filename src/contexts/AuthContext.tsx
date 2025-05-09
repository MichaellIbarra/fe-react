
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types'; // UserRole is implicitly used via User
import { useToast } from "@/hooks/use-toast"; 


interface AuthContextType {
  currentUser: User | null;
  isAuthLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  logout: () => void;
  // Removed: switchUserProfile and availableUsers
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers: User[] = [
  { id: 'super1', name: 'Admin General', email: 'admin@eduassist.com', role: 'superuser', avatarSeed: 'admin@eduassist.com', passwordHint: 'super1' },
  { id: 'normal1', name: 'Profesor Ejemplo', email: 'profesor@eduassist.com', role: 'normal', avatarSeed: 'profesor@eduassist.com', passwordHint: 'normal1' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserInternal] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { toast } = useToast(); // Retain for potential future use or login messages


  useEffect(() => {
    // Attempt to load user from localStorage on initial client render
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          setCurrentUserInternal(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user:", e);
          localStorage.removeItem('currentUser'); 
        }
      }
      setIsAuthLoading(false); 
    }
  }, []);

  useEffect(() => {
    // Persist currentUser to localStorage whenever it changes
    if (typeof window !== 'undefined' && !isAuthLoading) { 
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, [currentUser, isAuthLoading]);

  const login = async (email: string, passwordAttempt: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300)); 
    const userToLogin = defaultUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHint === passwordAttempt
    );
    if (userToLogin) {
      setCurrentUserInternal(userToLogin);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUserInternal(null);
  };

  // switchUserProfile and availableUsers are removed from the context value
  return (
    <AuthContext.Provider value={{ currentUser, isAuthLoading, login, logout }}>
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

