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
import { Building2, PlusCircle, Edit, Trash2, Eye, MoreVertical, Search, Loader2, Palette, Users, Briefcase, UploadCloud, LockKeyhole, GraduationCap, Image as ImageIcon, UserSquare, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LegacyCampus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCampusContext } from "@/contexts/CampusContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";


const fileSchema = z.preprocess(
    (value) => {
      if (typeof window !== 'undefined' && value instanceof FileList && value.length > 0) {
        return new Promise((resolve, reject) => {
          const file = value[0];
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      }
      if (typeof value === 'string' || value === undefined || value === null || value === '') {
        return value;
      }
      return undefined; 
    },
    z.string().optional().or(z.literal('')) 
);


const campusSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres.").max(50),
  institutionLogo: fileSchema,
  institutionColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Debe ser un color hexadecimal válido (ej: #FF0000).").optional().or(z.literal('')),
  educationalLevelSelection: z.string().optional(), 
  
  directorPhoto: fileSchema,
  directorFirstName: z.string().min(2, "Nombre del director es muy corto.").max(50).optional().or(z.literal('')),
  directorLastName: z.string().min(2, "Apellido del director es muy corto.").max(50).optional().or(z.literal('')),
  directorDocumentNumber: z.string().regex(/^\d{8,15}$/, "N° de documento inválido.").optional().or(z.literal('')),
  directorPhoneNumber: z.string().regex(/^\d{7,15}$/, "Número de celular inválido.").optional().or(z.literal('')),
  directorEmail: z.string().email("Email de director inválido.").optional().or(z.literal('')),
  directorPassword: z.string().min(6, "Contraseña debe tener al menos 6 caracteres.").optional().or(z.literal('')),
});

type CampusFormData = z.infer<typeof campusSchema>;

const educationalLevelOptions = ["Primaria", "Secundaria", "Primaria y Secundaria"];

export default function CampusesPage() {
  const { campuses, addCampus, updateCampus, deleteCampus, isLoaded: campusesLoaded } = useCampusContext();
  const { currentUser, isAuthLoading } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<LegacyCampus | null>(null);
  const [viewingCampus, setViewingCampus] = useState<LegacyCampus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [institutionLogoPreview, setInstitutionLogoPreview] = useState<string | null>(null);
  const [directorPhotoPreview, setDirectorPhotoPreview] = useState<string | null>(null);

  const form = useForm<CampusFormData>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      name: "",
      code: "",
      institutionLogo: "",
      institutionColor: "#3498db",
      educationalLevelSelection: "",
      directorPhoto: "",
      directorFirstName: "",
      directorLastName: "",
      directorDocumentNumber: "",
      directorPhoneNumber: "",
      directorEmail: "",
      directorPassword: "",
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
            institutionLogo: editingCampus.institutionLogo || "",
            institutionColor: editingCampus.institutionColor || "#3498db",
            educationalLevelSelection: editingCampus.educationalLevelSelection || "",
            directorPhoto: editingCampus.directorPhoto || "",
            directorFirstName: editingCampus.directorFirstName || "",
            directorLastName: editingCampus.directorLastName || "",
            directorDocumentNumber: editingCampus.directorDocumentNumber || "",
            directorPhoneNumber: editingCampus.directorPhoneNumber || "",
            directorEmail: editingCampus.directorEmail || "",
            directorPassword: "", 
        });
        setInstitutionLogoPreview(null); 
        setDirectorPhotoPreview(null);   
      } else if (!viewingCampus) { 
        form.reset({ 
          name: "", code: "", institutionLogo: "", institutionColor: "#3498db",
          educationalLevelSelection: "", directorPhoto: "", directorFirstName: "",
          directorLastName: "", directorDocumentNumber: "", directorPhoneNumber: "",
          directorEmail: "", directorPassword: "",
        });
        setInstitutionLogoPreview(null);
        setDirectorPhotoPreview(null);
      }
    } else { // When modal is closed, also clear previews
        setInstitutionLogoPreview(null);
        setDirectorPhotoPreview(null);
    }
  }, [editingCampus, viewingCampus, form, isModalOpen]);

  const onSubmit = async (data: CampusFormData) => {
    const processedData = { ...data };
    
    // If password is empty during edit, don't update it (keep existing password)
    if (editingCampus && !processedData.directorPassword) {
        delete processedData.directorPassword;
    }

    if (editingCampus) {
      updateCampus({ ...editingCampus, ...processedData });
      toast({ title: "Sede Actualizada", description: "Los datos de la sede han sido actualizados." });
    } else {
      addCampus(processedData);
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
              <CardTitle className="text-2xl font-bold">Gestión de Sedes (Instituciones)</CardTitle>
              <CardDescription>
                Administre las sedes/instituciones (Función de Superusuario).
              </CardDescription>
            </div>
          </div>
          <Button onClick={openAddModal}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Añadir Institución
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
                    <TableHead>Niveles</TableHead>
                    <TableHead>Director</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampuses.map((campus) => (
                    <TableRow key={campus.id}>
                      <TableCell>{campus.name}</TableCell>
                      <TableCell>{campus.code}</TableCell>
                      <TableCell>{campus.educationalLevelSelection || "N/A"}</TableCell>
                      <TableCell>{campus.directorFirstName || "N/A"} {campus.directorLastName || ""}</TableCell>
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
              <p className="text-muted-foreground text-lg mt-4">No se encontraron instituciones.</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm ? "Intente con otros términos de búsqueda o " : ""}
                Agregue una nueva institución para comenzar.
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
            setInstitutionLogoPreview(null);
            setDirectorPhotoPreview(null);
          }
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewingCampus ? "Detalles de la Institución" : editingCampus ? "Editar Institución" : "Añadir Institución"}</DialogTitle>
            {viewingCampus ? (
              <DialogDescription>
                Información detallada de la institución {viewingCampus.name}.
              </DialogDescription>
            ) : (
              <DialogDescription>
                {editingCampus ? "Modifique los datos de la institución." : "Complete los datos de la nueva institución."}
              </DialogDescription>
            )}
          </DialogHeader>
          {viewingCampus ? (
            <div className="grid gap-6 py-4">
              <section>
                <h3 className="text-lg font-semibold mb-2 text-primary">Detalles de la Institución</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 border rounded-md">
                  <div><Label>Nombre:</Label><p className="text-sm">{viewingCampus.name}</p></div>
                  <div><Label>Código:</Label><p className="text-sm">{viewingCampus.code}</p></div>
                  <div>
                    <Label>Logo:</Label>
                    {viewingCampus.institutionLogo && typeof viewingCampus.institutionLogo === 'string' && viewingCampus.institutionLogo.startsWith('data:image') ? (
                       <Image src={viewingCampus.institutionLogo} alt="Logo Institucional" width={100} height={100} className="rounded-md border object-contain mt-1" data-ai-hint="institution logo"/>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No asignado</p>
                    )}
                  </div>
                  <div><Label>Color Paleta:</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: viewingCampus.institutionColor || '#ffffff' }}></div>
                      <p className="text-sm">{viewingCampus.institutionColor || "N/A"}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2"><Label>Niveles Educativos:</Label><p className="text-sm">{viewingCampus.educationalLevelSelection || "N/A"}</p></div>
                </div>
              </section>
              <section>
                 <h3 className="text-lg font-semibold mb-2 text-primary">Información del Director</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 border rounded-md">
                    <div>
                      <Label>Foto:</Label>
                      {viewingCampus.directorPhoto && typeof viewingCampus.directorPhoto === 'string' && viewingCampus.directorPhoto.startsWith('data:image') ? (
                        <Image src={viewingCampus.directorPhoto} alt="Foto del Director" width={100} height={100} className="rounded-md border object-contain mt-1" data-ai-hint="director photo"/>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No asignada</p>
                      )}
                    </div>
                    <div><Label>Nombres:</Label><p className="text-sm">{viewingCampus.directorFirstName || "N/A"}</p></div>
                    <div><Label>Apellidos:</Label><p className="text-sm">{viewingCampus.directorLastName || "N/A"}</p></div>
                    <div><Label>N° Documento:</Label><p className="text-sm">{viewingCampus.directorDocumentNumber || "N/A"}</p></div>
                    <div><Label>N° Celular:</Label><p className="text-sm">{viewingCampus.directorPhoneNumber || "N/A"}</p></div>
                    <div><Label>Email:</Label><p className="text-sm">{viewingCampus.directorEmail || "N/A"}</p></div>
                 </div>
              </section>
               <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
              <section className="space-y-4 p-4 border rounded-md shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold text-primary">Datos de la Institución</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <Label htmlFor="institutionLogoFile">Logo Institucional</Label>
                    {(institutionLogoPreview || (form.getValues("institutionLogo") && typeof form.getValues("institutionLogo") === 'string' && (form.getValues("institutionLogo") as string).startsWith('data:image'))) && (
                        <div className="mt-2 mb-2 space-y-1">
                        <Image src={institutionLogoPreview || form.getValues("institutionLogo") as string} alt="Previsualización del logo" width={80} height={80} className="rounded-md border object-contain" data-ai-hint="logo preview"/>
                        <Button type="button" variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive-hover" onClick={() => { form.setValue("institutionLogo", "", { shouldValidate: true }); setInstitutionLogoPreview(null); const el = document.getElementById("institutionLogoFile") as HTMLInputElement; if(el) el.value = ""; }}>
                            <X className="mr-1 h-3 w-3"/> Quitar Logo
                        </Button>
                        </div>
                    )}
                    <Controller name="institutionLogo" control={form.control} render={({ field: { onChange, value, ...restField } }) => ( // value here is what RHF holds
                        <Input id="institutionLogoFile" type="file" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setInstitutionLogoPreview(reader.result as string); onChange(e.target.files); }; reader.readAsDataURL(file); } else { onChange(e.target.files); if (!form.getValues("institutionLogo")) setInstitutionLogoPreview(null); }}} className={cn(form.formState.errors.institutionLogo && "border-destructive")} accept="image/*" {...restField} />
                    )}/>
                    {form.formState.errors.institutionLogo && <p className="text-destructive text-sm mt-1">{form.formState.errors.institutionLogo.message as string}</p>}
                  </div>
                  <div>
                    <Label htmlFor="name">Nombre de la Institución</Label>
                    <Input id="name" {...form.register("name")} placeholder="Ej: IEP Santa Rita" className={cn(form.formState.errors.name && "border-destructive")} />
                    {form.formState.errors.name && <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="code">Código de la Institución (Interno)</Label>
                    <Input id="code" {...form.register("code")} placeholder="Ej: STRT-01" className={cn(form.formState.errors.code && "border-destructive")} />
                    {form.formState.errors.code && <p className="text-destructive text-sm mt-1">{form.formState.errors.code.message}</p>}
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="institutionColor">Paleta de Color Principal</Label>
                    <div className="flex items-center gap-2">
                       <Input id="institutionColor" type="color" {...form.register("institutionColor")} className={cn("p-1 h-10 w-14",form.formState.errors.institutionColor && "border-destructive")} />
                       <Input {...form.register("institutionColor")} placeholder="#3498db" className={cn("flex-1",form.formState.errors.institutionColor && "border-destructive")} />
                    </div>
                    {form.formState.errors.institutionColor && <p className="text-destructive text-sm mt-1">{form.formState.errors.institutionColor.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="educationalLevelSelection">Niveles Educativos Ofrecidos</Label>
                    <Controller control={form.control} name="educationalLevelSelection" render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                            <SelectTrigger className={cn(form.formState.errors.educationalLevelSelection && "border-destructive")}> <SelectValue placeholder="Seleccionar niveles" /> </SelectTrigger>
                            <SelectContent> {educationalLevelOptions.map(level => (<SelectItem key={level} value={level}>{level}</SelectItem>))} </SelectContent>
                        </Select>
                    )}/>
                    {form.formState.errors.educationalLevelSelection && <p className="text-destructive text-sm mt-1">{form.formState.errors.educationalLevelSelection.message}</p>}
                  </div>
                </div>
              </section>

              <section className="space-y-4 p-4 border rounded-md shadow-sm">
                 <div className="flex items-center gap-2 mb-4">
                    <Users className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold text-primary">Datos del Director</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <Label htmlFor="directorPhotoFile">Foto del Director</Label>
                     {(directorPhotoPreview || (form.getValues("directorPhoto") && typeof form.getValues("directorPhoto") === 'string' && (form.getValues("directorPhoto") as string).startsWith('data:image'))) && (
                        <div className="mt-2 mb-2 space-y-1">
                        <Image src={directorPhotoPreview || form.getValues("directorPhoto") as string} alt="Previsualización foto director" width={80} height={80} className="rounded-md border object-contain" data-ai-hint="director preview"/>
                        <Button type="button" variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive-hover" onClick={() => { form.setValue("directorPhoto", "", { shouldValidate: true }); setDirectorPhotoPreview(null); const el = document.getElementById("directorPhotoFile") as HTMLInputElement; if(el) el.value = ""; }}>
                            <X className="mr-1 h-3 w-3"/> Quitar Foto
                        </Button>
                        </div>
                    )}
                     <Controller name="directorPhoto" control={form.control} render={({ field: { onChange, value, ...restField } }) => (
                          <Input id="directorPhotoFile" type="file" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setDirectorPhotoPreview(reader.result as string); onChange(e.target.files); }; reader.readAsDataURL(file); } else { onChange(e.target.files); if(!form.getValues("directorPhoto")) setDirectorPhotoPreview(null); }}} className={cn(form.formState.errors.directorPhoto && "border-destructive")} accept="image/*" {...restField}/>
                      )}/>
                    {form.formState.errors.directorPhoto && <p className="text-destructive text-sm mt-1">{form.formState.errors.directorPhoto.message as string}</p>}
                  </div>
                  <div>
                    <Label htmlFor="directorFirstName">Nombres del Director</Label>
                    <Input id="directorFirstName" {...form.register("directorFirstName")} placeholder="Ej: Francis" className={cn(form.formState.errors.directorFirstName && "border-destructive")} />
                    {form.formState.errors.directorFirstName && <p className="text-destructive text-sm mt-1">{form.formState.errors.directorFirstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="directorLastName">Apellidos del Director</Label>
                    <Input id="directorLastName" {...form.register("directorLastName")} placeholder="Ej: Castillo Sonobrie" className={cn(form.formState.errors.directorLastName && "border-destructive")} />
                    {form.formState.errors.directorLastName && <p className="text-destructive text-sm mt-1">{form.formState.errors.directorLastName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="directorDocumentNumber">N° Documento del Director</Label>
                    <Input id="directorDocumentNumber" {...form.register("directorDocumentNumber")} placeholder="Ej: 75422158" className={cn(form.formState.errors.directorDocumentNumber && "border-destructive")} />
                    {form.formState.errors.directorDocumentNumber && <p className="text-destructive text-sm mt-1">{form.formState.errors.directorDocumentNumber.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="directorPhoneNumber">N° Celular del Director</Label>
                    <Input id="directorPhoneNumber" {...form.register("directorPhoneNumber")} placeholder="Ej: 952770000" className={cn(form.formState.errors.directorPhoneNumber && "border-destructive")} />
                    {form.formState.errors.directorPhoneNumber && <p className="text-destructive text-sm mt-1">{form.formState.errors.directorPhoneNumber.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="directorEmail">Email del Director</Label>
                    <Input id="directorEmail" type="email" {...form.register("directorEmail")} placeholder="director@ejemplo.com" className={cn(form.formState.errors.directorEmail && "border-destructive")} />
                    {form.formState.errors.directorEmail && <p className="text-destructive text-sm mt-1">{form.formState.errors.directorEmail.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="directorPassword">Contraseña (para el Director)</Label>
                    <Input id="directorPassword" type="password" {...form.register("directorPassword")} placeholder={editingCampus ? "Dejar en blanco para no cambiar" : "••••••••"} className={cn(form.formState.errors.directorPassword && "border-destructive")} />
                    {form.formState.errors.directorPassword && <p className="text-destructive text-sm mt-1">{form.formState.errors.directorPassword.message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Esta contraseña se usará para el acceso del director. Asegúrese de que sea segura.</p>
                  </div>
                </div>
              </section>
              
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  {editingCampus ? "Guardar Cambios" : "Agregar Institución"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
