
"use client"; 

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PieChartIcon, UsersRound, BarChartHorizontalBig, BookCopy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; 
import type { LegacyStudent, LegacyAttendanceRecord, LegacyGrade } from "@/types";
import StudentLevelDistributionChart, { type StudentLevelDataPoint } from "@/components/charts/StudentLevelDistributionChart";
import TodaysAttendanceChart, { type AttendanceDataPoint } from "@/components/charts/TodaysAttendanceChart";
import StudentsPerGradeChart, { type StudentsPerGradeDataPoint } from "@/components/charts/StudentsPerGradeChart";
import GradeCountBySubjectChart, { type GradeCountBySubjectDataPoint } from "@/components/charts/GradeCountBySubjectChart";

import { useStudentContext } from "@/contexts/StudentContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const getAttendanceStorageKey = (date: Date) => `eduassist_attendance_${format(date, "yyyy-MM-dd")}`;
const GRADES_STORAGE_KEY = "eduassist_grades";

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
  
  const [studentLevelData, setStudentLevelData] = useState<StudentLevelDataPoint[]>([]);
  const [todaysAttendanceData, setTodaysAttendanceData] = useState<AttendanceDataPoint[]>([]);
  const [studentsPerGradeData, setStudentsPerGradeData] = useState<StudentsPerGradeDataPoint[]>([]);
  const [gradeCountBySubjectData, setGradeCountBySubjectData] = useState<GradeCountBySubjectDataPoint[]>([]);
  
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

  useEffect(() => {
    if (studentsLoaded && typeof window !== 'undefined') {
      setIsLoadingCharts(true);
      
      // Process student level distribution
      const levelCounts: Record<LegacyStudent['level'], number> = {
        'Inicial': 0,
        'Primaria': 0,
        'Secundaria': 0,
      };
      students.forEach(student => {
        if (levelCounts[student.level] !== undefined) {
          levelCounts[student.level]++;
        }
      });
      setStudentLevelData([
        { level: "Inicial", count: levelCounts['Inicial'], fill: chartColors[0] },
        { level: "Primaria", count: levelCounts['Primaria'], fill: chartColors[1] },
        { level: "Secundaria", count: levelCounts['Secundaria'], fill: chartColors[2] },
      ]);

      // Process today's attendance
      const today = new Date();
      const attendanceKey = getAttendanceStorageKey(today);
      const storedAttendance = localStorage.getItem(attendanceKey);
      const attendanceStatusCounts: Record<LegacyAttendanceRecord['status'], number> = {
        'Presente': 0,
        'Ausente': 0,
        'Tardanza': 0,
        'Justificado': 0,
      };

      if (storedAttendance) {
        try {
          const dailyAttendance: Record<string, LegacyAttendanceRecord['status']> = JSON.parse(storedAttendance);
          Object.values(dailyAttendance).forEach(status => {
            if (attendanceStatusCounts[status] !== undefined) {
              attendanceStatusCounts[status]++;
            }
          });
        } catch (e) {
          console.error("Error parsing today's attendance for dashboard:", e);
        }
      }
      
      setTodaysAttendanceData([
        { status: "Presente", count: attendanceStatusCounts['Presente'], fill: chartColors[0] },
        { status: "Ausente", count: attendanceStatusCounts['Ausente'], fill: chartColors[1] },
        { status: "Tardanza", count: attendanceStatusCounts['Tardanza'], fill: chartColors[2] },
        { status: "Justificado", count: attendanceStatusCounts['Justificado'], fill: chartColors[3] },
      ]);

      // Process students per grade
      const gradeCounts: Record<string, number> = {};
      students.forEach(student => {
        gradeCounts[student.grade] = (gradeCounts[student.grade] || 0) + 1;
      });
      setStudentsPerGradeData(
        Object.entries(gradeCounts).map(([grade, count], index) => ({
          grade,
          count,
          fill: chartColors[index % chartColors.length],
        }))
      );
      
      // Process grade count by subject
      const storedGrades = localStorage.getItem(GRADES_STORAGE_KEY);
      let allGrades: LegacyGrade[] = [];
      if (storedGrades) {
        try {
          allGrades = JSON.parse(storedGrades);
        } catch (e) {
          console.error("Error parsing grades for dashboard:", e);
        }
      }
      const subjectGradeCounts: Record<string, number> = {};
      allGrades.forEach(grade => {
        subjectGradeCounts[grade.subjectArea] = (subjectGradeCounts[grade.subjectArea] || 0) + 1;
      });
      setGradeCountBySubjectData(
        Object.entries(subjectGradeCounts).map(([subject, count], index) => ({
          subject,
          count,
          fill: chartColors[index % chartColors.length],
        }))
      );
      
      setIsLoadingCharts(false);
    }
  }, [students, studentsLoaded]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Panel Principal de EduAssist</CardTitle>
            <CardDescription className="text-lg">
              Bienvenido {currentUser?.name || 'Usuario'} al sistema de gestión académica.
              Aquí puede acceder a las funciones principales. ({currentUser?.role === 'superuser' ? 'Modo Superusuario' : 'Modo Usuario'})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Utilice la barra de navegación lateral para explorar las diferentes secciones de la aplicación.</p>
          </CardContent>
        </Card>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Resumen Académico</h2>
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
