import React, { useState } from 'react';
import { BrewLogEntry, AppliedAdjustment } from '../types';
import { X, Sparkles, Star, Trash2, Save, ArrowRight, Compass, Coffee, Clock, Scale } from 'lucide-react';
import { evaluateTaste, getDescriptorList } from '../utils/evaluator';
import { updateBrewLog } from '../utils/db';
import { useLanguage } from '../utils/i18n';

interface BrewLogDetailModalProps {
  logEntry: BrewLogEntry;
  onClose: () => void;
  onSave: (updatedLog: BrewLogEntry) => void;
  onDelete: (id: string) => void;
  onApplyToNextBrew?: (adjustment: AppliedAdjustment, recipeId: string) => void;
}

export const BrewLogDetailModal: React.FC<BrewLogDetailModalProps> = ({
  logEntry,
  onClose,
  onSave,
  onDelete,
  onApplyToNextBrew,
}) => {
  const { t, language } = useLanguage();

  // Form State
  const [rating, setRating] = useState<number>(logEntry.rating || 5);
  const [beanName, setBeanName] = useState<string>(logEntry.beanName || '');
  const [dose, setDose] = useState<number>(logEntry.dose || 18);
  const [water, setWater] = useState<number>(logEntry.water || 280);
  const [actualWeight, setActualWeight] = useState<number | undefined>(logEntry.actualWeight ?? undefined);
  const [grind, setGrind] = useState<string>(logEntry.grind || '中研磨');
  const [ratio, setRatio] = useState<string>(logEntry.ratio || '1:15.5');
  const [notes, setNotes] = useState<string>(logEntry.notes || '');
  const [selectedDescriptors, setSelectedDescriptors] = useState<string[]>(
    logEntry.descriptors || []
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const availableDescriptors = getDescriptorList();
  const suggestionResult = evaluateTaste(selectedDescriptors, language);

  const toggleDescriptor = (desc: string) => {
    setSelectedDescriptors(prev =>
      prev.includes(desc) ? prev.filter(d => d !== desc) : [...prev, desc]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const fallbackText = language === 'zh' ? '風味表現極佳，維持目前參數。' : 'Excellent flavor balance, maintain current parameters.';
    const updated: BrewLogEntry = {
      ...logEntry,
      rating,
      beanName: beanName.trim() || undefined,
      dose: Number(dose) || logEntry.dose,
      water: Number(water) || logEntry.water,
      actualWeight: actualWeight !== undefined && actualWeight !== null ? Number(actualWeight) : undefined,
      grind: grind.trim() || logEntry.grind,
      ratio: ratio.trim() || logEntry.ratio,
      notes: notes.trim() || undefined,
      descriptors: selectedDescriptors,
      suggestion: suggestionResult?.text || fallbackText,
    };

    await updateBrewLog(updated);
    setIsSaving(false);
    onSave(updated);
  };

  const handleSaveAndApply = async () => {
    await handleSave();
    if (onApplyToNextBrew && suggestionResult) {
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

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (language === 'zh') {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        return `${y}年${m}月${d}日 ${h}:${min}`;
      } else {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      return isoStr;
    }
  };

  const formatDuration = (totalSec?: number) => {
    if (!totalSec) return '--';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto select-none">
      <div className="bg-[#12141a] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in duration-150 text-slate-100">
        {/* Header Bar */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              <Coffee className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '編輯沖煮紀錄' : 'EDIT BREW RECORD'}</span>
            </div>
            <h2 className="text-xl font-black text-white font-sans">
              {logEntry.recipeName}
            </h2>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formatDate(logEntry.timestamp)} · {logEntry.method}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Rating Selector */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {language === 'zh' ? '杯測評分 (Rating)' : 'Cupping Rating'}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">{rating}.0 / 5.0</span>
          </div>

          <div className="flex items-center justify-center gap-3 py-1">
            {[1, 2, 3, 4, 5].map((starVal) => (
              <button
                key={starVal}
                type="button"
                onClick={() => setRating(starVal)}
                className="p-1.5 rounded-xl hover:bg-white/[0.06] active:scale-125 transition-all text-amber-400"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    starVal <= rating
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'text-slate-600 fill-transparent'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 2. Bean Name & Origin */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            {language === 'zh' ? '咖啡豆名稱 / 產區 (Bean Origin)' : 'Coffee Bean / Origin'}
          </label>
          <input
            type="text"
            value={beanName}
            onChange={(e) => setBeanName(e.target.value)}
            placeholder={language === 'zh' ? '例如：衣索比亞 耶加雪菲 水洗 G1' : 'e.g. Ethiopia Yirgacheffe Washed G1'}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-amber-400 text-xs font-medium text-slate-100 placeholder-slate-600 outline-none transition-colors"
          />
        </div>

        {/* 3. Extraction Numerical Parameters Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Dose */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">
              {language === 'zh' ? '粉量 (Dose)' : 'Dose (g)'}
            </label>
            <input
              type="number"
              value={dose}
              onChange={(e) => setDose(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] focus:border-amber-400 text-xs font-mono font-bold text-slate-100 outline-none"
            />
          </div>

          {/* Water */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">
              {language === 'zh' ? '總水量 (Water)' : 'Water (g)'}
            </label>
            <input
              type="number"
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] focus:border-amber-400 text-xs font-mono font-bold text-amber-400 outline-none"
            />
          </div>

          {/* Duration Display */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">
              {language === 'zh' ? '萃取時長' : 'Duration'}
            </label>
            <div className="px-3 py-2 rounded-xl bg-black/20 border border-white/[0.04] text-xs font-mono font-bold text-slate-300">
              {formatDuration(logEntry.durationSec)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Grind Size */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">
              {language === 'zh' ? '研磨刻度 (Grind)' : 'Grind Size'}
            </label>
            <input
              type="text"
              value={grind}
              onChange={(e) => setGrind(e.target.value)}
              placeholder="中幼研磨"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] focus:border-amber-400 text-xs font-medium text-slate-100 outline-none"
            />
          </div>

          {/* Ratio */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">
              {language === 'zh' ? '粉水比 (Ratio)' : 'Ratio'}
            </label>
            <input
              type="text"
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              placeholder="1:15.5"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] focus:border-amber-400 text-xs font-mono font-bold text-slate-100 outline-none"
            />
          </div>
        </div>

        {/* 4. Flavor Descriptors Tag Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">
            {language === 'zh' ? '風味與口感特徵 (Flavor Attributes)' : 'Flavor & Extraction Attributes'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableDescriptors.map((desc) => {
              const isSelected = selectedDescriptors.includes(desc);
              return (
                <button
                  key={desc}
                  type="button"
                  onClick={() => toggleDescriptor(desc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
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

        {/* 5. Barista Dial-In Recommendation */}
        {selectedDescriptors.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
              <Compass className="w-3.5 h-3.5" />
              <span>{t('eval.baristaAdvice')}</span>
            </div>
            <p className="text-xs font-bold text-white leading-relaxed">
              {suggestionResult ? suggestionResult.text : (language === 'zh' ? '這杯表現非常平衡！建議維持目前研磨度與注水比例。' : 'Well balanced! Maintain current grind and ratio.')}
            </p>
          </div>
        )}

        {/* 6. Tasting Notes Textarea */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            {language === 'zh' ? '品飲筆記 (Tasting Memo)' : 'Tasting Memo & Cupping Notes'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={language === 'zh' ? '記錄這壺咖啡的花果香氣、酸質細緻度或尾韻...' : 'Describe floral aromas, acidity brightness, body, or sweet finish...'}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-amber-400 text-xs text-slate-100 placeholder-slate-600 outline-none resize-none"
          />
        </div>

        {/* 7. Delete Confirmation Section */}
        {showDeleteConfirm ? (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-center animate-in fade-in">
            <p className="text-xs font-bold text-rose-300">
              {language === 'zh' ? '確定要永久刪除此筆沖煮紀錄嗎？' : 'Permanently delete this brew record?'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-white/[0.08] text-slate-300 text-xs font-bold hover:bg-white/[0.12] transition-colors"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(logEntry.id)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg"
              >
                {language === 'zh' ? '確認刪除' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        ) : null}

        {/* 8. Action Buttons Bottom */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            {/* Safe In-App Delete Button */}
            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/[0.08] hover:border-rose-500/30 active:scale-95 transition-all flex items-center justify-center"
                title={language === 'zh' ? '刪除此筆紀錄' : 'Delete Record'}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            {/* Save Changes Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? (language === 'zh' ? '正在儲存...' : 'Saving...') : (language === 'zh' ? '儲存修改' : 'Save Changes')}</span>
            </button>
          </div>

          {/* Optional: Apply to Next Brew */}
          {onApplyToNextBrew && (
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="w-full py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-amber-300 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>{t('eval.applyBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
