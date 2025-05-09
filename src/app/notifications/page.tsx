
"use client";

import type { ChangeEvent } from 'react';
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, MessageSquare, Loader2, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { sendGuardianNotification, type SendGuardianNotificationOutput } from "@/ai/flows/send-notification-flow";
import { useStudentContext } from "@/contexts/StudentContext";
import type { LegacyStudent } from "@/types";
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  studentId: z.string().min(1, { message: "Debe seleccionar un estudiante." }),
  messageContent: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }).max(500, { message: "El mensaje no puede exceder los 500 caracteres." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SendGuardianNotificationOutput | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<LegacyStudent | null>(null);
  const { toast } = useToast();
  const { students, getStudentById, isLoaded: studentsLoaded } = useStudentContext();
  const { currentUser } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      messageContent: "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "studentId" && value.studentId) {
        const student = getStudentById(value.studentId);
        setSelectedStudent(student || null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, getStudentById]);

  async function onSubmit(values: FormValues) {
    if (!selectedStudent) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Estudiante no seleccionado correctamente.",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const aiResult = await sendGuardianNotification({
        studentId: selectedStudent.id,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        guardianPhoneNumber: selectedStudent.guardianPhoneNumber,
        messageContent: values.messageContent,
      });
      setResult(aiResult);
      toast({
        title: aiResult.success ? "Operación Exitosa" : "Error en la Operación",
        description: aiResult.confirmationMessage,
        variant: aiResult.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error calling AI flow:", error);
      toast({
        variant: "destructive",
        title: "Error al Enviar Notificación",
        description: "No se pudo completar la simulación de envío. Intente nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (!studentsLoaded) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Cargando datos de estudiantes...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Role-based access (example)
  // if (currentUser && currentUser.role !== 'superuser' && currentUser.role !== 'normal') {
  //   return (
  //     <DashboardLayout>
  //       <Card>
  //         <CardHeader><CardTitle>Acceso Denegado</CardTitle></CardHeader>
  //         <CardContent><p>No tiene permisos para acceder a esta página.</p></CardContent>
  //       </Card>
  //     </DashboardLayout>
  //   );
  // }

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <MessageSquare className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Enviar Notificación a Apoderados</CardTitle>
              <CardDescription>
                Seleccione un estudiante y redacte el mensaje para su apoderado.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleccionar Estudiante</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Elija un estudiante..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} ({student.grade} &quot;{student.section}&quot;)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedStudent && (
                  <Alert variant="default" className="bg-primary/5 border-primary/30">
                    <Info className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-primary font-semibold">Información del Apoderado</AlertTitle>
                    <AlertDescription>
                      <p><strong>Estudiante:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</p>
                      <p><strong>Celular Apoderado:</strong> {selectedStudent.guardianPhoneNumber || "No registrado"}</p>
                      <p className="text-xs mt-1">Este es el número al que se "enviará" la notificación (simulación).</p>
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="messageContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido del Mensaje</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escriba aquí el mensaje para el apoderado..."
                          className="resize-y min-h-[120px]"
                          {...field}
                          disabled={isLoading || !selectedStudent}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !selectedStudent || !form.formState.isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Notificación (Simulación)
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {result && (
          <Card className="shadow-lg lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Resultado del Envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant={result.success ? "default" : "destructive"} className={result.success ? "bg-accent/10 border-accent" : ""}>
                {result.success ? <CheckCircle className="h-5 w-5 text-accent" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
                <AlertTitle>{result.success ? "Envío Exitoso (Simulado)" : "Error en el Envío"}</AlertTitle>
                <AlertDescription>{result.confirmationMessage}</AlertDescription>
              </Alert>
              
              {result.success && result.details && (
                <div className="text-sm space-y-1 p-3 bg-muted/50 rounded-md">
                  <p><strong>Para:</strong> Apoderado de {result.details.studentName}</p>
                  <p><strong>Contacto:</strong> {result.details.guardianPhoneNumber}</p>
                  <p><strong>Mensaje:</strong> &quot;{result.details.messageContent}&quot;</p>
                  <p><strong>Fecha y Hora (Log):</strong> {new Date(result.details.timestamp).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
