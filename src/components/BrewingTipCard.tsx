import React, { useState } from 'react';
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react';
import { COFFEE_TIPS, CoffeeTip } from '../data/coffeeTips';
import { useLanguage } from '../utils/i18n';

export const BrewingTipCard: React.FC = () => {
  const { language } = useLanguage();
  const [tipIndex, setTipIndex] = useState<number>(() => {
    const day = new Date().getDate();
    return (day - 1) % COFFEE_TIPS.length;
  });

  const [isRotating, setIsRotating] = useState<boolean>(false);
  const currentTip: CoffeeTip = COFFEE_TIPS[tipIndex] || COFFEE_TIPS[0];

  const handleNextTip = () => {
    setIsRotating(true);
    setTimeout(() => {
      setTipIndex(prev => (prev + 1) % COFFEE_TIPS.length);
      setIsRotating(false);
    }, 150);
  };

  return (
    <div className="relative rounded-3xl bg-[#12141a] border border-white/[0.08] p-4 shadow-xl overflow-hidden group">
      {/* Background Subtle Radial Accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
          <div className="w-5 h-5 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400">
            <Lightbulb className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span className="tracking-wider">{language === 'zh' ? '每日手沖心法 · TIP OF THE DAY' : 'BARISTA BREWING TIP'}</span>
        </div>

        {/* Shuffle / Next Tip Button */}
        <button
          onClick={handleNextTip}
          title={language === 'zh' ? '換下一個心法' : 'Next Tip'}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-mono font-bold text-slate-300 hover:text-amber-300 active:scale-95 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3 h-3 text-amber-400 ${isRotating ? 'animate-spin' : ''}`} />
          <span>{tipIndex + 1}/{COFFEE_TIPS.length}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`space-y-2 relative z-10 transition-opacity duration-200 ${isRotating ? 'opacity-40' : 'opacity-100'}`}>
        {/* Category Subhead & Tag */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-amber-300 uppercase">
            {language === 'zh' ? currentTip.categoryLabelZh : currentTip.categoryLabelEn}
          </span>
          <span className="text-[10px] text-slate-400 font-medium font-sans">
            {language === 'zh' ? currentTip.tagZh : currentTip.tagEn}
          </span>
        </div>

        {/* Tip Title */}
        <h3 className="text-base font-black text-white font-sans tracking-tight leading-snug">
          {language === 'zh' ? currentTip.titleZh : currentTip.titleEn}
        </h3>

        {/* Detailed Insight Body */}
        <p className="text-xs text-slate-300/90 leading-relaxed font-medium">
          {language === 'zh' ? currentTip.insightZh : currentTip.insightEn}
        </p>

        {/* Barista Actionable Golden Rule Callout */}
        <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.05] flex items-start gap-2 text-[11px] text-amber-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="leading-tight">{language === 'zh' ? currentTip.baristaRuleZh : currentTip.baristaRuleEn}</span>
        </div>
      </div>

      {/* Pagination Progress Dots */}
      <div className="flex items-center justify-center gap-1 pt-3">
        {COFFEE_TIPS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setTipIndex(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === tipIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
