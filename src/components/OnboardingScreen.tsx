import React, { useState } from 'react';
import { ChevronRight, Coffee, Leaf, Timer, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onboardingSlides } from '../data/onboardingSlides';
import { useLanguage } from '../utils/i18n';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  Leaf,
  Timer,
  TrendingUp,
};

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = onboardingSlides[currentSlide];
  const IconComponent = iconMap[slide.icon] || Coffee;
  const isLastSlide = currentSlide === onboardingSlides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <div className="w-full min-h-dvh flex flex-col justify-between pb-8 pt-4 select-none font-sans text-[#f0eeeb]">
      <div className="flex justify-end px-4">
        <button
          onClick={onComplete}
          className="px-4 py-2 rounded-full text-xs font-bold text-[#f0eeeb]/40 hover:text-white transition-colors duration-300"
        >
          {language === 'zh' ? '略過' : 'Skip'}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto"
              style={{ boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.08), 0 4px 24px rgba(245, 158, 11, 0.15)' }}>
              <IconComponent className="w-10 h-10 text-amber-400" />
            </div>

            <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {language === 'zh' ? slide.title : slide.titleEn}
            </h2>

            <p className="text-sm text-[#f0eeeb]/60 leading-relaxed max-w-sm mx-auto">
              {language === 'zh' ? slide.description : slide.descriptionEn}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 space-y-6">
        <div className="flex items-center justify-center gap-2">
          {onboardingSlides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlide ? 'w-8 bg-amber-400' : 'w-1.5 bg-white/15'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0a0a08] font-black text-sm tracking-wide active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2"
          style={{ transitionTimingFunction: 'var(--ease-spring)', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)' }}
        >
          <span>{isLastSlide ? (language === 'zh' ? '開始使用' : 'Get Started') : (language === 'zh' ? '下一步' : 'Next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
