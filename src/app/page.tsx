import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <School className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold text-primary">EduAssist</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Simplificando la gestión de asistencia y notas.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-center text-foreground">
            Bienvenido a EduAssist, su solución integral para el seguimiento académico.
          </p>
          <Link href="/dashboard" legacyBehavior>
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Acceder al Panel
            </Button>
          </Link>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduAssist. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
