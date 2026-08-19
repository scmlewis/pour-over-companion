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

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(defaultRecipesData as Recipe[]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(defaultRecipesData[0] as Recipe);
  const [scannedBean, setScannedBean] = useState<BeanInfo | null>(null);
  const [appliedAdjustment, setAppliedAdjustment] = useState<AppliedAdjustment | null>(null);

  // Brew configuration state
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

  // Completed brew metrics
  const [completedDurationSec, setCompletedDurationSec] = useState<number>(0);

  // Persistent logs & custom entities
  const [logs, setLogs] = useState<BrewLogEntry[]>([]);
  const [customBeans, setCustomBeans] = useState<BeanInfo[]>([]);
  const [editingLog, setEditingLog] = useState<BrewLogEntry | null>(null);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Load logs, custom recipes, and custom beans on mount
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

  // Helper to recalculate scaled steps when a recipe is selected
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

  // Handle Bean Scanned from ScanScreen or selected on Home
  const handleBeanIdentified = (bean: BeanInfo) => {
    setScannedBean(bean);
    const recommended = allRecipes.find(r => r.id === bean.recommendedRecipeId) || allRecipes[0];
    setSelectedRecipe(recommended);
    updateBrewConfigForRecipe(recommended);
    setCurrentView('recipe-detail');
  };

  // Bean Cellar CRUD handlers
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

  // Select Recipe from Methods Screen
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    updateBrewConfigForRecipe(recipe);
  };

  // Proceed from Methods to Recipe Detail
  const handleContinueToDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    updateBrewConfigForRecipe(recipe);
    setCurrentView('recipe-detail');
  };

  // Home -> Start Brew directly with current selected recipe
  const handleDirectStartBrew = () => {
    updateBrewConfigForRecipe(selectedRecipe);
    setCurrentView('prep');
  };

  // Recipe Detail -> Prep Checklist
  const handleUseRecipe = () => {
    setCurrentView('prep');
  };

  // Prep Checklist -> Brew Screen
  const handleStartBrewing = (advanceMode: 'auto' | 'manual') => {
    setBrewConfig(prev => ({
      ...prev,
      advanceMode,
    }));
    setCurrentView('brew');
  };

  // Brew Complete -> Finish Screen
  const handleFinishBrew = (meta: { durationSec: number; theoreticalWater: number }) => {
    setCompletedDurationSec(meta.durationSec);
    setCurrentView('finish');
  };

  // Finish -> Saved to History
  const handleSavedToHistory = async (newLog: BrewLogEntry) => {
    setLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
    setAppliedAdjustment(null);
    setCurrentView('history');
  };

  // Finish -> Evaluate immediately
  const handleEvaluateImmediately = async (newLog: BrewLogEntry) => {
    setLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
    setEditingLog(newLog);
    setCurrentView('history');
  };

  // Apply evaluation adjustment to next brew
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

  return (
    <div className="min-h-screen bg-[#0d0b09] text-slate-100 flex flex-col items-center justify-start font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Standardized Viewport Container */}
      <main className="w-full max-w-md mx-auto px-4 py-3 flex-1 flex flex-col">
        {currentView === 'home' && (
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
        )}

        {currentView === 'lab' && (
          <BaristaLabScreen
            onBack={() => setCurrentView('home')}
            onGoToRecipes={() => setCurrentView('methods')}
            onGoToBeans={() => setCurrentView('beans')}
          />
        )}

        {(currentView === 'beans' || currentView === 'scan') && (
          <BeanCellarScreen
            activeBean={scannedBean}
            customBeans={customBeans}
            recipes={allRecipes}
            onBack={() => setCurrentView('home')}
            onSelectBean={(bean) => {
              setScannedBean(bean);
            }}
            onSaveBean={handleSaveBean}
            onDeleteBean={handleDeleteBean}
            onBrewWithBean={handleBrewWithBean}
          />
        )}

        {currentView === 'methods' && (
          <MethodSelector
            recipes={allRecipes}
            selectedRecipe={selectedRecipe}
            onBack={() => setCurrentView('home')}
            onSelectRecipe={handleSelectRecipe}
            onContinue={handleContinueToDetail}
            onCreateCustomRecipe={() => setShowCustomModal(true)}
          />
        )}

        {currentView === 'recipe-detail' && (
          <RecipeDetailScreen
            recipe={selectedRecipe}
            beanInfo={scannedBean}
            onBack={() => setCurrentView('methods')}
            onChooseOtherMethod={() => setCurrentView('methods')}
            onUseRecipe={handleUseRecipe}
          />
        )}

        {currentView === 'prep' && (
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
        )}

        {currentView === 'brew' && (
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
        )}

        {currentView === 'finish' && (
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
        )}

        {currentView === 'history' && (
          <HistoryScreen
            logs={logs}
            onBack={() => setCurrentView('home')}
            onSelectLogForEval={(log) => setEditingLog(log)}
            onRefreshLogs={loadData}
            onDeleteLog={handleDeleteLog}
          />
        )}
      </main>

      {/* Comprehensive Brew Record Editor & Tasting Journal Modal */}
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

      {/* Custom Recipe Modal */}
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
