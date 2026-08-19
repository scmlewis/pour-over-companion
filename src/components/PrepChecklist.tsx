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
  recipe, dose, ratio, totalWater, grind, scaledSteps, onBack, onStartBrew,
}) => {
  const { t, language } = useLanguage();
  const [advanceMode, setAdvanceMode] = useState<'manual' | 'auto'>('manual');
  const displayGrind = language === 'zh' ? grind : (recipe.grindEn || grind);

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
    `Weigh and grind specialty beans (${dose}g · ${displayGrind})`,
    'Rinse paper filter thoroughly with hot water',
    'Pre-heat dripper and glass decanter for thermal stability',
    'Discard rinse water from decanter',
    'Add coffee grounds and gently tap to level the bed',
    'Place dripper on scale and Tare to zero (0.0g)',
  ];

  const [checkedState, setCheckedState] = useState<boolean[]>(new Array(checklistItems.length).fill(false));

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
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-1 select-none space-y-5 font-sans text-[#f0eeeb]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between py-1 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#f0eeeb]/40 hover:text-white hover:bg-white/5 active:scale-90 transition-all duration-500"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" />
          </button>
          <div className="text-center">
            <div className="eyebrow mb-1">
              <span>{t('prep.title')}</span>
            </div>
            <h2 className="text-base font-bold text-[#f0eeeb]/80 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {language === 'zh' ? '沖煮前準備' : 'PRE-BREW SETUP'}
            </h2>
          </div>
          <span className="w-8" />
        </div>

        {/* Parameters Grid — Double-Bezel */}
        <div className="bezel-card mb-4">
          <div className="p-4 space-y-3">
            <div className="text-xs text-[#f0eeeb]/40 font-medium flex items-center justify-between">
              <span className="text-amber-400 font-mono font-bold">{t('prep.specs')}</span>
              <span className="text-[#f0eeeb]/60">{language === 'zh' ? recipe.name : (recipe.nameEn || recipe.name)}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
              <div className="p-2.5 rounded-2xl bg-black/30">
                <div className="text-[10px] text-[#f0eeeb]/40">{t('prep.coffeeGround')}</div>
                <div className="text-base font-extrabold text-white mt-0.5">{dose}g</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-black/30">
                <div className="text-[10px] text-[#f0eeeb]/40">{t('prep.totalWater')}</div>
                <div className="text-base font-extrabold text-amber-400 mt-0.5">{totalWater}g</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-black/30">
                <div className="text-[10px] text-[#f0eeeb]/40">{t('prep.ratio')}</div>
                <div className="text-base font-extrabold text-white mt-0.5">{ratio}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-black/30">
                <div className="text-[10px] text-[#f0eeeb]/40">{t('prep.waterTemp')}</div>
                <div className="text-base font-extrabold text-amber-400 mt-0.5">{recipe.temp}°C</div>
              </div>
            </div>
          </div>
        </div>

        {/* Advance Mode — Double-Bezel */}
        <div className="bezel-card mb-4">
          <div className="p-4 space-y-3">
            <div className="text-xs text-[#f0eeeb]/60 font-bold">
              {t('prep.advanceMode')}
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/40">
              <button
                onClick={() => setAdvanceMode('manual')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-500 ${
                  advanceMode === 'manual'
                    ? 'bg-amber-500 text-[#0a0a08]'
                    : 'text-[#f0eeeb]/40 hover:text-[#f0eeeb]/70'
                }`}
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              >
                {t('prep.manualMode')}
              </button>
              <button
                onClick={() => setAdvanceMode('auto')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-500 ${
                  advanceMode === 'auto'
                    ? 'bg-amber-500 text-[#0a0a08]'
                    : 'text-[#f0eeeb]/40 hover:text-[#f0eeeb]/70'
                }`}
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              >
                {t('prep.autoMode')}
              </button>
            </div>
            <p className="text-[11px] text-[#f0eeeb]/40">
              {advanceMode === 'manual' ? t('prep.manualDesc') : t('prep.autoDesc')}
            </p>
          </div>
        </div>

        {/* Checklist — Double-Bezel */}
        <div className="bezel-card mb-4">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#f0eeeb]/60 flex items-center gap-1.5">
                <span>{t('prep.checklist')}</span>
                <span className="font-mono text-amber-400">
                  ({checkedCount.toString().padStart(2, '0')} / {checklistItems.length.toString().padStart(2, '0')})
                </span>
              </div>
              <button
                onClick={handleToggleAll}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors duration-300"
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
                    className={`p-3 rounded-2xl cursor-pointer transition-all duration-500 flex items-center gap-3 ${
                      isChecked
                        ? 'bg-amber-500/8 text-amber-200 border border-amber-500/20'
                        : 'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] text-[#f0eeeb]/70'
                    }`}
                    style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        isChecked
                          ? 'bg-amber-500 text-[#0a0a08]'
                          : 'border border-[#f0eeeb]/20'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs font-medium leading-relaxed ${isChecked ? 'line-through opacity-50' : ''}`}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Equipment Tips */}
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/[0.03] text-[11px] text-[#f0eeeb]/40 space-y-1.5">
          <div className="font-bold text-[#f0eeeb]/60 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('prep.waterQuality')}</span>
          </div>
          <p>{t('prep.requiredEquipment')}：{language === 'zh' ? (recipe.equipment?.join(' · ') || 'V60 濾杯 · 濾紙 · 分享壺 · 手沖壺 · 電子秤') : (recipe.equipmentEn?.join(' · ') || 'V60 Dripper · Filter Paper · Carafe · Gooseneck Kettle · Scale')}</p>
        </div>
      </div>

      {/* CTA — Button-in-Button */}
      <div className="pt-2">
        <button id="prep-start-brew-button" onClick={() => onStartBrew(advanceMode)} className="btn-primary">
          <span>{t('prep.startBrew')}</span>
          <span className="btn-icon-nest">
            <Coffee className="w-4 h-4 stroke-[2.5]" />
          </span>
        </button>
      </div>
    </div>
  );
};
