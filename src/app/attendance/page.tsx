
// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarCheck, CalendarIcon, Users, QrCode, ScanLine, Camera, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { LegacyStudent, LegacyAttendanceRecord } from "@/types";
import { useToast } from "@/hooks/use-toast";
import QrCodeDisplay from "@/components/QrCodeDisplay";
import QrScanner from "@/components/QrScanner";
import { useStudentContext } from "@/contexts/StudentContext";

type AttendanceStatus = LegacyAttendanceRecord["status"];

const getAttendanceStorageKey = (date: Date) => `eduassist_attendance_${format(date, "yyyy-MM-dd")}`;

interface QrScannerModalContentProps {
  selectedDate: Date;
  onAttendanceRecorded: (studentId: string, studentName: string) => void;
  onClose: () => void;
  getStudentById: (studentId: string) => LegacyStudent | undefined;
}

const QrScannerModalContent: React.FC<QrScannerModalContentProps> = ({ selectedDate, onAttendanceRecorded, onClose, getStudentById }) => {
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const resetScanner = async () => {
    setScanResult(null);
    setError(null);
    setLastScannedData(null);
    setIsScanning(false); 
    setHasCameraPermission(null); // Trigger permission request again
  };

  useEffect(() => {
    let streamInstance: MediaStream | null = null;
    const requestCameraPermission = async () => {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamInstance = stream;
          setHasCameraPermission(true);
          setIsScanning(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          setHasCameraPermission(false);
          setError("No se pudo acceder a la cámara. Por favor, verifique los permisos.");
          console.error("Camera permission error:", err);
          toast({
            variant: "destructive",
            title: "Error de Cámara",
            description: "Por favor, habilite los permisos de cámara en su navegador.",
          });
        }
      } else {
         setHasCameraPermission(false);
         setError("El acceso a multimedia no está disponible en este navegador.");
      }
    };

    if (isQrScannerModalOpen && hasCameraPermission === null) { // Only request if modal is open and permission not determined
        requestCameraPermission();
    }
    
    return () => { 
      if (streamInstance) {
        streamInstance.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [toast, hasCameraPermission, isQrScannerModalOpen]); // Add isQrScannerModalOpen dependency


  const handleScanSuccess = (decodedText: string) => {
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
        const student = getStudentById(qrData.studentId);
        if (student) {
          onAttendanceRecorded(qrData.studentId, qrData.studentName);
          toast({
            title: "Asistencia Registrada por QR",
            description: `${qrData.studentName} marcado(a) como presente para el ${format(selectedDate, "PPP", { locale: es })}.`,
            className: "bg-accent text-accent-foreground",
          });
        } else {
           throw new Error("Estudiante no encontrado en la lista actual.");
        }
      } else {
        throw new Error("Código QR no es válido para identificación de estudiante.");
      }
    } catch (e: any) {
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
  
  if (hasCameraPermission === null && isQrScannerModalOpen) { // Show loader only if modal is open and checking permission
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg">Verificando permisos de cámara...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
       <Alert variant="default">
        <CalendarCheck className="h-4 w-4" />
        <AlertTitle>Fecha de Asistencia</AlertTitle>
        <AlertDescription>
          Registrando asistencia para el: <strong>{format(selectedDate, "PPP", { locale: es })}</strong>.
        </AlertDescription>
      </Alert>

      <video ref={videoRef} className={`w-full aspect-video rounded-md ${!isScanning || !hasCameraPermission ? 'hidden' : ''}`} autoPlay muted playsInline />

      {!hasCameraPermission && ( 
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de Cámara</AlertTitle>
          <AlertDescription>
            {error || "No se pudo acceder a la cámara. Por favor, asegúrese de que la aplicación tiene permisos para usar la cámara en la configuración de su navegador e inténtelo de nuevo."}
            <Button onClick={resetScanner} variant="link" className="p-0 h-auto ml-1 underline">Reintentar</Button>
          </AlertDescription>
        </Alert>
      )}

      {hasCameraPermission && isScanning && (
         <div className="border-2 border-dashed border-primary/50 p-4 rounded-lg bg-primary/5 aspect-video flex items-center justify-center min-h-[300px] overflow-hidden">
          <QrScanner
            onScanSuccess={handleScanSuccess}
            onScanFailure={handleScanFailure}
            qrboxSize={200} 
            fps={5}
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
       {error && !isScanning && !hasCameraPermission && ( 
        <Alert variant="destructive">
          <XCircle className="h-5 w-5" />
          <AlertTitle>Error en Escaneo</AlertTitle>
          <AlertDescription>{error} <Button onClick={resetScanner} variant="link" className="p-0 h-auto ml-1 underline">Reintentar</Button></AlertDescription>
        </Alert>
      )}
       {error && !isScanning && hasCameraPermission && ( 
        <Alert variant="destructive">
          <XCircle className="h-5 w-5" />
          <AlertTitle>Error al Procesar QR</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isScanning && hasCameraPermission && ( 
        <Button onClick={() => { setScanResult(null); setError(null); setLastScannedData(null); setIsScanning(true);}} className="w-full">
          Escanear Otro Código
        </Button>
      )}
       <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cerrar Escáner</Button>
      </DialogFooter>
    </div>
  );
};


export default function AttendancePage() {
  const { students, getStudentById, isLoaded: studentsLoaded } = useStudentContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const { toast } = useToast();
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isQrScannerModalOpen, setIsQrScannerModalOpen] = useState(false);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Pick<LegacyStudent, "id" | "firstName" | "lastName"> | null>(null);
  const [qrValue, setQrValue] = useState("");


  // Load and initialize attendance data
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedDate && studentsLoaded) {
      setIsLoadingAttendance(true);
      const storageKey = getAttendanceStorageKey(selectedDate);
      const storedAttendance = localStorage.getItem(storageKey);
      
      if (storedAttendance) {
        try {
          setAttendanceData(JSON.parse(storedAttendance));
        } catch (error) {
          console.error("Error parsing attendance from localStorage:", error);
          // Initialize if parsing fails
          const initialData: Record<string, AttendanceStatus> = {};
          students.forEach(student => {
            initialData[student.id] = 'Presente';
          });
          setAttendanceData(initialData);
        }
      } else {
        // Initialize if not found in storage
        const initialData: Record<string, AttendanceStatus> = {};
        students.forEach(student => {
          initialData[student.id] = 'Presente';
        });
        setAttendanceData(initialData);
      }
      setIsLoadingAttendance(false);
    }
  }, [selectedDate, students, studentsLoaded]);

  // Save attendance data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedDate && !isLoadingAttendance && Object.keys(attendanceData).length > 0) {
      const storageKey = getAttendanceStorageKey(selectedDate);
      localStorage.setItem(storageKey, JSON.stringify(attendanceData));
    }
  }, [attendanceData, selectedDate, isLoadingAttendance]);


  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prevData => ({
      ...prevData,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, seleccione una fecha.",
      });
      return;
    }
    // Data is already saved by the useEffect hook, this is more for user feedback
    console.log("Attendance Data for", format(selectedDate, "PPP", { locale: es }), attendanceData);
    toast({
      title: "Asistencia Guardada",
      description: `Se ha guardado la asistencia para el ${format(selectedDate, "PPP", { locale: es })}.`,
    });
  };

  const handleShowQr = (student: Pick<LegacyStudent, "id" | "firstName" | "lastName">) => {
    setSelectedStudentForQr(student);
    const qrData = {
      type: "eduassist_student_id",
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`
    };
    setQrValue(JSON.stringify(qrData));
    setIsQrModalOpen(true);
  };
  
  const handleAttendanceRecordedByQr = (studentId: string, studentName: string) => {
    handleStatusChange(studentId, 'Presente');
  };
  
  if (!studentsLoaded || isLoadingAttendance) {
     return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <CalendarCheck className="h-16 w-16 animate-spin text-primary" />
           <p className="ml-4 text-lg text-muted-foreground">Cargando datos de asistencia...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <CalendarCheck className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Registro de Asistencia Digital</CardTitle>
              <CardDescription>
                Seleccione fecha, registre asistencia manual, genere QR o escanee.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full sm:w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={es}
                  disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                />
              </PopoverContent>
            </Popover>
             <Dialog open={isQrScannerModalOpen} onOpenChange={setIsQrScannerModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto" variant="outline" disabled={!selectedDate} onClick={() => setIsQrScannerModalOpen(true)}>
                  <ScanLine className="mr-2 h-5 w-5" />
                  Escanear Asistencia QR
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Escanear Código QR de Asistencia</DialogTitle>
                  <DialogDescription>
                    Apunte la cámara al QR del estudiante para registrar su asistencia.
                  </DialogDescription>
                </DialogHeader>
                {selectedDate && isQrScannerModalOpen && ( 
                  <QrScannerModalContent
                    selectedDate={selectedDate}
                    onAttendanceRecorded={handleAttendanceRecordedByQr}
                    onClose={() => setIsQrScannerModalOpen(false)}
                    getStudentById={getStudentById}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Grado y Sección</TableHead>
                      <TableHead className="w-[200px]">Estado</TableHead>
                      <TableHead className="text-center">Código QR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                        <TableCell>{student.grade} "{student.section}"</TableCell>
                        <TableCell>
                          <Select
                            value={attendanceData[student.id] || 'Presente'}
                            onValueChange={(value: AttendanceStatus) => handleStatusChange(student.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Presente">Presente</SelectItem>
                              <SelectItem value="Ausente">Ausente</SelectItem>
                              <SelectItem value="Tardanza">Tardanza</SelectItem>
                              <SelectItem value="Justificado">Justificado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleShowQr(student)} title="Mostrar Código QR">
                            <QrCode className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveAttendance}>
                  Guardar Asistencia Manual
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50">
              <Users className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mt-4">No hay estudiantes para mostrar.</p>
              <p className="text-sm text-muted-foreground mt-2">Agregue estudiantes en la sección de Gestión de Estudiantes.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudentForQr && (
        <QrCodeDisplay
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          qrValue={qrValue}
          studentName={`${selectedStudentForQr.firstName} ${selectedStudentForQr.lastName}`}
        />
      )}
    </DashboardLayout>
  );
}

