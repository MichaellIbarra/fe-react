
// @ts-nocheck
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QrScanner from '@/components/QrScanner';
import { useToast } from '@/hooks/use-toast';
import { Camera, CheckCircle, XCircle, Loader2, AlertTriangle, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// No longer need mockStudents or currentStudent here, student info comes from QR

function QrScanContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<Date>(new Date());

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        // Attempt to parse assuming YYYY-MM-DD
        const parsedDate = parseISO(dateParam); 
        // Check if parsedDate is a valid date object
        if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
            setTargetDate(parsedDate);
        } else {
            console.warn("Invalid date parameter:", dateParam, "Using current date.");
            setTargetDate(new Date());
        }
      } catch (e) {
        console.error("Error parsing date parameter:", e);
        setTargetDate(new Date());
      }
    } else {
      setTargetDate(new Date());
    }
  }, [searchParams]);

  useEffect(() => {
    const checkCameraPermission = async () => {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          setHasCameraPermission(false);
          setError("No se pudo acceder a la cámara. Por favor, verifique los permisos.");
          console.error("Camera permission error:", err);
        }
      } else {
        setHasCameraPermission(false);
        setError("El acceso a multimedia no está disponible en este navegador.");
      }
    };
    checkCameraPermission();
  }, []);


  const handleScanSuccess = (decodedText: string, result: any) => {
    if (decodedText === lastScannedData) {
      return;
    }
    setLastScannedData(decodedText);
    setIsScanning(false); 
    setScanResult(decodedText);
    setError(null);

    try {
      const qrData = JSON.parse(decodedText);
      if (qrData.type === "eduassist_student_id" && qrData.studentId && qrData.studentName) {
        // Simulate recording attendance for the identified student for the targetDate
        console.log(`Attendance Recorded: Student ID ${qrData.studentId} (${qrData.studentName}) for date ${format(targetDate, "yyyy-MM-dd")}`);
        
        toast({
          title: "Asistencia Registrada",
          description: `${qrData.studentName} marcado(a) como presente para el ${format(targetDate, "PPP", { locale: es })}.`,
          variant: "default",
          className: "bg-accent text-accent-foreground",
        });
      } else {
        throw new Error("Código QR no es válido para identificación de estudiante.");
      }
    } catch (e) {
      console.error("Error processing QR code:", e);
      setError(e.message || "Error al procesar el código QR.");
      toast({
        title: "Error de QR",
        description: e.message || "El código QR escaneado no es válido o está malformado.",
        variant: "destructive",
      });
    }
  };

  const handleScanFailure = (errorMessage: string) => {
    // console.warn(`QR Scan Failure: ${errorMessage}`);
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(true);
    setLastScannedData(null);
    toast({ title: "Escáner Reiniciado", description: "Listo para escanear un nuevo código." });
  };

  if (hasCameraPermission === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verificando permisos de cámara...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <Camera className="h-10 w-10 text-primary" />
        <div>
          <CardTitle className="text-2xl font-bold">Registro de Asistencia por QR</CardTitle>
          <CardDescription>
            Escanee el código QR del estudiante para marcar su asistencia.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="default">
            <CalendarDays className="h-4 w-4" />
            <AlertTitle>Fecha de Asistencia</AlertTitle>
            <AlertDescription>
                Registrando asistencia para el: <strong>{format(targetDate, "PPPP", { locale: es })}</strong>.
            </AlertDescription>
        </Alert>

        {!hasCameraPermission && (
           <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de Cámara</AlertTitle>
            <AlertDescription>
              No se pudo acceder a la cámara. Por favor, asegúrese de que la aplicación tiene permisos para usar la cámara en la configuración de su navegador e inténtelo de nuevo.
            </AlertDescription>
          </Alert>
        )}

        {hasCameraPermission && isScanning && (
          <div className="border-2 border-dashed border-primary/50 p-4 rounded-lg bg-primary/5 aspect-video flex items-center justify-center">
            <QrScanner
              onScanSuccess={handleScanSuccess}
              onScanFailure={handleScanFailure}
              qrboxSize={280} 
            />
          </div>
        )}

        {scanResult && !isScanning && (
          <Alert className="bg-accent/10 border-accent text-accent-foreground">
            <CheckCircle className="h-5 w-5 text-accent" />
            <AlertTitle>Escaneo Exitoso</AlertTitle>
            <AlertDescription>
              Código QR procesado. Verifique la notificación para más detalles.
              <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-auto max-h-20">{scanResult}</pre>
            </AlertDescription>
          </Alert>
        )}
        {error && !isScanning && (
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Error en Escaneo</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isScanning && (
           <Button onClick={resetScanner} className="w-full">
            Escanear Otro Código
          </Button>
        )}

        <Alert variant="default" className="mt-4">
          <Camera className="h-4 w-4" />
          <AlertTitle>Instrucciones</AlertTitle>
          <AlertDescription>
            Apunte la cámara de su dispositivo al código QR del estudiante. La asistencia se registrará para la fecha indicada arriba.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}


export default function QrScanPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
           <p className="ml-4 text-lg">Cargando escáner...</p>
        </div>
      }>
        <QrScanContent />
      </Suspense>
    </DashboardLayout>
  );
}
