import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <CalendarCheck className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-2xl font-bold">Registro de Asistencia Digital</CardTitle>
            <CardDescription>
              Aquí podrá registrar y consultar la asistencia de los estudiantes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50">
            <p className="text-muted-foreground text-lg">Funcionalidad de Asistencia en desarrollo.</p>
            <p className="text-sm text-muted-foreground mt-2">Próximamente podrá tomar asistencia de forma digital.</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
