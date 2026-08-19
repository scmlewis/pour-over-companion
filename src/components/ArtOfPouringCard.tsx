import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, Droplets } from 'lucide-react';
import { ASSETS } from '../assets';
import { useLanguage } from '../utils/i18n';

interface PourTechnique {
  id: string;
  nameZh: string;
  nameEn: string;
  enSub: string;
  flowRateZh: string;
  flowRateEn: string;
  idealForZh: string;
  idealForEn: string;
  descriptionZh: string;
  descriptionEn: string;
  image: string;
  tagZh: string;
  tagEn: string;
}

const POUR_TECHNIQUES: PourTechnique[] = [
  {
    id: 'spiral',
    nameZh: '同心向外螺旋注水',
    nameEn: 'Concentric Spiral Pour',
    enSub: 'CONCENTRIC SPIRAL',
    flowRateZh: '4.2 – 4.8 g/s 柔和垂直水柱',
    flowRateEn: '4.2 – 4.8 g/s Gentle Stream',
    idealForZh: '淺焙花香、柑橘果酸豆（衣索比亞、肯亞）',
    idealForEn: 'Light roast floral & berry notes (Ethiopia, Kenya)',
    descriptionZh: '由中心向外緩慢擴展 1–2 圈後收回，均勻浸潤粉層邊緣，最大化展現花香與明亮果酸層次。',
    descriptionEn: 'Expand outwards in 1–2 gentle circles from the center and back, evenly wetting the coffee bed for maximum floral vibrancy.',
    image: ASSETS.pourSpiral,
    tagZh: '果酸花香首選',
    tagEn: 'Floral & Acidity',
  },
  {
    id: 'center',
    nameZh: '中心定點深層脈衝',
    nameEn: 'Center Pulse Deep Pour',
    enSub: 'CENTER PULSE',
    flowRateZh: '3.5 – 4.0 g/s 低擾動柱流',
    flowRateEn: '3.5 – 4.0 g/s Low Turbulence',
    idealForZh: '中深焙、厚實甜感與可可堅果韻（曼特寧）',
    idealForEn: 'Medium-dark roast, chocolate & nut sweetness (Sumatra)',
    descriptionZh: '水柱始終精準注於中心硬幣大小區域，藉由中心垂直滲透對流萃取核心甘甜，減少邊緣苦澀。',
    descriptionEn: 'Pour strictly into a coin-sized center area. Vertical osmosis draws out deep caramelized sweetness while avoiding wall astringency.',
    image: ASSETS.pourCenter,
    tagZh: '醇厚甜感聚焦點',
    tagEn: 'Sweet & Heavy Body',
  },
  {
    id: 'circular',
    nameZh: '恆速漣漪連續注水',
    nameEn: 'Continuous Osmotic Wave',
    enSub: 'CONTINUOUS OSMOTIC',
    flowRateZh: '4.8 – 5.2 g/s 恆速平穩流',
    flowRateEn: '4.8 – 5.2 g/s Steady Flow',
    idealForZh: '中焙水洗豆、追求極致風味平衡的日常手沖',
    idealForEn: 'Medium roast washed coffees for golden cup balance',
    descriptionZh: '保持壺嘴高度 10cm 恆速繞圈，維持粉層液面高低差與滲透壓，獲得金杯萃取標準的平衡甜潤。',
    descriptionEn: 'Maintain constant kettle height of 10cm with steady circular cadence to preserve optimal hydraulic pressure and balance.',
    image: ASSETS.pourCircular,
    tagZh: '金杯黃金平衡',
    tagEn: 'Golden Cup Balance',
  },
];

export const ArtOfPouringCard: React.FC = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % POUR_TECHNIQUES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const current = POUR_TECHNIQUES[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + POUR_TECHNIQUES.length) % POUR_TECHNIQUES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % POUR_TECHNIQUES.length);
  };

  return (
    <div
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] shadow-xl space-y-3 relative overflow-hidden group select-none"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'zh' ? 'ART OF POURING · 注水美學' : 'ART OF POURING · TECHNIQUE'}</span>
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center gap-1.5">
          {POUR_TECHNIQUES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Image Frame with Ambient Backdrop */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-white/[0.06] bg-black group/image">
        <img
          src={current.image}
          alt={language === 'zh' ? current.nameZh : current.nameEn}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
        />

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

        {/* Tag Pill on Image */}
        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/[0.1] text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
          <Droplets className="w-3 h-3 text-amber-400" />
          <span>{language === 'zh' ? current.tagZh : current.tagEn}</span>
        </div>

        {/* Arrow Navigation Controls on Image */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white flex items-center justify-center opacity-75 group-hover/image:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white flex items-center justify-center opacity-75 group-hover/image:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Bottom Floating Title on Image */}
        <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none">
          <div className="text-[10px] font-mono text-amber-400/90 tracking-wider">
            {current.enSub}
          </div>
          <h3 className="text-base font-extrabold text-white tracking-tight">
            {language === 'zh' ? current.nameZh : current.nameEn}
          </h3>
        </div>
      </div>

      {/* Description & Barista Extraction Specs */}
      <div className="space-y-2 text-xs">
        <p className="text-slate-300 leading-relaxed font-medium">
          {language === 'zh' ? current.descriptionZh : current.descriptionEn}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/[0.06] text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/[0.05]">
            <span className="text-amber-400 font-bold">{language === 'zh' ? '流速建議:' : 'Flow Rate:'}</span>
            <span className="text-slate-200">{language === 'zh' ? current.flowRateZh : current.flowRateEn}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/[0.05]">
            <span className="text-amber-400 font-bold">{language === 'zh' ? '最適豆種:' : 'Best For:'}</span>
            <span className="text-slate-200 truncate">{language === 'zh' ? current.idealForZh : current.idealForEn}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
