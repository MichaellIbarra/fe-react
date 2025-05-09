
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { GraduationCap, PlusCircle, Edit, Trash2, BookOpen, Users } from "lucide-react";
import type { LegacyStudent, LegacyGrade } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useStudentContext } from "@/contexts/StudentContext";

const mockSubjects: string[] = ["Matemáticas", "Comunicación", "Ciencias", "Personal Social", "Arte"];
const mockPeriods: string[] = ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4"];

const gradeSchema = z.object({
  studentId: z.string().min(1, "Debe seleccionar un estudiante."),
  subjectArea: z.string().min(1, "Debe seleccionar una materia."),
  gradeValue: z.string().min(1, "La nota es requerida.").max(10, "La nota es muy larga."),
  period: z.string().min(1, "Debe seleccionar un periodo."),
});

type GradeFormData = z.infer<typeof gradeSchema>;

const GRADES_STORAGE_KEY = "eduassist_grades";

export default function GradesPage() {
  const { students, getStudentById, isLoaded: studentsLoaded } = useStudentContext();
  const [grades, setGrades] = useState<LegacyGrade[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<LegacyGrade | null>(null);
  const { toast } = useToast();
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);

  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      studentId: "",
      subjectArea: "",
      gradeValue: "",
      period: "",
    },
  });

  // Load grades from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedGrades = localStorage.getItem(GRADES_STORAGE_KEY);
      if (storedGrades) {
        try {
          setGrades(JSON.parse(storedGrades));
        } catch (error) {
          console.error("Error parsing grades from localStorage:", error);
          setGrades([]); // Fallback to empty array if parsing fails
        }
      }
      setIsLoadingGrades(false);
    }
  }, []);

  // Save grades to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoadingGrades) {
      localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(grades));
    }
  }, [grades, isLoadingGrades]);


 useEffect(() => {
    if (isModalOpen) {
      if (editingGrade) {
        form.reset({
          studentId: editingGrade.studentId,
          subjectArea: editingGrade.subjectArea,
          gradeValue: String(editingGrade.gradeValue),
          period: editingGrade.period,
        });
      } else {
         form.reset({
          studentId: selectedStudentId || "",
          subjectArea: "",
          gradeValue: "",
          period: "",
        });
      }
    }
  }, [isModalOpen, editingGrade, form, selectedStudentId]);


  const onSubmit = (data: GradeFormData) => {
    const newGrade: LegacyGrade = {
      ...data,
      id: editingGrade ? editingGrade.id : String(Date.now()),
      dateAssigned: new Date().toISOString(),
    };

    if (editingGrade) {
      setGrades(grades.map(g => g.id === editingGrade.id ? newGrade : g));
      toast({ title: "Nota Actualizada", description: "La nota ha sido actualizada correctamente." });
    } else {
      setGrades([...grades, newGrade]);
      toast({ title: "Nota Agregada", description: "La nueva nota ha sido registrada." });
    }
    setIsModalOpen(false);
    setEditingGrade(null);
  };

  const handleDeleteGrade = (gradeId: string) => {
    setGrades(grades.filter(g => g.id !== gradeId));
    toast({ title: "Nota Eliminada", description: "La nota ha sido eliminada.", variant: "destructive" });
  };

  const openEditModal = (grade: LegacyGrade) => {
    setEditingGrade(grade);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingGrade(null);
    setIsModalOpen(true);
  };

  const filteredGrades = selectedStudentId ? grades.filter(g => g.studentId === selectedStudentId) : [];
  const selectedStudentDetails = selectedStudentId ? getStudentById(selectedStudentId) : null;
  const selectedStudentName = selectedStudentDetails ? `${selectedStudentDetails.firstName} ${selectedStudentDetails.lastName}` : 'el estudiante';


  if (!studentsLoaded || isLoadingGrades) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <GraduationCap className="h-16 w-16 animate-spin text-primary" />
           <p className="ml-4 text-lg text-muted-foreground">Cargando datos de notas...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <GraduationCap className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Registro Auxiliar de Notas</CardTitle>
              <CardDescription>
                Gestione las calificaciones de los estudiantes.
              </CardDescription>
            </div>
          </div>
           <Button onClick={openAddModal} disabled={!selectedStudentId}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Nota
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="student-select">Seleccionar Estudiante</Label>
            <Select value={selectedStudentId || ""} onValueChange={setSelectedStudentId}>
              <SelectTrigger id="student-select">
                <SelectValue placeholder="Seleccione un estudiante..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudentId ? (
            filteredGrades.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Materia</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>{grade.subjectArea}</TableCell>
                        <TableCell>{grade.gradeValue}</TableCell>
                        <TableCell>{grade.period}</TableCell>
                        <TableCell>{format(new Date(grade.dateAssigned), "dd/MM/yyyy", { locale: es })}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => openEditModal(grade)} className="mr-2" title="Editar Nota">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteGrade(grade.id)} className="text-destructive hover:text-destructive" title="Eliminar Nota">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mt-4">No hay notas registradas para este estudiante.</p>
                <p className="text-sm text-muted-foreground mt-2">Agregue una nueva nota para comenzar.</p>
              </div>
            )
          ) : (
             <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50">
                <Users className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mt-4">Seleccione un estudiante</p>
                <p className="text-sm text-muted-foreground mt-2">Elija un estudiante de la lista para ver o agregar notas.</p>
              </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) setEditingGrade(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGrade ? "Editar Nota" : "Agregar Nota"}</DialogTitle>
            <DialogDescription>
              {editingGrade ? "Modifique los detalles de la nota." : `Complete los detalles de la nueva nota para ${selectedStudentName}.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
             <Controller
                name="studentId"
                control={form.control}
                defaultValue={selectedStudentId || ""}
                render={({ field }) => <input type="hidden" {...field} />}
             />

            <div>
              <Label htmlFor="subjectArea">Materia</Label>
               <Controller
                control={form.control}
                name="subjectArea"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <SelectTrigger id="subjectArea" className={cn(form.formState.errors.subjectArea && "border-destructive")}>
                      <SelectValue placeholder="Seleccione materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSubjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.subjectArea && <p className="text-destructive text-sm mt-1">{form.formState.errors.subjectArea.message}</p>}
            </div>
            <div>
              <Label htmlFor="gradeValue">Nota</Label>
              <Input id="gradeValue" {...form.register("gradeValue")} className={cn(form.formState.errors.gradeValue && "border-destructive")} />
              {form.formState.errors.gradeValue && <p className="text-destructive text-sm mt-1">{form.formState.errors.gradeValue.message}</p>}
            </div>
            <div>
              <Label htmlFor="period">Periodo</Label>
              <Controller
                control={form.control}
                name="period"
                render={({ field }) => (
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <SelectTrigger id="period" className={cn(form.formState.errors.period && "border-destructive")}>
                      <SelectValue placeholder="Seleccione periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPeriods.map(period => (
                        <SelectItem key={period} value={period}>{period}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.period && <p className="text-destructive text-sm mt-1">{form.formState.errors.period.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingGrade ? "Guardar Cambios" : "Agregar Nota"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

