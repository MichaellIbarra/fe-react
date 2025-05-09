export type UserRole = 'superuser' | 'normal';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarSeed?: string; // Used for generating placeholder avatar
  passwordHint: string; // For demo login, e.g. 'super1' or 'normal1'
}

export interface Student {
  id: string; // Unique identifier
  dni: string; // DNI del estudiante
  firstName: string; // Nombres
  lastName: string; // Apellidos
  grade: string; // Grado (e.g., "1ro", "5to")
  section: string; // Sección (e.g., "A", "B")
  level: 'Inicial' | 'Primaria' | 'Secundaria'; // Nivel educativo
  shift: 'Mañana' | 'Tarde'; // Turno
  guardianPhoneNumber: string; // Celular del apoderado
}

export interface SecondaryAssistant {
  id: string; // Unique identifier
  name: string; // Nombres de auxiliares de secundaria
  phoneNumber: string; // Celular de c/auxiliar
}

// Future types for other features
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO date string
  status: 'Presente' | 'Ausente' | 'Tardanza' | 'Justificado';
  notes?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectArea: string; // Área piloto o asignatura
  gradeValue: string | number; // Nota (puede ser numérica o literal)
  period: string; // Bimestre, Trimestre, etc.
  dateAssigned: string; // ISO date string
}

export interface ProgressReport {
  id: string;
  studentId: string;
  period: string;
  summary: string; // Resumen del progreso
  gradesBySubject: Array<{ subject: string; grade: string | number; comments?: string }>;
  behavioralObservations?: string; // Para tutorías (conductual)
  futRequests?: Array<{ date: string; reason: string; status: string }>; // Formato FUT
  attendanceSummary?: { // Optional attendance summary
    totalDays: number;
    present: number;
    absent: number;
    late: number;
  };
}
