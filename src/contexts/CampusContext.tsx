'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LegacyCampus } from '@/types';

interface CampusContextType {
  campuses: LegacyCampus[];
  selectedCampus: LegacyCampus | null;
  setSelectedCampus: (campus: LegacyCampus | null) => void;
  addCampus: (campusData: Omit<LegacyCampus, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateCampus: (updatedCampus: LegacyCampus) => void;
  deleteCampus: (campusId: string) => void;
  getCampusById: (campusId: string) => LegacyCampus | undefined;
  isLoaded: boolean;
  isLoadingSelection: boolean; // To track if selected campus is being loaded
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

const CAMPUSES_STORAGE_KEY = 'eduassist_campuses';
const SELECTED_CAMPUS_ID_KEY = 'eduassist_selected_campus_id';

const initialCampusesData: LegacyCampus[] = [
  { 
    id: "campus-1", 
    name: "Sede Central Principal", 
    code: "SC-001", 
    address: "Av. Principal 123, Lima", 
    contactPerson: "Juan Perez Gonzales", 
    contactEmail: "jperez@example.com", 
    contactPhone: "987654321", 
    status: 'A', 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
   { 
    id: "campus-2", 
    name: "Anexo Norte Escolar", 
    code: "AN-002", 
    address: "Jr. Olivos 456, Trujillo", 
    contactPerson: "Maria Rodriguez Silva", 
    contactEmail: "mrodriguez@example.com", 
    contactPhone: "912345678", 
    status: 'A', 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  },
];

export const CampusProvider = ({ children }: { children: ReactNode }) => {
  const [campuses, setCampuses] = useState<LegacyCampus[]>(initialCampusesData);
  const [selectedCampus, setSelectedCampusState] = useState<LegacyCampus | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // For campus list
  const [isLoadingSelection, setIsLoadingSelection] = useState(true); // For selected campus

  // Load all campuses
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCampuses = localStorage.getItem(CAMPUSES_STORAGE_KEY);
        if (storedCampuses) {
          const parsedCampuses = JSON.parse(storedCampuses);
          if (Array.isArray(parsedCampuses) && parsedCampuses.length > 0) {
            setCampuses(parsedCampuses);
          } else {
             localStorage.setItem(CAMPUSES_STORAGE_KEY, JSON.stringify(initialCampusesData));
             setCampuses(initialCampusesData);
          }
        } else {
          localStorage.setItem(CAMPUSES_STORAGE_KEY, JSON.stringify(initialCampusesData));
          setCampuses(initialCampusesData);
        }
      } catch (error) {
        console.error("Error parsing campuses from localStorage:", error);
        setCampuses(initialCampusesData);
        localStorage.setItem(CAMPUSES_STORAGE_KEY, JSON.stringify(initialCampusesData));
      }
      setIsLoaded(true);
    }
  }, []);

  // Load selected campus
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) { // Ensure campuses are loaded first
      const storedSelectedCampusId = localStorage.getItem(SELECTED_CAMPUS_ID_KEY);
      if (storedSelectedCampusId) {
        const campus = campuses.find(c => c.id === storedSelectedCampusId);
        setSelectedCampusState(campus || null);
      }
      setIsLoadingSelection(false);
    }
  }, [isLoaded, campuses]); // Depend on isLoaded and campuses array

  // Persist all campuses
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(CAMPUSES_STORAGE_KEY, JSON.stringify(campuses));
    }
  }, [campuses, isLoaded]);

  const setSelectedCampus = useCallback((campus: LegacyCampus | null) => {
    setSelectedCampusState(campus);
    if (typeof window !== 'undefined') {
      if (campus) {
        localStorage.setItem(SELECTED_CAMPUS_ID_KEY, campus.id);
      } else {
        localStorage.removeItem(SELECTED_CAMPUS_ID_KEY);
      }
    }
  }, []);


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
    setCampuses(prevCampuses => {
      const newCampuses = prevCampuses.filter(c => c.id !== campusId);
      if (selectedCampus?.id === campusId) {
        setSelectedCampus(null); // Clear selection if deleted campus was selected
      }
      return newCampuses;
    });
  };

  const getCampusById = (campusId: string): LegacyCampus | undefined => {
    return campuses.find(c => c.id === campusId);
  };

  return (
    <CampusContext.Provider value={{ 
      campuses, 
      selectedCampus, 
      setSelectedCampus, 
      addCampus, 
      updateCampus, 
      deleteCampus, 
      getCampusById, 
      isLoaded,
      isLoadingSelection 
    }}>
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

