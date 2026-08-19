import React, { useState, useMemo } from 'react';
import { Recipe, AppliedAdjustment, RecipeStep } from '../types';
import { ChevronLeft, Sparkles, Scale, Droplets, SlidersHorizontal, Check, Coffee, ChevronRight } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface SetupScreenProps {
  recipe: Recipe;
  appliedAdjustment: AppliedAdjustment | null;
  onBack: () => void;
  onProceedToPrep: (config: {
    dose: number;
    ratio: string;
    totalWater: number;
    grind: string;
    scaledSteps: RecipeStep[];
  }) => void;
}

const GRIND_OPTIONS = [
  { id: 'fine', label: 'Fine (細研磨)', hint: '摩卡壺 / 愛樂壓' },
  { id: 'medium-fine', label: 'Medium-Fine (中細研磨)', hint: '標準 V60 / 摺紙濾杯' },
  { id: 'medium', label: 'Medium (中度研磨)', hint: '梯形濾杯 / 聰明濾杯' },
  { id: 'medium-coarse', label: 'Medium-Coarse (中粗研磨)', hint: 'Chemex / 冰滴' },
  { id: 'coarse', label: 'Coarse (粗研磨)', hint: '法壓壺 / 冷萃' },
];

const COMMON_RATIOS = ['1:14', '1:15', '1:15.5', '1:16', '1:16.5'];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  recipe,
  appliedAdjustment,
  onBack,
  onProceedToPrep,
}) => {
  const { t, language } = useLanguage();
  const initialDose = useMemo(() => {
    let d = recipe.dose;
    if (appliedAdjustment?.doseOffset) {
      d += appliedAdjustment.doseOffset;
    }
    return Math.max(8, Math.min(60, d));
  }, [recipe, appliedAdjustment]);

  const initialRatio = appliedAdjustment?.ratio || recipe.ratio;
  const initialGrind = appliedAdjustment?.grind || recipe.grind;

  const [dose, setDose] = useState<number>(initialDose);
  const [ratio, setRatio] = useState<string>(initialRatio);
  const [grind, setGrind] = useState<string>(initialGrind);

  const ratioMultiplier = useMemo(() => {
    const parts = ratio.replace('1:', '').trim();
    const val = parseFloat(parts);
    return isNaN(val) || val <= 0 ? 15.5 : val;
  }, [ratio]);

  const totalWater = useMemo(() => {
    return Math.round(dose * ratioMultiplier);
  }, [dose, ratioMultiplier]);

  const scaledSteps = useMemo(() => {
    const originalMaxTarget = recipe.steps
      .filter(s => s.targetWeight !== undefined)
      .reduce((max, s) => Math.max(max, s.targetWeight || 0), 0);

    const baseWater = originalMaxTarget > 0 ? originalMaxTarget : (recipe.dose * 15.5);
    const scalingFactor = totalWater / baseWater;

    return recipe.steps.map(step => {
      let stepDuration = step.durationSec;
      if (step.type === 'bloom' && appliedAdjustment?.bloomSecOffset) {
        stepDuration = Math.max(20, stepDuration + appliedAdjustment.bloomSecOffset);
      }

      if (step.targetWeight === undefined) {
        return { ...step, durationSec: stepDuration };
      }

      const scaledTarget = Math.round(step.targetWeight * scalingFactor);
      return {
        ...step,
        targetWeight: scaledTarget,
        durationSec: stepDuration,
      };
    });
  }, [recipe, totalWater, appliedAdjustment]);

  const adjustDose = (delta: number) => {
    setDose(prev => {
      const next = Math.round((prev + delta) * 2) / 2;
      return Math.max(8, Math.min(60, next));
    });
  };

  const handleStart = () => {
    onProceedToPrep({
      dose,
      ratio,
      totalWater,
      grind,
      scaledSteps,
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-1 select-none space-y-4 font-sans text-slate-100">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between py-1 mb-2">
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-200 tracking-tight">
              {language === 'zh' ? '沖煮參數微調' : 'Recipe Parameter Tuning'}
            </h2>
          </div>
          <span className="w-8" />
        </div>

        {/* Applied Adjustment Banner if any */}
        {appliedAdjustment && (
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-amber-500/30 flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-amber-300">已自動套用日誌風味校正建議</div>
              <p className="text-slate-300 mt-0.5 leading-relaxed">{appliedAdjustment.textSummary}</p>
            </div>
          </div>
        )}

        {/* Primary Dose Stepper Card */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300 font-sans">咖啡粉量</span>
            </div>
            <span className="text-xs font-mono text-slate-500">單位：公克 (g)</span>
          </div>

          {/* Stepper with big numbers */}
          <div className="flex items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/[0.06]">
            <button
              id="dose-minus-btn"
              onClick={() => adjustDose(-1)}
              className="w-12 h-12 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-90 transition-all flex items-center justify-center text-slate-200 text-2xl font-bold border border-white/[0.08]"
            >
              -
            </button>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-white tracking-tight font-mono">
                {dose}<span className="text-base text-amber-400 font-sans ml-1 font-normal">g</span>
              </div>
              <span className="text-[11px] text-slate-400">現磨精品咖啡粉</span>
            </div>
            <button
              id="dose-plus-btn"
              onClick={() => adjustDose(1)}
              className="w-12 h-12 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-90 transition-all flex items-center justify-center text-slate-200 text-2xl font-bold border border-white/[0.08]"
            >
              +
            </button>
          </div>

          {/* Quick Dose presets */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {[12, 15, 18, 20, 24].map((preset) => (
              <button
                key={preset}
                onClick={() => setDose(preset)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  dose === preset
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                }`}
              >
                {preset}g
              </button>
            ))}
          </div>
        </div>

        {/* Ratio & Total Water Live Calculator */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-300">粉水比例與總注水</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-bold text-amber-400">{totalWater}g</span>
              <span className="text-[11px] text-slate-500 ml-1">總水</span>
            </div>
          </div>

          {/* Ratio Chips */}
          <div className="grid grid-cols-5 gap-1.5">
            {COMMON_RATIOS.map((r) => {
              const isSelected = ratio === r;
              return (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center border ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                      : 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:bg-white/[0.08]'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grind Size Preset Chips */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">研磨刻度配置</span>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold">{grind}</span>
          </div>

          <div className="space-y-1.5">
            {GRIND_OPTIONS.map((g) => {
              const isSelected = grind === g.id || grind.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => setGrind(g.id)}
                  className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/70 text-slate-100'
                      : 'bg-white/[0.03] border-white/[0.05] text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-200">{g.label}</div>
                    <div className="text-[10px] text-slate-500">{g.hint}</div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Button */}
      <div className="pt-2">
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[54px]"
        >
          <span>進入沖煮準備清單</span>
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
