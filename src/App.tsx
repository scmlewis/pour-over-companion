import React, { useState, useEffect, useCallback } from 'react';
import { Recipe, BrewLogEntry, AppView, BeanInfo, AppliedAdjustment, RecipeStep } from './types';
import defaultRecipesData from './data/recipes.json';
import {
  getAllBrewLogs,
  getAllCustomRecipes,
  getAllCustomBeans,
  deleteBrewLog,
  saveCustomBean,
  deleteCustomBean,
} from './utils/db';
import { HomeScreen } from './components/HomeScreen';
import { BeanCellarScreen } from './components/BeanCellarScreen';
import { BaristaLabScreen } from './components/BaristaLabScreen';
import { MethodSelector } from './components/MethodSelector';
import { RecipeDetailScreen } from './components/RecipeDetailScreen';
import { PrepChecklist } from './components/PrepChecklist';
import { BrewScreen } from './components/BrewScreen';
import { FinishScreen } from './components/FinishScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { BrewLogDetailModal } from './components/BrewLogDetailModal';
import { CustomRecipeModal } from './components/CustomRecipeModal';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, BookOpen, Beaker, Home } from 'lucide-react';

const NAV_ITEMS: { view: AppView; icon: typeof Home; label: string }[] = [
  { view: 'home', icon: Home, label: 'Home' },
  { view: 'beans', icon: Coffee, label: 'Cellar' },
  { view: 'lab', icon: Beaker, label: 'Lab' },
  { view: 'history', icon: BookOpen, label: 'Journal' },
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(defaultRecipesData as Recipe[]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(defaultRecipesData[0] as Recipe);
  const [scannedBean, setScannedBean] = useState<BeanInfo | null>(null);
  const [appliedAdjustment, setAppliedAdjustment] = useState<AppliedAdjustment | null>(null);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  const [brewConfig, setBrewConfig] = useState<{
    dose: number;
    ratio: string;
    totalWater: number;
    grind: string;
    scaledSteps: RecipeStep[];
    advanceMode: 'auto' | 'manual';
  }>({
    dose: 18,
    ratio: '1:15.5',
    totalWater: 280,
    grind: '中幼研磨',
    scaledSteps: (defaultRecipesData[0] as Recipe).steps,
    advanceMode: 'manual',
  });

  const [completedDurationSec, setCompletedDurationSec] = useState<number>(0);
  const [logs, setLogs] = useState<BrewLogEntry[]>([]);
  const [customBeans, setCustomBeans] = useState<BeanInfo[]>([]);
  const [editingLog, setEditingLog] = useState<BrewLogEntry | null>(null);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    const [storedLogs, customRecipes, storedBeans] = await Promise.all([
      getAllBrewLogs(),
      getAllCustomRecipes(),
      getAllCustomBeans(),
    ]);
    setLogs(storedLogs);
    setCustomBeans(storedBeans);

    const combined = [...(defaultRecipesData as Recipe[])];
    customRecipes.forEach(custom => {
      const existingIdx = combined.findIndex(r => r.id === custom.id);
      if (existingIdx >= 0) {
        combined[existingIdx] = custom;
      } else {
        combined.push(custom);
      }
    });
    setAllRecipes(combined);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateBrewConfigForRecipe = (recipe: Recipe) => {
    setBrewConfig({
      dose: recipe.dose,
      ratio: recipe.ratio,
      totalWater: recipe.water,
      grind: recipe.grind,
      scaledSteps: recipe.steps,
      advanceMode: 'manual',
    });
  };

  const handleBeanIdentified = (bean: BeanInfo) => {
    setScannedBean(bean);
    const recommended = allRecipes.find(r => r.id === bean.recommendedRecipeId) || allRecipes[0];
    setSelectedRecipe(recommended);
    updateBrewConfigForRecipe(recommended);
    setCurrentView('recipe-detail');
  };

  const handleSaveBean = async (bean: BeanInfo) => {
    await saveCustomBean(bean);
    await loadData();
    setScannedBean(bean);
  };

  const handleDeleteBean = async (id: string) => {
    await deleteCustomBean(id);
    await loadData();
    if (scannedBean?.id === id) {
      setScannedBean(null);
    }
  };

  const handleBrewWithBean = (bean: BeanInfo) => {
    setScannedBean(bean);
    const targetRecipe = allRecipes.find(r => r.id === bean.recommendedRecipeId) || allRecipes[0];
    setSelectedRecipe(targetRecipe);
    updateBrewConfigForRecipe(targetRecipe);
    setCurrentView('recipe-detail');
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    updateBrewConfigForRecipe(recipe);
  };

  const handleContinueToDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    updateBrewConfigForRecipe(recipe);
    setCurrentView('recipe-detail');
  };

  const handleDirectStartBrew = () => {
    updateBrewConfigForRecipe(selectedRecipe);
    setCurrentView('prep');
  };

  const handleUseRecipe = () => {
    setCurrentView('prep');
  };

  const handleStartBrewing = (advanceMode: 'auto' | 'manual') => {
    setBrewConfig(prev => ({
      ...prev,
      advanceMode,
    }));
    setCurrentView('brew');
  };

  const handleFinishBrew = (meta: { durationSec: number; theoreticalWater: number }) => {
    setCompletedDurationSec(meta.durationSec);
    setCurrentView('finish');
  };

  const handleSavedToHistory = async (newLog: BrewLogEntry) => {
    setLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
    setAppliedAdjustment(null);
    setCurrentView('history');
  };

  const handleEvaluateImmediately = async (newLog: BrewLogEntry) => {
    setLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
    setEditingLog(newLog);
    setCurrentView('history');
  };

  const handleApplyAdjustment = (adjustment: AppliedAdjustment, recipeId: string) => {
    const targetRecipe = allRecipes.find(r => r.id === recipeId) || allRecipes[0];
    setSelectedRecipe(targetRecipe);
    updateBrewConfigForRecipe(targetRecipe);
    setAppliedAdjustment(adjustment);
    setEditingLog(null);
    setCurrentView('recipe-detail');
  };

  const handleDeleteLog = async (id: string) => {
    await deleteBrewLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
    if (editingLog && editingLog.id === id) {
      setEditingLog(null);
    }
  };

  const showNav = !['brew', 'prep', 'finish'].includes(currentView);
  const activeNav = currentView === 'scan' ? 'beans' : currentView;

  return (
    <div className="min-h-[100dvh] bg-[#0a0a08] text-[#f0eeeb] flex flex-col items-center font-sans">
      <main className="w-full max-w-md mx-auto px-4 pt-4 pb-28 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <HomeScreen
                logs={logs}
                selectedRecipe={selectedRecipe}
                allRecipes={allRecipes}
                customBeans={customBeans}
                onSelectRecipe={handleSelectRecipe}
                onScan={() => setCurrentView('beans')}
                onBrowseMethods={() => setCurrentView('methods')}
                onViewHistory={() => setCurrentView('history')}
                onOpenLab={() => setCurrentView('lab')}
                onStartBrew={handleDirectStartBrew}
                onSelectBeanDirectly={handleBeanIdentified}
                onRefreshBeans={loadData}
              />
            </motion.div>
          )}

          {currentView === 'lab' && (
            <motion.div
              key="lab"
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <BaristaLabScreen
                onBack={() => setCurrentView('home')}
                onGoToRecipes={() => setCurrentView('methods')}
                onGoToBeans={() => setCurrentView('beans')}
              />
            </motion.div>
          )}

          {(currentView === 'beans' || currentView === 'scan') && (
            <motion.div
              key="beans"
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <BeanCellarScreen
                activeBean={scannedBean}
                customBeans={customBeans}
                recipes={allRecipes}
                onBack={() => setCurrentView('home')}
                onSelectBean={(bean) => setScannedBean(bean)}
                onSaveBean={handleSaveBean}
                onDeleteBean={handleDeleteBean}
                onBrewWithBean={handleBrewWithBean}
              />
            </motion.div>
          )}

          {currentView === 'methods' && (
            <motion.div
              key="methods"
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <MethodSelector
                recipes={allRecipes}
                selectedRecipe={selectedRecipe}
                onBack={() => setCurrentView('home')}
                onSelectRecipe={handleSelectRecipe}
                onContinue={handleContinueToDetail}
                onCreateCustomRecipe={() => setShowCustomModal(true)}
              />
            </motion.div>
          )}

          {currentView === 'recipe-detail' && (
            <motion.div
              key="recipe-detail"
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <RecipeDetailScreen
                recipe={selectedRecipe}
                beanInfo={scannedBean}
                onBack={() => setCurrentView('methods')}
                onChooseOtherMethod={() => setCurrentView('methods')}
                onUseRecipe={handleUseRecipe}
              />
            </motion.div>
          )}

          {currentView === 'prep' && (
            <motion.div
              key="prep"
              initial={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <PrepChecklist
                recipe={selectedRecipe}
                dose={brewConfig.dose}
                ratio={brewConfig.ratio}
                totalWater={brewConfig.totalWater}
                grind={brewConfig.grind}
                scaledSteps={brewConfig.scaledSteps}
                onBack={() => setCurrentView('recipe-detail')}
                onStartBrew={handleStartBrewing}
              />
            </motion.div>
          )}

          {currentView === 'brew' && (
            <motion.div
              key="brew"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <BrewScreen
                recipe={selectedRecipe}
                dose={brewConfig.dose}
                ratio={brewConfig.ratio}
                totalWater={brewConfig.totalWater}
                grind={brewConfig.grind}
                scaledSteps={brewConfig.scaledSteps}
                advanceMode={brewConfig.advanceMode}
                onFinishBrew={handleFinishBrew}
                onCancelBrew={() => setCurrentView('prep')}
              />
            </motion.div>
          )}

          {currentView === 'finish' && (
            <motion.div
              key="finish"
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <FinishScreen
                recipe={selectedRecipe}
                dose={brewConfig.dose}
                ratio={brewConfig.ratio}
                totalWater={brewConfig.totalWater}
                grind={brewConfig.grind}
                durationSec={completedDurationSec}
                beanInfo={scannedBean}
                onSaved={handleSavedToHistory}
                onEvaluateNow={handleEvaluateImmediately}
              />
            </motion.div>
          )}

          {currentView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <HistoryScreen
                logs={logs}
                onBack={() => setCurrentView('home')}
                onSelectLogForEval={(log) => setEditingLog(log)}
                onRefreshLogs={loadData}
                onDeleteLog={handleDeleteLog}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Pill Navigation */}
      {showNav && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex items-center gap-1 p-1.5 rounded-full bg-[#0f0e0c]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`relative flex items-center justify-center rounded-full transition-all duration-500 ${
                    isActive
                      ? 'w-10 h-10 bg-amber-500 text-[#0a0a08]'
                      : 'w-10 h-10 text-[#f0eeeb]/40 hover:text-[#f0eeeb]/70 hover:bg-white/[0.04]'
                  }`}
                  style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                  title={item.label}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-amber-500 -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        </nav>
      )}

      {/* Modals */}
      {editingLog && (
        <BrewLogDetailModal
          logEntry={editingLog}
          onClose={() => setEditingLog(null)}
          onApplyToNextBrew={handleApplyAdjustment}
          onSave={(updated) => {
            setLogs(prev => prev.map(l => l.id === updated.id ? updated : l));
            setEditingLog(null);
          }}
          onDelete={handleDeleteLog}
        />
      )}

      {showCustomModal && (
        <CustomRecipeModal
          onClose={() => setShowCustomModal(false)}
          onSaved={(newRecipe) => {
            setAllRecipes(prev => [newRecipe, ...prev]);
            setSelectedRecipe(newRecipe);
            updateBrewConfigForRecipe(newRecipe);
            setShowCustomModal(false);
            setCurrentView('recipe-detail');
          }}
        />
      )}
    </div>
  );
}
