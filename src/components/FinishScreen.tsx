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
  recipe, dose, ratio, totalWater, grind, durationSec, beanInfo, onSaved, onEvaluateNow,
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
      dose, water: totalWater, ratio, grind,
      temp: recipe.temp,
      rating, actualWeight, deviation,
      descriptors: null, suggestion: null,
      notes: notes.trim() || null,
      durationSec,
    };
    await saveBrewLog(newEntry);
    setIsSaving(false);
    if (evaluateImmediately) onEvaluateNow(newEntry);
    else onSaved(newEntry);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-1 select-none space-y-5 font-sans text-[#f0eeeb]" style={{ paddingBottom: 'calc(var(--sab, env(safe-area-inset-bottom)) + 1.5rem)' }}>
      <div>
        {/* Header */}
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 mx-auto flex items-center justify-center mb-3"
            style={{ boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.08), 0 4px 24px rgba(16, 185, 129, 0.15)' }}>
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {t('finish.completeTitle')}
          </h1>
          <p className="text-xs text-[#f0eeeb]/40 mt-1 font-mono">
            {t('finish.totalDuration').replace('{time}', formatTime(durationSec))}
          </p>
        </div>

        {/* Summary + Rating — Combined */}
        <div className="bezel-card mb-4">
          <div className="p-4 space-y-3">
            <div className="text-xs text-amber-400 font-mono font-bold">{t('finish.summaryTitle')}</div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-2xl bg-black/30">
                <div className="text-[11px] text-[#f0eeeb]/40">{t('prep.coffeeGround')}</div>
                <div className="text-base font-extrabold text-white">{dose}g</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-black/30">
                <div className="text-[11px] text-[#f0eeeb]/40">{t('prep.totalWater')}</div>
                <div className="text-base font-extrabold text-amber-400">{totalWater}g</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-black/30">
                <div className="text-[11px] text-[#f0eeeb]/40">{t('methods.temp')}</div>
                <div className="text-base font-extrabold text-white">{recipe.temp}°C</div>
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.05]">
              <div className="text-xs text-[#f0eeeb]/60 font-bold mb-2">{t('finish.cuppingScore')}</div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-2 rounded-2xl active:scale-90 transition-all duration-500"
                    style={{ transitionTimingFunction: 'var(--ease-spring-bounce)' }}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors duration-300 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[#f0eeeb]/15 hover:text-[#f0eeeb]/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weight Deviation — Double-Bezel */}
        <div className="bezel-card mb-4">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#f0eeeb]/60 font-bold">{t('finish.actualScale')}</span>
              <span className={`text-xs font-mono font-bold ${deviation === 0 ? 'text-[#f0eeeb]/40' : deviation > 0 ? 'text-amber-400' : 'text-sky-400'}`}>
                {deviation === 0 ? t('finish.exactMatch') : deviation > 0 ? `+${deviation}g` : `${deviation}g`}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActualWeight(w => Math.max(50, w - 5))}
                className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-[#f0eeeb]/70 font-bold text-base flex items-center justify-center active:scale-90 transition-all duration-500"
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              >
                -
              </button>
              <div className="text-2xl font-extrabold font-mono text-white">
                {actualWeight} <span className="text-sm font-normal text-[#f0eeeb]/40 font-sans">g</span>
              </div>
              <button
                type="button"
                onClick={() => setActualWeight(w => w + 5)}
                className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-[#f0eeeb]/70 font-bold text-base flex items-center justify-center active:scale-90 transition-all duration-500"
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Tasting Notes — Double-Bezel */}
        <div className="bezel-card mb-4">
          <div className="p-4 space-y-2">
            <label className="text-xs text-[#f0eeeb]/60 font-bold block">{t('finish.tastingNotes')}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('finish.tastingPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/30 border border-white/[0.04] text-xs text-[#f0eeeb] focus:outline-none focus:border-amber-500/50 font-medium placeholder-[#f0eeeb]/20 transition-colors duration-500"
            />
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-2.5 pt-1">
        <button onClick={() => handleSave(true)} disabled={isSaving} className="btn-primary">
          <span>{t('finish.diagnoseBtn')}</span>
          <span className="btn-icon-nest">
            <Compass className="w-4 h-4" />
          </span>
        </button>

        <button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="w-full py-3.5 rounded-full bg-[#141311] hover:bg-[#1a1816] border border-white/[0.04] text-[#f0eeeb]/60 font-bold text-xs active:scale-[0.98] transition-all duration-500"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          {t('finish.saveToHistory')}
        </button>
      </div>
    </div>
  );
};
