
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUserRole: (role: UserRole) => void; // Helper to switch role of current user for demo
  availableUsers: User[];
  loginAs: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers: User[] = [
  { id: 'super1', name: 'Admin General', email: 'admin@eduassist.com', role: 'superuser', avatarSeed: 'admin@eduassist.com' },
  { id: 'normal1', name: 'Profesor Ejemplo', email: 'profesor@eduassist.com', role: 'normal', avatarSeed: 'profesor@eduassist.com' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserInternal] = useState<User | null>(() => {
    // Attempt to load user from localStorage on initial client render
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          console.error("Failed to parse stored user:", e);
          // Fallback to default if parsing fails
        }
      }
    }
    return defaultUsers.find(u => u.role === 'normal') || defaultUsers[0]; // Default to normal user or first user
  });

  useEffect(() => {
    // Persist currentUser to localStorage whenever it changes
    if (typeof window !== 'undefined') {
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, [currentUser]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserInternal(user);
  };
  
  const loginAs = (userId: string) => {
    const userToLogin = defaultUsers.find(u => u.id === userId);
    if (userToLogin) {
      setCurrentUserInternal(userToLogin);
    }
  };

  const switchUserRole = (role: UserRole) => {
    if (currentUser) {
      const newProfile = defaultUsers.find(u => u.role === role);
      if (newProfile) {
        setCurrentUserInternal(newProfile);
      } else {
         // Fallback: create a temporary user with the new role if no predefined user found
         setCurrentUserInternal({ ...currentUser, role });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, switchUserRole, availableUsers: defaultUsers, loginAs }}>
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
