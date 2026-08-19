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

// Sophisticated Staggered Entrance Variants for Main Home Screen
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1], // Premium bezier curve for natural deceleration
    },
  },
};

const beanListContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

const beanCardVariants: Variants = {
  hidden: { opacity: 0, x: 14, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    },
  },
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
  
  // Custom Bean Modal
  const [showBeanModal, setShowBeanModal] = useState<boolean>(false);
  const [editingBean, setEditingBean] = useState<BeanInfo | null>(null);

  // Recipe Carousel index and ref
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

  // Combine sample beans + custom beans
  const allBeans: BeanInfo[] = [
    ...customBeans,
    ...(sampleBeans as BeanInfo[]),
  ];

  // Scroll to a specific recipe in the carousel
  const scrollToRecipe = (index: number) => {
    const nextIdx = (index + allRecipes.length) % allRecipes.length;
    setRecipeIndex(nextIdx);
    if (recipeScrollRef.current) {
      isProgrammaticScroll.current = true;
      const targetScroll = nextIdx * recipeScrollRef.current.clientWidth;
      recipeScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 400);
    }
    if (onSelectRecipe) {
      onSelectRecipe(allRecipes[nextIdx]);
    }
  };

  // Handle recipe manual touch/swipe scroll
  const handleRecipeScroll = () => {
    if (isProgrammaticScroll.current) return;
    if (recipeScrollRef.current) {
      const { scrollLeft, clientWidth } = recipeScrollRef.current;
      if (clientWidth > 0) {
        const newIdx = Math.round(scrollLeft / clientWidth);
        if (newIdx >= 0 && newIdx < allRecipes.length && newIdx !== recipeIndex) {
          setRecipeIndex(newIdx);
          if (onSelectRecipe) {
            onSelectRecipe(allRecipes[newIdx]);
          }
        }
      }
    }
  };

  // Keep scroll position in sync if selectedRecipe prop changes externally
  useEffect(() => {
    const idx = allRecipes.findIndex(r => r.id === selectedRecipe.id);
    if (idx >= 0 && idx !== recipeIndex) {
      scrollToRecipe(idx);
    }
  }, [selectedRecipe.id]);

  // Bean scroll helpers
  const handleBeanScroll = (direction: 'left' | 'right') => {
    if (beanScrollRef.current) {
      const scrollAmount = 230;
      beanScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
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
      className="w-full flex-1 flex flex-col justify-between pb-6 pt-1 select-none space-y-3.5 font-sans text-slate-100"
    >
      {/* 1. Header with App Title, Language Toggle, and History Pill */}
      <motion.div variants={sectionVariants} className="flex items-center justify-between py-1 px-0.5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{t('app.title')}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Bilingual Language Switcher Toggle */}
          <div className="flex items-center p-0.5 rounded-full bg-[#161311] border border-white/[0.08] shadow-inner">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                language === 'zh'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              中
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                language === 'en'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* Quick Logs Counter Badge */}
          <button
            onClick={onViewHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161311] hover:bg-[#1d1917] border border-white/[0.08] active:scale-95 transition-all text-xs text-slate-300 shadow-sm group"
            title={t('history.title')}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span className="font-mono font-bold text-amber-300">{cupsCount}</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Scrollable & Swipeable Recipe Carousel Hero Station */}
      <motion.div variants={sectionVariants} className="space-y-1.5">
        <div
          ref={recipeScrollRef}
          onScroll={handleRecipeScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-3xl border border-white/[0.08] bg-[#14110f] shadow-2xl touch-pan-x cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
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
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={bgImg}
                    alt={rName}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover object-center brightness-75 transform group-hover/card:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14110f] via-[#14110f]/75 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#14110f]/90 via-transparent to-transparent" />

                  {/* Top Method Tag & Carousel Pagination Controls */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.1] text-[11px] font-medium text-amber-300">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{recipe.method}</span>
                      <span className="text-white/40">·</span>
                      <span className="font-mono font-bold text-amber-400">{recipe.ratio}</span>
                    </div>

                    {/* Carousel Navigation Arrows */}
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/[0.1]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToRecipe(idx - 1);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                        aria-label="Previous Recipe"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-mono text-amber-400 font-bold px-1">
                        {idx + 1}/{allRecipes.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToRecipe(idx + 1);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                        aria-label="Next Recipe"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hero Card Body */}
                <div className="p-4 -mt-8 relative z-10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="text-[10px] font-mono text-amber-400/90 font-bold uppercase">
                        {language === 'zh' ? '當前沖煮食譜' : 'ACTIVE BREW PROFILE'}
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white truncate">{rName}</h2>
                    </div>
                    
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-slate-400">{language === 'zh' ? '水溫 · 目標時間' : 'Temp · Target'}</div>
                      <div className="text-xs font-bold text-amber-400">{recipe.temp}°C · {recipe.targetTimeRange}</div>
                    </div>
                  </div>

                  {/* Key Extraction Metrics Bar */}
                  <div className="grid grid-cols-4 gap-1 p-2 rounded-2xl bg-black/40 border border-white/[0.05] text-center font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">{t('methods.dose')}</span>
                      <span className="text-slate-200 font-bold">{recipe.dose}g</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">{t('methods.water')}</span>
                      <span className="text-amber-400 font-bold">{recipe.water}g</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">{t('prep.ratio')}</span>
                      <span className="text-slate-200 font-bold">{recipe.ratio}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">{t('recipe.grind')}</span>
                      <span className="text-slate-300 font-bold text-[10px] truncate block px-0.5">{rGrind}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300/90 leading-relaxed font-medium line-clamp-2">
                    {rReason}
                  </p>

                  {/* One-Tap Start Hero Button */}
                  <button
                    id={`home-start-brew-button-${recipe.id}`}
                    onClick={() => {
                      if (onSelectRecipe) onSelectRecipe(recipe);
                      onStartBrew();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-slate-950 stroke-none" />
                    <span>{t('home.quickStart')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          {allRecipes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToRecipe(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === recipeIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to recipe ${idx + 1}`}
            />
          ))}
        </div>
      </motion.div>

      {/* 3. Primary Action Buttons 2x2 Grid (Bean Cellar, Recipes, Journal, Barista Lab) */}
      <motion.div variants={sectionVariants} className="grid grid-cols-2 gap-2.5">
        {/* Bean Cellar & Profiler Card */}
        <motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          id="home-cellar-button"
          onClick={onScan}
          className="p-3.5 rounded-2xl bg-[#14110f] hover:bg-[#1a1614] border border-white/[0.07] hover:border-amber-500/40 text-left flex items-center gap-3 transition-all group shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Coffee className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">BEAN CELLAR</div>
            <div className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
              {language === 'zh' ? '精品豆窖與豆單' : 'Bean Cellar'}
            </div>
          </div>
        </motion.button>

        {/* Browse Recipes Card */}
        <motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          id="home-methods-button"
          onClick={onBrowseMethods}
          className="p-3.5 rounded-2xl bg-[#14110f] hover:bg-[#1a1614] border border-white/[0.07] hover:border-amber-500/40 text-left flex items-center gap-3 transition-all group shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <List className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">RECIPES</div>
            <div className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
              {t('home.chooseMethod')}
            </div>
          </div>
        </motion.button>

        {/* Brew Log Journal Card */}
        <motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          id="home-history-button"
          onClick={onViewHistory}
          className="p-3.5 rounded-2xl bg-[#14110f] hover:bg-[#1a1614] border border-white/[0.07] hover:border-amber-500/40 text-left flex items-center gap-3 transition-all group shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Compass className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>JOURNAL</span>
              <span className="text-[9px] text-amber-300/80 font-mono">({logs.length})</span>
            </div>
            <div className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
              {t('history.title')}
            </div>
          </div>
        </motion.button>

        {/* Barista Lab Card */}
        <motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          id="home-lab-button"
          onClick={onOpenLab}
          className="p-3.5 rounded-2xl bg-[#14110f] hover:bg-[#1a1614] border border-white/[0.07] hover:border-amber-500/40 text-left flex items-center gap-3 transition-all group shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform flex-shrink-0">
            <Zap className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">BARISTA LAB</div>
            <div className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
              {language === 'zh' ? '咖啡萃取實驗室' : 'Barista Lab'}
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* 4. Bean Cellar (精品豆窖) Section */}
      <motion.div variants={sectionVariants} className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <button
            onClick={onScan}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                <span>{language === 'zh' ? '精品豆窖與豆單' : 'Bean Cellar'}</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">({allBeans.length})</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 transition-colors" />
              </h3>
            </div>
          </button>

          {/* Right side controls (Manage/All + Scroll arrows) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onScan}
              className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm"
              title={language === 'zh' ? '管理與新增豆單' : 'Manage Cellar'}
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'zh' ? '豆單管理' : 'Manage'}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleBeanScroll('left')}
                className="w-7 h-7 rounded-full bg-[#161311] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center active:scale-90 transition-all"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleBeanScroll('right')}
                className="w-7 h-7 rounded-full bg-[#161311] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center active:scale-90 transition-all"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Staggered Scrollable Bean Carousel */}
        <motion.div
          ref={beanScrollRef}
          onScroll={updateBeanScrollButtons}
          variants={beanListContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent snap-x snap-mandatory touch-pan-x cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Quick Add Custom Bean Tile */}
          <motion.div
            variants={beanCardVariants}
            whileHover={{ y: -2.5, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setEditingBean(null);
              setShowBeanModal(true);
            }}
            className="flex-shrink-0 w-36 p-3 rounded-2xl bg-[#14110f]/80 hover:bg-[#1a1614] border border-dashed border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all shadow-md flex flex-col items-center justify-center text-center space-y-1.5 snap-start min-h-[130px] group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                {language === 'zh' ? '新增私房豆' : 'Add Bean'}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {language === 'zh' ? '自訂風味' : 'Custom'}
              </div>
            </div>
          </motion.div>

          {/* List of Custom & Estate Beans with Staggered Entrance */}
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
                whileHover={{ y: -2.5, scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectBeanDirectly && onSelectBeanDirectly(bean)}
                className="flex-shrink-0 w-48 p-3.5 rounded-2xl bg-[#14110f] hover:bg-[#1a1614] border border-white/[0.07] hover:border-amber-500/40 cursor-pointer transition-all shadow-md space-y-1.5 snap-start relative group"
              >
                {/* Top Tags & Custom Edit Button */}
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1 text-amber-400 truncate max-w-[120px]">
                    <span className="truncate">{processName}</span>
                    <span className="text-slate-500">·</span>
                    <span className="truncate">{roastName}</span>
                  </div>

                  {isCustom ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBean(bean);
                        setShowBeanModal(true);
                      }}
                      className="p-1 rounded-md text-amber-400 hover:text-white hover:bg-white/10"
                      title={language === 'zh' ? '編輯自訂咖啡豆' : 'Edit'}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500 font-semibold px-1 rounded bg-white/[0.03]">
                      {language === 'zh' ? '莊園' : 'Estate'}
                    </span>
                  )}
                </div>

                {/* Bean Name */}
                <div className="text-xs font-black text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {beanTitle}
                </div>

                {/* Origin */}
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  {beanOrigin}
                </div>

                {/* Flavor Tags */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {flavorTags.slice(0, 2).map((note, nIdx) => (
                    <span key={nIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-amber-300 border border-white/[0.06] font-medium truncate max-w-[80px]">
                      {note}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Custom Bean Add/Edit Modal */}
      {showBeanModal && (
        <CustomBeanModal
          existingBean={editingBean}
          recipes={allRecipes}
          onClose={() => {
            setShowBeanModal(false);
            setEditingBean(null);
          }}
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
