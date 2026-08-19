import React, { useState } from 'react';
import { ChevronLeft, Check, Coffee, Droplet } from 'lucide-react';
import { Recipe, RecipeStep } from '../types';
import { useLanguage } from '../utils/i18n';

interface PrepChecklistProps {
  recipe: Recipe;
  dose: number;
  ratio: string;
  totalWater: number;
  grind: string;
  scaledSteps: RecipeStep[];
  onBack: () => void;
  onStartBrew: (advanceMode: 'auto' | 'manual') => void;
}

export const PrepChecklist: React.FC<PrepChecklistProps> = ({
  recipe,
  dose,
  ratio,
  totalWater,
  grind,
  scaledSteps,
  onBack,
  onStartBrew,
}) => {
  const { t, language } = useLanguage();
  const [advanceMode, setAdvanceMode] = useState<'manual' | 'auto'>('manual');
  
  const checklistItems = language === 'zh' ? [
    `將手沖水加熱至指定水溫 (${recipe.temp}°C)`,
    `量取精品咖啡豆並研磨 (${dose}g · ${grind})`,
    '放妥濾紙並以熱水完全潤濕洗去紙漿味',
    '徹底預熱濾杯與玻璃分享壺，提升萃取溫控',
    '倒乾分享壺內的洗紙預熱用水',
    '倒入研磨咖啡粉，輕拍濾杯整平粉床表面',
    '放上電子磅並將重量與計時器歸零 (Tare)',
  ] : [
    `Heat brew water to specified temp (${recipe.temp}°C)`,
    `Weigh and grind specialty beans (${dose}g · ${grind})`,
    'Rinse paper filter thoroughly with hot water',
    'Pre-heat dripper and glass decanter for thermal stability',
    'Discard rinse water from decanter',
    'Add coffee grounds and gently tap to level the bed',
    'Place dripper on scale and Tare to zero (0.0g)',
  ];

  const [checkedState, setCheckedState] = useState<boolean[]>(
    new Array(checklistItems.length).fill(false)
  );

  const toggleCheck = (index: number) => {
    setCheckedState(prev => prev.map((val, i) => (i === index ? !val : val)));
  };

  const handleToggleAll = () => {
    const areAllChecked = checkedState.every(Boolean);
    setCheckedState(new Array(checklistItems.length).fill(!areAllChecked));
  };

  const checkedCount = checkedState.filter(Boolean).length;
  const isAllChecked = checkedCount === checklistItems.length;

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
              {t('prep.title')}
            </h2>
          </div>
          <span className="w-8" />
        </div>

        {/* 4 Key Numerical Parameters Grid Card */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-xl space-y-3">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span className="text-amber-400 font-mono font-bold">{t('prep.specs')}</span>
            <span className="text-slate-300">{language === 'zh' ? recipe.name : (recipe.nameEn || recipe.name)}</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.05]">
              <div className="text-[10px] text-slate-400">{t('prep.coffeeGround')}</div>
              <div className="text-base font-extrabold text-white mt-0.5">{dose}g</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.05]">
              <div className="text-[10px] text-slate-400">{t('prep.totalWater')}</div>
              <div className="text-base font-extrabold text-amber-400 mt-0.5">{totalWater}g</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.05]">
              <div className="text-[10px] text-slate-400">{t('prep.ratio')}</div>
              <div className="text-base font-extrabold text-white mt-0.5">{ratio}</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.05]">
              <div className="text-[10px] text-slate-400">{t('prep.waterTemp')}</div>
              <div className="text-base font-extrabold text-amber-400 mt-0.5">{recipe.temp}°C</div>
            </div>
          </div>
        </div>

        {/* Step Advance Mode Switcher Card */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-md space-y-2">
          <div className="text-xs text-slate-300 font-bold">
            {t('prep.advanceMode')}
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/50 border border-white/[0.06]">
            <button
              onClick={() => setAdvanceMode('manual')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                advanceMode === 'manual'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('prep.manualMode')}
            </button>
            <button
              onClick={() => setAdvanceMode('auto')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                advanceMode === 'auto'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('prep.autoMode')}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            {advanceMode === 'manual' ? t('prep.manualDesc') : t('prep.autoDesc')}
          </p>
        </div>

        {/* Checklist Container */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>{t('prep.checklist')}</span>
              <span className="font-mono text-amber-400">
                ({checkedCount.toString().padStart(2, '0')} / {checklistItems.length.toString().padStart(2, '0')})
              </span>
            </div>
            <button
              onClick={handleToggleAll}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              {isAllChecked ? t('prep.uncheckAll') : t('prep.checkAll')}
            </button>
          </div>

          <div className="space-y-1.5">
            {checklistItems.map((item, idx) => {
              const isChecked = checkedState[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] flex items-center gap-3 ${
                    isChecked
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/[0.05] text-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-amber-500 text-slate-950'
                        : 'border border-slate-600'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className={`text-xs font-medium leading-relaxed ${isChecked ? 'line-through opacity-70' : ''}`}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipment & Water Quality Tips */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] text-[11px] text-slate-400 space-y-1">
          <div className="font-bold text-slate-300 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('prep.waterQuality')}</span>
          </div>
          <p>{t('prep.requiredEquipment')}：{language === 'zh' ? (recipe.equipment?.join(' · ') || 'V60 濾杯 · 濾紙 · 分享壺 · 手沖壺 · 電子秤') : (recipe.equipmentEn?.join(' · ') || 'V60 Dripper · Filter Paper · Carafe · Gooseneck Kettle · Scale')}</p>
        </div>
      </div>

      {/* Large Bottom Pill Button: 開始沖煮 */}
      <div className="pt-2">
        <button
          id="prep-start-brew-button"
          onClick={() => onStartBrew(advanceMode)}
          className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[54px]"
        >
          <Coffee className="w-5 h-5 stroke-[2.5]" />
          <span>{t('prep.startBrew')}</span>
        </button>
      </div>
    </div>
  );
};
