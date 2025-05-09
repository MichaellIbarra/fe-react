
"use client"; 

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, BarChart3, Users, CheckSquare, MessageSquare } from "lucide-react"; // Added MessageSquare
import { useAuth } from "@/contexts/AuthContext"; 
import type { LegacyUserRole } from "@/types";

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
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
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
        
        <QuickAccessItems />
      </div>
    </DashboardLayout>
  );
}

