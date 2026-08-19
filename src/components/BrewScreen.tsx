import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, Volume2, VolumeX, ChevronRight, Pause, Play, Sparkles, Droplets, Clock, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe, RecipeStep } from '../types';
import { playStepChime, playFinishChime, playCountdownBeep } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { requestWakeLock, releaseWakeLock } from '../utils/wakeLock';
import { BrewFlowChart } from './BrewFlowChart';
import { useLanguage } from '../utils/i18n';

interface BrewScreenProps {
  recipe: Recipe;
  dose: number;
  ratio: string;
  totalWater: number;
  grind: string;
  scaledSteps: RecipeStep[];
  advanceMode: 'auto' | 'manual';
  onFinishBrew: (meta: { durationSec: number; theoreticalWater: number }) => void;
  onCancelBrew: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Gentle scaling for step indicator capsule and segment bar
const stepIndicatorVariants = {
  hidden: { opacity: 0, scale: 0.93, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Gentle scaling for the hero step countdown timer display
const timerCardVariants = {
  hidden: { opacity: 0, scale: 0.90, y: 14 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.56,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Action directive and instruction variants
const actionDirectiveVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Telemetry & flow chart cards
const telemetryVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Bottom controls variants
const bottomControlsVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 14 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const BrewScreen: React.FC<BrewScreenProps> = ({
  recipe,
  dose,
  ratio,
  totalWater,
  grind,
  scaledSteps,
  advanceMode,
  onFinishBrew,
  onCancelBrew,
}) => {
  const { t, language } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [elapsedTotalSec, setElapsedTotalSec] = useState<number>(0);
  const [stepElapsedSec, setStepElapsedSec] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showTechniqueModal, setShowTechniqueModal] = useState<boolean>(false);
  const [showFlowChart, setShowFlowChart] = useState<boolean>(true);

  const timerRef = useRef<number | null>(null);

  // Keep screen awake while brewing
  useEffect(() => {
    requestWakeLock();
    return () => {
      releaseWakeLock();
    };
  }, []);

  const currentStep = scaledSteps[currentStepIndex] || scaledSteps[0];
  const nextStep = scaledSteps[currentStepIndex + 1];

  const stepTotalSec = currentStep.durationSec || 30;
  const pourTargetSec = currentStep.pourDurationSec ?? (
    currentStep.type === 'bloom'
      ? Math.min(15, stepTotalSec)
      : currentStep.type === 'drawdown'
      ? 0
      : Math.min(25, stepTotalSec)
  );

  // State phases within current step:
  const isPouring = pourTargetSec > 0 && stepElapsedSec < pourTargetSec;
  const isWaiting = !isPouring && stepElapsedSec < stepTotalSec;
  const isOvertime = stepElapsedSec >= stepTotalSec;

  const pourRemainingSec = Math.max(0, pourTargetSec - stepElapsedSec);
  const waitRemainingSec = Math.max(0, stepTotalSec - stepElapsedSec);
  const overtimeSec = stepElapsedSec - stepTotalSec;

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer Tick Engine
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = window.setInterval(() => {
      setElapsedTotalSec(prev => prev + 1);
      setStepElapsedSec(prev => {
        const nextStepSec = prev + 1;

        // Auto mode advance
        if (advanceMode === 'auto' && nextStepSec >= stepTotalSec) {
          if (currentStepIndex < scaledSteps.length - 1) {
            goToNextStep();
            return 0;
          } else {
            handleCompleteBrew();
            return nextStepSec;
          }
        }

        // Countdown Beep Audio Cues (last 3 seconds of pour)
        if (pourTargetSec > 3 && nextStepSec >= pourTargetSec - 3 && nextStepSec < pourTargetSec) {
          if (soundEnabled) playCountdownBeep();
          triggerHaptic('light');
        }

        return nextStepSec;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, advanceMode, currentStepIndex, scaledSteps.length, stepTotalSec, pourTargetSec, soundEnabled]);

  const goToNextStep = () => {
    if (soundEnabled) playStepChime();
    triggerHaptic('medium');

    if (currentStepIndex < scaledSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setStepElapsedSec(0);
    } else {
      handleCompleteBrew();
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      triggerHaptic('light');
      setCurrentStepIndex(prev => prev - 1);
      setStepElapsedSec(0);
    }
  };

  const handleCompleteBrew = () => {
    if (soundEnabled) playFinishChime();
    triggerHaptic('heavy');
    if (timerRef.current) clearInterval(timerRef.current);
    onFinishBrew({
      durationSec: elapsedTotalSec,
      theoreticalWater: totalWater,
    });
  };

  // Current and Target Scale Weights
  const currentTargetWeight = currentStep.targetWeight || totalWater;
  const previousStepTargetWeight = currentStepIndex > 0
    ? (scaledSteps[currentStepIndex - 1]?.targetWeight || 0)
    : 0;
  const currentWaterToAdd = Math.max(0, currentTargetWeight - previousStepTargetWeight);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex-1 flex flex-col justify-between pb-6 pt-0 select-none space-y-3 font-sans text-slate-100 relative"
    >
      <div>
        {/* Prominent High-Visibility Paused Banner when !isRunning */}
        <AnimatePresence>
          {!isRunning && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsRunning(true)}
              className="mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-500/30 to-amber-500/25 border-2 border-amber-400 text-amber-200 shadow-xl shadow-amber-950/50 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold animate-pulse flex-shrink-0">
                  <Pause className="w-4 h-4 fill-slate-950" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-amber-300 tracking-wide flex items-center gap-1.5">
                    <span>{language === 'zh' ? '計時已暫停' : 'TIMER PAUSED'}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200">
                      {formatTime(isPouring ? pourRemainingSec : waitRemainingSec)}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-100/90 font-medium">
                    {language === 'zh' ? '點擊此處或下方按鈕隨時恢復' : 'Tap here or below to resume'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRunning(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all flex-shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 stroke-none" />
                <span>{language === 'zh' ? '繼續' : 'Resume'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Top Header */}
        <motion.div variants={headerVariants} className="sticky top-0 z-30 bg-[#0d0b09]/95 backdrop-blur-md py-2.5 mb-2 -mx-4 px-4 border-b border-white/[0.06] flex items-center justify-between shadow-md">
          <button
            onClick={onCancelBrew}
            className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            title={t('brew.cancel')}
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>

          <div className="text-center">
            <h2 className="text-sm font-extrabold text-slate-200 tracking-tight flex items-center gap-1.5 justify-center">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-amber-400 ring-4 ring-amber-400/30'}`} />
              <span>{language === 'zh' ? recipe.name : (recipe.nameEn || recipe.name)}</span>
            </h2>
            <div className="text-[10px] font-mono tracking-wider font-semibold">
              {isRunning ? (
                <span className="text-slate-400">
                  {recipe.method} · {recipe.temp}°C
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold animate-pulse">
                  <Pause className="w-2.5 h-2.5 fill-amber-300" />
                  <span>{language === 'zh' ? '計時暫停中' : 'TIMER PAUSED'}</span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(s => !s)}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
            title={soundEnabled ? t('brew.soundOn') : t('brew.soundMuted')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>
        </motion.div>

        {/* Step Capsule & Total Elapsed Strip */}
        <motion.div variants={stepIndicatorVariants} className="flex items-center justify-between px-1 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-300">
            <span>{t('brew.step')} {(currentStepIndex + 1).toString().padStart(2, '0')} / {scaledSteps.length.toString().padStart(2, '0')}</span>
            <span className="text-amber-500/60">·</span>
            <span className="text-slate-200">{language === 'zh' ? currentStep.label : (currentStep.labelEn || currentStep.label)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span>{language === 'zh' ? '累計' : 'Total'}</span>
            <span className={`font-bold ${isRunning ? 'text-amber-400' : 'text-amber-300'}`}>
              {formatTime(elapsedTotalSec)}
              {!isRunning && <span className="text-[10px] text-amber-400 font-bold ml-1">({language === 'zh' ? '暫停' : 'PAUSED'})</span>}
            </span>
          </div>
        </motion.div>

        {/* Segmented Stage Progress Bar */}
        <motion.div variants={stepIndicatorVariants} className="grid grid-cols-4 gap-1.5 mb-4">
          {scaledSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const stepProgressPercent = isCurrent 
              ? Math.min(100, Math.round((stepElapsedSec / (step.durationSec || 30)) * 100))
              : isCompleted ? 100 : 0;
            const sLabel = language === 'zh' ? step.label : (step.labelEn || step.label);

            return (
              <div key={idx} className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-amber-500' 
                        : isCurrent 
                        ? isRunning
                          ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                          : 'bg-amber-400 border-r-2 border-white animate-pulse'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${stepProgressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono px-0.5">
                  <span className={`truncate font-medium ${isCurrent ? 'text-amber-300 font-bold' : isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                    {sLabel}
                  </span>
                  <span className={`${isCurrent ? 'text-amber-400' : 'text-slate-600'}`}>
                    {step.durationSec}s
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Hero Step Timer & Extraction Metrics Display */}
        <motion.div
          variants={timerCardVariants}
          onClick={() => !isRunning && setIsRunning(true)}
          className={`p-4 rounded-3xl transition-all mb-3 shadow-xl relative overflow-hidden ${
            !isRunning
              ? 'bg-gradient-to-b from-[#1c1814] to-[#12100d] border-2 border-amber-400/80 ring-4 ring-amber-500/20 cursor-pointer shadow-amber-950/40'
              : 'bg-[#12141a] border border-white/[0.08]'
          }`}
        >
          {/* Paused Ambient Badge in Top Right */}
          {!isRunning && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black shadow-lg animate-pulse z-20">
              <Pause className="w-3 h-3 fill-slate-950" />
              <span>{language === 'zh' ? '已暫停 · 點擊恢復' : 'PAUSED · TAP TO RESUME'}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            {/* Left: Giant Step Countdown with clear state indication */}
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono font-medium flex items-center gap-1.5">
                <Clock className={`w-3.5 h-3.5 ${!isRunning ? 'text-amber-300' : 'text-amber-400'}`} />
                <span className={!isRunning ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                  {!isRunning
                    ? (language === 'zh' ? '注水倒數 (已凍結)' : 'POUR COUNTDOWN (FROZEN)')
                    : isPouring
                    ? (language === 'zh' ? '注水倒數' : 'POUR COUNTDOWN')
                    : (language === 'zh' ? '本段進度' : 'STEP TIMER')}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={formatTime(stepElapsedSec)}
                    initial={{ opacity: 0.78, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.78, scale: 1.02 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className={`text-6xl sm:text-7xl font-black font-mono tracking-tighter tabular-nums leading-none ${
                      !isRunning ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'text-white'
                    }`}
                  >
                    {isPouring ? formatTime(pourRemainingSec) : formatTime(stepElapsedSec)}
                  </motion.div>
                </AnimatePresence>

                {!isRunning && (
                  <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 uppercase tracking-wider">
                    PAUSE
                  </span>
                )}
              </div>
            </div>

            {/* Right: Step Context & Target Status */}
            <div className="text-right space-y-1.5 font-mono">
              <div className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/[0.06] text-right">
                <div className="text-[10px] text-slate-400">{language === 'zh' ? '本段總時長' : 'Step Total'}</div>
                <div className="text-sm font-bold text-slate-200">{formatTime(stepTotalSec)}</div>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/[0.06] text-right">
                <div className="text-[10px] text-slate-400">{language === 'zh' ? '總目標時長' : 'Target Window'}</div>
                <div className="text-xs font-bold text-amber-400">{recipe.targetTimeRange}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* High-Impact Primary Action Directive Section */}
        <motion.div
          variants={actionDirectiveVariants}
          className={`p-4 rounded-3xl transition-all mb-3 shadow-lg space-y-1.5 ${
            !isRunning ? 'bg-[#181410] border-2 border-amber-500/40 ring-1 ring-amber-500/20' : 'bg-[#12141a] border border-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wide flex items-center gap-1.5">
              {!isRunning ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black flex items-center gap-1 text-[11px]">
                  <Pause className="w-3 h-3 fill-slate-950" />
                  {language === 'zh' ? '計時暫停中 · 靜置保持' : 'TIMER PAUSED · STANDBY'}
                </span>
              ) : isPouring ? (
                <span className="text-amber-400">{language === 'zh' ? '● 正在注水' : '● POURING NOW'}</span>
              ) : isWaiting ? (
                <span className="text-amber-400">{language === 'zh' ? '● 靜置滴濾中' : '● DRAWDOWN'}</span>
              ) : (
                <span className="text-amber-400">{language === 'zh' ? '● 本段完成' : '● STEP DONE'}</span>
              )}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {advanceMode === 'auto' ? (language === 'zh' ? '自動換段' : 'Auto-advance') : (language === 'zh' ? '手動換段' : 'Manual')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            {!isRunning ? (
              <span className="text-amber-300 flex items-center gap-2">
                <Pause className="w-6 h-6 fill-amber-300" />
                <span>{language === 'zh' ? '沖煮計時已暫停' : 'Brew Timer Paused'}</span>
              </span>
            ) : (
              <>
                {isPouring && t('brew.pourNow')}
                {isWaiting && t('brew.waitDrawdown')}
                {isOvertime && t('brew.stepFinished')}
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
            {!isRunning ? (
              language === 'zh'
                ? <>注水倒數與流速已凍結（當前目標：在剩餘 <strong className="text-amber-300 font-bold font-mono">{formatTime(isPouring ? pourRemainingSec : waitRemainingSec)}</strong> 內達 <strong className="text-white font-bold">{currentTargetWeight}g</strong>）。點擊下方 <strong className="text-amber-300 font-bold">「繼續」</strong> 隨時恢復計時。</>
                : <>Timer and telemetry frozen (Target: reach <strong className="text-white font-bold">{currentTargetWeight}g</strong> within <strong className="text-amber-300 font-bold font-mono">{formatTime(isPouring ? pourRemainingSec : waitRemainingSec)}</strong>). Tap <strong className="text-amber-300 font-bold">"Resume"</strong> below to continue.</>
            ) : (
              <>
                {isPouring && (
                  language === 'zh'
                    ? <>在 <span className="text-amber-300 font-bold font-mono">{formatTime(pourRemainingSec)}</span> 內加入 <strong className="text-white font-black">{currentWaterToAdd} 克水</strong> · 磅重達 <strong className="text-amber-400 font-black">{currentTargetWeight} 克</strong>。</>
                    : <>Pour <strong className="text-white font-bold">{currentWaterToAdd}g</strong> in {formatTime(pourRemainingSec)} · target reach <strong className="text-amber-400 font-bold">{currentTargetWeight}g</strong>.</>
                )}
                {isWaiting && (
                  language === 'zh'
                    ? <>停止注水 · 靜置咖啡粉床等待完全透水滴濾。</>
                    : <>Stop pouring · allow coffee bed to filter through completely.</>
                )}
                {isOvertime && (
                  language === 'zh'
                    ? <>此段時間已滿 · 請點擊下方按鈕進入「{nextStep?.label || t('brew.finishStepName')}」。</>
                    : <>Step time completed · tap button below to advance to "{nextStep?.label || t('brew.finishStepName')}".</>
                )}
              </>
            )}
          </p>
        </motion.div>

        {/* Precision Scale Target Weight Card with Concentric Radial Graphic */}
        <motion.div
          variants={telemetryVariants}
          className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 flex items-center justify-between shadow-lg relative overflow-hidden"
        >
          {/* Ambient Warm Glow */}
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

          {/* Left: Scale Target Readout */}
          <div className="space-y-1 relative z-10">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span>{t('brew.scaleTarget')}</span>
              {!isRunning && (
                <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  {language === 'zh' ? '保持中' : 'HOLD'}
                </span>
              )}
            </div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight flex items-baseline">
              <span>{currentTargetWeight}</span>
              <span className="text-lg font-normal text-slate-400 ml-1 font-sans">g</span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 font-semibold px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span>{t('brew.stepAdd').replace('{water}', currentWaterToAdd.toString())}</span>
            </div>
          </div>

          {/* Right: Barista Concentric Radar Core */}
          <div className="w-18 h-18 relative flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 80 80" className="w-18 h-18">
              <circle cx="40" cy="40" r="36" className="stroke-white/[0.06] fill-none stroke-[1.2]" />
              <circle cx="40" cy="40" r="28" className="stroke-amber-500/20 fill-none stroke-[1.4]" />
              <circle cx="40" cy="40" r="20" className="stroke-amber-500/40 fill-none stroke-[1.6]" />
              
              {/* Expanding Active Radar Ring only when running */}
              {isRunning && (
                <circle cx="40" cy="40" r="35" className="stroke-amber-400/40 fill-none stroke-[1.5] animate-radar-wave" />
              )}

              {/* Inner Focus Core */}
              <circle cx="40" cy="40" r="12" className="stroke-amber-400 fill-none stroke-[2]" />
              <circle cx="40" cy="40" r="5" className={`fill-amber-400 ${isRunning ? 'animate-pulse' : ''}`} />
              <circle cx="40" cy="40" r="2.5" className="fill-amber-200" />
            </svg>
          </div>
        </motion.div>

        {/* Real-time Flow Telemetry Curve */}
        {showFlowChart && (
          <motion.div variants={telemetryVariants} className="mb-3">
            <BrewFlowChart
              stepElapsedSec={stepElapsedSec}
              stepTotalSec={stepTotalSec}
              pourTargetSec={pourTargetSec}
              waterToAdd={currentWaterToAdd}
              isPouring={isPouring}
              isWaiting={isWaiting}
              isRunning={isRunning}
              stepIndex={currentStepIndex}
            />
          </motion.div>
        )}

        {/* Barista Technique Drawer Button */}
        <motion.div variants={telemetryVariants}>
          <button
            onClick={() => setShowTechniqueModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-[#12141a] hover:bg-[#181b22] border border-white/[0.06] flex items-center justify-between text-xs text-slate-300 font-medium active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold">{t('brew.technique')}</span>
              <span className="text-slate-200 truncate">{currentStep.pourStyle || '輕柔同心圓注水'}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400 hover:text-amber-300 font-mono text-[11px]">
              <span>{t('brew.viewDetails')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </motion.div>
      </div>

      {/* Viewport Anchored Bottom Controls */}
      <motion.div variants={bottomControlsVariants} className="space-y-2.5 pt-2">
        {/* Large Primary Action Capsule Button with Distinct Paused Transformation */}
        <button
          onClick={() => {
            if (!isRunning) {
              setIsRunning(true);
            } else {
              goToNextStep();
            }
          }}
          className={`w-full py-4 rounded-full font-black text-base tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[54px] ${
            !isRunning
              ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 ring-4 ring-amber-400/40 animate-pulse shadow-amber-950/60'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
          }`}
        >
          {!isRunning ? (
            <>
              <Play className="w-5 h-5 fill-slate-950 stroke-none" />
              <span>{language === 'zh' ? `點擊繼續注水計時 · ${formatTime(isPouring ? pourRemainingSec : waitRemainingSec)}` : `Resume Brewing Timer · ${formatTime(isPouring ? pourRemainingSec : waitRemainingSec)}`}</span>
            </>
          ) : isPouring ? (
            <>
              <Droplets className="w-4 h-4 fill-current stroke-[2.5]" />
              <span>{t('brew.pourCapsule').replace('{time}', formatTime(pourRemainingSec))}</span>
            </>
          ) : isWaiting ? (
            <>
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span>{t('brew.waitCapsule').replace('{time}', formatTime(waitRemainingSec))}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>{currentStepIndex === scaledSteps.length - 1 ? t('brew.finishCapsule') : t('brew.nextCapsule')}</span>
            </>
          )}
        </button>

        {/* 3 Symmetrical Secondary Bottom Controls */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={goToPrevStep}
            disabled={currentStepIndex === 0}
            className="py-3 px-2 rounded-2xl bg-[#12141a] hover:bg-[#181b22] border border-white/[0.06] text-slate-300 disabled:opacity-30 text-xs font-bold tracking-wide active:scale-95 transition-all flex items-center justify-center"
          >
            {t('brew.prevStep')}
          </button>

          {/* Pause / Resume Button with High-Contrast Paused Highlight */}
          <button
            onClick={() => setIsRunning(r => !r)}
            className={`py-3 px-2 rounded-2xl border text-xs font-bold tracking-wide active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
              !isRunning
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 font-black shadow-lg shadow-amber-950/50'
                : 'bg-[#12141a] hover:bg-[#181b22] border-white/[0.06] text-slate-200'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{t('brew.pause')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950 stroke-none" />
                <span>{t('brew.resume')}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setStepElapsedSec(0);
              setIsRunning(true);
            }}
            className="py-3 px-2 rounded-2xl bg-[#12141a] hover:bg-[#181b22] border border-white/[0.06] text-slate-300 text-xs font-bold tracking-wide active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('brew.restartStep')}</span>
          </button>
        </div>
      </motion.div>

      {/* Barista Pouring Technique Drawer Modal */}
      {showTechniqueModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          <div className="bg-[#12141a] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">POUR TECHNIQUE</div>
                <h3 className="text-lg font-black text-slate-100">{currentStep.pourStyle || '同心向外螺旋注水'}</h3>
              </div>
              <button
                onClick={() => setShowTechniqueModal(false)}
                className="p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2 text-xs text-slate-300 leading-relaxed font-medium">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? '本段手法解析' : 'Technique Breakdown'}</span>
              </div>
              <p>
                {currentStep.description || (language === 'zh'
                  ? '維持中心垂直穩定水柱，以約每秒 4–5g 水速平緩由內向外畫同心圓，充分浸潤所有咖啡粉床，釋放極致香氣。'
                  : 'Maintain a gentle vertical stream at ~4–5g/sec in smooth concentric circles outwards, evenly saturating the coffee bed.')}
              </p>
            </div>

            <button
              onClick={() => setShowTechniqueModal(false)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
            >
              {language === 'zh' ? '我知道了 · 回到計時' : 'Got it · Return to Timer'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
