'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  value: string;
  type?: 'BIRD' | 'CAGE' | 'CREATOR';
  identifier?: string;
}

export function QRModal({
  isOpen,
  onClose,
  title,
  subtitle,
  value,
  type = 'BIRD',
  identifier
}: QRModalProps) {
  const [copied, setCopied] = React.useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);
        
        // Add footer text on canvas
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`BIRDPRO • ${title}`, 500, 940);
        if (identifier) {
          ctx.font = '28px monospace';
          ctx.fillStyle = '#059669';
          ctx.fillText(identifier, 500, 975);
        }

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qrcode-${(identifier || 'birdpro').toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <QrCode className="w-5 h-5 text-emerald-600" />
          <span>QR Code Oficial de Identificação</span>
        </div>
      }
      description="Utilize este código para consulta instantânea por smartphone no criatório ou exposições."
      maxWidth="md"
    >
      <div className="flex flex-col items-center text-center space-y-5 py-2">
        {/* Card of QR Code with decorative border */}
        <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-emerald-500/40 shadow-lg relative group">
          <div className="bg-white p-3 rounded-xl shadow-xs">
            <QRCodeSVG
              ref={qrRef}
              value={value}
              size={220}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/logo-icon.png',
                x: undefined,
                y: undefined,
                height: 38,
                width: 38,
                excavate: true,
              }}
            />
          </div>
        </div>

        {/* Info detail */}
        <div>
          <h4 className="font-bold text-base text-slate-900">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          {identifier && (
            <span className="inline-block mt-2 font-mono text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              {identifier}
            </span>
          )}
        </div>

        {/* Link display & copy */}
        <div className="w-full flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          <span className="truncate flex-1 text-left font-mono">{value}</span>
          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-medium flex items-center gap-1 shrink-0 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        {/* Actions */}
        <div className="w-full grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" onClick={handleDownloadQR}>
            <Download className="w-4 h-4 mr-1.5" />
            Baixar PNG
          </Button>
          <Button onClick={() => window.open(value, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-1.5" />
            Abrir Link
          </Button>
        </div>
      </div>
    </Modal>
  );
}
