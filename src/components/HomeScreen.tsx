import React, { useState, useRef, useEffect } from 'react';
import { Camera, List, ChevronRight, ChevronLeft, Sparkles, Coffee, Flame, Compass, Play, Droplets, BookOpen, Globe, Plus, Edit2, Star, Zap, Sliders } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Recipe, BrewLogEntry, BeanInfo } from '../types';
import sampleBeans from '../data/sampleBeans.json';
import defaultRecipesData from '../data/recipes.json';
import { ASSETS } from '../assets';
import { CustomBeanModal } from './CustomBeanModal';
import { useLanguage } from '../utils/i18n';

interface HomeScreenProps {
  logs: BrewLogEntry[];
  selectedRecipe: Recipe;
  allRecipes?: Recipe[];
  customBeans?: BeanInfo[];
  onSelectRecipe?: (recipe: Recipe) => void;
  onScan: () => void;
  onBrowseMethods: () => void;
  onViewHistory: () => void;
  onOpenLab?: () => void;
  onStartBrew: () => void;
  onSelectBeanDirectly?: (bean: BeanInfo) => void;
  onRefreshBeans?: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const beanListContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const beanCardVariants: Variants = {
  hidden: { opacity: 0, x: 16, scale: 0.96 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const RECIPE_IMAGES = [
  ASSETS.cafePourover,
  ASSETS.pourSpiral,
  ASSETS.pourCenter,
  ASSETS.pourCircular,
  ASSETS.specialtyBeans,
  ASSETS.coffeeFlavor,
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  logs,
  selectedRecipe,
  allRecipes = defaultRecipesData as Recipe[],
  customBeans = [],
  onSelectRecipe,
  onScan,
  onBrowseMethods,
  onViewHistory,
  onOpenLab,
  onStartBrew,
  onSelectBeanDirectly,
  onRefreshBeans,
}) => {
  const { t, language, setLanguage } = useLanguage();

  const [showBeanModal, setShowBeanModal] = useState<boolean>(false);
  const [editingBean, setEditingBean] = useState<BeanInfo | null>(null);

  const [recipeIndex, setRecipeIndex] = useState<number>(() => {
    const idx = allRecipes.findIndex(r => r.id === selectedRecipe.id);
    return idx >= 0 ? idx : 0;
  });

  const recipeScrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef<boolean>(false);

  const beanScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const cupsCount = logs.length.toString().padStart(2, '0');

  const allBeans: BeanInfo[] = [...customBeans, ...(sampleBeans as BeanInfo[])];

  const scrollToRecipe = (index: number) => {
    const nextIdx = (index + allRecipes.length) % allRecipes.length;
    setRecipeIndex(nextIdx);
    if (recipeScrollRef.current) {
      isProgrammaticScroll.current = true;
      const targetScroll = nextIdx * recipeScrollRef.current.clientWidth;
      recipeScrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setTimeout(() => { isProgrammaticScroll.current = false; }, 400);
    }
    if (onSelectRecipe) onSelectRecipe(allRecipes[nextIdx]);
  };

  const handleRecipeScroll = () => {
    if (isProgrammaticScroll.current) return;
    if (recipeScrollRef.current) {
      const { scrollLeft, clientWidth } = recipeScrollRef.current;
      if (clientWidth > 0) {
        const newIdx = Math.round(scrollLeft / clientWidth);
        if (newIdx >= 0 && newIdx < allRecipes.length && newIdx !== recipeIndex) {
          setRecipeIndex(newIdx);
          if (onSelectRecipe) onSelectRecipe(allRecipes[newIdx]);
        }
      }
    }
  };

  useEffect(() => {
    const idx = allRecipes.findIndex(r => r.id === selectedRecipe.id);
    if (idx >= 0 && idx !== recipeIndex) scrollToRecipe(idx);
  }, [selectedRecipe.id]);

  const handleBeanScroll = (direction: 'left' | 'right') => {
    if (beanScrollRef.current) {
      beanScrollRef.current.scrollBy({ left: direction === 'left' ? -230 : 230, behavior: 'smooth' });
    }
  };

  const updateBeanScrollButtons = () => {
    if (beanScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = beanScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex-1 flex flex-col justify-between select-none space-y-6 font-sans text-[#f0eeeb]"
    >
      {/* 1. Header */}
      <motion.div variants={sectionVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {t('app.title')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-full bg-[#141311] border border-white/[0.06]">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-500 ${
                language === 'zh'
                  ? 'bg-amber-500 text-[#0a0a08]'
                  : 'text-[#f0eeeb]/40 hover:text-[#f0eeeb]/70'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}
            >
              中
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-500 ${
                language === 'en'
                  ? 'bg-amber-500 text-[#0a0a08]'
                  : 'text-[#f0eeeb]/40 hover:text-[#f0eeeb]/70'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}
            >
              EN
            </button>
          </div>

          <button
            onClick={onViewHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141311] hover:bg-[#1a1816] border border-white/[0.06] active:scale-95 transition-all duration-500 text-xs text-[#f0eeeb]/60 group"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-700" style={{ transitionTimingFunction: 'var(--ease-spring)' }} />
            <span className="font-mono font-bold text-amber-300">{cupsCount}</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Recipe Carousel Hero */}
      <motion.div variants={sectionVariants} className="space-y-2" whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <div className="eyebrow mb-3">
          <Sparkles className="w-3 h-3" />
          <span>{language === 'zh' ? '當前沖煮食譜' : 'ACTIVE BREW PROFILE'}</span>
        </div>

        <div
          ref={recipeScrollRef}
          onScroll={handleRecipeScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-[calc(1.5rem+4px)] border border-white/[0.04] bg-[#0f0e0c] touch-pan-x cursor-grab active:cursor-grabbing"
          style={{
            WebkitOverflowScrolling: 'touch',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {allRecipes.map((recipe, idx) => {
            const rName = language === 'zh' ? recipe.name : (recipe.nameEn || recipe.name);
            const rReason = language === 'zh' ? recipe.reason : (recipe.reasonEn || recipe.reason);
            const rGrind = language === 'zh' ? recipe.grind : (recipe.grindEn || recipe.grind);
            const bgImg = RECIPE_IMAGES[idx % RECIPE_IMAGES.length];

            return (
              <div
                key={recipe.id}
                className="w-full flex-shrink-0 snap-center snap-always relative overflow-hidden group/card"
              >
                {/* Cinematic Background Banner */}
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={bgImg}
                    alt={rName}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover object-center brightness-75 transform group-hover/card:scale-105 transition-transform duration-700"
                    style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0c] via-[#0f0e0c]/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e0c]/90 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/[0.08] text-[11px] font-medium text-amber-300">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{recipe.method}</span>
                      <span className="text-white/30">·</span>
                      <span className="font-mono font-bold text-amber-400">{recipe.ratio}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xl p-1 rounded-full border border-white/[0.08]">
                      <button
                        onClick={(e) => { e.stopPropagation(); scrollToRecipe(idx - 1); }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-500"
                        style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-mono text-amber-400 font-bold px-1">
                        {idx + 1}/{allRecipes.length}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); scrollToRecipe(idx + 1); }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-500"
                        style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hero Card Body — nested in double-bezel outer */}
                <div className="p-4 -mt-8 relative z-10">
                  <div className="bezel-outer">
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5 max-w-[70%]">
                          <h2 className="text-xl sm:text-2xl font-black text-white truncate" style={{ fontFamily: 'var(--font-display)' }}>{rName}</h2>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-[10px] text-[#f0eeeb]/40">{language === 'zh' ? '水溫 · 目標時間' : 'Temp · Target'}</div>
                          <div className="text-xs font-bold text-amber-400">{recipe.temp}°C · {recipe.targetTimeRange}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1 p-2 rounded-2xl bg-black/30 text-center font-mono text-[11px]">
                        <div>
                          <span className="text-[#f0eeeb]/40 block text-[9px]">{t('methods.dose')}</span>
                          <span className="text-[#f0eeeb] font-bold">{recipe.dose}g</span>
                        </div>
                        <div>
                          <span className="text-[#f0eeeb]/40 block text-[9px]">{t('methods.water')}</span>
                          <span className="text-amber-400 font-bold">{recipe.water}g</span>
                        </div>
                        <div>
                          <span className="text-[#f0eeeb]/40 block text-[9px]">{t('prep.ratio')}</span>
                          <span className="text-[#f0eeeb] font-bold">{recipe.ratio}</span>
                        </div>
                        <div>
                          <span className="text-[#f0eeeb]/40 block text-[9px]">{t('recipe.grind')}</span>
                          <span className="text-[#f0eeeb]/80 font-bold text-[10px] truncate block px-0.5">{rGrind}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#f0eeeb]/60 leading-relaxed font-medium line-clamp-2">
                        {rReason}
                      </p>

                      {/* CTA Button — Button-in-Button pattern */}
                      <button
                        onClick={() => {
                          if (onSelectRecipe) onSelectRecipe(recipe);
                          onStartBrew();
                        }}
                        className="btn-primary"
                      >
                        <span>{t('home.quickStart')}</span>
                        <span className="btn-icon-nest">
                          <Play className="w-3.5 h-3.5 fill-[#0a0a08] stroke-none" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {allRecipes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToRecipe(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === recipeIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/15 hover:bg-white/30'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              aria-label={`Go to recipe ${idx + 1}`}
            />
          ))}
        </div>
      </motion.div>

      {/* 3. Primary Action Grid — 2x2 Asymmetric Bento */}
      <motion.div variants={sectionVariants} className="grid grid-cols-2 gap-3" whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}>
        {/* Bean Cellar */}
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onScan}
          className="bezel-card text-left group"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          <div className="p-4 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-500"
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}>
              <Coffee className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">BEAN CELLAR</div>
              <div className="text-xs font-bold text-[#f0eeeb] truncate group-hover:text-amber-300 transition-colors duration-500">
                {language === 'zh' ? '精品豆窖與豆單' : 'Bean Cellar'}
              </div>
            </div>
          </div>
        </motion.button>

        {/* Browse Recipes */}
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBrowseMethods}
          className="bezel-card text-left group"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          <div className="p-4 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-500"
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}>
              <List className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">RECIPES</div>
              <div className="text-xs font-bold text-[#f0eeeb] truncate group-hover:text-amber-300 transition-colors duration-500">
                {t('home.chooseMethod')}
              </div>
            </div>
          </div>
        </motion.button>

        {/* Brew Log Journal */}
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onViewHistory}
          className="bezel-card text-left group"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          <div className="p-4 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-500"
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}>
              <Compass className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>JOURNAL</span>
                <span className="text-[9px] text-amber-300/70 font-mono">({logs.length})</span>
              </div>
              <div className="text-xs font-bold text-[#f0eeeb] truncate group-hover:text-amber-300 transition-colors duration-500">
                {t('history.title')}
              </div>
            </div>
          </div>
        </motion.button>

        {/* Barista Lab */}
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenLab}
          className="bezel-card text-left group"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          <div className="p-4 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-500"
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}>
              <Zap className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">BARISTA LAB</div>
              <div className="text-xs font-bold text-[#f0eeeb] truncate group-hover:text-amber-300 transition-colors duration-500">
                {language === 'zh' ? '咖啡萃取實驗室' : 'Barista Lab'}
              </div>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* 4. Bean Cellar Section */}
      <motion.div variants={sectionVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={onScan} className="flex items-center gap-2.5 text-left group">
            <div className="w-8 h-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-500"
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}>
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors duration-500" style={{ fontFamily: 'var(--font-display)' }}>
                <span>{language === 'zh' ? '精品豆窖與豆單' : 'Bean Cellar'}</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">({allBeans.length})</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#f0eeeb]/30 group-hover:text-amber-300 transition-colors duration-500" />
              </h3>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onScan}
              className="px-2.5 py-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-[#f0eeeb]/60 hover:text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all duration-500"
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'zh' ? '豆單管理' : 'Manage'}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleBeanScroll('left')}
                className="w-7 h-7 rounded-full bg-[#141311] border border-white/[0.06] text-[#f0eeeb]/40 hover:text-white flex items-center justify-center active:scale-90 transition-all duration-500"
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleBeanScroll('right')}
                className="w-7 h-7 rounded-full bg-[#141311] border border-white/[0.06] text-[#f0eeeb]/40 hover:text-white flex items-center justify-center active:scale-90 transition-all duration-500"
                style={{ transitionTimingFunction: 'var(--ease-spring)' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <motion.div
          ref={beanScrollRef}
          onScroll={updateBeanScrollButtons}
          variants={beanListContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory touch-pan-x cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Quick Add Tile */}
          <motion.div
            variants={beanCardVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setEditingBean(null); setShowBeanModal(true); }}
            className="flex-shrink-0 w-40 p-4 rounded-[calc(1.5rem+4px)] bg-[#0f0e0c]/80 hover:bg-[#141311] border border-dashed border-amber-500/30 hover:border-amber-400/60 cursor-pointer transition-all duration-500 flex flex-col items-center justify-center text-center space-y-2 snap-start min-h-[140px] group"
            style={{
              transitionTimingFunction: 'var(--ease-spring)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-500"
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}>
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                {language === 'zh' ? '新增私房豆' : 'Add Bean'}
              </div>
              <div className="text-[9px] text-[#f0eeeb]/30 mt-0.5">
                {language === 'zh' ? '自訂風味' : 'Custom'}
              </div>
            </div>
          </motion.div>

          {/* Bean Cards */}
          {allBeans.map((bean, idx) => {
            const isCustom = !!bean.isCustom;
            const beanTitle = language === 'zh' ? bean.name : (bean.nameEn || bean.name);
            const beanOrigin = language === 'zh' ? bean.origin : (bean.originEn || bean.origin);
            const roastName = language === 'zh' ? bean.roastLevel : (bean.roastLevelEn || bean.roastLevel.split(' ')[0]);
            const processName = language === 'zh' ? bean.process : (bean.processEn || bean.process.split(' ')[0]);
            const flavorTags = language === 'zh' ? bean.flavorNotes : (bean.flavorNotesEn || bean.flavorNotes);

            return (
              <motion.div
                key={bean.id || `bean_${idx}`}
                variants={beanCardVariants}
                whileHover={{ y: -4, scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectBeanDirectly && onSelectBeanDirectly(bean)}
                className="flex-shrink-0 w-52 p-4 rounded-[calc(1.5rem+4px)] bg-[#0f0e0c] hover:bg-[#141311] border border-white/[0.04] hover:border-amber-500/30 cursor-pointer transition-all duration-500 snap-start relative group"
                style={{
                  transitionTimingFunction: 'var(--ease-spring)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)',
                }}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                  <div className="flex items-center gap-1 text-amber-400 truncate max-w-[130px]">
                    <span className="truncate">{processName}</span>
                    <span className="text-[#f0eeeb]/20">·</span>
                    <span className="truncate">{roastName}</span>
                  </div>
                  {isCustom ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditingBean(bean); setShowBeanModal(true); }}
                      className="p-1 rounded-md text-amber-400/60 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-[#f0eeeb]/30 font-semibold px-1.5 py-0.5 rounded bg-white/[0.03]">
                      {language === 'zh' ? '莊園' : 'Estate'}
                    </span>
                  )}
                </div>

                <div className="text-xs font-black text-[#f0eeeb] line-clamp-1 group-hover:text-amber-300 transition-colors duration-500">
                  {beanTitle}
                </div>

                <div className="text-[10px] text-[#f0eeeb]/40 font-medium truncate mt-0.5">
                  {beanOrigin}
                </div>

                <div className="flex flex-wrap gap-1 pt-1.5">
                  {flavorTags.slice(0, 2).map((note, nIdx) => (
                    <span key={nIdx} className="text-[9px] px-1.5 py-0.5 rounded-lg bg-white/[0.03] text-amber-300/80 border border-white/[0.04] font-medium truncate max-w-[90px]">
                      {note}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {showBeanModal && (
        <CustomBeanModal
          existingBean={editingBean}
          recipes={allRecipes}
          onClose={() => { setShowBeanModal(false); setEditingBean(null); }}
          onSaved={(saved) => {
            setShowBeanModal(false);
            setEditingBean(null);
            if (onRefreshBeans) onRefreshBeans();
            if (onSelectBeanDirectly) onSelectBeanDirectly(saved);
          }}
          onDeleted={() => {
            setShowBeanModal(false);
            setEditingBean(null);
            if (onRefreshBeans) onRefreshBeans();
          }}
        />
      )}
    </motion.div>
  );
};
