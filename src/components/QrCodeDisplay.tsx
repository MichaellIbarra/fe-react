"use client";

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from 'qrcode.react';
import { Download, UserCircle, Fingerprint } from 'lucide-react'; // Added UserCircle and Fingerprint for DNI style
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For photo placeholder

interface QrCodeDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  qrValue: string;
  studentName: string;
  studentDni?: string; // Optional DNI for display
  studentPhotoSeed?: string; // Optional seed for placeholder photo
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ 
    isOpen, 
    onClose, 
    qrValue, 
    studentName, 
    studentDni = "N/A", 
    studentPhotoSeed 
}) => {
  const qrCodeCanvasRef = useRef<HTMLDivElement>(null); // For downloading the QR code itself
  const dniCardRef = useRef<HTMLDivElement>(null); // For downloading the entire DNI card (optional, more complex)

  if (!isOpen) return null;

  const handleDownloadQrOnly = () => {
    if (qrCodeCanvasRef.current) {
      const canvas = qrCodeCanvasRef.current.querySelector('canvas');
      if (canvas) {
        const pngUrl = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");
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
  
  // Note: Downloading the entire DNI card as an image is more complex 
  // and might require a library like html2canvas if not using a canvas for the DNI card itself.
  // For now, we'll keep the download button for the QR code only.

  const studentInitials = studentName
    .split(' ')
    .map(name => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Identificación QR del Estudiante</DialogTitle>
          <DialogDescription>
            Carnet digital con código QR para {studentName}.
          </DialogDescription>
        </DialogHeader>
        
        {/* DNI-like Card */}
        <div 
          ref={dniCardRef} 
          className="my-6 p-5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-lg border border-slate-300 dark:border-slate-600"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-primary/30">
            <div className='flex items-center gap-2'>
                <Fingerprint className="h-7 w-7 text-primary" />
                <h3 className="text-lg font-semibold text-primary">DOCUMENTO ESTUDIANTIL</h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">EduAssist ID</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Student Photo Placeholder */}
            <div className="flex-shrink-0">
              <Avatar className="h-28 w-28 border-4 border-primary/50 shadow-md">
                <AvatarImage 
                    src={studentPhotoSeed ? `https://picsum.photos/seed/${studentPhotoSeed}/112/112` : `https://picsum.photos/seed/${studentDni}/112/112`} 
                    alt={studentName}
                />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                    {studentInitials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Student Info and QR */}
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">NOMBRES Y APELLIDOS</p>
                <p className="text-lg font-semibold text-foreground leading-tight">{studentName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">NÚMERO DE DOCUMENTO (DNI)</p>
                <p className="text-md font-medium text-foreground">{studentDni}</p>
              </div>
            </div>
             {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center p-2 bg-white rounded-md shadow" ref={qrCodeCanvasRef}>
                {qrValue ? (
                <QRCode value={qrValue} size={100} level="H" includeMargin={false} renderAs="canvas" />
                ) : (
                <p className="text-xs text-muted-foreground">Error QR</p>
                )}
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4 pt-2 border-t border-primary/20">
            Este carnet es para identificación y registro de asistencia.
          </p>
        </div>

        <DialogFooter className="sm:justify-between gap-2 mt-2">
          <Button onClick={handleDownloadQrOnly} variant="outline" disabled={!qrValue}>
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

