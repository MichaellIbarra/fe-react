// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, PlusCircle, Edit, Trash2, Eye, MoreVertical, Search, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LegacyCampus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCampusContext } from "@/contexts/CampusContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const campusSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres.").max(50),
  address: z.string().max(200).optional().or(z.literal('')),
  contactPerson: z.string().max(100).optional().or(z.literal('')),
  contactEmail: z.string().email("Correo electrónico inválido.").max(100).optional().or(z.literal('')),
  contactPhone: z.string().regex(/^\d{7,15}$/, "Número de celular inválido.").optional().or(z.literal('')),
});

type CampusFormData = z.infer<typeof campusSchema>;

export default function CampusesPage() {
  const { campuses, addCampus, updateCampus, deleteCampus, isLoaded: campusesLoaded } = useCampusContext();
  const { currentUser, isAuthLoading } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<LegacyCampus | null>(null);
  const [viewingCampus, setViewingCampus] = useState<LegacyCampus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<CampusFormData>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

   useEffect(() => {
    if (!isAuthLoading && currentUser && currentUser.role !== 'superuser') {
      toast({
        variant: "destructive",
        title: "Acceso Denegado",
        description: "No tiene permisos para acceder a esta página.",
      });
      router.push('/dashboard');
    }
  }, [currentUser, isAuthLoading, router, toast]);

  useEffect(() => {
    if (isModalOpen) {
      if (editingCampus) {
        form.reset({
            name: editingCampus.name,
            code: editingCampus.code,
            address: editingCampus.address || "",
            contactPerson: editingCampus.contactPerson || "",
            contactEmail: editingCampus.contactEmail || "",
            contactPhone: editingCampus.contactPhone || "",
        });
      } else if (!viewingCampus) {
        form.reset({
          name: "",
          code: "",
          address: "",
          contactPerson: "",
          contactEmail: "",
          contactPhone: "",
        });
      }
    }
  }, [editingCampus, viewingCampus, form, isModalOpen]);

  const onSubmit = (data: CampusFormData) => {
    if (editingCampus) {
      updateCampus({ ...editingCampus, ...data });
      toast({ title: "Sede Actualizada", description: "Los datos de la sede han sido actualizados." });
    } else {
      addCampus(data);
      toast({ title: "Sede Agregada", description: "La nueva sede ha sido agregada." });
    }
    setIsModalOpen(false);
    setEditingCampus(null);
  };

  const handleDelete = (id: string) => {
    deleteCampus(id);
    toast({ title: "Sede Eliminada", description: "La sede ha sido eliminada.", variant: "destructive" });
  };

  const openEditModal = (campus: LegacyCampus) => {
    setEditingCampus(campus);
    setViewingCampus(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCampus(null);
    setViewingCampus(null);
    setIsModalOpen(true);
  };

  const openViewModal = (campus: LegacyCampus) => {
    setViewingCampus(campus);
    setEditingCampus(null);
    setIsModalOpen(true);
  };

  const filteredCampuses = campuses.filter(campus =>
    (campus?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (campus?.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  if (isAuthLoading || !currentUser || !campusesLoaded) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
           <p className="ml-4 text-lg text-muted-foreground">Cargando datos de sedes...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (currentUser.role !== 'superuser') {
    // This should ideally be caught by useEffect redirect, but as a fallback:
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No tiene los permisos necesarios para ver esta página.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Building2 className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Gestión de Sedes</CardTitle>
              <CardDescription>
                Administre las sedes de la institución (Función de Superusuario).
              </CardDescription>
            </div>
          </div>
          <Button onClick={openAddModal}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Sede
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredCampuses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampuses.map((campus) => (
                    <TableRow key={campus.id}>
                      <TableCell>{campus.name}</TableCell>
                      <TableCell>{campus.code}</TableCell>
                      <TableCell>{campus.address || "N/A"}</TableCell>
                      <TableCell>{campus.contactPerson || "N/A"} ({campus.contactPhone || "N/A"})</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewModal(campus)}>
                              <Eye className="mr-2 h-4 w-4" /> Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(campus)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(campus.id)} className="text-destructive-foreground bg-destructive hover:bg-destructive/90 focus:bg-destructive/90">
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
              <Building2 className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground text-lg mt-4">No se encontraron sedes.</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm ? "Intente con otros términos de búsqueda o " : ""}
                Agregue una nueva sede para comenzar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) {
            setEditingCampus(null);
            setViewingCampus(null);
            form.reset();
          }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingCampus ? "Detalles de la Sede" : editingCampus ? "Editar Sede" : "Agregar Sede"}</DialogTitle>
            {viewingCampus ? (
              <DialogDescription>
                Información detallada de la sede {viewingCampus.name}.
              </DialogDescription>
            ) : (
              <DialogDescription>
                {editingCampus ? "Modifique los datos de la sede." : "Complete los datos de la nueva sede."}
              </DialogDescription>
            )}
          </DialogHeader>
          {viewingCampus ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div><Label>Nombre:</Label><p className="text-sm">{viewingCampus.name}</p></div>
                <div><Label>Código:</Label><p className="text-sm">{viewingCampus.code}</p></div>
                <div><Label>Dirección:</Label><p className="text-sm">{viewingCampus.address || "N/A"}</p></div>
                <div><Label>Persona de Contacto:</Label><p className="text-sm">{viewingCampus.contactPerson || "N/A"}</p></div>
                <div><Label>Email de Contacto:</Label><p className="text-sm">{viewingCampus.contactEmail || "N/A"}</p></div>
                <div><Label>Teléfono de Contacto:</Label><p className="text-sm">{viewingCampus.contactPhone || "N/A"}</p></div>
                <div><Label>Estado:</Label><p className="text-sm">{viewingCampus.status === 'A' ? 'Activa' : 'Inactiva'}</p></div>
                <div><Label>Creada:</Label><p className="text-sm">{new Date(viewingCampus.createdAt).toLocaleDateString()}</p></div>
                <div><Label>Actualizada:</Label><p className="text-sm">{new Date(viewingCampus.updatedAt).toLocaleDateString()}</p></div>
              </div>
               <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Sede</Label>
                  <Input id="name" {...form.register("name")} className={cn(form.formState.errors.name && "border-destructive")} />
                  {form.formState.errors.name && <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="code">Código de la Sede</Label>
                  <Input id="code" {...form.register("code")} className={cn(form.formState.errors.code && "border-destructive")} />
                  {form.formState.errors.code && <p className="text-destructive text-sm mt-1">{form.formState.errors.code.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" {...form.register("address")} className={cn(form.formState.errors.address && "border-destructive")} />
                  {form.formState.errors.address && <p className="text-destructive text-sm mt-1">{form.formState.errors.address.message}</p>}
                </div>
                <div>
                  <Label htmlFor="contactPerson">Persona de Contacto</Label>
                  <Input id="contactPerson" {...form.register("contactPerson")} className={cn(form.formState.errors.contactPerson && "border-destructive")} />
                  {form.formState.errors.contactPerson && <p className="text-destructive text-sm mt-1">{form.formState.errors.contactPerson.message}</p>}
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email de Contacto</Label>
                  <Input id="contactEmail" type="email" {...form.register("contactEmail")} className={cn(form.formState.errors.contactEmail && "border-destructive")} />
                  {form.formState.errors.contactEmail && <p className="text-destructive text-sm mt-1">{form.formState.errors.contactEmail.message}</p>}
                </div>
                <div>
                  <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                  <Input id="contactPhone" {...form.register("contactPhone")} className={cn(form.formState.errors.contactPhone && "border-destructive")} />
                  {form.formState.errors.contactPhone && <p className="text-destructive text-sm mt-1">{form.formState.errors.contactPhone.message}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingCampus ? "Guardar Cambios" : "Agregar Sede"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
