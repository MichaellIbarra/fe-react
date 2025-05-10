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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, PlusCircle, Edit, Trash2, Eye, MoreVertical, Search, Building2, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LegacyStudent } from "@/types"; 
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useStudentContext } from "@/contexts/StudentContext";
import { useCampusContext } from "@/contexts/CampusContext";
import Link from "next/link";

const gradeOptions = ["Kinder", "1ro", "2do", "3ro", "4to", "5to"]; 
const sectionOptions = ["A", "B", "C", "D", "E"];

const studentSchema = z.object({
  dni: z.string().min(8, "El DNI debe tener al menos 8 caracteres.").max(15, "El DNI no debe exceder los 15 caracteres."),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres.").max(50),
  grade: z.string().min(1, "El grado es requerido."),
  section: z.string().min(1, "La sección es requerida."),
  level: z.enum(['Inicial', 'Primaria', 'Secundaria'], { required_error: "El nivel es requerido." }),
  shift: z.enum(['Mañana', 'Tarde'], { required_error: "El turno es requerido." }),
  guardianPhoneNumber: z.string().regex(/^\d{7,15}$/, "Número de celular inválido.").optional().or(z.literal('')),
  // campusId: z.string().min(1, "La sede es requerida."), // Will be auto-filled from selectedCampus
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent, isLoaded: studentsLoaded } = useStudentContext();
  const { selectedCampus, isLoadingSelection: campusLoading, campuses } = useCampusContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<LegacyStudent | null>(null); 
  const [viewingStudent, setViewingStudent] = useState<LegacyStudent | null>(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      dni: "",
      firstName: "",
      lastName: "",
      grade: "",
      section: "",
      level: undefined,
      shift: undefined,
      guardianPhoneNumber: "",
    },
  });

  useEffect(() => {
    if (isModalOpen) { 
      if (editingStudent) {
        form.reset(editingStudent);
      } else if (!viewingStudent) { 
        form.reset({
          dni: "",
          firstName: "",
          lastName: "",
          grade: "",
          section: "",
          level: undefined,
          shift: undefined,
          guardianPhoneNumber: "",
        });
      }
    }
  }, [editingStudent, viewingStudent, form, isModalOpen]);


  const onSubmit = (data: StudentFormData) => {
    if (!selectedCampus) {
        toast({ variant: "destructive", title: "Error", description: "No hay una sede seleccionada." });
        return;
    }
    // TODO: When students have campusId, ensure it's set:
    // const studentDataWithCampus = { ...data, campusId: selectedCampus.id };

    if (editingStudent) {
      updateStudent({ ...editingStudent, ...data }); // Pass `studentDataWithCampus` when ready
      toast({ title: "Estudiante Actualizado", description: "Los datos del estudiante han sido actualizados." });
    } else {
      addStudent(data as Omit<LegacyStudent, 'id'>); // Pass `studentDataWithCampus` when ready
      toast({ title: "Estudiante Agregado", description: "El nuevo estudiante ha sido agregado." });
    }
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    toast({ title: "Estudiante Eliminado", description: "El estudiante ha sido eliminado.", variant: "destructive" });
  };

  const openEditModal = (student: LegacyStudent) => { 
    setEditingStudent(student);
    setViewingStudent(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setViewingStudent(null);
    setIsModalOpen(true);
  };
  
  const openViewModal = (student: LegacyStudent) => { 
    setViewingStudent(student);
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  // TODO: Filter students by selectedCampus.id once student data includes campusId
  const filteredStudents = students.filter(student =>
    // (student.campusId === selectedCampus?.id) && // Uncomment when campusId is available
    (`${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.dni.includes(searchTerm))
  );

  if (campusLoading || !studentsLoaded) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-2">Cargando datos de estudiantes...</p>
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
              Por favor, seleccione una sede desde el <Link href="/dashboard" className="text-primary hover:underline">Dashboard</Link> para gestionar estudiantes.
            </CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Users className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Gestión de Estudiantes</CardTitle>
              <CardDescription>
                Administre la información de los estudiantes de la sede: {selectedCampus.name}.
              </CardDescription>
            </div>
          </div>
          <Button onClick={openAddModal}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Estudiante
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DNI</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Sección</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.dni}</TableCell>
                      <TableCell>{student.firstName} {student.lastName}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell>{student.level}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewModal(student)}>
                              <Eye className="mr-2 h-4 w-4" /> Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(student)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(student.id)} className="text-destructive-foreground bg-destructive hover:bg-destructive/90 focus:bg-destructive/90">
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-card/50">
              <Users className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mt-4">
                {searchTerm ? "No se encontraron estudiantes con ese criterio." : "No hay estudiantes registrados en esta sede."}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Agregue un nuevo estudiante para comenzar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) {
            setEditingStudent(null);
            setViewingStudent(null);
            form.reset(); 
          }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingStudent ? "Detalles del Estudiante" : editingStudent ? "Editar Estudiante" : "Agregar Estudiante"}</DialogTitle>
            {viewingStudent ? (
              <DialogDescription>
                Información detallada del estudiante {viewingStudent.firstName} {viewingStudent.lastName}.
              </DialogDescription>
            ) : (
              <DialogDescription>
                {editingStudent ? "Modifique los datos del estudiante." : `Complete los datos del nuevo estudiante para la sede ${selectedCampus?.name}.`}
              </DialogDescription>
            )}
          </DialogHeader>
          {viewingStudent ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div><Label>DNI:</Label><p className="text-sm">{viewingStudent.dni}</p></div>
                <div><Label>Nombres:</Label><p className="text-sm">{viewingStudent.firstName}</p></div>
                <div><Label>Apellidos:</Label><p className="text-sm">{viewingStudent.lastName}</p></div>
                <div><Label>Grado:</Label><p className="text-sm">{viewingStudent.grade}</p></div>
                <div><Label>Sección:</Label><p className="text-sm">{viewingStudent.section}</p></div>
                <div><Label>Nivel:</Label><p className="text-sm">{viewingStudent.level}</p></div>
                <div><Label>Turno:</Label><p className="text-sm">{viewingStudent.shift}</p></div>
                <div><Label>Celular Apoderado:</Label><p className="text-sm">{viewingStudent.guardianPhoneNumber || "No registrado"}</p></div>
              </div>
               <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dni">DNI</Label>
                  <Input id="dni" {...form.register("dni")} className={cn(form.formState.errors.dni && "border-destructive")} />
                  {form.formState.errors.dni && <p className="text-destructive text-sm mt-1">{form.formState.errors.dni.message}</p>}
                </div>
                <div>
                  <Label htmlFor="firstName">Nombres</Label>
                  <Input id="firstName" {...form.register("firstName")} className={cn(form.formState.errors.firstName && "border-destructive")} />
                  {form.formState.errors.firstName && <p className="text-destructive text-sm mt-1">{form.formState.errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input id="lastName" {...form.register("lastName")} className={cn(form.formState.errors.lastName && "border-destructive")} />
                  {form.formState.errors.lastName && <p className="text-destructive text-sm mt-1">{form.formState.errors.lastName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="grade">Grado</Label>
                  <Controller
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <SelectTrigger id="grade" className={cn(form.formState.errors.grade && "border-destructive")}>
                          <SelectValue placeholder="Seleccione grado" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.grade && <p className="text-destructive text-sm mt-1">{form.formState.errors.grade.message}</p>}
                </div>
                <div>
                  <Label htmlFor="section">Sección</Label>
                  <Controller
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                       <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <SelectTrigger id="section" className={cn(form.formState.errors.section && "border-destructive")}>
                          <SelectValue placeholder="Seleccione sección" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.section && <p className="text-destructive text-sm mt-1">{form.formState.errors.section.message}</p>}
                </div>
                <div>
                  <Label htmlFor="level">Nivel Educativo</Label>
                  <Controller
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <SelectTrigger className={cn(form.formState.errors.level && "border-destructive")}>
                          <SelectValue placeholder="Seleccione nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inicial">Inicial</SelectItem>
                          <SelectItem value="Primaria">Primaria</SelectItem>
                          <SelectItem value="Secundaria">Secundaria</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.level && <p className="text-destructive text-sm mt-1">{form.formState.errors.level.message}</p>}
                </div>
                <div>
                  <Label htmlFor="shift">Turno</Label>
                  <Controller
                    control={form.control}
                    name="shift"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <SelectTrigger className={cn(form.formState.errors.shift && "border-destructive")}>
                          <SelectValue placeholder="Seleccione turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mañana">Mañana</SelectItem>
                          <SelectItem value="Tarde">Tarde</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.shift && <p className="text-destructive text-sm mt-1">{form.formState.errors.shift.message}</p>}
                </div>
                <div>
                  <Label htmlFor="guardianPhoneNumber">Celular del Apoderado (Opcional)</Label>
                  <Input id="guardianPhoneNumber" {...form.register("guardianPhoneNumber")} className={cn(form.formState.errors.guardianPhoneNumber && "border-destructive")} />
                  {form.formState.errors.guardianPhoneNumber && <p className="text-destructive text-sm mt-1">{form.formState.errors.guardianPhoneNumber.message}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingStudent ? "Guardar Cambios" : "Agregar Estudiante"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
