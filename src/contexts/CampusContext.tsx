
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { LegacyCampus } from '@/types';

interface CampusContextType {
  campuses: LegacyCampus[];
  addCampus: (campusData: Omit<LegacyCampus, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateCampus: (updatedCampus: LegacyCampus) => void;
  deleteCampus: (campusId: string) => void;
  getCampusById: (campusId: string) => LegacyCampus | undefined;
  isLoaded: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

const CAMPUSES_STORAGE_KEY = 'eduassist_campuses';

const initialCampusesData: LegacyCampus[] = [
  { 
    id: "campus-1", 
    name: "Sede Central", 
    code: "SC-001", 
    address: "Av. Principal 123", 
    contactPerson: "Juan Perez", 
    contactEmail: "jperez@example.com", 
    contactPhone: "987654321", 
    status: 'A', 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
];

export const CampusProvider = ({ children }: { children: ReactNode }) => {
  const [campuses, setCampuses] = useState<LegacyCampus[]>(initialCampusesData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCampuses = localStorage.getItem(CAMPUSES_STORAGE_KEY);
        if (storedCampuses) {
          setCampuses(JSON.parse(storedCampuses));
        } else {
          // If no data in localStorage, set initial data and save it
          localStorage.setItem(CAMPUSES_STORAGE_KEY, JSON.stringify(initialCampusesData));
        }
      } catch (error) {
        console.error("Error parsing campuses from localStorage:", error);
        // If parsing fails, initialize with default and save
        setCampuses(initialCampusesData);
        localStorage.setItem(CAMPUSES_STORAGE_KEY, JSON.stringify(initialCampusesData));
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(CAMPUSES_STORAGE_KEY, JSON.stringify(campuses));
    }
  }, [campuses, isLoaded]);

  const addCampus = (campusData: Omit<LegacyCampus, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const now = new Date().toISOString();
    const newCampus: LegacyCampus = {
      ...campusData,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      status: 'A',
      createdAt: now,
      updatedAt: now,
    };
    setCampuses(prevCampuses => [...prevCampuses, newCampus]);
  };

  const updateCampus = (updatedCampusData: LegacyCampus) => {
    setCampuses(prevCampuses =>
      prevCampuses.map(c =>
        c.id === updatedCampusData.id ? { ...updatedCampusData, updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const deleteCampus = (campusId: string) => {
    setCampuses(prevCampuses => prevCampuses.filter(c => c.id !== campusId));
  };

  const getCampusById = (campusId: string): LegacyCampus | undefined => {
    return campuses.find(c => c.id === campusId);
  };

  return (
    <CampusContext.Provider value={{ campuses, addCampus, updateCampus, deleteCampus, getCampusById, isLoaded }}>
      {children}
    </CampusContext.Provider>
  );
};

export const useCampusContext = () => {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error('useCampusContext must be used within a CampusProvider');
  }
  return context;
};
