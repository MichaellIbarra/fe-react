// @ts-nocheck
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { GraduationCap, PlusCircle, Edit, Trash2, BookOpen, Users, Loader2, Building2, Search, Filter } from "lucide-react";
import type { LegacyStudent, LegacyGrade } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useStudentContext } from "@/contexts/StudentContext";
import { useCampusContext } from "@/contexts/CampusContext";
import Link from "next/link";

const mockSubjects: string[] = ["Matemáticas", "Comunicación", "Ciencias", "Personal Social", "Arte", "Inglés", "Educación Física"];
const mockPeriods: string[] = ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4"];
const gradeOptions = ["Todos", "Kinder", "1ro", "2do", "3ro", "4to", "5to"];
const sectionOptions = ["Todas", "A", "B", "C", "D", "E"];

const gradeSchema = z.object({
  studentId: z.string().min(1, "Debe seleccionar un estudiante."),
  subjectArea: z.string().min(1, "Debe seleccionar una materia."),
  gradeValue: z.string().min(1, "La nota es requerida.").max(10, "La nota es muy larga."), 
  period: z.string().min(1, "Debe seleccionar un periodo."),
});

type GradeFormData = z.infer<typeof gradeSchema>;

const getGradesStorageKey = (campusId?: string) => 
  `eduassist_grades_${campusId ? campusId + '_' : ''}`;


export default function GradesPage() {
  const { students, getStudentById, isLoaded: studentsLoaded } = useStudentContext();
  const { selectedCampus, isLoadingSelection: campusLoading } = useCampusContext();
  const [grades, setGrades] = useState<LegacyGrade[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<LegacyGrade | null>(null);
  const { toast } = useToast();
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [gradeSearchTerm, setGradeSearchTerm] = useState(""); 
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("Todos");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("Todas");

  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      studentId: "",
      subjectArea: "",
      gradeValue: "",
      period: "",
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedCampus && !campusLoading) {
      setIsLoadingGrades(true);
      const storageKey = getGradesStorageKey(selectedCampus.id);
      const storedGrades = localStorage.getItem(storageKey);
      if (storedGrades) {
        try {
          setGrades(JSON.parse(storedGrades));
        } catch (error) {
          console.error("Error parsing grades from localStorage:", error);
          setGrades([]);
        }
      } else {
        setGrades([]); 
      }
      setIsLoadingGrades(false);
    } else if (!selectedCampus && !campusLoading) {
        setGrades([]); 
        setIsLoadingGrades(false);
    }
  }, [selectedCampus, campusLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoadingGrades && selectedCampus) {
      const storageKey = getGradesStorageKey(selectedCampus.id);
      localStorage.setItem(storageKey, JSON.stringify(grades));
    }
  }, [grades, isLoadingGrades, selectedCampus]);


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
     if (!selectedCampus) {
        toast({ variant: "destructive", title: "Error", description: "No hay una sede seleccionada." });
        return;
    }
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

  const availableStudents = useMemo(() => {
    return selectedCampus ? students : [];
  }, [students, selectedCampus]);

  const filteredStudentsForDropdown = useMemo(() => {
    return availableStudents.filter(student =>
        (selectedGradeFilter === "Todos" || student.grade === selectedGradeFilter) &&
        (selectedSectionFilter === "Todas" || student.section === selectedSectionFilter) &&
        (`${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
         (student.dni && student.dni.toLowerCase().includes(studentSearchTerm.toLowerCase())))
    );
  }, [availableStudents, studentSearchTerm, selectedGradeFilter, selectedSectionFilter]);

  useEffect(() => {
    if (selectedStudentId && !filteredStudentsForDropdown.find(s => s.id === selectedStudentId)) {
        setSelectedStudentId(null);
    }
  }, [selectedStudentId, filteredStudentsForDropdown]);


  const filteredGrades = useMemo(() => {
    if (!selectedStudentId) return [];
    return grades.filter(grade =>
      grade.studentId === selectedStudentId &&
      (grade.subjectArea.toLowerCase().includes(gradeSearchTerm.toLowerCase()) ||
       String(grade.gradeValue).toLowerCase().includes(gradeSearchTerm.toLowerCase()) ||
       grade.period.toLowerCase().includes(gradeSearchTerm.toLowerCase()))
    );
  }, [grades, selectedStudentId, gradeSearchTerm]);

  const selectedStudentDetails = selectedStudentId ? getStudentById(selectedStudentId) : null;
  const selectedStudentName = selectedStudentDetails ? `${selectedStudentDetails.firstName} ${selectedStudentDetails.lastName}` : 'el estudiante';


  if (!studentsLoaded || isLoadingGrades || campusLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
           <p className="ml-4 text-lg text-muted-foreground">Cargando datos de notas...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedCampus) {
     return (
      <DashboardLayout>
        <Card className="text-center">
          <CardHeader>
            <Building2 className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle>No hay Sede Seleccionada</CardTitle>
            <CardDescription>
              Por favor, seleccione una sede desde el <Link href="/dashboard" className="text-primary hover:underline">Dashboard</Link> para gestionar las notas.
            </CardDescription>
          </CardHeader>
        </Card>
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
                Sede: {selectedCampus.name}. Gestione las calificaciones de los estudiantes.
              </CardDescription>
            </div>
          </div>
           <Button onClick={openAddModal} disabled={!selectedStudentId}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Nota
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters for Student Selection */}
          <div className="mb-6 p-4 border rounded-md shadow-sm bg-muted/20">
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtrar Estudiantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="student-search-input">Buscar Estudiante (Nombre/DNI)</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="student-search-input"
                    placeholder="Ej: Ana García o 123..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="grade-filter-select">Grado</Label>
                <Select value={selectedGradeFilter} onValueChange={setSelectedGradeFilter}>
                  <SelectTrigger id="grade-filter-select">
                    <SelectValue placeholder="Todos los grados" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="section-filter-select">Sección</Label>
                <Select value={selectedSectionFilter} onValueChange={setSelectedSectionFilter}>
                  <SelectTrigger id="section-filter-select">
                    <SelectValue placeholder="Todas las secciones" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map(section => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Student Selection Dropdown */}
          <div className="mb-6">
            <Label htmlFor="student-select">Seleccionar Estudiante de la Lista Filtrada</Label>
            <Select 
                value={selectedStudentId || ""} 
                onValueChange={(value) => {setSelectedStudentId(value); setGradeSearchTerm("");}} 
                disabled={filteredStudentsForDropdown.length === 0 && availableStudents.length > 0}
            >
              <SelectTrigger id="student-select">
                <SelectValue placeholder={
                    availableStudents.length === 0 ? "No hay estudiantes en esta sede" : 
                    filteredStudentsForDropdown.length === 0 ? "No hay estudiantes con esos filtros" : 
                    "Seleccione un estudiante..."
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredStudentsForDropdown.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.dni}) - {student.grade} &quot;{student.section}&quot;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableStudents.length > 0 && filteredStudentsForDropdown.length === 0 && studentSearchTerm && (
                <p className="text-sm text-muted-foreground mt-1">Ningún estudiante coincide con los filtros aplicados.</p>
            )}
             {availableStudents.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">No hay estudiantes en esta sede. Agregue estudiantes primero.</p>
            )}
          </div>
          
          {/* Grade Table Search (for selected student's grades) */}
          {selectedStudentId && (
            <div className="mb-4">
              <Label htmlFor="grade-search-table">Buscar en Notas del Estudiante (Materia, Nota, Periodo)</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="grade-search-table"
                  type="search"
                  placeholder="Ej: Matemáticas, 15, Bimestre 1..."
                  value={gradeSearchTerm}
                  onChange={(e) => setGradeSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>
          )}

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
                <p className="text-muted-foreground text-lg mt-4">
                  {gradeSearchTerm ? "No se encontraron notas con ese criterio para el estudiante." : `No hay notas registradas para ${selectedStudentName}.`}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {gradeSearchTerm ? "Intente con otros términos." : "Agregue una nueva nota para comenzar."}
                </p>
              </div>
            )
          ) : (
             <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50 mt-6">
                <Users className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mt-4">Seleccione un estudiante</p>
                <p className="text-sm text-muted-foreground mt-2">Utilice los filtros de arriba para encontrar y seleccionar un estudiante.</p>
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
