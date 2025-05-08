import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function StudentsPage() {
  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Users className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-2xl font-bold">Gestión de Estudiantes</CardTitle>
            <CardDescription>
              Administre la información de los estudiantes y personal auxiliar.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50">
            <p className="text-muted-foreground text-lg">Funcionalidad de Estudiantes en desarrollo.</p>
            <p className="text-sm text-muted-foreground mt-2">Próximamente podrá gestionar datos de estudiantes.</p>
          </div>
           <div className="mt-6 p-4 border rounded-lg bg-secondary/30">
            <h3 className="text-lg font-semibold mb-2 text-secondary-foreground">Datos Requeridos (Ejemplo):</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>DNI del estudiante</li>
              <li>Nombres del estudiante</li>
              <li>Grado y Sección (Inicial / Primaria / Secundaria)</li>
              <li>Turno de cada sección</li>
              <li>Celular del apoderado</li>
              <li>Nombres de auxiliares de secundaria</li>
              <li>Celular de cada auxiliar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
