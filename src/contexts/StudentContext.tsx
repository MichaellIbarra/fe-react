
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Student } from '@/types';

interface StudentContextType {
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  getStudentById: (studentId: string) => Student | undefined;
  isLoaded: boolean; // To indicate if data has been loaded from localStorage
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// This data will be used for the initial server render and the first client render
// to ensure consistency and prevent hydration mismatches.
const initialStudentsData: Student[] = [
  { id: "1", dni: "12345678", firstName: "Ana", lastName: "García", grade: "5to", section: "A", level: "Primaria", shift: "Mañana", guardianPhoneNumber: "987654321" },
  { id: "2", dni: "87654321", firstName: "Luis", lastName: "Martínez", grade: "3ro", section: "B", level: "Secundaria", shift: "Tarde", guardianPhoneNumber: "912345678" },
  { id: "3", dni: "11223344", firstName: "Sofía", lastName: "Rodríguez", grade: "Kinder", section: "C", level: "Inicial", shift: "Mañana", guardianPhoneNumber: "998877665" },
];


export const StudentProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with initialStudentsData. This ensures server and initial client render match.
  const [students, setStudents] = useState<Student[]>(initialStudentsData);
  const [isLoaded, setIsLoaded] = useState(false); // Flag to indicate when localStorage data is loaded

  // Load students from localStorage on the client side after mount
  useEffect(() => {
    // This effect runs only on the client, after the initial render phase
    if (typeof window !== 'undefined') {
      try {
        const storedStudents = localStorage.getItem('students');
        if (storedStudents) {
          setStudents(JSON.parse(storedStudents));
        }
        // If no stored students or parsing fails, it remains initialStudentsData, which is intended.
      } catch (error) {
        console.error("Error parsing students from localStorage:", error);
        // Fallback to initialStudentsData if parsing fails, which is already the current state.
      }
      setIsLoaded(true); // Mark that loading attempt from localStorage is complete
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Persist students to localStorage whenever they change, but only after initial load from localStorage
  useEffect(() => {
    // This effect runs only on the client
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students, isLoaded]); // Re-run when students or isLoaded state changes

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    // Using Date.now() + a random string for client-generated IDs.
    // For a production app, consider UUIDs for more robustness.
    const newStudent: Student = { ...studentData, id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}` };
    setStudents(prevStudents => [...prevStudents, newStudent]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prevStudents =>
      prevStudents.map(s => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
  };

  const getStudentById = (studentId: string): Student | undefined => {
    return students.find(s => s.id === studentId);
  };

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, getStudentById, isLoaded }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudentContext must be used within a StudentProvider');
  }
  return context;
};
