import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, BarChart3, Users, CheckSquare } from "lucide-react";

const quickAccessItems = [
  { title: "Registrar Asistencia", href: "/attendance", icon: CheckSquare, description: "Marcar la asistencia diaria de los estudiantes." },
  { title: "Ingresar Notas", href: "/grades", icon: BarChart3, description: "Añadir y gestionar calificaciones." },
  { title: "Ver Estudiantes", href: "/students", icon: Users, description: "Consultar y administrar datos de estudiantes." },
  { title: "Chequeo con IA", href: "/anomaly-checker", icon: Activity, description: "Detectar anomalías en datos de estudiantes." },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Panel Principal de EduAssist</CardTitle>
            <CardDescription className="text-lg">
              Bienvenido al sistema de gestión académica. Aquí puede acceder a las funciones principales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Utilice la barra de navegación lateral para explorar las diferentes secciones de la aplicación.</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickAccessItems.map((item) => (
            <Card key={item.title} className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                <item.icon className="w-6 h-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <Link href={item.href} passHref legacyBehavior>
                  <Button className="w-full">Ir a {item.title.split(" ")[0]}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
