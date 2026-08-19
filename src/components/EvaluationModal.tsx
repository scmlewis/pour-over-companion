import React, { useState } from 'react';
import { BrewLogEntry, AppliedAdjustment } from '../types';
import { X, Sparkles, ArrowRight, Compass } from 'lucide-react';
import { evaluateTaste, getDescriptorList } from '../utils/evaluator';
import { updateBrewLog } from '../utils/db';
import { useLanguage } from '../utils/i18n';

interface EvaluationModalProps {
  logEntry: BrewLogEntry;
  onClose: () => void;
  onApplyToNextBrew: (adjustment: AppliedAdjustment, recipeId: string) => void;
  onSaved: (updatedLog: BrewLogEntry) => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  logEntry,
  onClose,
  onApplyToNextBrew,
  onSaved,
}) => {
  const { t, language } = useLanguage();
  const [selectedDescriptors, setSelectedDescriptors] = useState<string[]>(
    logEntry.descriptors || []
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const availableDescriptors = getDescriptorList();
  const suggestionResult = evaluateTaste(selectedDescriptors, language);

  const toggleDescriptor = (desc: string) => {
    setSelectedDescriptors(prev =>
      prev.includes(desc) ? prev.filter(d => d !== desc) : [...prev, desc]
    );
  };

  const handleSaveAndApply = async () => {
    setIsSaving(true);
    const fallbackText = language === 'zh' ? '風味表現極佳，維持目前參數。' : 'Excellent flavor balance, maintain current parameters.';
    const updated: BrewLogEntry = {
      ...logEntry,
      descriptors: selectedDescriptors,
      suggestion: suggestionResult?.text || fallbackText,
    };

    await updateBrewLog(updated);
    setIsSaving(false);
    onSaved(updated);

    if (suggestionResult) {
      onApplyToNextBrew(
        {
          recipeId: logEntry.recipeId,
          ...suggestionResult.adjust,
          textSummary: suggestionResult.text,
        },
        logEntry.recipeId
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto select-none">
      <div className="bg-[#12141a] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('eval.subtitle')}</span>
            </div>
            <h2 className="text-xl font-black text-white font-sans">
              {t('eval.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Brew Context */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs text-slate-300">
          <div>
            <span className="font-bold text-white">{logEntry.recipeName}</span>
            <span className="text-amber-400/90 ml-2 font-mono">({logEntry.dose}g · 1:{logEntry.ratio} · {logEntry.grind})</span>
          </div>
          {logEntry.beanName && (
            <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{logEntry.beanName}</span>
          )}
        </div>

        {/* Descriptor Chips Selector */}
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-2">
            {t('eval.selectFlavor')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableDescriptors.map((desc) => {
              const isSelected = selectedDescriptors.includes(desc);
              return (
                <button
                  key={desc}
                  type="button"
                  onClick={() => toggleDescriptor(desc)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-white/[0.03] text-slate-300 border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  {desc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rule Engine Suggestion Outcome */}
        {selectedDescriptors.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
              <Compass className="w-4 h-4" />
              <span>{t('eval.baristaAdvice')}</span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">
              {suggestionResult ? suggestionResult.text : (language === 'zh' ? '這杯表現非常平衡！建議維持目前研磨度與注水比例。' : 'Well balanced! Maintain current grind and ratio.')}
            </p>
            {suggestionResult?.rationale && (
              <p className="text-xs text-slate-300 pt-1 leading-relaxed border-t border-amber-500/20">
                {suggestionResult.rationale}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleSaveAndApply}
            disabled={isSaving}
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[54px]"
          >
            <span>{t('eval.applyBtn')}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
