import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function GradesPage() {
  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <GraduationCap className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-2xl font-bold">Registro Auxiliar de Notas</CardTitle>
            <CardDescription>
              Gestione las calificaciones de los estudiantes en el área piloto.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50">
            <p className="text-muted-foreground text-lg">Funcionalidad de Notas en desarrollo.</p>
            <p className="text-sm text-muted-foreground mt-2">Próximamente podrá registrar y consultar notas.</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
