import React, { useState } from 'react';
import {
  Sparkles, Calculator, Droplets, Flame, Sliders, Compass, Zap,
  RotateCcw, CheckCircle2, AlertCircle, HelpCircle, Layers, Thermometer, Activity,
  ArrowRight, BookOpen,
} from 'lucide-react';
import { ArtOfPouringCard } from './ArtOfPouringCard';
import { BrewingTipCard } from './BrewingTipCard';
import { ScreenHeader } from './ScreenHeader';
import { useLanguage } from '../utils/i18n';

interface BaristaLabScreenProps {
  onBack: () => void;
  onGoToRecipes?: () => void;
  onGoToBeans?: () => void;
}

export const BaristaLabScreen: React.FC<BaristaLabScreenProps> = ({
  onBack, onGoToRecipes, onGoToBeans,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tds' | 'pour' | 'water' | 'grind' | 'tips'>('tds');

  const [dose, setDose] = useState<number>(18);
  const [beverageWeight, setBeverageWeight] = useState<number>(270);
  const [tds, setTds] = useState<number>(1.35);

  const eyPercentage = dose > 0 ? (beverageWeight * (tds / 100) / dose) * 100 : 0;

  let eyStatus = 'ideal';
  let eyDiagnosisZh = '理想黃金萃取區間 (SCA Golden Cup 18% ~ 22%)';
  let eyDiagnosisEn = 'Ideal Golden Cup Target (18% ~ 22%)';
  let eyColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/8';

  if (eyPercentage < 18) {
    eyStatus = 'under';
    eyDiagnosisZh = '萃取不足 (Under-extracted)：容易產生尖銳酸感、青草澀味與短促餘韻。建議：調細研磨度、提升水溫或延長悶蒸時間。';
    eyDiagnosisEn = 'Under-extracted: Sour, grassy, quick finish. Suggestion: Grind finer, raise water temp, or extend bloom.';
    eyColor = 'text-amber-400 border-amber-500/30 bg-amber-500/8';
  } else if (eyPercentage > 22) {
    eyStatus = 'over';
    eyDiagnosisZh = '過度萃取 (Over-extracted)：容易萃出木質澀感、苦尾與乾澀感。建議：調粗研磨度、降低水溫或減輕擾動水流。';
    eyDiagnosisEn = 'Over-extracted: Bitter, astringent, dry. Suggestion: Grind coarser, lower temp, or reduce agitation.';
    eyColor = 'text-rose-400 border-rose-500/30 bg-rose-500/8';
  }

  const [startTemp, setStartTemp] = useState<number>(93);
  const [kettleMaterial, setKettleMaterial] = useState<'steel' | 'copper' | 'ceramic'>('steel');
  const [roomTemp, setRoomTemp] = useState<number>(22);
  const [lidOpen, setLidOpen] = useState<boolean>(false);

  const getCoolingFactor = () => {
    let factor = 1.0;
    if (kettleMaterial === 'copper') factor = 0.85;
    if (kettleMaterial === 'ceramic') factor = 0.75;
    if (lidOpen) factor *= 1.4;
    const roomDelta = (30 - roomTemp) * 0.015;
    return factor * (1 + roomDelta);
  };

  const cooling = getCoolingFactor();
  const temp60s = Math.round((startTemp - 1.8 * cooling) * 10) / 10;
  const temp120s = Math.round((startTemp - 3.4 * cooling) * 10) / 10;
  const temp180s = Math.round((startTemp - 4.9 * cooling) * 10) / 10;

  const [selectedDefect, setSelectedDefect] = useState<string>('sour');

  const DEFECTS = [
    { id: 'sour', nameZh: '尖銳酸感 / 草本澀味', nameEn: 'Sour / Vegetal', causeZh: '主要原因：萃取不足 (Under-extraction) 或水溫過低。', causeEn: 'Cause: Under-extraction or water temp too low.', fixZh: '調校方針：\n1. 研磨度調細 1~2 格\n2. 水溫提升 +2°C ~ +3°C (92°C~95°C)\n3. 延長悶蒸時間 5~10 秒\n4. 增加繞圈注水力度提升擾動', fixEn: 'Fix:\n1. Grind 1–2 clicks finer\n2. Raise temp +2°C to +3°C (92–95°C)\n3. Extend bloom by 5–10s\n4. Increase pour agitation' },
    { id: 'bitter', nameZh: '苦尾刮喉 / 乾澀收斂', nameEn: 'Bitter / Astringent', causeZh: '主要原因：過度萃取 (Over-extraction) 或細粉堵塞通道效應 (Channeling)。', causeEn: 'Cause: Over-extraction or fines clogging (channeling).', fixZh: '調校方針：\n1. 研磨度調粗 1~2 格\n2. 水溫降低 -2°C ~ -4°C (86°C~89°C)\n3. 縮短總注水時間，採用大水流分段\n4. 水柱靠近粉面中心，避免沖刷濾紙邊緣', fixEn: 'Fix:\n1. Grind 1–2 clicks coarser\n2. Lower temp -2°C to -4°C (86–89°C)\n3. Shorten total pour time, use larger pulses\n4. Keep stream centered, avoid paper edges' },
    { id: 'weak', nameZh: '水感空洞 / 風味平淡', nameEn: 'Watery / Hollow', causeZh: '主要原因：粉水比過大 (水太多) 或萃取濃度過低。', causeEn: 'Cause: Ratio too high (too much water) or low extraction.', fixZh: '調校方針：\n1. 調整粉水比至 1:14 ~ 1:15\n2. 增加粉量 1~2 克\n3. 採用中心點滴或多段注水提升醇厚度', fixEn: 'Fix:\n1. Adjust ratio to 1:14–1:15\n2. Increase dose by 1–2g\n3. Use center drip or multi-pour for body' },
    { id: 'clogged', nameZh: '下水停滯 / 泥濘積水', nameEn: 'Stalled Flow / Muddy', causeZh: '主要原因：刀盤細粉過多，或晃動濾杯造成微粉沉降堵塞濾紙毛孔。', causeEn: 'Cause: Too many fines, or swirl settling fines into paper.', fixZh: '調校方針：\n1. 減少下壺搖晃 (Swirl) 力度\n2. 研磨前水滴防靜電 (RDT) 減少細粉吸附\n3. 調粗研磨度或使用滲透流手法', fixEn: 'Fix:\n1. Reduce swirl intensity\n2. Use RDT (water spray) to reduce static fines\n3. Grind coarser or try osmotic flow' },
  ];

  const TABS = [
    { id: 'tds' as const, icon: Calculator, labelZh: '萃取率 TDS', labelEn: 'TDS & EY%' },
    { id: 'pour' as const, icon: Droplets, labelZh: '注水手法', labelEn: 'Pour Art' },
    { id: 'water' as const, icon: Flame, labelZh: '水質與水溫', labelEn: 'Water & Temp' },
    { id: 'grind' as const, icon: Sliders, labelZh: '研磨與調校', labelEn: 'Tuning' },
    { id: 'tips' as const, icon: BookOpen, labelZh: '萃取心法', labelEn: 'Wisdom' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-1 select-none space-y-4 font-sans text-[#f0eeeb]">
      <div>
        {/* Header */}
        <ScreenHeader
          onBack={onBack}
          title={language === 'zh' ? '咖啡萃取實驗室' : 'Barista Lab'}

          rightAction={
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          }
        />

        {/* Tab Bar — Double-Bezel */}
        <div className="bezel-outer mb-4">
          <div className="flex gap-1 p-1 overflow-x-auto scrollbar-none">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2.5 rounded-xl transition-all duration-500 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 text-xs font-bold font-mono ${
                    isSelected
                      ? 'bg-amber-500 text-[#0a0a08]'
                      : 'text-[#f0eeeb]/35 hover:text-[#f0eeeb]/60 hover:bg-white/[0.03]'
                  }`}
                  style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? tab.labelZh : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: TDS & EY */}
        {activeTab === 'tds' && (
          <div className="space-y-4 animate-fade-slide-up">
            {/* EY Result — Double-Bezel */}
            <div className="bezel-card">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">EXTRACTION YIELD (EY %)</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${eyColor}`}>
                    {eyStatus === 'ideal' ? 'GOLDEN CUP' : eyStatus === 'under' ? 'UNDER' : 'OVER'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-4xl font-black font-mono text-white tracking-tight">
                    {eyPercentage.toFixed(2)}<span className="text-xl text-amber-400 font-bold ml-1">%</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#f0eeeb]/40 font-mono">{language === 'zh' ? '粉水濃度比 (Ratio)' : 'Brew Ratio'}</div>
                    <div className="text-sm font-bold font-mono text-[#f0eeeb]/80">1 : {(beverageWeight / (dose || 1)).toFixed(1)}</div>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${eyColor}`}>
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '萃取狀態評估' : 'Extraction Evaluation'}</span>
                  </div>
                  <p className="text-[#f0eeeb]/70">{language === 'zh' ? eyDiagnosisZh : eyDiagnosisEn}</p>
                </div>
              </div>
            </div>

            {/* Inputs — Double-Bezel */}
            <div className="bezel-card">
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#f0eeeb]/60 font-bold">{language === 'zh' ? '咖啡粉重 (Dose)' : 'Coffee Dose'}</span>
                    <span className="font-mono text-amber-400 font-bold">{dose} g</span>
                  </div>
                  <input type="range" min="10" max="30" step="0.5" value={dose} onChange={e => setDose(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#f0eeeb]/60 font-bold">{language === 'zh' ? '萃取液重 (Beverage Weight)' : 'Beverage Weight'}</span>
                    <span className="font-mono text-amber-400 font-bold">{beverageWeight} g</span>
                  </div>
                  <input type="range" min="150" max="450" step="5" value={beverageWeight} onChange={e => setBeverageWeight(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#f0eeeb]/60 font-bold">{language === 'zh' ? '咖啡濃度計 TDS (%)' : 'TDS (%)'}</span>
                    <span className="font-mono text-amber-400 font-bold">{tds.toFixed(2)} %</span>
                  </div>
                  <input type="range" min="0.8" max="2.0" step="0.01" value={tds} onChange={e => setTds(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { setDose(18); setBeverageWeight(270); setTds(1.35); }}
                    className="text-[11px] text-[#f0eeeb]/35 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors duration-300"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === 'zh' ? '重設標準參數' : 'Reset Standard'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SCA Formula */}
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/[0.03] space-y-2 text-xs text-[#f0eeeb]/40">
              <div className="text-[11px] font-bold font-mono text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? 'SCA GOLDEN CUP 標準公式' : 'SCA GOLDEN CUP FORMULA'}</span>
              </div>
              <p className="leading-relaxed">
                {language === 'zh'
                  ? '萃取率 (%) = [ 萃取液重 (g) × TDS (%) ] ÷ 咖啡粉重 (g)。SCA 建議黃金杯萃取率為 18% ~ 22%，濃度 TDS 落在 1.20% ~ 1.45% 為最均衡甜感區間。'
                  : 'Extraction Yield (%) = [ Beverage Weight (g) × TDS (%) ] ÷ Coffee Dose (g). SCA recommends 18%–22% EY with TDS 1.20%–1.45% for optimal sweetness.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Pour Art */}
        {activeTab === 'pour' && (
          <div className="space-y-4 animate-fade-slide-up">
            <ArtOfPouringCard />
            <div className="bezel-card">
              <div className="p-4 space-y-3">
                <div className="text-xs font-bold text-amber-400 font-mono flex items-center justify-between">
                  <span>{language === 'zh' ? '注水流速與擾動指南 (FLOW RATE & AGITATION)' : 'FLOW RATE & AGITATION GUIDE'}</span>
                  <span className="text-[10px] text-[#f0eeeb]/40">g / sec</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-2xl bg-black/30 space-y-1">
                    <div className="text-[10px] font-mono text-[#f0eeeb]/40">{language === 'zh' ? '溫柔點滴' : 'Gentle Drip'}</div>
                    <div className="text-sm font-black font-mono text-amber-400">2.0 ~ 3.0</div>
                    <div className="text-[10px] text-[#f0eeeb]/50">{language === 'zh' ? '極低擾動·花香乾淨' : 'Low agitation · Clean florals'}</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-amber-500/8 border border-amber-500/20 space-y-1">
                    <div className="text-[10px] font-mono text-amber-300">{language === 'zh' ? '黃金流速' : 'Golden Rate'}</div>
                    <div className="text-sm font-black font-mono text-amber-400">4.5 ~ 5.5</div>
                    <div className="text-[10px] text-[#f0eeeb]/70">{language === 'zh' ? '標準分段·酸甜平衡' : 'Standard pour · Balanced'}</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-black/30 space-y-1">
                    <div className="text-[10px] font-mono text-[#f0eeeb]/40">{language === 'zh' ? '大水流擾動' : 'Heavy Agitation'}</div>
                    <div className="text-sm font-black font-mono text-amber-400">6.5 ~ 8.0</div>
                    <div className="text-[10px] text-[#f0eeeb]/50">{language === 'zh' ? '高擾動·醇厚度強' : 'High agitation · Full body'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Water & Temp */}
        {activeTab === 'water' && (
          <div className="space-y-4 animate-fade-slide-up">
            {/* Kettle Heat Loss — Double-Bezel */}
            <div className="bezel-card">
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                    <Thermometer className="w-4 h-4" />
                    <span>{language === 'zh' ? '手沖壺水溫熱損耗模擬' : 'Kettle Heat Loss Simulator'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#f0eeeb]/40">{language === 'zh' ? '物理衰減模型' : 'Physics-based model'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#f0eeeb]/40">{language === 'zh' ? '起始水溫 (°C)' : 'Start Temp (°C)'}</label>
                    <input type="number" min="80" max="98" value={startTemp} onChange={e => setStartTemp(parseFloat(e.target.value) || 90)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500/50 transition-colors duration-300" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#f0eeeb]/40">{language === 'zh' ? '手沖壺材質' : 'Kettle Material'}</label>
                    <select value={kettleMaterial} onChange={e => setKettleMaterial(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300">
                      <option value="steel">{language === 'zh' ? '不銹鋼 (Stainless)' : 'Stainless Steel'}</option>
                      <option value="copper">{language === 'zh' ? '純銅保溫 (Copper)' : 'Copper'}</option>
                      <option value="ceramic">{language === 'zh' ? '陶瓷塗層 (Ceramic)' : 'Ceramic'}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-black/30 space-y-0.5">
                    <span className="text-[10px] font-mono text-[#f0eeeb]/40">{language === 'zh' ? '60 秒後' : 'After 60s'}</span>
                    <div className="text-base font-black font-mono text-amber-400">{temp60s}°C</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-black/30 space-y-0.5">
                    <span className="text-[10px] font-mono text-[#f0eeeb]/40">{language === 'zh' ? '120 秒後' : 'After 120s'}</span>
                    <div className="text-base font-black font-mono text-amber-400">{temp120s}°C</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-black/30 space-y-0.5">
                    <span className="text-[10px] font-mono text-[#f0eeeb]/40">{language === 'zh' ? '180 秒後' : 'After 180s'}</span>
                    <div className="text-base font-black font-mono text-amber-400">{temp180s}°C</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SCA Water Standard */}
            <div className="bezel-card">
              <div className="p-4 space-y-2.5">
                <div className="text-xs font-bold text-amber-400 font-mono">{language === 'zh' ? 'SCA 精品咖啡水質標準' : 'SCA Specialty Water Standards'}</div>
                <div className="space-y-1.5 text-xs">
                  {[
                    { label: language === 'zh' ? '總溶解固體 (TDS)' : 'Total Dissolved Solids (TDS)', value: '75 ~ 150 ppm' },
                    { label: language === 'zh' ? '鈣鎂總硬度 (GH)' : 'General Hardness (GH)', value: '50 ~ 70 ppm' },
                    { label: language === 'zh' ? '鹼度緩衝 (KH)' : 'Alkalinity Buffer (KH)', value: '40 ppm' },
                    { label: language === 'zh' ? '酸鹼值 (pH)' : 'pH Level', value: '6.5 ~ 7.5' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.03]">
                      <span className="text-[#f0eeeb]/60">{item.label}</span>
                      <span className="font-mono text-amber-400 font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Grind Tuning */}
        {activeTab === 'grind' && (
          <div className="space-y-4 animate-fade-slide-up">
            <div className="bezel-card">
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                  <Sliders className="w-4 h-4" />
                  <span>{language === 'zh' ? '風味缺陷快速調校矩陣' : 'Flavor Defect Quick Tuning'}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {DEFECTS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDefect(d.id)}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all duration-500 ${
                        selectedDefect === d.id
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                          : 'bg-black/30 border-white/[0.04] text-[#f0eeeb]/40 hover:text-[#f0eeeb]/70'
                      }`}
                      style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                    >
                      {language === 'zh' ? d.nameZh : d.nameEn}
                    </button>
                  ))}
                </div>
                {(() => {
                  const current = DEFECTS.find(d => d.id === selectedDefect) || DEFECTS[0];
                  return (
                    <div className="p-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/20 space-y-2 text-xs">
                      <div className="font-black text-white">{language === 'zh' ? current.nameZh : current.nameEn}</div>
                      <div className="text-amber-400 font-mono text-[11px]">{language === 'zh' ? current.causeZh : current.causeEn}</div>
                      <div className="text-[#f0eeeb]/70 whitespace-pre-line leading-relaxed text-[11px] bg-black/30 p-2.5 rounded-xl border border-white/[0.03]">
                        {language === 'zh' ? current.fixZh : current.fixEn}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Grinder Clicks */}
            <div className="bezel-card">
              <div className="p-4 space-y-2.5 text-xs">
                <div className="text-xs font-bold text-amber-400 font-mono">{language === 'zh' ? '主流磨豆機手沖刻度參考' : 'Popular Grinder Pour-Over Settings'}</div>
                <div className="space-y-1.5 font-mono">
                  {[
                    { name: 'Comandante C40 MK4', clicks: '22 ~ 26 Clicks' },
                    { name: '1Zpresso K-Ultra', clicks: '7.0 ~ 8.0' },
                    { name: 'Timemore C2 / C3', clicks: language === 'zh' ? '15 ~ 18 格' : '15 ~ 18 Clicks' },
                    { name: 'Fellow Ode Gen 2', clicks: '4.1 ~ 5.2' },
                  ].map((g, i) => (
                    <div key={i} className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.03]">
                      <span className="text-[#f0eeeb]/60 font-sans">{g.name}</span>
                      <span className="text-amber-400 font-bold">{g.clicks}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Wisdom */}
        {activeTab === 'tips' && (
          <div className="space-y-4 animate-fade-slide-up">
            <BrewingTipCard />
            <div className="bezel-card">
              <div className="p-4 space-y-2.5 text-xs">
                <div className="text-xs font-bold text-amber-400 font-mono">{language === 'zh' ? '精品手沖萃取三大不可逆定律' : 'Three Laws of Pour-Over Extraction'}</div>
                <ul className="space-y-2 text-[#f0eeeb]/70 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">01.</span>
                    <span><strong className="text-white">{language === 'zh' ? '前段釋放酸與花香：' : 'Front loads acidity & florals: '}</strong>{language === 'zh' ? '悶蒸與前 40% 水量決定香氣與酸度細緻度。' : 'Bloom and first 40% of water determine aroma and acidity clarity.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">02.</span>
                    <span><strong className="text-white">{language === 'zh' ? '中段釋放焦糖甜感：' : 'Mid extracts caramel sweetness: '}</strong>{language === 'zh' ? '60%~80% 水量萃取豐富糖類與水果熟甜。' : '60–80% of water extracts sugars and fruit ripeness.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">03.</span>
                    <span><strong className="text-white">{language === 'zh' ? '後段只留純淨水感：' : 'End preserves clean body: '}</strong>{language === 'zh' ? '80% 後咖啡已無正面風味，維持中心溫柔水柱避免過萃苦澀。' : 'After 80%, no positive flavors remain—keep a gentle center stream to avoid bitterness.'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="pt-2">
        <button onClick={onGoToRecipes || onBack} className="btn-primary">
          <span>{language === 'zh' ? '套用實驗心法 · 挑選手沖食譜' : 'Apply Principles & Select Recipe'}</span>
          <span className="btn-icon-nest">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        </button>
      </div>
    </div>
  );
};
