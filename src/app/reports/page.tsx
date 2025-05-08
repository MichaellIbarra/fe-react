// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, UserCircle, BarChart2, ClipboardList, AlertCircle, Printer } from "lucide-react";
import type { Student, ProgressReport, Grade, AttendanceRecord } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Mock data - In a real app, this would come from a backend or global state
const mockStudents: Pick<Student, "id" | "firstName" | "lastName" | "grade" | "section" | "level">[] = [
  { id: "1", firstName: "Ana", lastName: "García", grade: "5to", section: "A", level: "Primaria" },
  { id: "2", firstName: "Luis", lastName: "Martínez", grade: "3ro", section: "B", level: "Secundaria" },
  { id: "3", firstName: "Sofía", lastName: "Rodríguez", grade: "Kinder", section: "C", level: "Inicial" },
];

const mockGrades: Grade[] = [
  { id: "g1", studentId: "1", subjectArea: "Matemáticas", gradeValue: "A", period: "Bimestre 1", dateAssigned: new Date().toISOString() },
  { id: "g2", studentId: "1", subjectArea: "Comunicación", gradeValue: "AD", period: "Bimestre 1", dateAssigned: new Date().toISOString() },
  { id: "g3", studentId: "2", subjectArea: "Ciencias", gradeValue: "15", period: "Bimestre 1", dateAssigned: new Date().toISOString() },
];

const mockAttendance: AttendanceRecord[] = [
  { id: "a1", studentId: "1", date: new Date().toISOString(), status: "Presente" },
  { id: "a2", studentId: "1", date: new Date(Date.now() - 86400000).toISOString(), status: "Ausente" }, // Yesterday
  { id: "a3", studentId: "2", date: new Date().toISOString(), status: "Tardanza" },
];


function generateMockReport(studentId: string, period: string): ProgressReport | null {
  const student = mockStudents.find(s => s.id === studentId);
  if (!student) return null;

  const studentGrades = mockGrades.filter(g => g.studentId === studentId && g.period === period);
  const studentAttendance = mockAttendance.filter(a => a.studentId === studentId); // For simplicity, use all attendance

  const presentDays = studentAttendance.filter(a => a.status === 'Presente').length;
  const absentDays = studentAttendance.filter(a => a.status === 'Ausente').length;
  const lateDays = studentAttendance.filter(a => a.status === 'Tardanza').length;

  return {
    id: `report-${studentId}-${period.replace(" ", "-")}`,
    studentId: studentId,
    period: period,
    summary: `Informe de progreso para ${student.firstName} ${student.lastName} durante el ${period}. En general, ${student.firstName} ha demostrado un progreso ${studentGrades.length > 1 && (studentGrades[0].gradeValue === "AD" || Number(studentGrades[0].gradeValue) > 15) ? "sobresaliente" : "adecuado"} en sus asignaturas. Se recomienda seguir fomentando la participación activa en clase.`,
    gradesBySubject: studentGrades.map(g => ({ subject: g.subjectArea, grade: g.gradeValue, comments: "Buen desempeño." })),
    behavioralObservations: "Muestra una actitud positiva y colaboradora en el aula. A veces se distrae durante las explicaciones, pero responde bien a los recordatorios.",
    futRequests: [
      { date: new Date(Date.now() - 86400000 * 5).toISOString(), reason: "Solicitud de constancia de estudios.", status: "Atendido" },
    ],
    attendanceSummary: {
      totalDays: studentAttendance.length, // Simplified
      present: presentDays,
      absent: absentDays,
      late: lateDays,
    }
  };
}

const mockPeriods: string[] = ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4"];

export default function ReportsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(mockPeriods[0]);
  const [reportData, setReportData] = useState<ProgressReport | null>(null);
  const { toast } = useToast();

  const handleGenerateReport = () => {
    if (!selectedStudentId || !selectedPeriod) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, seleccione un estudiante y un periodo.",
      });
      return;
    }
    const generatedReport = generateMockReport(selectedStudentId, selectedPeriod);
    setReportData(generatedReport);
    if (generatedReport) {
      toast({
        title: "Informe Generado",
        description: `Se ha generado el informe para el estudiante seleccionado.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el informe para el estudiante seleccionado.",
      });
    }
  };

  const studentDetails = selectedStudentId ? mockStudents.find(s => s.id === selectedStudentId) : null;

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
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="student-select" className="block text-sm font-medium text-foreground mb-1">Estudiante</label>
              <Select value={selectedStudentId || ""} onValueChange={setSelectedStudentId}>
                <SelectTrigger id="student-select">
                  <SelectValue placeholder="Seleccione estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {mockStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="period-select" className="block text-sm font-medium text-foreground mb-1">Periodo</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger id="period-select">
                  <SelectValue placeholder="Seleccione periodo" />
                </SelectTrigger>
                <SelectContent>
                  {mockPeriods.map(period => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:self-end">
              <Button onClick={handleGenerateReport} className="w-full" disabled={!selectedStudentId || !selectedPeriod}>
                Generar Informe
              </Button>
            </div>
          </div>

          {reportData && studentDetails ? (
            <Card className="mt-6 border-primary shadow-md">
              <CardHeader className="bg-primary/10">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl text-primary">Informe de Progreso - {reportData.period}</CardTitle>
                        <CardDescription>Estudiante: {studentDetails.firstName} {studentDetails.lastName} - {studentDetails.grade} &quot;{studentDetails.section}&quot; ({studentDetails.level})</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4"/> Imprimir
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-2 flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary" /> Resumen General</h3>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">{reportData.summary}</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2 flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-primary" /> Calificaciones por Área</h3>
                  {reportData.gradesBySubject.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Área/Asignatura</TableHead>
                          <TableHead>Calificación</TableHead>
                          <TableHead>Comentarios</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.gradesBySubject.map((gradeItem, index) => (
                          <TableRow key={index}>
                            <TableCell>{gradeItem.subject}</TableCell>
                            <TableCell className="font-medium">{gradeItem.grade}</TableCell>
                            <TableCell className="text-xs italic">{gradeItem.comments}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                     <p className="text-sm text-muted-foreground">No hay calificaciones registradas para este periodo.</p>
                  )}
                </section>
                
                {reportData.attendanceSummary && (
                <section>
                  <h3 className="text-lg font-semibold mb-2 flex items-center"><CalendarCheck className="mr-2 h-5 w-5 text-primary" /> Resumen de Asistencia</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-muted/30 p-3 rounded-md"><strong>Total Días (Ref.):</strong> {reportData.attendanceSummary.totalDays}</div>
                    <div className="bg-accent/10 p-3 rounded-md"><strong>Presente:</strong> {reportData.attendanceSummary.present}</div>
                    <div className="bg-destructive/10 p-3 rounded-md"><strong>Ausente:</strong> {reportData.attendanceSummary.absent}</div>
                    <div className="bg-yellow-400/10 p-3 rounded-md"><strong>Tardanzas:</strong> {reportData.attendanceSummary.late}</div>
                  </div>
                </section>
                )}

                <section>
                  <h3 className="text-lg font-semibold mb-2 flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" /> Observaciones Conductuales</h3>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">{reportData.behavioralObservations || "Sin observaciones conductuales registradas."}</p>
                </section>

                {reportData.futRequests && reportData.futRequests.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" /> Solicitudes (FUT)</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Motivo</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.futRequests.map((fut, index) => (
                          <TableRow key={index}>
                            <TableCell>{format(new Date(fut.date), "dd/MM/yyyy", { locale: es })}</TableCell>
                            <TableCell>{fut.reason}</TableCell>
                            <TableCell>{fut.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                Generado el: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
              </CardFooter>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50">
              <AlertCircle className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mt-4">
                {selectedStudentId && selectedPeriod ? "No se encontró información para generar el informe." : "Seleccione un estudiante y un periodo para generar el informe."}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Asegúrese de que haya datos de calificaciones y asistencia registrados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
