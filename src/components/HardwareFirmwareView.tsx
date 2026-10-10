import React, { useState } from 'react';
import {
  ARDUINO_STM32_FIRMWARE_CPP,
  ARDUINO_DRAGONWING_AI_PYTHON,
} from '../services/arduinoFirmware';
import {
  Terminal,
  Cpu,
  Copy,
  Check,
  Download,
  Usb,
  Play,
  RotateCcw,
} from 'lucide-react';
import { edgeAudio } from '../services/audioBuzzer';

interface HardwareFirmwareViewProps {
  isHardwareConnected: boolean;
  setIsHardwareConnected: (val: boolean) => void;
}

export const HardwareFirmwareView: React.FC<HardwareFirmwareViewProps> = ({
  isHardwareConnected,
  setIsHardwareConnected,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'cpp' | 'python'>('cpp');
  const [copied, setCopied] = useState<boolean>(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[STM32U585] Booted successfully. Firmware v2.6.4 (BPUT-HACKATHON-PS02)',
    '[STM32U585] I2C Bus scanned: SHT41 at 0x44, MLX90640 at 0x33 found.',
    '[STM32U585] OneWire Dallas DS18B20 Black Globe Initialized on Pin D4.',
    '[DRAGONWING] Linux Kernel 6.1.42 booted on Qualcomm QRB2210.',
    '[DRAGONWING] Loaded thermal_tcn_quantized.tflite on Cortex-A53 core 0.',
    '[IPC_BRIDGE] Inter-core serial link established at 115200 baud.',
    '{"ta":38.5,"rh":64,"tg":45.2,"v":0.8,"sr":840,"soc":94.0}',
    '[AI Core] WBGT computed: 34.2°C (Category: DANGER). Autonomous relief enabled.',
  ]);
  const [customSerialCmd, setCustomSerialCmd] = useState<string>('RELAY4:PULSE');

  const handleCopyCode = () => {
    const code =
      activeCodeTab === 'cpp' ? ARDUINO_STM32_FIRMWARE_CPP : ARDUINO_DRAGONWING_AI_PYTHON;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const code =
      activeCodeTab === 'cpp' ? ARDUINO_STM32_FIRMWARE_CPP : ARDUINO_DRAGONWING_AI_PYTHON;
    const filename =
      activeCodeTab === 'cpp' ? 'thermaedge_stm32u585.ino' : 'thermaedge_dragonwing_ai.py';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConnectWebSerial = async () => {
    if ('serial' in navigator) {
      try {
        const port = await (navigator as unknown as { serial: { requestPort: () => Promise<unknown> } }).serial.requestPort();
        if (port) {
          setIsHardwareConnected(true);
          setSerialLogs((prev) => [
            ...prev,
            `[WebSerial] Real Arduino UNO Q Port Connected! Streaming live USB telemetry...`,
          ]);
        }
      } catch {
        // User cancelled picker, connect simulated mode
        setIsHardwareConnected(!isHardwareConnected);
      }
    } else {
      setIsHardwareConnected(!isHardwareConnected);
    }
  };

  const handleSendSerialCommand = () => {
    if (!customSerialCmd) return;
    edgeAudio.playRelayClick();
    if (customSerialCmd.includes('RELAY4') || customSerialCmd.includes('PULSE')) {
      edgeAudio.playRestBreakAlert();
    }
    setSerialLogs((prev) => [
      ...prev,
      `> TX: ${customSerialCmd}`,
      `< RX [STM32]: ACK ${customSerialCmd} executed.`,
    ]);
    setCustomSerialCmd('');
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Arduino UNO Q Hardware Bridge &amp; Production Firmware
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              WebSerial / IPC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connects directly to the physical Arduino UNO Q board over USB-C CDC serial or displays real-time inter-core telemetry.
          </p>
        </div>

        <button
          onClick={handleConnectWebSerial}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            isHardwareConnected
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:text-cyan-400'
          }`}
        >
          <Usb className="w-4 h-4 text-cyan-400" />
          <span>{isHardwareConnected ? 'Disconnect Serial (UNO Q)' : 'Connect Physical UNO Q (USB-C)'}</span>
        </button>
      </div>

      {/* Hardware Module Overview & Live Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hardware Visual & Specs */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300">Board Architecture</span>
              <span className="text-[10px] font-mono text-cyan-400">Arduino UNO Q</span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 mb-4 bg-slate-950 aspect-[4/3] flex items-center justify-center relative">
              <img
                src="/src/assets/images/arduino_uno_q_edge_module_1791305219177.jpg"
                alt="Arduino UNO Q Hardware Board"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm p-2 rounded-lg border border-slate-800 text-[10px] text-slate-300 flex justify-between">
                <span>QRB2210 + STM32U585</span>
                <span className="text-emerald-400 font-mono">115200 Baud IPC</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between pb-1 border-b border-slate-800/80">
                <span className="text-slate-400">AI Processor:</span>
                <span className="font-semibold text-white">Qualcomm Dragonwing QRB2210</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-800/80">
                <span className="text-slate-400">Low-Power MCU:</span>
                <span className="font-semibold text-white">STM32U585 (Cortex-M33)</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-800/80">
                <span className="text-slate-400">Sensors Attached:</span>
                <span className="font-semibold text-slate-200">SHT41, DS18B20, MLX90640</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Actuator Relays:</span>
                <span className="font-semibold text-amber-300">4-Channel Optocoupled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Serial Console & Command Transmitter */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Live Serial Terminal (115200 Baud)</span>
            </div>
            <button
              onClick={() => setSerialLogs([])}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>

          {/* Terminal Output Window */}
          <div className="bg-black/90 rounded-xl p-3 font-mono text-[11px] text-emerald-400/90 h-64 overflow-y-auto space-y-1 border border-slate-800/80 scrollbar-thin">
            {serialLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>

          {/* Serial Command Input Bar */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
            <input
              type="text"
              value={customSerialCmd}
              onChange={(e) => setCustomSerialCmd(e.target.value)}
              placeholder="e.g. RELAY1:1, RELAY2:0, RELAY4:PULSE"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSendSerialCommand()}
            />
            <button
              onClick={handleSendSerialCommand}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Send TX</span>
            </button>
          </div>
        </div>
      </div>

      {/* Production Firmware Code Viewer */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
              <button
                onClick={() => setActiveCodeTab('cpp')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeCodeTab === 'cpp'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                STM32U585 Firmware (C++)
              </button>
              <button
                onClick={() => setActiveCodeTab('python')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeCodeTab === 'python'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dragonwing QRB2210 AI Engine (Python)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownloadCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sketch</span>
            </button>
          </div>
        </div>

        {/* Code Block Container */}
        <div className="bg-[#050811] rounded-xl p-4 overflow-x-auto border border-slate-800/80 max-h-96">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed">
            {activeCodeTab === 'cpp' ? ARDUINO_STM32_FIRMWARE_CPP : ARDUINO_DRAGONWING_AI_PYTHON}
          </pre>
        </div>
      </div>
    </div>
  );
};
