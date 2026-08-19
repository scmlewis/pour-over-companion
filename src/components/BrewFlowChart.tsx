import React, { useEffect, useRef, useState } from 'react';
import { Activity, Droplets, Target, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface BrewFlowChartProps {
  stepElapsedSec: number;
  stepTotalSec: number;
  pourTargetSec: number;
  waterToAdd: number;
  isPouring: boolean;
  isWaiting: boolean;
  isRunning: boolean;
  stepIndex: number;
}

export const BrewFlowChart: React.FC<BrewFlowChartProps> = ({
  stepElapsedSec,
  stepTotalSec,
  pourTargetSec,
  waterToAdd,
  isPouring,
  isWaiting,
  isRunning,
  stepIndex,
}) => {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 340, height: 85 });

  // Store history of flow rates for the current step
  const flowHistoryRef = useRef<{ time: number; actualRate: number; targetRate: number }[]>([]);
  const lastStepIndexRef = useRef<number>(stepIndex);

  // Target flow rate calculation (e.g. 50g / 10s = 5.0 g/s)
  const targetRate = isPouring && pourTargetSec > 0 
    ? Number((waterToAdd / pourTargetSec).toFixed(1)) 
    : 0;

  // Calculate simulated realistic barista actual flow rate
  const currentActualRate = isPouring
    ? Math.max(
        0,
        Number(
          (
            targetRate *
            (stepElapsedSec <= 1
              ? 0.55
              : stepElapsedSec >= pourTargetSec
              ? 0.2
              : 0.96 + Math.sin(stepElapsedSec * 1.8) * 0.12)
          ).toFixed(1)
        )
      )
    : 0;

  // Reset or append history when step changes or time progresses
  useEffect(() => {
    if (lastStepIndexRef.current !== stepIndex) {
      lastStepIndexRef.current = stepIndex;
      flowHistoryRef.current = [{ time: 0, actualRate: 0, targetRate }];
    }
  }, [stepIndex, targetRate]);

  useEffect(() => {
    const existing = flowHistoryRef.current.find(pt => pt.time === stepElapsedSec);
    if (!existing) {
      flowHistoryRef.current.push({
        time: stepElapsedSec,
        actualRate: currentActualRate,
        targetRate,
      });
    }
  }, [stepElapsedSec, currentActualRate, targetRate]);

  // Responsive canvas sizing with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = dimensions;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Padding
    const padL = 34;
    const padR = 12;
    const padT = 10;
    const padB = 18;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Max scale (flow rate up to 8 g/s or dynamically higher)
    const maxFlow = Math.max(6, Math.ceil(targetRate * 1.35));
    const maxTime = Math.max(stepTotalSec, 30);

    // Coordinate mapping helpers
    const getX = (t: number) => padL + (Math.min(t, maxTime) / maxTime) * chartW;
    const getY = (flow: number) => padT + chartH - (Math.min(flow, maxFlow) / maxFlow) * chartH;

    // Draw grid horizontal lines and Y-axis labels
    const yTicks = [0, Math.round(maxFlow / 2), maxFlow];
    ctx.font = '500 8.5px ui-monospace, monospace';
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    yTicks.forEach(tickVal => {
      const y = getY(tickVal);
      ctx.beginPath();
      ctx.strokeStyle = tickVal === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.moveTo(padL, y);
      ctx.lineTo(width - padR, y);
      ctx.stroke();

      ctx.fillText(`${tickVal}g/s`, padL - 4, y);
    });

    // Draw X-axis time ticks
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xTicks = [0, Math.round(maxTime / 2), maxTime];
    xTicks.forEach(tVal => {
      const x = getX(tVal);
      ctx.fillText(`${tVal}s`, x, height - padB + 4);
    });

    // Draw Pour Window Zone background highlight
    if (pourTargetSec > 0) {
      const pourEndX = getX(pourTargetSec);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.fillRect(padL, padT, pourEndX - padL, chartH);

      // Pour window boundary dashed vertical line
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.moveTo(pourEndX, padT);
      ctx.lineTo(pourEndX, padT + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 1. Draw Target Flow Rate Line (dashed amber line)
    if (targetRate > 0) {
      const targetY = getY(targetRate);
      const pourEndX = getX(pourTargetSec);

      ctx.beginPath();
      ctx.setLineDash([3.5, 3.5]);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)'; // warm amber dashed
      ctx.lineWidth = 1.5;
      ctx.moveTo(padL, targetY);
      ctx.lineTo(pourEndX, targetY);
      ctx.lineTo(pourEndX, getY(0));
      ctx.lineTo(getX(maxTime), getY(0));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Draw Actual Flow Rate Curve in Warm Amber / Gold
    const data = flowHistoryRef.current;
    if (data.length > 0) {
      const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      areaGrad.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
      areaGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

      ctx.beginPath();
      ctx.moveTo(getX(data[0].time), getY(data[0].actualRate));

      for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        const cx = (getX(prev.time) + getX(curr.time)) / 2;
        const cy = (getY(prev.actualRate) + getY(curr.actualRate)) / 2;
        ctx.quadraticCurveTo(getX(prev.time), getY(prev.actualRate), cx, cy);
      }
      const last = data[data.length - 1];
      ctx.lineTo(getX(last.time), getY(last.actualRate));

      // Close path for area
      ctx.lineTo(getX(last.time), getY(0));
      ctx.lineTo(getX(data[0].time), getY(0));
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Stroke actual curve
      ctx.beginPath();
      ctx.moveTo(getX(data[0].time), getY(data[0].actualRate));
      for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        const cx = (getX(prev.time) + getX(curr.time)) / 2;
        const cy = (getY(prev.actualRate) + getY(curr.actualRate)) / 2;
        ctx.quadraticCurveTo(getX(prev.time), getY(prev.actualRate), cx, cy);
      }
      ctx.lineTo(getX(last.time), getY(last.actualRate));
      ctx.strokeStyle = '#fbbf24'; // amber-400 glowing curve
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Draw pulsating current playhead dot
      const curX = getX(stepElapsedSec);
      const curY = getY(currentActualRate);

      ctx.beginPath();
      ctx.arc(curX, curY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }, [dimensions, stepElapsedSec, stepTotalSec, pourTargetSec, targetRate, currentActualRate, isPouring]);

  // Flow rate diagnostic label
  const flowDiff = currentActualRate - targetRate;
  const flowStatusZh = !isRunning
    ? '已凍結 · 暫停中'
    : isWaiting
    ? '滴濾排氣中'
    : isPouring
    ? Math.abs(flowDiff) <= 0.6
      ? '水速極佳 · 穩定'
      : flowDiff > 0.6
      ? '注水偏快'
      : '注水偏慢'
    : '準備下一步';

  const flowStatusEn = !isRunning
    ? 'Frozen · Paused'
    : isWaiting
    ? 'Drawdown in progress'
    : isPouring
    ? Math.abs(flowDiff) <= 0.6
      ? 'Optimal Flow'
      : flowDiff > 0.6
      ? 'Fast Flow'
      : 'Slow Flow'
    : 'Ready for Next';

  return (
    <div className={`rounded-2xl border p-3 space-y-2 select-none shadow-md transition-colors ${
      !isRunning ? 'bg-[#15120e] border-amber-500/30' : 'bg-[#0d0f14] border-white/[0.07]'
    }`}>
      {/* Top Inline Flow Telemetry Line */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Activity className={`w-3.5 h-3.5 ${!isRunning ? 'text-amber-300' : 'text-amber-400'}`} />
          <span className="font-semibold text-slate-200">{language === 'zh' ? '注水流速監控' : 'Flow Rate Telemetry'}</span>
          <span className={`font-semibold px-1.5 py-0.5 rounded-md text-[10px] ${
            !isRunning
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {language === 'zh' ? flowStatusZh : flowStatusEn}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 flex items-center gap-1 text-[10px]">
            <span className="w-2 h-0.5 bg-amber-500/80 inline-block border-b border-dashed" />
            <span>{language === 'zh' ? '目標' : 'Target'} {targetRate > 0 ? `${targetRate}g/s` : '--'}</span>
          </span>

          <span className="text-amber-300 font-bold flex items-center gap-1 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-amber-500'}`} />
            <span>{currentActualRate.toFixed(1)} <span className="font-normal text-[9px] text-slate-400">g/s</span></span>
          </span>
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="w-full h-[84px] relative rounded-xl bg-black/50 border border-white/[0.04] overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
        {!isRunning && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
              ⏸ {language === 'zh' ? '流速監控已凍結' : 'TELEMETRY FROZEN'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
