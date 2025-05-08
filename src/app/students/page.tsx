
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, PlusCircle, Edit, Trash2, Eye, MoreVertical, Search } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Student } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const gradeOptions = ["1ro", "2do", "3ro", "4to", "5to", "Kinder"];
const sectionOptions = ["A", "B", "C", "D", "E"];

const studentSchema = z.object({
  dni: z.string().min(8, "El DNI debe tener al menos 8 caracteres.").max(15, "El DNI no debe exceder los 15 caracteres."),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres.").max(50),
  grade: z.string().min(1, "El grado es requerido."),
  section: z.string().min(1, "La sección es requerida."),
  level: z.enum(['Inicial', 'Primaria', 'Secundaria'], { required_error: "El nivel es requerido." }),
  shift: z.enum(['Mañana', 'Tarde'], { required_error: "El turno es requerido." }),
  guardianPhoneNumber: z.string().regex(/^\d{7,15}$/, "Número de celular inválido."),
});

type StudentFormData = z.infer<typeof studentSchema>;

const initialStudents: Student[] = [
  { id: "1", dni: "12345678", firstName: "Ana", lastName: "García", grade: "5to", section: "A", level: "Primaria", shift: "Mañana", guardianPhoneNumber: "987654321" },
  { id: "2", dni: "87654321", firstName: "Luis", lastName: "Martínez", grade: "3ro", section: "B", level: "Secundaria", shift: "Tarde", guardianPhoneNumber: "912345678" },
  { id: "3", dni: "11223344", firstName: "Sofía", lastName: "Rodríguez", grade: "Kinder", section: "C", level: "Inicial", shift: "Mañana", guardianPhoneNumber: "998877665" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
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
    if (isModalOpen) { // Only reset form when modal opens
      if (editingStudent) {
        form.reset(editingStudent);
      } else {
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
  }, [editingStudent, form, isModalOpen]);


  const onSubmit = (data: StudentFormData) => {
    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...data } : s));
      toast({ title: "Estudiante Actualizado", description: "Los datos del estudiante han sido actualizados." });
    } else {
      setStudents([...students, { ...data, id: String(Date.now()) }]);
      toast({ title: "Estudiante Agregado", description: "El nuevo estudiante ha sido agregado." });
    }
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleDelete = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    toast({ title: "Estudiante Eliminado", description: "El estudiante ha sido eliminado.", variant: "destructive" });
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setViewingStudent(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setViewingStudent(null);
    setIsModalOpen(true);
  };
  
  const openViewModal = (student: Student) => {
    setViewingStudent(student);
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.dni.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Users className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Gestión de Estudiantes</CardTitle>
              <CardDescription>
                Administre la información de los estudiantes.
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
              <p className="text-muted-foreground text-lg mt-4">No se encontraron estudiantes.</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm ? "Intente con otros términos de búsqueda o " : ""}
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
            form.reset(); // Reset form when modal closes
          }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingStudent ? "Detalles del Estudiante" : editingStudent ? "Editar Estudiante" : "Agregar Estudiante"}</DialogTitle>
            {!viewingStudent && <DialogDescription>
              {editingStudent ? "Modifique los datos del estudiante." : "Complete los datos del nuevo estudiante."}
            </DialogDescription>}
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
                <div><Label>Celular Apoderado:</Label><p className="text-sm">{viewingStudent.guardianPhoneNumber}</p></div>
              </div>
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
                  <Label htmlFor="guardianPhoneNumber">Celular del Apoderado</Label>
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
          {viewingStudent && (
             <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

