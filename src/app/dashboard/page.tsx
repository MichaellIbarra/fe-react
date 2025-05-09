"use client"; 

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PieChartIcon, UsersRound, BarChartHorizontalBig, BookCopy, Building, CheckCircle, Home, Settings2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; 
import type { LegacyStudent, LegacyAttendanceRecord, LegacyGrade, LegacyCampus } from "@/types";
import StudentLevelDistributionChart, { type StudentLevelDataPoint } from "@/components/charts/StudentLevelDistributionChart";
import TodaysAttendanceChart, { type AttendanceDataPoint } from "@/components/charts/TodaysAttendanceChart";
import StudentsPerGradeChart, { type StudentsPerGradeDataPoint } from "@/components/charts/StudentsPerGradeChart";
import GradeCountBySubjectChart, { type GradeCountBySubjectDataPoint } from "@/components/charts/GradeCountBySubjectChart";

import { useStudentContext } from "@/contexts/StudentContext";
import { useCampusContext } from "@/contexts/CampusContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

const getAttendanceStorageKey = (date: Date, campusId?: string) => 
  `eduassist_attendance_${campusId ? campusId + '_' : ''}${format(date, "yyyy-MM-dd")}`;
const getGradesStorageKey = (campusId?: string) => 
  `eduassist_grades_${campusId ? campusId + '_' : ''}`;

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { students, isLoaded: studentsLoaded } = useStudentContext();
  const { campuses, selectedCampus, setSelectedCampus, isLoaded: campusesLoaded, isLoadingSelection: campusSelectionLoading } = useCampusContext();
  
  const [studentLevelData, setStudentLevelData] = useState<StudentLevelDataPoint[]>([]);
  const [todaysAttendanceData, setTodaysAttendanceData] = useState<AttendanceDataPoint[]>([]);
  const [studentsPerGradeData, setStudentsPerGradeData] = useState<StudentsPerGradeDataPoint[]>([]);
  const [gradeCountBySubjectData, setGradeCountBySubjectData] = useState<GradeCountBySubjectDataPoint[]>([]);
  
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

  useEffect(() => {
    // Wait for students, selected campus, and campus list to be loaded
    if (studentsLoaded && campusesLoaded && !campusSelectionLoading && typeof window !== 'undefined') {
      if (selectedCampus) {
        setIsLoadingCharts(true);
        
        // TODO: Filter students by selectedCampus.id once student data includes campusId
        const campusStudents = students; // Placeholder: use all students for now

        // Process student level distribution
        const levelCounts: Record<LegacyStudent['level'], number> = {
          'Inicial': 0,
          'Primaria': 0,
          'Secundaria': 0,
        };
        campusStudents.forEach(student => {
          if (levelCounts[student.level] !== undefined) {
            levelCounts[student.level]++;
          }
        });
        setStudentLevelData([
          { level: "Inicial", count: levelCounts['Inicial'], fill: chartColors[0] },
          { level: "Primaria", count: levelCounts['Primaria'], fill: chartColors[1] },
          { level: "Secundaria", count: levelCounts['Secundaria'], fill: chartColors[2] },
        ]);

        // Process today's attendance for the selected campus
        const today = new Date();
        const attendanceKey = getAttendanceStorageKey(today, selectedCampus.id);
        const storedAttendance = localStorage.getItem(attendanceKey);
        const attendanceStatusCounts: Record<LegacyAttendanceRecord['status'], number> = {
          'Presente': 0, 'Ausente': 0, 'Tardanza': 0, 'Justificado': 0,
        };

        if (storedAttendance) {
          try {
            const dailyAttendance: Record<string, LegacyAttendanceRecord['status']> = JSON.parse(storedAttendance);
            Object.values(dailyAttendance).forEach(status => {
              if (attendanceStatusCounts[status] !== undefined) attendanceStatusCounts[status]++;
            });
          } catch (e) { console.error("Error parsing today's attendance for dashboard:", e); }
        }
        
        setTodaysAttendanceData([
          { status: "Presente", count: attendanceStatusCounts['Presente'], fill: chartColors[0] },
          { status: "Ausente", count: attendanceStatusCounts['Ausente'], fill: chartColors[1] },
          { status: "Tardanza", count: attendanceStatusCounts['Tardanza'], fill: chartColors[2] },
          { status: "Justificado", count: attendanceStatusCounts['Justificado'], fill: chartColors[3] },
        ]);

        // Process students per grade for the selected campus
        const gradeCounts: Record<string, number> = {};
        campusStudents.forEach(student => {
          gradeCounts[student.grade] = (gradeCounts[student.grade] || 0) + 1;
        });
        setStudentsPerGradeData(
          Object.entries(gradeCounts).map(([grade, count], index) => ({
            grade, count, fill: chartColors[index % chartColors.length],
          }))
        );
        
        // Process grade count by subject for the selected campus
        const gradesKey = getGradesStorageKey(selectedCampus.id);
        const storedGrades = localStorage.getItem(gradesKey);
        let allGrades: LegacyGrade[] = [];
        if (storedGrades) {
          try { allGrades = JSON.parse(storedGrades); } 
          catch (e) { console.error("Error parsing grades for dashboard:", e); }
        }
        const subjectGradeCounts: Record<string, number> = {};
        allGrades.forEach(grade => {
          subjectGradeCounts[grade.subjectArea] = (subjectGradeCounts[grade.subjectArea] || 0) + 1;
        });
        setGradeCountBySubjectData(
          Object.entries(subjectGradeCounts).map(([subject, count], index) => ({
            subject, count, fill: chartColors[index % chartColors.length],
          }))
        );
        
        setIsLoadingCharts(false);
      } else {
        // No campus selected, clear chart data and stop loading
        setStudentLevelData([]);
        setTodaysAttendanceData([]);
        setStudentsPerGradeData([]);
        setGradeCountBySubjectData([]);
        setIsLoadingCharts(false);
      }
    }
  }, [students, studentsLoaded, selectedCampus, campusesLoaded, campusSelectionLoading]);


  if (!studentsLoaded || !campusesLoaded || campusSelectionLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Cargando datos principales...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedCampus) {
    return (
      <DashboardLayout>
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Bienvenido a EduAssist</CardTitle>
            </div>
            <CardDescription className="text-lg">
              {currentUser?.name}, por favor seleccione una sede para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campuses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campuses.map((campus) => (
                  <Card 
                    key={campus.id} 
                    className="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => setSelectedCampus(campus)}
                    data-ai-hint="campus card"
                  >
                    <CardHeader className="flex-row items-center gap-4 pb-2">
                       <div className="p-3 rounded-md bg-primary/10">
                         <Building className="h-8 w-8 text-primary" />
                       </div>
                       <div>
                        <CardTitle className="text-xl">{campus.name}</CardTitle>
                        <CardDescription>{campus.code}</CardDescription>
                       </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1 pt-2">
                      <p>Dirección: {campus.address || "No especificada"}</p>
                      <p>Contacto: {campus.contactPerson || "No especificado"}</p>
                    </CardContent>
                    <div className="p-4 pt-2 flex justify-end">
                        <Button variant="outline" size="sm">Seleccionar Sede</Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay sedes configuradas. Contacte al superadministrador.</p>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // If a campus is selected, show the regular dashboard
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-3xl font-bold text-primary">
                        Panel de Control: {selectedCampus.name}
                    </CardTitle>
                    <CardDescription className="text-lg">
                    Bienvenido {currentUser?.name || 'Usuario'}. Está viendo los datos de la sede {selectedCampus.name}.
                    ({currentUser?.role === 'superuser' ? 'Modo Superusuario' : 'Modo Usuario'})
                    </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedCampus(null)}>
                    <Home className="mr-2 h-4 w-4" /> Cambiar Sede
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p>Utilice la barra de navegación lateral para explorar las diferentes secciones de la sede.</p>
          </CardContent>
        </Card>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Resumen Académico de la Sede</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-2">
                <UsersRound className="w-7 h-7 text-primary" />
                <CardTitle>Distribución por Nivel Educativo</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCharts ? (
                  <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : studentLevelData.some(d => d.count > 0) ? (
                  <StudentLevelDistributionChart data={studentLevelData} />
                ) : (
                  <p className="text-muted-foreground text-center py-10">No hay datos de estudiantes para mostrar.</p>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-2">
                <PieChartIcon className="w-7 h-7 text-primary" />
                <CardTitle>Asistencia de Hoy ({format(new Date(), "dd MMM yyyy", { locale: es })})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCharts ? (
                   <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : todaysAttendanceData.some(d => d.count > 0) ? (
                  <TodaysAttendanceChart data={todaysAttendanceData} />
                ) : (
                  <p className="text-muted-foreground text-center py-10">No hay datos de asistencia para hoy.</p>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-2">
                <BarChartHorizontalBig className="w-7 h-7 text-primary" />
                <CardTitle>Estudiantes por Grado</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCharts ? (
                  <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : studentsPerGradeData.some(d => d.count > 0) ? (
                  <StudentsPerGradeChart data={studentsPerGradeData} />
                ) : (
                  <p className="text-muted-foreground text-center py-10">No hay datos de estudiantes por grado.</p>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-2">
                <BookCopy className="w-7 h-7 text-primary" />
                <CardTitle>Distribución de Notas por Materia</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCharts ? (
                   <div className="flex justify-center items-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : gradeCountBySubjectData.some(d => d.count > 0) ? (
                  <GradeCountBySubjectChart data={gradeCountBySubjectData} />
                ) : (
                  <p className="text-muted-foreground text-center py-10">No hay notas registradas para mostrar.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
