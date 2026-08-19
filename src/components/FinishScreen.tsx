import React, { useState } from 'react';
import { Recipe, BrewLogEntry, BeanInfo } from '../types';
import { Star, Check, Compass } from 'lucide-react';
import { saveBrewLog } from '../utils/db';
import { useLanguage } from '../utils/i18n';

interface FinishScreenProps {
  recipe: Recipe;
  dose: number;
  ratio: string;
  totalWater: number;
  grind: string;
  durationSec: number;
  beanInfo?: BeanInfo | null;
  onSaved: (log: BrewLogEntry) => void;
  onEvaluateNow: (log: BrewLogEntry) => void;
}

export const FinishScreen: React.FC<FinishScreenProps> = ({
  recipe,
  dose,
  ratio,
  totalWater,
  grind,
  durationSec,
  beanInfo,
  onSaved,
  onEvaluateNow,
}) => {
  const { t, language } = useLanguage();
  const [rating, setRating] = useState<number>(5);
  const [actualWeight, setActualWeight] = useState<number>(totalWater);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const deviation = actualWeight - totalWater;

  const handleSave = async (evaluateImmediately = false) => {
    setIsSaving(true);
    const newEntry: BrewLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      recipeId: recipe.id,
      recipeName: recipe.name,
      method: recipe.method,
      beanName: beanInfo?.name,
      dose,
      water: totalWater,
      ratio,
      grind,
      temp: recipe.temp,
      rating,
      actualWeight,
      deviation,
      descriptors: null,
      suggestion: null,
      notes: notes.trim() || null,
      durationSec,
    };

    await saveBrewLog(newEntry);
    setIsSaving(false);

    if (evaluateImmediately) {
      onEvaluateNow(newEntry);
    } else {
      onSaved(newEntry);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-1 select-none space-y-4 font-sans text-slate-100">
      <div>
        {/* Top Header */}
        <div className="text-center py-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-2 shadow-xl shadow-emerald-950/40">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <div className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">EXTRACTION COMPLETE</div>
          <h1 className="text-2xl font-black text-white mt-0.5">
            {t('finish.completeTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            {t('finish.totalDuration').replace('{time}', formatTime(durationSec))}
          </p>
        </div>

        {/* Summary Metric Card */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-xl">
          <div className="text-xs text-amber-400 font-mono font-bold mb-2">{t('finish.summaryTitle')}</div>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.05]">
              <div className="text-[11px] text-slate-400">{t('prep.coffeeGround')}</div>
              <div className="text-base font-extrabold text-white">{dose}g</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.05]">
              <div className="text-[11px] text-slate-400">{t('prep.totalWater')}</div>
              <div className="text-base font-extrabold text-amber-400">{totalWater}g</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.05]">
              <div className="text-[11px] text-slate-400">{t('methods.temp')}</div>
              <div className="text-base font-extrabold text-white">{recipe.temp}°C</div>
            </div>
          </div>
        </div>

        {/* Rating Stepper */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-lg">
          <div className="text-xs text-slate-300 font-bold mb-2">{t('finish.cuppingScore')}</div>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-2 rounded-2xl transition-all active:scale-90"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-700 hover:text-slate-500'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Physical Scale Actual Weight Deviation */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-bold">{t('finish.actualScale')}</span>
            <span className={`text-xs font-mono font-bold ${deviation === 0 ? 'text-slate-400' : deviation > 0 ? 'text-amber-400' : 'text-sky-400'}`}>
              {deviation === 0 ? t('finish.exactMatch') : deviation > 0 ? `+${deviation}g` : `${deviation}g`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActualWeight(w => Math.max(50, w - 5))}
              className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-200 font-bold text-base flex items-center justify-center active:scale-95"
            >
              -
            </button>
            <div className="text-2xl font-extrabold font-mono text-white">
              {actualWeight} <span className="text-sm font-normal text-slate-400 font-sans">g</span>
            </div>
            <button
              type="button"
              onClick={() => setActualWeight(w => w + 5)}
              className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-200 font-bold text-base flex items-center justify-center active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick Notes */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-lg">
          <label className="text-xs text-slate-300 font-bold block mb-2">{t('finish.tastingNotes')}</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('finish.tastingPlaceholder')}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-black/40 border border-white/[0.06] text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[54px]"
        >
          <Compass className="w-4 h-4" />
          <span>{t('finish.diagnoseBtn')}</span>
        </button>

        <button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="w-full py-3.5 rounded-full bg-[#12141a] hover:bg-[#181b22] border border-white/[0.06] text-slate-300 font-bold text-xs active:scale-[0.99] transition-all"
        >
          {t('finish.saveToHistory')}
        </button>
      </div>
    </div>
  );
};
