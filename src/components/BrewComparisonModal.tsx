import React from 'react';
import { X, Star, Clock, Droplets, Thermometer, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { BrewLogEntry } from '../types';
import { useLanguage } from '../utils/i18n';

interface BrewComparisonModalProps {
  brewA: BrewLogEntry;
  brewB: BrewLogEntry;
  onClose: () => void;
}

export const BrewComparisonModal: React.FC<BrewComparisonModalProps> = ({
  brewA,
  brewB,
  onClose,
}) => {
  const { language } = useLanguage();

  const formatTime = (totalSec?: number) => {
    if (!totalSec) return '--';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch { return isoStr; }
  };

  const renderRow = (
    label: string,
    valueA: string | number | null | undefined,
    valueB: string | number | null | undefined,
    unit?: string,
  ) => (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/[0.04] last:border-0">
      <div className="text-center">
        <span className="text-sm font-bold text-[#f0eeeb]">{valueA ?? '--'}</span>
        {unit && <span className="text-[10px] text-[#f0eeeb]/40 ml-0.5">{unit}</span>}
      </div>
      <div className="text-center text-[10px] font-mono text-[#f0eeeb]/40 uppercase tracking-wider flex items-center justify-center">
        {label}
      </div>
      <div className="text-center">
        <span className="text-sm font-bold text-[#f0eeeb]">{valueB ?? '--'}</span>
        {unit && <span className="text-[10px] text-[#f0eeeb]/40 ml-0.5">{unit}</span>}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0f0e0c] border border-white/[0.06] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {language === 'zh' ? '沖煮比較' : 'Brew Comparison'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-[#f0eeeb]/40 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brew Headers */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div></div>
          <div className="text-[10px] font-mono text-amber-400 font-bold">{language === 'zh' ? '沖煮 A' : 'BREW A'}</div>
          <div className="text-[10px] font-mono text-amber-400 font-bold">{language === 'zh' ? '沖煮 B' : 'BREW B'}</div>
        </div>

        {/* Comparison Rows */}
        <div className="bezel-card">
          <div className="p-3">
            {renderRow(
              language === 'zh' ? '食譜' : 'Recipe',
              brewA.recipeName,
              brewB.recipeName,
            )}
            {renderRow(
              language === 'zh' ? '方法' : 'Method',
              brewA.method,
              brewB.method,
            )}
            {renderRow(
              language === 'zh' ? '評分' : 'Rating',
              `${brewA.rating}/5`,
              `${brewB.rating}/5`,
            )}
            {renderRow(
              language === 'zh' ? '時間' : 'Time',
              formatTime(brewA.durationSec),
              formatTime(brewB.durationSec),
            )}
            {renderRow(
              language === 'zh' ? '粉量' : 'Dose',
              brewA.dose,
              brewB.dose,
              'g',
            )}
            {renderRow(
              language === 'zh' ? '水量' : 'Water',
              brewA.water,
              brewB.water,
              'g',
            )}
            {renderRow(
              language === 'zh' ? '比例' : 'Ratio',
              brewA.ratio,
              brewB.ratio,
            )}
            {renderRow(
              language === 'zh' ? '研磨' : 'Grind',
              brewA.grind,
              brewB.grind,
            )}
            {renderRow(
              language === 'zh' ? '水溫' : 'Temp',
              brewA.temp,
              brewB.temp,
              '°C',
            )}
            {renderRow(
              language === 'zh' ? '實際水量' : 'Actual',
              brewA.actualWeight,
              brewB.actualWeight,
              'g',
            )}
          </div>
        </div>

        {/* Notes */}
        {(brewA.notes || brewB.notes) && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              {language === 'zh' ? '筆記' : 'Notes'}
            </h4>
            {brewA.notes && (
              <div className="p-3 rounded-2xl bg-[#141311] border border-white/[0.04]">
                <div className="text-[9px] text-amber-400 font-mono mb-1">{language === 'zh' ? '沖煮 A' : 'BREW A'}</div>
                <p className="text-xs text-[#f0eeeb]/60 italic">"{brewA.notes}"</p>
              </div>
            )}
            {brewB.notes && (
              <div className="p-3 rounded-2xl bg-[#141311] border border-white/[0.04]">
                <div className="text-[9px] text-amber-400 font-mono mb-1">{language === 'zh' ? '沖煮 B' : 'BREW B'}</div>
                <p className="text-xs text-[#f0eeeb]/60 italic">"{brewB.notes}"</p>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-[#141311] hover:bg-[#1a1816] border border-white/[0.04] text-[#f0eeeb]/60 font-bold text-xs active:scale-[0.98] transition-all duration-500"
        >
          {language === 'zh' ? '關閉' : 'Close'}
        </button>
      </motion.div>
    </motion.div>
  );
};
