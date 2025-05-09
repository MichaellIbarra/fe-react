
"use client"; 

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, BarChart3, Users, CheckSquare, MessageSquare, Loader2, PieChartIcon, UsersRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; 
import type { LegacyUserRole, LegacyStudent, LegacyAttendanceRecord } from "@/types";
import StudentLevelDistributionChart, { type StudentLevelDataPoint } from "@/components/charts/StudentLevelDistributionChart";
import TodaysAttendanceChart, { type AttendanceDataPoint } from "@/components/charts/TodaysAttendanceChart";
import { useStudentContext } from "@/contexts/StudentContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const getAttendanceStorageKey = (date: Date) => `eduassist_attendance_${format(date, "yyyy-MM-dd")}`;

interface QuickAccessItemData {
  title: string;
  href: string;
  icon: React.ElementType;
  description: string;
  roles?: LegacyUserRole[];
}

const allQuickAccessItems: QuickAccessItemData[] = [
  { title: "Registrar Asistencia", href: "/attendance", icon: CheckSquare, description: "Marcar la asistencia diaria de los estudiantes y escanear QR." },
  { title: "Ingresar Notas", href: "/grades", icon: BarChart3, description: "Añadir y gestionar calificaciones." },
  { title: "Ver Estudiantes", href: "/students", icon: Users, description: "Consultar y administrar datos de estudiantes." },
  { title: "Enviar Notificaciones", href: "/notifications", icon: MessageSquare, description: "Comunicarse con los apoderados." },
  { title: "Informes", href: "/reports", icon: BarChart3, description: "Generar informes de progreso." },
  { title: "Chequeo con IA", href: "/anomaly-checker", icon: Activity, description: "Detectar anomalías en datos de estudiantes.", roles: ['superuser'] },
];

const QuickAccessItems = () => {
  const { currentUser } = useAuth();

  const accessibleItems = allQuickAccessItems.filter(item => {
    if (!item.roles || item.roles.length === 0) {
      return true; 
    }
    return currentUser && item.roles.includes(currentUser.role);
  });

  return (
     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {accessibleItems.map((item) => (
        <Card key={item.title} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
            <item.icon className="w-6 h-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
            <Link href={item.href} passHref legacyBehavior>
              <Button className="w-full mt-auto">Ir a {item.title.split(" ")[0]}</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { students, isLoaded: studentsLoaded } = useStudentContext();
  
  const [studentLevelData, setStudentLevelData] = useState<StudentLevelDataPoint[]>([]);
  const [todaysAttendanceData, setTodaysAttendanceData] = useState<AttendanceDataPoint[]>([]);
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
        { level: "Inicial", count: levelCounts['Inicial'], fill: "hsl(var(--chart-1))" },
        { level: "Primaria", count: levelCounts['Primaria'], fill: "hsl(var(--chart-2))" },
        { level: "Secundaria", count: levelCounts['Secundaria'], fill: "hsl(var(--chart-3))" },
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
        { status: "Presente", count: attendanceStatusCounts['Presente'], fill: "hsl(var(--chart-1))" },
        { status: "Ausente", count: attendanceStatusCounts['Ausente'], fill: "hsl(var(--chart-2))" },
        { status: "Tardanza", count: attendanceStatusCounts['Tardanza'], fill: "hsl(var(--chart-3))" },
        { status: "Justificado", count: attendanceStatusCounts['Justificado'], fill: "hsl(var(--chart-4))" },
      ]);
      
      setIsLoadingCharts(false);
    }
  }, [students, studentsLoaded]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8"> {/* Increased gap for sections */}
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
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Accesos Rápidos</h2>
          <QuickAccessItems />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Resumen Académico</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-2">
                <UsersRound className="w-7 h-7 text-primary" />
                <CardTitle>Distribución de Estudiantes por Nivel</CardTitle>
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
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}
