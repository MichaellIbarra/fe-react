
"use client";

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from 'qrcode.react';
import { Download } from 'lucide-react';

interface QrCodeDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  qrValue: string;
  studentName: string;
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ isOpen, onClose, qrValue, studentName }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadQr = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector('canvas');
      if (canvas) {
        const pngUrl = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream"); // Suggests download
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        const safeStudentName = studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        downloadLink.download = `QR_Estudiante_${safeStudentName}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Código QR de Estudiante</DialogTitle>
          <DialogDescription>
            Este es el código QR para {studentName}. Puede ser utilizado para el registro de asistencia o descargado.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4" ref={qrCodeRef}>
          {qrValue ? (
            <QRCode value={qrValue} size={256} level="H" includeMargin={true} renderAs="canvas" />
          ) : (
            <p className="text-muted-foreground">No se pudo generar el código QR.</p>
          )}
          <p className="mt-4 font-semibold text-lg">{studentName}</p>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <Button onClick={handleDownloadQr} variant="outline" disabled={!qrValue}>
            <Download className="mr-2 h-4 w-4" />
            Descargar QR (PNG)
          </Button>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDisplay;

