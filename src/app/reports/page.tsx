import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <FileText className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-2xl font-bold">Informes de Progreso</CardTitle>
            <CardDescription>
              Genere y consulte los informes de progreso de los estudiantes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50">
            <p className="text-muted-foreground text-lg">Funcionalidad de Informes en desarrollo.</p>
            <p className="text-sm text-muted-foreground mt-2">Próximamente podrá generar informes detallados.</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
