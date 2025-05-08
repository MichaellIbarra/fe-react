
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarCheck, CalendarIcon, Users, QrCode, ScanLine } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Student, AttendanceRecord } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import QrCodeDisplay from "@/components/QrCodeDisplay"; // New component for displaying QR

const mockStudents: Pick<Student, "id" | "firstName" | "lastName" | "grade" | "section">[] = [
  { id: "1", firstName: "Ana", lastName: "García", grade: "5to", section: "A" },
  { id: "2", firstName: "Luis", lastName: "Martínez", grade: "3ro", section: "B" },
  { id: "3", firstName: "Sofía", lastName: "Rodríguez", grade: "Kinder", section: "C" },
  { id: "4", firstName: "Carlos", lastName: "López", grade: "1ro", section: "A" },
  { id: "5", firstName: "Laura", lastName: "Pérez", grade: "2do", section: "B" },
];

type AttendanceStatus = AttendanceRecord["status"];

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const { toast } = useToast();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Pick<Student, "id" | "firstName" | "lastName"> | null>(null);
  const [qrValue, setQrValue] = useState("");


  useEffect(() => {
    const initialData: Record<string, AttendanceStatus> = {};
    mockStudents.forEach(student => {
      initialData[student.id] = 'Presente'; 
    });
    setAttendanceData(initialData);
  }, [selectedDate]);

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
    console.log("Attendance Data for", format(selectedDate, "PPP", { locale: es }), attendanceData);
    toast({
      title: "Asistencia Guardada",
      description: `Se ha guardado la asistencia para el ${format(selectedDate, "PPP", { locale: es })}.`,
    });
  };

  const handleShowQr = (student: Pick<Student, "id" | "firstName" | "lastName">) => {
    setSelectedStudentForQr(student);
    const qrData = {
      type: "eduassist_student_id",
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`
    };
    setQrValue(JSON.stringify(qrData));
    setIsQrModalOpen(true);
  };

  const getQrScanLink = () => {
    if (selectedDate) {
      return `/attendance/qr-scan?date=${format(selectedDate, 'yyyy-MM-dd')}`;
    }
    return `/attendance/qr-scan?date=${format(new Date(), 'yyyy-MM-dd')}`; // Default to today if no date selected
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
                  className="w-full md:w-[280px] justify-start text-left font-normal"
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
            <Link href={getQrScanLink()} passHref legacyBehavior>
              <Button className="w-full md:w-auto" variant="outline">
                <ScanLine className="mr-2 h-5 w-5" />
                Escanear Códigos QR
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {mockStudents.length > 0 ? (
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
                    {mockStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                        <TableCell>{student.grade} &quot;{student.section}&quot;</TableCell>
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
