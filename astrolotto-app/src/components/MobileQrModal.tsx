import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check, Wifi } from 'lucide-react';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  localIp: string;
  port: number;
  publicUrl?: string;
}

export const MobileQrModal: React.FC<MobileQrModalProps> = ({
  isOpen,
  onClose,
  localIp,
  port,
  publicUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [mobileUrl, setMobileUrl] = useState(publicUrl || `http://${localIp}:${port}`);

  useEffect(() => {
    if (publicUrl) {
      setMobileUrl(publicUrl);
    } else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        setMobileUrl(`${window.location.protocol}//${hostname}${window.location.port ? ':' + window.location.port : ''}`);
      } else {
        setMobileUrl(`http://${localIp}:${port}`);
      }
    }
  }, [localIp, port, publicUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-cosmos-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-500 to-astral-violet p-[1px] shadow-cyan-glow">
          <div className="w-full h-full bg-cosmos-950 rounded-[15px] flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-cyan-300" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-1">
          Abre la App en tu Celular
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
          Escanea el código QR con la cámara de tu teléfono móvil o escribe la dirección en tu navegador móvil.
        </p>

        {/* QR Code Container */}
        <div className="inline-block p-4 rounded-2xl bg-white shadow-2xl mx-auto mb-5 border-4 border-amber-400/40">
          <QRCodeSVG
            value={mobileUrl}
            size={210}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* IP & URL pill */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-cosmos-950/80 border border-white/10 mb-4 text-left font-mono text-xs">
          <div className="truncate text-cyan-300 font-bold pl-2">
            {mobileUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="p-3.5 rounded-xl bg-cosmos-950/50 border border-white/5 text-left text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <Wifi className="w-3.5 h-3.5 text-amber-400" />
            <span>Requisito de conexión:</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Tu celular debe estar conectado a la misma red Wi-Fi de tu casa/oficina. Todos los cambios y cálculos que hagas en tu celular se procesarán en tiempo real.
          </p>
        </div>

      </div>
    </div>
  );
};
