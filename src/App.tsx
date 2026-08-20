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

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(defaultRecipesData as Recipe[]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(defaultRecipesData[0] as Recipe);
  const [scannedBean, setScannedBean] = useState<BeanInfo | null>(null);
  const [appliedAdjustment, setAppliedAdjustment] = useState<AppliedAdjustment | null>(null);

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

  const updateBrewConfigForRecipe = (recipe: Recipe, overrides?: Partial<{
    dose: number;
    ratio: string;
    totalWater: number;
    grind: string;
    temp: number;
  }>) => {
    const dose = overrides?.dose ?? recipe.dose;
    const ratio = overrides?.ratio ?? recipe.ratio;
    const totalWater = overrides?.totalWater ?? recipe.water;
    const grind = overrides?.grind ?? recipe.grind;
    const temp = overrides?.temp ?? recipe.temp;
    setBrewConfig({
      dose,
      ratio,
      totalWater,
      grind,
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

  const handleUseRecipe = (overrides?: { dose: number; ratio: string; totalWater: number }) => {
    if (overrides) {
      updateBrewConfigForRecipe(selectedRecipe, overrides);
    }
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
    // Apply the dial-in suggestion to the next brew's parameters so the
    // "Apply & Prep Next Brew" action actually changes what gets brewed.
    const overrides: Parameters<typeof updateBrewConfigForRecipe>[1] = {};
    if (adjustment.doseOffset != null) overrides.dose = Math.max(5, (targetRecipe.dose + adjustment.doseOffset));
    if (adjustment.waterOffset != null) overrides.totalWater = Math.max(50, (targetRecipe.water + adjustment.waterOffset));
    if (adjustment.tempOffset != null) overrides.temp = targetRecipe.temp + adjustment.tempOffset;
    if (adjustment.ratio) overrides.ratio = adjustment.ratio;
    if (adjustment.grindOffset != null) {
      overrides.grind = translateGrindOffset(targetRecipe.grind, adjustment.grindOffset);
    }
    updateBrewConfigForRecipe(targetRecipe, overrides);
    setAppliedAdjustment(adjustment);
    setEditingLog(null);
    setCurrentView('recipe-detail');
  };

  // Map a relative grind-step offset (-1 finer, +1 coarser) onto the recipe's
  // existing grind label using the canonical ladder order.
  const GRIND_LADDER = [
    '細研磨', '中幼研磨', '中研磨', '中粗研磨', '粗研磨',
  ];
  const translateGrindOffset = (grind: string, offset: number): string => {
    const idx = GRIND_LADDER.indexOf(grind);
    if (idx === -1) return grind; // unknown label — leave unchanged
    const next = Math.min(GRIND_LADDER.length - 1, Math.max(0, idx + offset));
    return GRIND_LADDER[next];
  };

  const handleDeleteLog = async (id: string) => {
    await deleteBrewLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
    if (editingLog && editingLog.id === id) {
      setEditingLog(null);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'instant' });

  return (
    <div className="min-h-[100dvh] bg-[#0a0a08] text-[#f0eeeb] flex flex-col items-center font-sans">
      {/* Cover for translucent iOS status bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        style={{ height: 'var(--sat, env(safe-area-inset-top, 0px))', background: '#0a0a08' }}
      />
      <main className="w-full max-w-md mx-auto px-4 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={scrollToTop}
              className="flex-1 flex flex-col"
              style={{ paddingTop: 'var(--sat, env(safe-area-inset-top))' }}
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
                onCreateRecipe={() => setShowCustomModal(true)}
                onSelectBeanDirectly={handleBeanIdentified}
                onRefreshBeans={loadData}
              />
            </motion.div>
          )}

          {currentView === 'lab' && (
            <motion.div
              key="lab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={scrollToTop}
              className="flex-1 flex flex-col"
              style={{ paddingTop: 'calc(var(--sat, env(safe-area-inset-top)) + 3.5rem)' }}
            >
              <BaristaLabScreen
                onBack={() => setCurrentView('home')}
                onGoToRecipes={() => setCurrentView('methods')}
                onGoToBeans={() => setCurrentView('beans')}
              />
            </motion.div>
          )}

          {(currentView === 'beans') && (
            <motion.div
              key="beans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={scrollToTop}
              className="flex-1 flex flex-col"
              style={{ paddingTop: 'calc(var(--sat, env(safe-area-inset-top)) + 3.5rem)' }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={scrollToTop}
              className="flex-1 flex flex-col"
              style={{ paddingTop: 'calc(var(--sat, env(safe-area-inset-top)) + 3.5rem)' }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={scrollToTop}
              className="flex-1 flex flex-col"
              style={{ paddingTop: 'calc(var(--sat, env(safe-area-inset-top)) + 3.5rem)' }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={scrollToTop}
              className="flex-1 flex flex-col"
            >
              <PrepChecklist
                recipe={{ ...selectedRecipe, temp: brewConfig.temp }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={scrollToTop}
              className="flex-1 flex flex-col"
            >
              <BrewScreen
                recipe={{ ...selectedRecipe, temp: brewConfig.temp }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={scrollToTop}
              className="flex-1 flex flex-col"
              style={{ paddingTop: 'var(--sat, env(safe-area-inset-top))' }}
            >
              <FinishScreen
                recipe={{ ...selectedRecipe, temp: brewConfig.temp }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={scrollToTop}
              className="flex-1 flex flex-col"
              style={{ paddingTop: 'calc(var(--sat, env(safe-area-inset-top)) + 3.5rem)' }}
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
