import React, { useState } from 'react';
import { BrewLogEntry } from '../types';
import { Download, Trash2, Star, Coffee, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { deleteBrewLog, exportLogsAsCSV } from '../utils/db';
import { useLanguage } from '../utils/i18n';
import { ScreenHeader } from './ScreenHeader';

interface HistoryScreenProps {
  logs: BrewLogEntry[];
  onBack: () => void;
  onSelectLogForEval: (log: BrewLogEntry) => void;
  onRefreshLogs: () => void;
  onDeleteLog?: (id: string) => void;
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  logs, onBack, onSelectLogForEval, onRefreshLogs, onDeleteLog,
}) => {
  const { t, language } = useLanguage();
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleExecuteDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteBrewLog(id);
    if (onDeleteLog) onDeleteLog(id);
    setDeletingId(null);
    onRefreshLogs();
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(null);
  };

  const filteredLogs = filterRating ? logs.filter(l => l.rating === filterRating) : logs;

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (language === 'zh') {
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        return `${m}月${d}日 ${h}:${min}`;
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return isoStr; }
  };

  const formatTime = (totalSec?: number) => {
    if (!totalSec) return '--';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-0 select-none space-y-5 font-sans text-[#f0eeeb]">
      <div>
        {/* Header */}
        <ScreenHeader
          onBack={onBack}
          title={language === 'zh' ? '沖煮日誌' : 'BREW JOURNAL'}
          subtitle={t('history.title')}
          rightAction={
            <button
              onClick={() => exportLogsAsCSV(logs)}
              title="CSV"
              className="p-2 rounded-full bg-[#141311] border border-white/[0.06] text-[#f0eeeb]/40 hover:text-amber-400 active:scale-90 transition-all duration-500"
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}
            >
              <Download className="w-4 h-4" />
            </button>
          }
        />

        {/* Stats — Double-Bezel */}
        <motion.div className="bezel-card mb-4" whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-20px' }} initial={{ opacity: 0, y: 16 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#f0eeeb]/40 font-medium">{t('history.totalBrews')}</div>
              <div className="text-2xl font-black font-mono text-[#f0eeeb] mt-0.5">
                {logs.length} <span className="text-xs font-normal text-[#f0eeeb]/40">{language === 'zh' ? '杯' : 'brews'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#f0eeeb]/40 font-medium">{t('history.avgRating')}</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                {logs.length > 0
                  ? (logs.reduce((acc, l) => acc + l.rating, 0) / logs.length).toFixed(1)
                  : '5.0'} <span className="text-xs font-normal text-[#f0eeeb]/40">/ 5.0</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Star Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-none">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all duration-500 ${
              filterRating === null
                ? 'bg-amber-500 text-[#0a0a08]'
                : 'bg-[#141311] text-[#f0eeeb]/40 border border-white/[0.04]'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            {t('history.all')}
          </button>
          {[5, 4, 3, 2, 1].map((st) => (
            <button
              key={st}
              onClick={() => setFilterRating(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1 transition-all duration-500 ${
                filterRating === st
                  ? 'bg-amber-500 text-[#0a0a08]'
                  : 'bg-[#141311] text-[#f0eeeb]/40 border border-white/[0.04]'
              }`}
              style={{ transitionTimingFunction: 'var(--ease-spring)' }}
            >
              <span>{st}</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-[#0f0e0c] border border-white/[0.03]">
            <Coffee className="w-12 h-12 text-[#f0eeeb]/15 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-bold text-[#f0eeeb]/50">{t('history.empty')}</p>
            <p className="text-xs text-[#f0eeeb]/30 mt-1">{t('history.emptySub')}</p>
          </div>
        ) : (
          <motion.div variants={listContainerVariants} initial="hidden" animate="visible" className="space-y-3">
            {filteredLogs.map((log) => {
              const isConfirmingDelete = deletingId === log.id;

              return (
                <motion.div
                  key={log.id}
                  variants={listItemVariants}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectLogForEval(log)}
                  className="p-4 rounded-[calc(1.5rem+4px)] bg-[#0f0e0c] hover:bg-[#141311] border border-white/[0.04] hover:border-amber-500/25 cursor-pointer transition-all duration-500 space-y-2.5 group relative overflow-hidden"
                  style={{
                    transitionTimingFunction: 'var(--ease-spring)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)',
                  }}
                >
                  {/* Delete Overlay */}
                  {isConfirmingDelete && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 bg-black/95 z-20 flex items-center justify-between px-4 py-3 animate-fade-slide-up"
                    >
                      <span className="text-xs font-bold text-rose-300">
                        {language === 'zh' ? '確認刪除此紀錄？' : 'Delete this record?'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCancelDelete}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-[#f0eeeb]/60 transition-colors duration-300"
                        >
                          {language === 'zh' ? '取消' : 'Cancel'}
                        </button>
                        <button
                          onClick={(e) => handleExecuteDelete(log.id, e)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors duration-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{language === 'zh' ? '刪除' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#f0eeeb] font-sans group-hover:text-amber-300 transition-colors duration-500">
                          {log.recipeName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.04] text-amber-400 font-bold">
                          {log.method}
                        </span>
                      </div>
                      {log.beanName && (
                        <div className="text-xs text-[#f0eeeb]/50 font-medium mt-0.5">{log.beanName}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {[...Array(log.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => confirmDelete(log.id, e)}
                        className="p-1.5 rounded-lg text-[#f0eeeb]/25 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all duration-500"
                        style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Parameters */}
                  <div className="grid grid-cols-4 gap-1 p-2 rounded-2xl bg-black/30 text-center font-mono text-[11px]">
                    <div>
                      <span className="text-[#f0eeeb]/40 block text-[9px]">{t('prep.coffeeGround')}</span>
                      <span className="text-[#f0eeeb]/80 font-bold">{log.dose}g</span>
                    </div>
                    <div>
                      <span className="text-[#f0eeeb]/40 block text-[9px]">{t('prep.totalWater')}</span>
                      <span className="text-amber-400 font-bold">{log.water}g</span>
                    </div>
                    <div>
                      <span className="text-[#f0eeeb]/40 block text-[9px]">{t('prep.ratio')}</span>
                      <span className="text-[#f0eeeb]/80 font-bold">{log.ratio}</span>
                    </div>
                    <div>
                      <span className="text-[#f0eeeb]/40 block text-[9px]">{t('recipe.targetTime')}</span>
                      <span className="text-[#f0eeeb]/80 font-bold">{formatTime(log.durationSec)}</span>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-xs text-[#f0eeeb]/50 italic line-clamp-1 px-1">"{log.notes}"</p>
                  )}

                  {log.descriptors && log.descriptors.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {log.descriptors.map((desc, dIdx) => (
                        <span key={dIdx} className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/8 text-amber-300/80 border border-amber-500/15 font-bold">
                          {desc}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#f0eeeb]/30 pt-1 border-t border-white/[0.03]">
                    <span>{formatDate(log.timestamp)}</span>
                    <span className="text-amber-400/70 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-500"
                      style={{ transitionTimingFunction: 'var(--ease-spring)' }}>
                      <Edit3 className="w-3 h-3" />
                      <span>{language === 'zh' ? '點擊編輯 · 診斷' : 'Edit & Cupping'}</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="pt-2">
        <button onClick={onBack} className="btn-primary">
          <span>{t('history.backHome')}</span>
        </button>
      </div>
    </div>
  );
};
