import React, { useState } from 'react';
import { ChevronLeft, MessageCircle, RefreshCw, Sparkles, Droplets, Coffee } from 'lucide-react';
import { Recipe, BeanInfo } from '../types';
import { useLanguage } from '../utils/i18n';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  beanInfo?: BeanInfo | null;
  onBack: () => void;
  onChooseOtherMethod: () => void;
  onUseRecipe: () => void;
  onUpdateRatio?: (ratio: string, water: number) => void;
}

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipe,
  beanInfo,
  onBack,
  onChooseOtherMethod,
  onUseRecipe,
}) => {
  const { t, language } = useLanguage();

  const ratioPresets = [
    { ratio: '1:14', label: language === 'zh' ? '濃厚飽滿 (1:14)' : 'Rich & Bold (1:14)', multiplier: 14 },
    { ratio: '1:15', label: language === 'zh' ? '金杯黃金 (1:15)' : 'Golden Cup (1:15)', multiplier: 15 },
    { ratio: '1:15.5', label: language === 'zh' ? '細緻平衡 (1:15.5)' : 'Balanced & Sweet (1:15.5)', multiplier: 15.5 },
    { ratio: '1:16', label: language === 'zh' ? '明亮花香 (1:16)' : 'Floral & Bright (1:16)', multiplier: 16 },
    { ratio: '1:16.5', label: language === 'zh' ? '極致清爽 (1:16.5)' : 'Light & Clean (1:16.5)', multiplier: 16.5 },
  ];

  const [selectedRatio, setSelectedRatio] = useState<string>(recipe.ratio);
  const [dose, setDose] = useState<number>(recipe.dose);

  const activeRatioConfig = ratioPresets.find(p => p.ratio === selectedRatio) || {
    ratio: recipe.ratio,
    label: recipe.ratio,
    multiplier: parseFloat(recipe.ratio.replace('1:', '')) || 15.5,
  };

  const calculatedWater = Math.round(dose * activeRatioConfig.multiplier);

  const handleShareWhatsApp = () => {
    const text = language === 'zh'
      ? `☕️ 【精品手沖咖啡食譜】\n沖煮方法：${recipe.name}\n${beanInfo ? `咖啡豆：${beanInfo.name} (${beanInfo.roastLevel})\n風味：${beanInfo.flavorNotes.join(' · ')}\n` : ''}萃取參數：粉量 ${dose}g | 總注水 ${calculatedWater}g (比例 ${selectedRatio})\n萃取水溫：${recipe.temp}°C | 研磨度：${recipe.grind}\n段數：${recipe.stagesCount} 段 | 目標時間：${recipe.targetTimeRange}\n萃取心法：${recipe.reason}`
      : `☕️ [Specialty Pour-Over Recipe]\nMethod: ${recipe.name}\n${beanInfo ? `Bean: ${beanInfo.name} (${beanInfo.roastLevel})\nNotes: ${beanInfo.flavorNotes.join(' · ')}\n` : ''}Parameters: Dose ${dose}g | Water ${calculatedWater}g (Ratio ${selectedRatio})\nWater Temp: ${recipe.temp}°C | Grind: ${recipe.grind}\nStages: ${recipe.stagesCount} | Target Time: ${recipe.targetTimeRange}\nExtraction Insight: ${recipe.reason}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
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
              {t('recipe.details')}
            </h2>
          </div>
          <span className="w-8" />
        </div>

        {/* Selected Method Label & Title */}
        <div className="mb-3 px-1">
          <div className="text-xs text-amber-400 font-mono font-medium mb-0.5">
            {recipe.source} · {recipe.method}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {recipe.name}
          </h1>
          {beanInfo && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-amber-300 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{beanInfo.name} ({beanInfo.roastLevel.split(' ')[0]})</span>
            </div>
          )}
        </div>

        {/* Top Wide Ratio & Weight Card with Barista Ratio Tuner */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 shadow-xl space-y-3">
          <div className="grid grid-cols-3 divide-x divide-white/[0.06] text-center">
            <div className="px-2">
              <div className="text-[11px] text-slate-400 font-medium">{t('prep.coffeeGround')}</div>
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight mt-0.5">
                {dose} <span className="text-xs font-normal text-slate-400">g</span>
              </div>
            </div>

            <div className="px-2">
              <div className="text-[11px] text-slate-400 font-medium">{t('prep.totalWater')}</div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono tracking-tight mt-0.5">
                {calculatedWater} <span className="text-xs font-normal text-slate-400">g</span>
              </div>
            </div>

            <div className="px-2">
              <div className="text-[11px] text-slate-400 font-medium">{t('prep.ratio')}</div>
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight mt-0.5">
                {selectedRatio}
              </div>
            </div>
          </div>

          {/* Quick Ratio Tuner Chips */}
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
              <span>{language === 'zh' ? '風味濃度比調校：' : 'Ratio Calibration:'}</span>
              <span className="text-amber-400 font-semibold">{activeRatioConfig.label}</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {ratioPresets.map((preset) => (
                <button
                  key={preset.ratio}
                  onClick={() => setSelectedRatio(preset.ratio)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all ${
                    selectedRatio === preset.ratio
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                  }`}
                >
                  {preset.ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Animated Parameter Cards */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Card 1: Water Temp */}
          <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.06] shadow-md space-y-2 group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">{t('methods.temp')}</span>
              <span className="text-[10px] text-amber-500 font-mono font-bold">OPTIMAL</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-extrabold font-mono text-white">
                {recipe.temp} <span className="text-sm font-normal text-slate-400">°C</span>
              </div>
              <div className="w-12 h-10 relative flex items-center justify-center">
                <svg viewBox="0 0 50 30" className="w-full h-full">
                  <path d="M 6,26 A 19,19 0 0,1 44,26" className="stroke-white/[0.08] fill-none stroke-[3.5] stroke-linecap-round" />
                  <path d="M 6,26 A 19,19 0 0,1 36,11" className="stroke-amber-400 fill-none stroke-[3.5] stroke-linecap-round animate-gauge-glow" />
                  <circle cx="25" cy="26" r="2.5" className="fill-slate-400" />
                  <circle cx="36" cy="11" r="2" className="fill-amber-300 animate-ping" />
                  <circle cx="36" cy="11" r="2" className="fill-amber-400" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Grind Size */}
          <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.06] shadow-md space-y-2 group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">{t('recipe.grind')}</span>
              <span className="text-[10px] text-amber-500 font-mono font-bold">BURR</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-base font-extrabold text-white font-sans truncate">
                {recipe.grind}
              </div>
              <div className="w-10 h-10 relative flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <circle cx="20" cy="20" r="17" className="stroke-white/[0.08] fill-none stroke-[1.5]" />
                  <g className="animate-burr-spin">
                    <circle cx="20" cy="20" r="11" className="stroke-amber-500 fill-none stroke-[1.8] stroke-dasharray-[4,3]" />
                  </g>
                  <g className="animate-burr-spin-reverse">
                    <circle cx="20" cy="20" r="6" className="stroke-slate-600 fill-none stroke-[1.2] stroke-dasharray-[3,2]" />
                  </g>
                  <circle cx="20" cy="20" r="2" className="fill-amber-400" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Pour Stages */}
          <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.06] shadow-md space-y-2 group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">{t('recipe.stages')}</span>
              <span className="text-[10px] text-amber-500 font-mono font-bold">PULSES</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-extrabold font-mono text-white">
                {recipe.stagesCount} <span className="text-xs font-normal text-slate-400">{language === 'zh' ? '段' : 'stages'}</span>
              </div>
              <div className="w-10 h-10 relative flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <circle cx="20" cy="20" r="16" className="stroke-amber-400/50 fill-none stroke-[1.2] animate-radar-wave" />
                  <circle cx="20" cy="20" r="15" className="stroke-white/[0.08] fill-none stroke-[1.2]" />
                  <circle cx="20" cy="20" r="9" className="stroke-amber-500 fill-none stroke-[1.5]" />
                  <circle cx="20" cy="20" r="3" className="fill-amber-400 animate-pulse" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 4: Target Time */}
          <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.06] shadow-md space-y-2 group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">{t('recipe.targetTime')}</span>
              <span className="text-[10px] text-amber-500 font-mono font-bold">TIME</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold font-mono text-white">
                {recipe.targetTimeRange}
              </div>
              <div className="w-10 h-10 relative flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <polygon points="9,6 31,6 23,20 17,20" className="stroke-slate-400 fill-none stroke-[1.6] stroke-linejoin-round" />
                  <line x1="13" y1="11" x2="27" y2="11" className="stroke-amber-700/60 stroke-[1.2] stroke-dasharray-[2,1]" />
                  <g className="animate-coffee-drip">
                    <circle cx="20" cy="22" r="1.6" className="fill-amber-400" />
                  </g>
                  <line x1="16" y1="36" x2="24" y2="36" className="stroke-slate-700 stroke-[1.2] stroke-linecap-round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Barista Flow & Technique Rationale Card */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 space-y-1.5 shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '風味萃取心法與流速建議' : 'Extraction Insight & Flow Guidance'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {recipe.reason}
          </p>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-white/[0.06] flex items-center gap-2">
            <Droplets className="w-3 h-3 text-amber-400" />
            <span>{language === 'zh' ? '建議注水流速：4–5 g/秒 垂直柔和水柱 · 離粉面約 8–10 cm' : 'Recommended flow: 4–5 g/s gentle stream ~8–10cm above bed'}</span>
          </div>
        </div>

        {/* 2 Middle Action Buttons */}
        <div className="space-y-2 mb-3">
          {/* WhatsApp Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#12141a] hover:bg-[#181b22] border border-white/[0.06] text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>{language === 'zh' ? '傳送豆資料及沖法到 WhatsApp' : 'Share Recipe to WhatsApp'}</span>
          </button>

          {/* Choose Other Method Button */}
          <button
            onClick={onChooseOtherMethod}
            className="w-full py-3 px-4 rounded-2xl bg-[#12141a] hover:bg-[#181b22] border border-white/[0.06] text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('recipe.chooseOther')}</span>
          </button>
        </div>
      </div>

      {/* Large Bottom Primary Button */}
      <div className="pt-2">
        <button
          onClick={onUseRecipe}
          className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[54px]"
        >
          <Coffee className="w-5 h-5 stroke-[2.5]" />
          <span>{t('recipe.useThis')}</span>
        </button>
      </div>
    </div>
  );
};
