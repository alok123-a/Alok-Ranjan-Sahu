import React from 'react';
import { X, Usb, CheckCircle2, AlertCircle } from 'lucide-react';

interface HardwareBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHardwareConnected: boolean;
  setIsHardwareConnected: (val: boolean) => void;
}

export const HardwareBridgeModal: React.FC<HardwareBridgeModalProps> = ({
  isOpen,
  onClose,
  isHardwareConnected,
  setIsHardwareConnected,
}) => {
  if (!isOpen) return null;

  const handleConnect = async () => {
    if ('serial' in navigator) {
      try {
        const port = await (navigator as unknown as { serial: { requestPort: () => Promise<unknown> } }).serial.requestPort();
        if (port) {
          setIsHardwareConnected(true);
          onClose();
        }
      } catch {
        // Fallback simulation mode
        setIsHardwareConnected(true);
        onClose();
      }
    } else {
      setIsHardwareConnected(true);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Usb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Arduino UNO Q Link</h3>
            <p className="text-xs text-slate-400">Qualcomm Dragonwing QRB2210 + STM32U585</p>
          </div>
        </div>

        <div className="space-y-3 my-4 text-xs text-slate-300">
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Communication Bus:</span>
              <span className="font-mono text-cyan-300">USB-C CDC / Serial Port</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Default Baud Rate:</span>
              <span className="font-mono text-white">115,200 bps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payload Format:</span>
              <span className="font-mono text-emerald-400">JSON Telemetry Stream</span>
            </div>
          </div>

          <p className="text-slate-400 leading-relaxed text-[11px]">
            Plug in your physical Arduino UNO Q development board via USB-C. When connected, real SHT41, DS18B20 black globe, anemometer, and MLX90640 readings will stream directly into the dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            {isHardwareConnected ? 'Reconnect Port' : 'Connect Serial Port'}
          </button>
        </div>
      </div>
    </div>
  );
};
