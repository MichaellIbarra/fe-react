
// Legacy types (from previous localStorage-based structure)
export type LegacyUserRole = 'superuser' | 'normal';

export interface LegacyUser {
  id: string;
  name: string;
  email: string;
  role: LegacyUserRole;
  avatarSeed?: string; // Used for generating placeholder avatar
  passwordHint: string; // For demo login, e.g. 'super1' or 'normal1'
}

export interface LegacyStudent {
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

export interface LegacyAttendanceRecord {
  id: string;
  studentId: string; // Corresponds to LegacyStudent.id
  date: string; // ISO date string
  status: 'Presente' | 'Ausente' | 'Tardanza' | 'Justificado';
  notes?: string;
}

export interface LegacyGrade {
  id: string;
  studentId: string; // Corresponds to LegacyStudent.id
  subjectArea: string; // Área piloto o asignatura
  gradeValue: string | number; // Nota (puede ser numérica o literal)
  period: string; // Bimestre, Trimestre, etc.
  dateAssigned: string; // ISO date string
}

export interface LegacyProgressReport {
  id: string;
  studentId: string; // Corresponds to LegacyStudent.id
  period: string;
  summary: string; // Resumen del progreso
  gradesBySubject: Array<{ subject: string; grade: string | number; comments?: string }>;
  behavioralObservations?: string; // Para tutorías (conductual)
  futRequests?: Array<{ date: string; reason: string; status: string }>; // Formato FUT
  attendanceSummary?: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
  };
}

export interface LegacyCampus {
  id: string; // Unique identifier (auto-generated string)
  name: string; // Nombre de la Institucion
  code: string; // Codigo de la Institucion (Kept for identification)
  
  institutionLogo?: string; // URL or path to logo
  institutionColor?: string; // Hex color code, e.g., #FF0000
  educationalLevelSelection?: string; // "Primaria", "Secundaria", "Primaria y Secundaria"

  directorPhoto?: string; // URL or path to director's photo
  directorFirstName?: string;
  directorLastName?: string;
  directorDocumentNumber?: string;
  directorPhoneNumber?: string;
  directorEmail?: string;
  directorPassword?: string; // Storing passwords/hints like this is not secure

  // Old fields that might still be in data but not actively used by the new form:
  address?: string; 
  contactPerson?: string; // Replaced by directorFirstName/LastName
  contactEmail?: string; // Replaced by directorEmail
  contactPhone?: string; // Replaced by directorPhoneNumber

  status: 'A' | 'I'; // Active, Inactive, default 'A'
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}


// New types based on the provided SQL schema

export type StatusEnum = 'A' | 'I'; // Active, Inactive
export type DocumentTypeEnum = 'DNI' | 'PASSPORT' | 'OTHER';
export type GenderEnum = 'M' | 'F' | 'O';
export type TurnEnum = 'M' | 'T'; // Mañana, Tarde - Noche removed
export type AttendanceStatusEnum = 'PRESENT' | 'MISSED' | 'LATE' | 'JUSTIFIED';


export interface EducationalGroup {
  group_id: number;
  group_name: string;
  code_name: string;
  logo?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface GroupUser {
  group_user_id: number;
  firebase_id?: string;
  group_id?: number;
  first_name: string;
  last_name: string;
  document_type?: DocumentTypeEnum;
  document_number: string;
  email: string;
  phone?: string;
  password?: string; // Should be hashed in a real scenario
  user_image?: string;
  role: 'SUPERADMIN';
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface Institution {
  institution_id: number;
  group_id?: number;
  institution_name: string;
  code_name: string;
  institution_logo?: string;
  modular_code: string;
  institution_color?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface Role {
  role_id: number;
  institution_id: number;
  role_name: string;
  role_slug: string;
  description?: string;
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface RolePermission {
  permission_id: number;
  role_id: number;
  permissions: any; // JSON, so can be Record<string, any> or a specific structure
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface User { // This is the institution user
  user_id: number;
  firebase_id?: string;
  institution_id?: number;
  first_name: string;
  last_name: string;
  document_type?: DocumentTypeEnum;
  document_number: string;
  email: string;
  phone?: string;
  password?: string; // Should be hashed
  user_image?: string;
  role: string; // e.g., 'ADMIN', 'DIRECTOR' - comes from a predefined list in comments
  role_id?: number; // FK to roles table
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface Campus {
  campus_id: number;
  institution_id: number;
  campus_name: string;
  campus_code: string;
  address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface EducationalLevel {
  level_id: number;
  level_name: string; // PRIMARIA, SECUNDARIA, etc.
  level_code: string;
  description?: string;
  status?: StatusEnum;
}

export interface CampusToLevel {
  c2l_id: number;
  campus_id: number;
  level_id: number;
  status?: StatusEnum;
  sort_order?: number;
}

export interface Classroom {
  classroom_id: number;
  campus_id: number;
  level_id: number;
  grade: number; // 1, 2, 3, etc.
  section: string; // A, B, C, etc.
  classroom_name: string; // "Grado 1, Sección A"
  capacity: number;
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface Student { // This is the new student type
  student_id: number;
  institution_id: number;
  first_name: string;
  last_name: string;
  document_type?: DocumentTypeEnum;
  document_number: string;
  gender: GenderEnum;
  birth_date: string; // Or Date
  address?: string;
  phone?: string;
  email?: string;
  name_qr?: string;
  image_data?: string; // Should be TEXT, perhaps for base64 image or path
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface ClassroomStudent {
  cs_id: number;
  classroom_id: number;
  student_id: number;
  enrollment_date: string; // Or Date
  turn: TurnEnum;
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface Attendance {
  attendance_id: number;
  student_id: number;
  classroom_id: number;
  attendance_date: string; // Or Date
  status_attendance: AttendanceStatusEnum;
  observation?: string;
  created_by: number; // User ID
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface Subject {
  subject_id: number;
  institution_id: number;
  subject_name: string;
  subject_code: string;
  level_id: number;
  hours_per_week: number;
  status?: StatusEnum;
  created_at?: string; // Or Date
}

export interface AcademicPeriod {
  period_id: number;
  institution_id: number;
  period_name: string;
  start_date: string; // Or Date
  end_date: string; // Or Date
  status?: StatusEnum;
  created_at?: string; // Or Date
}

export interface Grade { // This is the new grade type
  grade_id: number;
  student_id: number;
  subject_id: number;
  classroom_id: number;
  period_id: number;
  grade_value: number; // DECIMAL(5,2)
  evaluation_type: string;
  comments?: string;
  grade_details?: any; // JSON
  created_by: number; // User ID
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface UserToCampus {
  u2c_id: number;
  user_id: number;
  campus_id: number;
  status?: StatusEnum;
  sort_order: number;
  created_at?: string; // Or Date
}

export interface Teacher {
  teacher_id: number;
  user_id: number;
  speciality?: string;
  bio?: string;
  status?: StatusEnum;
  created_at?: string; // Or Date
}

export interface TeacherSubjectClassroom {
  tsc_id: number;
  teacher_id: number;
  subject_id: number;
  classroom_id: number;
  period_id: number;
  status?: StatusEnum;
  created_at?: string; // Or Date
}

export interface InstitutionSetting {
  setting_id: number;
  institution_id: number;
  setting_key: string;
  setting_value: any; // JSON
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

export interface CampusSetting {
  setting_id: number;
  campus_id: number;
  setting_key: string;
  setting_value?: string; // TEXT
  status?: StatusEnum;
  created_at?: string; // Or Date
  updated_at?: string; // Or Date
}

