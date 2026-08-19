import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, Volume2, VolumeX, ChevronRight, Pause, Play, Sparkles, Droplets, Clock, X, RotateCcw, Activity } from 'lucide-react';
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
  const [showFlowChart, setShowFlowChart] = useState<boolean>(true);
  const [showTechnique, setShowTechnique] = useState<boolean>(true);

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
      className="w-full h-full flex flex-col pb-3 pt-0 select-none font-sans text-[#f0eeeb] relative overflow-hidden"
    >
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden -mx-4 px-4 pb-2 space-y-2">

        {/* Sticky Top Header */}
        <motion.div variants={headerVariants} className="sticky top-0 z-30 bg-[#0a0a08] py-2 mb-1 -mx-4 px-4 border-b border-white/[0.04] flex items-center justify-between sticky-header-ios">
          <button
            onClick={onCancelBrew}
            className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center text-[#f0eeeb]/40 hover:text-white hover:bg-white/5 active:scale-90 transition-all duration-500"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
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
            className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#f0eeeb]/40 hover:text-white active:scale-90 transition-all duration-500"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
            title={soundEnabled ? t('brew.soundOn') : t('brew.soundMuted')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>
        </motion.div>

        {/* Compact Step Bar + Segmented Progress */}
        <motion.div variants={stepIndicatorVariants}>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/8 border border-amber-500/15 text-[11px] font-mono font-bold text-amber-300">
              <span>{t('brew.step')} {(currentStepIndex + 1).toString().padStart(2, '0')} / {scaledSteps.length.toString().padStart(2, '0')}</span>
              <span className="text-amber-500/50">·</span>
              <span className="text-[#f0eeeb]/80">{language === 'zh' ? currentStep.label : (currentStep.labelEn || currentStep.label)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#f0eeeb]/40">
              <span>{language === 'zh' ? '累計' : 'Total'}</span>
              <span className={`font-bold ${isRunning ? 'text-amber-400' : 'text-amber-300'}`}>{formatTime(elapsedTotalSec)}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {scaledSteps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const stepProgressPercent = isCurrent
                ? Math.min(100, Math.round((stepElapsedSec / (step.durationSec || 30)) * 100))
                : isCompleted ? 100 : 0;
              const sLabel = language === 'zh' ? step.label : (step.labelEn || step.label);
              return (
                <div key={idx}>
                  <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-amber-500'
                          : isCurrent ? isRunning ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'bg-amber-400'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${stepProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[8px] font-mono px-0.5 mt-0.5">
                    <span className={`truncate ${isCurrent ? 'text-amber-300 font-bold' : isCompleted ? 'text-[#f0eeeb]/30' : 'text-[#f0eeeb]/20'}`}>{sLabel}</span>
                    <span className={`${isCurrent ? 'text-amber-400' : 'text-[#f0eeeb]/20'}`}>{step.durationSec}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Hero Timer + Scale Target — Merged Single Card */}
        <motion.div
          variants={timerCardVariants}
          onClick={() => !isRunning && setIsRunning(true)}
          className={`p-3 rounded-2xl transition-all duration-500 relative overflow-hidden ${
            !isRunning
              ? 'bg-gradient-to-b from-[#1c1814] to-[#12100d] border-2 border-amber-400/70 ring-4 ring-amber-500/15 cursor-pointer'
              : 'bg-[#0f0e0c] border border-white/[0.05]'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-spring)', boxShadow: !isRunning ? '0 4px 24px rgba(245, 158, 11, 0.12)' : '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          {/* Paused Badge */}
          {!isRunning && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-[#0a0a08] font-mono text-[9px] font-black z-20">
              <Pause className="w-2.5 h-2.5 fill-[#0a0a08]" />
              <span>PAUSED · TAP TO RESUME</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Left: Big Timer */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono font-medium flex items-center gap-1 mb-0.5">
                <Clock className={`w-3 h-3 ${!isRunning ? 'text-amber-300' : 'text-amber-400'}`} />
                <span className={!isRunning ? 'text-amber-300 font-bold' : 'text-[#f0eeeb]/40'}>
                  {!isRunning ? 'FROZEN' : isPouring ? 'POUR COUNTDOWN' : 'STEP TIMER'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={formatTime(stepElapsedSec)}
                    initial={{ opacity: 0.78, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.78, scale: 1.02 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className={`text-5xl sm:text-6xl font-black font-mono tracking-tighter tabular-nums leading-none ${
                      !isRunning ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {isPouring ? formatTime(pourRemainingSec) : formatTime(stepElapsedSec)}
                  </motion.div>
                </AnimatePresence>
                {!isRunning && (
                  <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-400 text-[#0a0a08] uppercase">PAUSE</span>
                )}
              </div>
            </div>

            {/* Right: Scale Target */}
            <div className="text-right shrink-0 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2">
              <div className="text-[10px] text-amber-400/80 font-mono font-bold uppercase tracking-wider">{t('brew.scaleTarget')}</div>
              <div className="text-3xl font-black font-mono text-amber-300 leading-none mt-1">
                {currentTargetWeight}<span className="text-sm font-bold text-amber-400/60 ml-0.5">g</span>
              </div>
              <div className="text-[11px] font-mono text-amber-400 font-bold mt-1">
                +{currentWaterToAdd}g
              </div>
              <div className="text-[9px] text-[#f0eeeb]/30 font-mono mt-0.5">{recipe.targetTimeRange}</div>
            </div>
          </div>

          {/* Inline Action Line */}
          <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              {!isRunning ? (
                <span className="text-amber-300">⏸ {language === 'zh' ? '暫停中' : 'PAUSED'}</span>
              ) : isPouring ? (
                <span className="text-amber-400">● {language === 'zh' ? '注水' : 'POURING'} · {currentWaterToAdd}g → {currentTargetWeight}g</span>
              ) : isWaiting ? (
                <span className="text-amber-400">● {language === 'zh' ? '滴濾中' : 'DRAWDOWN'}</span>
              ) : (
                <span className="text-amber-400">✓ {language === 'zh' ? '本段完成' : 'STEP DONE'}</span>
              )}
            </span>
            <span className="text-[10px] font-mono text-[#f0eeeb]/30">
              {advanceMode === 'auto' ? 'AUTO' : 'MANUAL'}
            </span>
          </div>
        </motion.div>

        {/* Technique — Expandable Description */}
        <motion.div variants={telemetryVariants}>
          <button
            onClick={() => setShowTechnique(s => !s)}
            className="w-full py-2 px-3 rounded-xl bg-[#0f0e0c] hover:bg-[#141311] border border-white/[0.04] flex items-center justify-between text-[11px] text-[#f0eeeb]/40 font-medium active:scale-[0.98] transition-all duration-500 mb-1.5"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="shrink-0">{t('brew.technique')}</span>
              <span className="text-[#f0eeeb]/60 truncate">{language === 'zh' ? (currentStep.pourStyle || '輕柔同心圓注水') : (currentStep.pourStyleEn || 'Gentle concentric pour')}</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 text-[#f0eeeb]/30 transition-transform duration-500 shrink-0 ${showTechnique ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {showTechnique && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-[#0f0e0c] border border-white/[0.04] mb-1.5">
                  <p className="text-xs text-[#f0eeeb]/70 leading-relaxed">
                    {language === 'zh' ? (currentStep.pourStyle || '輕柔同心圓注水，確保粉床均勻萃取。') : (currentStep.pourStyleEn || 'Gentle concentric pour ensuring even extraction across the coffee bed.')}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Flow Rate Telemetry — Toggle */}
        <motion.div variants={telemetryVariants}>
          <button
            onClick={() => setShowFlowChart(f => !f)}
            className="w-full py-2 px-3 rounded-xl bg-[#0f0e0c] hover:bg-[#141311] border border-white/[0.04] flex items-center justify-between text-[11px] text-[#f0eeeb]/40 font-medium active:scale-[0.98] transition-all duration-500 mb-1.5"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'zh' ? '流速遙測' : 'Flow Rate Telemetry'}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono font-bold border border-amber-500/20">
                {isRunning ? (isPouring ? (language === 'zh' ? '注水中' : 'Pouring') : (language === 'zh' ? '等待中' : 'Ready')) : (language === 'zh' ? '暫停' : 'Paused')}
              </span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 text-[#f0eeeb]/30 transition-transform duration-500 ${showFlowChart ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {showFlowChart && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
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
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Viewport Anchored Bottom Controls — Fixed at bottom, never scrolls */}
      <motion.div variants={bottomControlsVariants} className="space-y-2 pt-2 shrink-0">
        {/* Large Primary Action Button */}
          <button
            onClick={() => {
              if (!isRunning) {
                setIsRunning(true);
              } else {
                goToNextStep();
              }
            }}
            className={`w-full py-3.5 rounded-full font-black text-base tracking-wide active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 min-h-[50px] ${
              !isRunning
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-[#0a0a08] ring-4 ring-amber-400/30 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0a0a08]'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-spring)', boxShadow: !isRunning ? '0 4px 24px rgba(245, 158, 11, 0.3)' : '0 4px 16px rgba(245, 158, 11, 0.25)' }}
          >
          {!isRunning ? (
            <>
              <Play className="w-5 h-5 fill-[#0a0a08] stroke-none" />
              <span>{language === 'zh' ? `繼續 · ${formatTime(isPouring ? pourRemainingSec : waitRemainingSec)}` : `Resume · ${formatTime(isPouring ? pourRemainingSec : waitRemainingSec)}`}</span>
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

        {/* 3 Compact Secondary Controls */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={goToPrevStep}
            disabled={currentStepIndex === 0}
            className="py-2.5 px-2 rounded-xl bg-[#0f0e0c] hover:bg-[#141311] border border-white/[0.04] text-[#f0eeeb]/70 disabled:opacity-30 text-xs font-bold tracking-wide active:scale-95 transition-all duration-500 flex items-center justify-center"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            {t('brew.prevStep')}
          </button>

          <button
            onClick={() => setIsRunning(r => !r)}
            className={`py-2.5 px-2 rounded-xl border text-xs font-bold tracking-wide active:scale-95 transition-all duration-500 flex items-center justify-center gap-1.5 ${
              !isRunning
                ? 'bg-amber-400 text-[#0a0a08] border-amber-300 ring-2 ring-amber-400/40 font-black'
                : 'bg-[#0f0e0c] hover:bg-[#141311] border-white/[0.04] text-[#f0eeeb]/80'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#0a0a08] fill-[#0a0a08]" />
                <span>{t('brew.pause')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-[#0a0a08] stroke-none" />
                <span>{t('brew.resume')}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setStepElapsedSec(0);
              setIsRunning(true);
            }}
            className="py-2.5 px-2 rounded-xl bg-[#0f0e0c] hover:bg-[#141311] border border-white/[0.04] text-[#f0eeeb]/70 text-xs font-bold tracking-wide active:scale-95 transition-all duration-500 flex items-center justify-center gap-1"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#f0eeeb]/40" />
            <span>{t('brew.restartStep')}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
