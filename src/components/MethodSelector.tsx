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
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const MethodSelector: React.FC<MethodSelectorProps> = ({
  recipes,
  selectedRecipe,
  onBack,
  onSelectRecipe,
  onContinue,
  onCreateCustomRecipe,
}) => {
  const { t, language } = useLanguage();
  const [currentSelected, setCurrentSelected] = useState<Recipe>(selectedRecipe);

  const handleCardClick = (recipe: Recipe) => {
    setCurrentSelected(recipe);
    onSelectRecipe(recipe);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-0 select-none space-y-4 font-sans text-slate-100">
      <div>
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-30 bg-[#0d0b09]/95 backdrop-blur-md py-2.5 mb-2 -mx-4 px-4 border-b border-white/[0.06] flex items-center justify-between shadow-md">
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-black text-slate-200 tracking-tight">
              {t('methods.title')}
            </h2>
          </div>
          <button
            onClick={onCreateCustomRecipe}
            className="w-9 h-9 rounded-full bg-[#161311] border border-white/[0.08] flex items-center justify-center text-amber-400 hover:text-white active:scale-95 transition-all shadow-sm"
            title={t('app.customRecipe')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Recipe Cards List with Staggered Entrance */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 mb-3"
        >
          {recipes.map((recipe) => {
            const isSelected = currentSelected.id === recipe.id;
            const rName = language === 'zh' ? recipe.name : (recipe.nameEn || recipe.name);
            const rReason = language === 'zh' ? recipe.reason : (recipe.reasonEn || recipe.reason);
            const rSource = language === 'zh' ? recipe.source : (recipe.sourceEn || recipe.source);

            return (
              <motion.div
                key={recipe.id}
                variants={itemVariants}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleCardClick(recipe)}
                className={`p-4 rounded-3xl cursor-pointer transition-all border relative shadow-lg ${
                  isSelected
                    ? 'bg-[#181412] border-amber-500/80 shadow-amber-950/20 ring-1 ring-amber-500/30'
                    : 'bg-[#14110f] hover:bg-[#1a1614] border-white/[0.06]'
                }`}
              >
                {/* Title & Tag */}
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                      <Coffee className="w-3 h-3 text-amber-500" />
                      <span>{recipe.method} · {rSource}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white font-sans">
                      {rName}
                    </h3>
                  </div>

                  {/* Selection badge */}
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-white/[0.04] text-slate-400 border-white/[0.06]'
                    }`}
                  >
                    {isSelected ? t('methods.selected') : t('methods.selectThis')}
                  </span>
                </div>

                {/* Parameters Pill Grid */}
                <div className="grid grid-cols-4 gap-1 p-2 rounded-2xl bg-black/40 border border-white/[0.05] text-center my-2 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">{t('methods.dose')}</div>
                    <div className="text-slate-100 font-bold">{recipe.dose}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">{t('methods.water')}</div>
                    <div className="text-slate-100 font-bold">{recipe.water}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">{t('methods.temp')}</div>
                    <div className="text-amber-400 font-bold">{recipe.temp}°C</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">{t('methods.stages')}</div>
                    <div className="text-slate-100 font-bold">{recipe.stagesCount} {language === 'zh' ? '段' : 'stages'}</div>
                  </div>
                </div>

                {/* Flavor Rationale */}
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {rReason}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Custom Recipe Quick Trigger */}
        <button
          onClick={onCreateCustomRecipe}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#14110f] hover:bg-[#1a1614] border border-dashed border-amber-500/40 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('methods.createCustom')}</span>
        </button>
      </div>

      {/* Sticky Bottom Action Button */}
      <div className="pt-2">
        <button
          onClick={() => onContinue(currentSelected)}
          className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[54px]"
        >
          <span>{t('methods.continueBtn').replace('{name}', currentSelected.name)}</span>
          <ChevronLeft className="w-4 h-4 rotate-180 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
