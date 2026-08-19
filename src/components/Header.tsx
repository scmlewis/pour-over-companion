import React, { useState, useEffect } from 'react';
import { Coffee, History, Volume2, VolumeX, Download, Plus, Globe } from 'lucide-react';
import { AppView } from '../types';
import { isSoundEnabled, setSoundEnabled } from '../utils/audio';
import { useLanguage } from '../utils/i18n';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onNewRecipe?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onNewRecipe }) => {
  const { language, setLanguage, t } = useLanguage();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0c0d12]/95 backdrop-blur-md border-b border-white/[0.06] px-4 py-3 select-none">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <button
          id="app-home-button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-950/40 text-slate-950 font-bold">
            <Coffee className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-sm leading-none font-sans">
                {t('app.title')}
              </span>
              {!isOnline && (
                <span className="text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.05] text-amber-300 border border-white/[0.08]">
                  {t('app.offline')}
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          {installPrompt && (
            <button
              id="install-pwa-button"
              onClick={handleInstall}
              className="flex items-center gap-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
              title={t('app.install')}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('app.install')}</span>
            </button>
          )}

          {/* Language Switcher Pill */}
          <button
            id="toggle-language-button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-amber-400 font-mono text-[11px] font-bold active:scale-95 transition-all"
            title={language === 'zh' ? 'Switch to English' : '切換為繁體中文'}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'zh' ? 'EN' : '中文'}</span>
          </button>

          {currentView === 'home' && onNewRecipe && (
            <button
              id="header-create-custom-recipe-button"
              onClick={onNewRecipe}
              className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
              title={t('app.customRecipe')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          <button
            id="toggle-sound-button"
            onClick={toggleSound}
            className={`p-2 rounded-full transition-colors ${
              soundOn
                ? 'text-amber-400 hover:bg-white/[0.05]'
                : 'text-slate-600 hover:bg-white/[0.05]'
            }`}
            title={soundOn ? t('app.soundOn') : t('app.soundMuted')}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            id="history-nav-button"
            onClick={() => onNavigate(currentView === 'history' ? 'home' : 'history')}
            className={`p-2 rounded-full transition-colors ${
              currentView === 'history'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
            title={t('app.history')}
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
