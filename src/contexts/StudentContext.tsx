
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
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// This data will be used if localStorage is empty or fails to parse
const initialStudentsData: Student[] = [
  { id: "1", dni: "12345678", firstName: "Ana", lastName: "García", grade: "5to", section: "A", level: "Primaria", shift: "Mañana", guardianPhoneNumber: "987654321" },
  { id: "2", dni: "87654321", firstName: "Luis", lastName: "Martínez", grade: "3ro", section: "B", level: "Secundaria", shift: "Tarde", guardianPhoneNumber: "912345678" },
  { id: "3", dni: "11223344", firstName: "Sofía", lastName: "Rodríguez", grade: "Kinder", section: "C", level: "Inicial", shift: "Mañana", guardianPhoneNumber: "998877665" },
];


export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedStudents = localStorage.getItem('students');
        return storedStudents ? JSON.parse(storedStudents) : initialStudentsData;
      } catch (error) {
        console.error("Error parsing students from localStorage:", error);
        // Fallback to initial data if parsing fails
        return initialStudentsData;
      }
    }
    // Default for SSR or if window is not defined yet
    return initialStudentsData;
  });

  useEffect(() => {
    // Persist students to localStorage whenever they change
    if (typeof window !== 'undefined') {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...studentData, id: String(Date.now()) };
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
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, getStudentById }}>
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
