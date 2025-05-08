// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QrScanner from '@/components/QrScanner';
import { useToast } from '@/hooks/use-toast';
import { Camera, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import type { Student, AttendanceRecord } from '@/types';
import { Button } from '@/components/ui/button';

// Mock student data for demonstration
const mockStudents: Pick<Student, "id" | "firstName" | "lastName">[] = [
  { id: "1", firstName: "Ana", lastName: "García" },
  { id: "2", firstName: "Luis", lastName: "Martínez" },
];

// Assume current student is Ana García for this demo
const currentStudent = mockStudents[0];

export default function QrScanPage() {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);

  useEffect(() => {
    const checkCameraPermission = async () => {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Permission granted
          setHasCameraPermission(true);
          // Important: Stop the track to release the camera for the QR scanner library
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          // Permission denied or no camera
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
    // Prevent processing the same QR code multiple times in quick succession
    if (decodedText === lastScannedData) {
      return;
    }
    setLastScannedData(decodedText);
    setIsScanning(false); // Stop continuous scanning display logic
    setScanResult(decodedText);
    setError(null);

    try {
      const qrData = JSON.parse(decodedText);
      if (qrData.type === "eduassist_attendance" && qrData.course && qrData.date) {
        // Simulate recording attendance
        const attendanceEntry: Partial<AttendanceRecord> = {
          studentId: currentStudent.id,
          // For a real app, course might map to subjectArea or a class ID
          // For now, just use the course name from QR
          notes: `Asistencia para ${qrData.course} el ${qrData.date} por ${currentStudent.firstName} ${currentStudent.lastName}`,
          status: 'Presente',
          date: new Date(qrData.date).toISOString(), // Ensure date is valid
        };
        console.log("Attendance Recorded:", attendanceEntry);
        
        toast({
          title: "Asistencia Registrada",
          description: `${currentStudent.firstName} ${currentStudent.lastName} marcado(a) como presente para ${qrData.course} el ${qrData.date}.`,
          variant: "default",
          className: "bg-accent text-accent-foreground",
        });
      } else {
        throw new Error("Código QR no válido para asistencia.");
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
    // Optionally, restart scanning after a delay or user action
    // setTimeout(() => {
    //   setIsScanning(true);
    //   setScanResult(null);
    //   setLastScannedData(null);
    // }, 5000); // Restart after 5 seconds
  };

  const handleScanFailure = (errorMessage: string) => {
    // This might be called frequently if no QR is found, so be cautious with UI updates
    // console.warn(`QR Scan Failure: ${errorMessage}`);
    // setError(errorMessage); // Can be too noisy
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
       <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Verificando permisos de cámara...</p>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Camera className="h-10 w-10 text-primary" />
          <div>
            <CardTitle className="text-2xl font-bold">Registro de Asistencia por QR</CardTitle>
            <CardDescription>
              Escanee el código QR proporcionado para marcar su asistencia.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
                qrboxSize={280} // Adjust size as needed
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
              Apunte la cámara de su dispositivo al código QR. La asistencia se registrará automáticamente.
              Actualmente registrando como: <strong>{currentStudent.firstName} {currentStudent.lastName}</strong>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
