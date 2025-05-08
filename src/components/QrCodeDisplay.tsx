
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from 'qrcode.react'; // Corrected import

interface QrCodeDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  qrValue: string;
  studentName: string;
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ isOpen, onClose, qrValue, studentName }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Código QR de Estudiante</DialogTitle>
          <DialogDescription>
            Este es el código QR para {studentName}. Puede ser utilizado para el registro de asistencia.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {qrValue ? (
            <QRCode value={qrValue} size={256} level="H" includeMargin={true} />
          ) : (
            <p className="text-muted-foreground">No se pudo generar el código QR.</p>
          )}
          <p className="mt-4 font-semibold text-lg">{studentName}</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDisplay;
