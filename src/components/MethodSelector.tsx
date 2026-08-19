import React, { useState } from 'react';
import { ChevronLeft, Plus, Coffee } from 'lucide-react';
import { motion } from 'motion/react';
import { Recipe } from '../types';
import { useLanguage } from '../utils/i18n';

interface MethodSelectorProps {
  recipes: Recipe[];
  selectedRecipe: Recipe;
  onBack: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onContinue: (recipe: Recipe) => void;
  onCreateCustomRecipe: () => void;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const MethodSelector: React.FC<MethodSelectorProps> = ({
  recipes, selectedRecipe, onBack, onSelectRecipe, onContinue, onCreateCustomRecipe,
}) => {
  const { t, language } = useLanguage();
  const [currentSelected, setCurrentSelected] = useState<Recipe>(selectedRecipe);

  const handleCardClick = (recipe: Recipe) => {
    setCurrentSelected(recipe);
    onSelectRecipe(recipe);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-0 select-none space-y-5 font-sans text-[#f0eeeb]">
      <div>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#0a0a08]/95 backdrop-blur-xl py-3 mb-3 -mx-4 px-4 border-b border-white/[0.04] flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center text-[#f0eeeb]/40 hover:text-white hover:bg-white/5 active:scale-90 transition-all duration-500"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" />
          </button>
          <div className="text-center">
            <div className="eyebrow mb-1">
              <span>{t('methods.title')}</span>
            </div>
            <h2 className="text-base font-black text-[#f0eeeb]/80 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {language === 'zh' ? '選擇沖煮食譜' : 'SELECT RECIPE'}
            </h2>
          </div>
          <button
            onClick={onCreateCustomRecipe}
            className="w-9 h-9 rounded-full bg-[#141311] border border-white/[0.06] flex items-center justify-center text-amber-400 hover:text-white active:scale-90 transition-all duration-500"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Recipe Cards — Double-Bezel */}
        <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3 mb-4">
          {recipes.map((recipe) => {
            const isSelected = currentSelected.id === recipe.id;
            const rName = language === 'zh' ? recipe.name : (recipe.nameEn || recipe.name);
            const rReason = language === 'zh' ? recipe.reason : (recipe.reasonEn || recipe.reason);
            const rSource = language === 'zh' ? recipe.source : (recipe.sourceEn || recipe.source);

            return (
              <motion.div
                key={recipe.id}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(recipe)}
                className={`cursor-pointer transition-all duration-500 relative ${
                  isSelected
                    ? 'bezel-card ring-1 ring-amber-500/30'
                    : 'bezel-card hover:ring-1 hover:ring-white/[0.08]'
                }`}
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="space-y-0.5">
                      <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <Coffee className="w-3 h-3 text-amber-500" />
                        <span>{recipe.method} · {rSource}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                        {rName}
                      </h3>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all duration-500 ${
                        isSelected
                          ? 'bg-amber-500 text-[#0a0a08] border-amber-500'
                          : 'bg-white/[0.03] text-[#f0eeeb]/40 border-white/[0.05]'
                      }`}
                    >
                      {isSelected ? t('methods.selected') : t('methods.selectThis')}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-2 rounded-2xl bg-black/30 text-center font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-[#f0eeeb]/40">{t('methods.dose')}</div>
                      <div className="text-[#f0eeeb] font-bold">{recipe.dose}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#f0eeeb]/40">{t('methods.water')}</div>
                      <div className="text-[#f0eeeb] font-bold">{recipe.water}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#f0eeeb]/40">{t('methods.temp')}</div>
                      <div className="text-amber-400 font-bold">{recipe.temp}°C</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#f0eeeb]/40">{t('methods.stages')}</div>
                      <div className="text-[#f0eeeb] font-bold">{recipe.stagesCount} {language === 'zh' ? '段' : 'stages'}</div>
                    </div>
                  </div>

                  <p className="text-xs text-[#f0eeeb]/50 leading-relaxed font-medium">
                    {rReason}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Custom Recipe Trigger */}
        <button
          onClick={onCreateCustomRecipe}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#0f0e0c] hover:bg-[#141311] border border-dashed border-amber-500/25 hover:border-amber-400/50 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-500"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          <Plus className="w-4 h-4" />
          <span>{t('methods.createCustom')}</span>
        </button>
      </div>

      {/* CTA — Button-in-Button */}
      <div className="pt-2">
        <button onClick={() => onContinue(currentSelected)} className="btn-primary">
          <span>{t('methods.continueBtn').replace('{name}', currentSelected.name)}</span>
          <span className="btn-icon-nest">
            <ChevronLeft className="w-4 h-4 rotate-180 stroke-[3]" />
          </span>
        </button>
      </div>
    </div>
  );
};
