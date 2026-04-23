"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { DbHistoryChart } from "@/components/charts/db-history-chart";
import { MetricCard } from "@/components/cards/metric-card";
import { AlertCard } from "@/components/cards/alert-card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, RotateCcw, Activity, TrendingUp, BarChart3 } from "lucide-react";
import { DbMeasurement } from "@/types/audio";
import { calculateDbFromPcm, calculateAverage, findPeak } from "@/lib/audio/db-meter";

export default function MedidorDbPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [measurements, setMeasurements] = useState<DbMeasurement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const processAudio = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray);

    const db = calculateDbFromPcm(dataArray);
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

    setCurrentDb(db);
    setPeakDb((prev) => Math.max(prev, db));

    setMeasurements((prev) => {
      const newMeasurement: DbMeasurement = {
        timestamp: elapsed,
        value: db,
      };
      // Keep last 120 measurements (2 minutes at ~1/sec rate)
      const updated = [...prev, newMeasurement].slice(-120);
      return updated;
    });

    animationRef.current = requestAnimationFrame(processAudio);
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Seu navegador não suporta acesso ao microfone.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      setPermissionGranted(true);

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;

      source.connect(analyser);
      analyserRef.current = analyser;

      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Start processing loop
      const process = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyser.fftSize;
        const dataArray = new Float32Array(bufferLength);
        analyser.getFloatTimeDomainData(dataArray);

        const db = calculateDbFromPcm(dataArray);
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

        setCurrentDb(db);
        setPeakDb((prev) => Math.max(prev, db));

        setMeasurements((prev) => {
          // Only add measurement every ~500ms
          const lastTimestamp = prev.length > 0 ? prev[prev.length - 1].timestamp : -1;
          if (elapsed === lastTimestamp) return prev;

          const newMeasurement: DbMeasurement = {
            timestamp: elapsed,
            value: db,
          };
          return [...prev, newMeasurement].slice(-120);
        });

        animationRef.current = requestAnimationFrame(process);
      };

      animationRef.current = requestAnimationFrame(process);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(
        "Não foi possível acessar o microfone. Verifique as permissões do navegador."
      );
    }
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    cleanup();
  }, [cleanup]);

  const resetMeasurements = useCallback(() => {
    stopRecording();
    setCurrentDb(0);
    setPeakDb(0);
    setMeasurements([]);
  }, [stopRecording]);

  const average = calculateAverage(measurements);

  // Visual meter level (0-100%)
  const meterLevel = Math.min(100, Math.max(0, (currentDb / 140) * 100));

  // Color based on dB level
  const getDbColor = (db: number) => {
    if (db < 60) return "text-emerald-400";
    if (db < 85) return "text-cyan-400";
    if (db < 100) return "text-amber-400";
    return "text-red-400";
  };

  const getMeterGradient = (db: number) => {
    if (db < 60) return "from-emerald-500 to-emerald-400";
    if (db < 85) return "from-cyan-500 to-cyan-400";
    if (db < 100) return "from-amber-500 to-amber-400";
    return "from-red-500 to-red-400";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Medidor dB
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Meça o nível de pressão sonora aproximado usando o microfone do dispositivo.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Meter Display */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-8">
          {/* Big dB display */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-white/[0.06] bg-[#0B0F15]">
              {/* Animated ring */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  isRecording ? "animate-pulse" : ""
                }`}
                style={{
                  background: isRecording
                    ? `conic-gradient(${
                        currentDb < 60
                          ? "#10b981"
                          : currentDb < 85
                          ? "#06b6d4"
                          : currentDb < 100
                          ? "#f59e0b"
                          : "#ef4444"
                      } ${meterLevel * 3.6}deg, transparent 0deg)`
                    : "none",
                  opacity: 0.3,
                  borderRadius: "50%",
                }}
              />
              <div className="text-center relative z-10">
                <p className={`text-5xl font-bold tabular-nums ${getDbColor(currentDb)}`}>
                  {currentDb.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500 mt-1">dB SPL</p>
              </div>
            </div>

            {/* Level bar */}
            <div className="w-full space-y-2">
              <div className="h-3 w-full rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-150 ${getMeterGradient(currentDb)}`}
                  style={{ width: `${meterLevel}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>0 dB</span>
                <span>60 dB</span>
                <span>85 dB</span>
                <span>100 dB</span>
                <span>140 dB</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20 px-8"
                  size="lg"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Iniciar Medição
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="px-8 shadow-lg"
                  size="lg"
                >
                  <MicOff className="mr-2 h-5 w-5" />
                  Parar
                </Button>
              )}
              <Button
                onClick={resetMeasurements}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <MetricCard
              title="Atual"
              value={`${currentDb.toFixed(1)} dB`}
              subtitle="Nível instantâneo"
              icon={Activity}
            />
            <MetricCard
              title="Pico Máximo"
              value={`${peakDb.toFixed(1)} dB`}
              subtitle="Maior valor medido"
              icon={TrendingUp}
            />
            <MetricCard
              title="Média"
              value={`${average.toFixed(1)} dB`}
              subtitle={`${measurements.length} amostras`}
              icon={BarChart3}
            />
          </div>

          {/* History Chart */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">
              Histórico da Sessão
            </h3>
            <DbHistoryChart data={measurements} />
          </div>
        </div>
      </div>

      {/* Reference table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111820] p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">
          Referência de Níveis
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { range: "0-30 dB", label: "Silêncio / sussurro", color: "text-emerald-400" },
            { range: "30-60 dB", label: "Conversa normal", color: "text-emerald-400" },
            { range: "60-85 dB", label: "Trânsito / música moderada", color: "text-cyan-400" },
            { range: "85-100 dB", label: "Som alto / show", color: "text-amber-400" },
            { range: "100-120 dB", label: "SPL competição", color: "text-orange-400" },
            { range: "120-140 dB", label: "Limiar da dor", color: "text-red-400" },
            { range: "140+ dB", label: "Risco de dano auditivo", color: "text-red-500" },
          ].map((ref) => (
            <div
              key={ref.range}
              className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
            >
              <span className={`text-sm font-bold tabular-nums ${ref.color}`}>
                {ref.range}
              </span>
              <span className="text-xs text-gray-500">{ref.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <AlertCard
        type="warning"
        title="Medição aproximada"
        description="A medição via microfone do navegador é aproximada e depende do aparelho, permissões e calibração. Para medições precisas, utilize decibelímetro profissional."
      />
    </div>
  );
}
