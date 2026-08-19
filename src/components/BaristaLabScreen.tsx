import React, { useState } from 'react';
import {
  ChevronLeft,
  Sparkles,
  Calculator,
  Droplets,
  Flame,
  Sliders,
  Compass,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Thermometer,
  Activity,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ArtOfPouringCard } from './ArtOfPouringCard';
import { BrewingTipCard } from './BrewingTipCard';
import { useLanguage } from '../utils/i18n';

interface BaristaLabScreenProps {
  onBack: () => void;
  onGoToRecipes?: () => void;
  onGoToBeans?: () => void;
}

export const BaristaLabScreen: React.FC<BaristaLabScreenProps> = ({
  onBack,
  onGoToRecipes,
  onGoToBeans,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'tds' | 'pour' | 'water' | 'grind' | 'tips'>('tds');

  // --- TDS & Extraction Yield Calculator State ---
  const [dose, setDose] = useState<number>(18);
  const [beverageWeight, setBeverageWeight] = useState<number>(270);
  const [tds, setTds] = useState<number>(1.35);

  // Extraction Yield calculation: EY% = (Beverage Weight * TDS%) / Coffee Dose
  const eyPercentage = dose > 0 ? (beverageWeight * (tds / 100) / dose) * 100 : 0;
  
  // EY Status evaluation
  let eyStatus = 'ideal';
  let eyDiagnosisZh = '理想黃金萃取區間 (SCA Golden Cup 18% ~ 22%)';
  let eyDiagnosisEn = 'Ideal Golden Cup Target (18% ~ 22%)';
  let eyColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';

  if (eyPercentage < 18) {
    eyStatus = 'under';
    eyDiagnosisZh = '萃取不足 (Under-extracted)：容易產生尖銳酸感、青草澀味與短促餘韻。建議：調細研磨度、提升水溫或延長悶蒸時間。';
    eyDiagnosisEn = 'Under-extracted: Sour, grassy, quick finish. Suggestion: Grind finer, raise water temp, or extend bloom.';
    eyColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  } else if (eyPercentage > 22) {
    eyStatus = 'over';
    eyDiagnosisZh = '過度萃取 (Over-extracted)：容易萃出木質澀感、苦尾與乾澀感。建議：調粗研磨度、降低水溫或減輕擾動水流。';
    eyDiagnosisEn = 'Over-extracted: Bitter, astringent, dry. Suggestion: Grind coarser, lower temp, or reduce agitation.';
    eyColor = 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  }

  // --- Water Temperature Decay Simulator State ---
  const [startTemp, setStartTemp] = useState<number>(93);
  const [kettleMaterial, setKettleMaterial] = useState<'steel' | 'copper' | 'ceramic'>('steel');
  const [roomTemp, setRoomTemp] = useState<number>(22);
  const [lidOpen, setLidOpen] = useState<boolean>(false);

  // Calculate temp at 60s, 120s, 180s based on cooling physics
  const getCoolingFactor = () => {
    let factor = 1.0;
    if (kettleMaterial === 'copper') factor = 0.85; // holds heat better
    if (kettleMaterial === 'ceramic') factor = 0.75;
    if (lidOpen) factor *= 1.4;
    const roomDelta = (30 - roomTemp) * 0.015;
    return factor * (1 + roomDelta);
  };

  const cooling = getCoolingFactor();
  const temp60s = Math.round((startTemp - 1.8 * cooling) * 10) / 10;
  const temp120s = Math.round((startTemp - 3.4 * cooling) * 10) / 10;
  const temp180s = Math.round((startTemp - 4.9 * cooling) * 10) / 10;

  // --- Troubleshooting Sensory Matrix State ---
  const [selectedDefect, setSelectedDefect] = useState<string>('sour');

  const DEFECTS = [
    {
      id: 'sour',
      nameZh: '尖銳酸感 / 草本澀味 (Sour / Vegetal)',
      nameEn: 'Sharp Acidity / Vegetal',
      causeZh: '主要原因：萃取不足 (Under-extraction) 或水溫過低。',
      fixZh: '調校方針：\n1. 研磨度調細 1~2 格\n2. 水溫提升 +2°C ~ +3°C (92°C~95°C)\n3. 延長悶蒸時間 5~10 秒\n4. 增加繞圈注水力度提升擾動',
    },
    {
      id: 'bitter',
      nameZh: '苦尾刮喉 / 乾澀收斂 (Bitter / Astringent)',
      nameEn: 'Bitter / Dry Astringency',
      causeZh: '主要原因：過度萃取 (Over-extraction) 或細粉堵塞通道效應 (Channeling)。',
      fixZh: '調校方針：\n1. 研磨度調粗 1~2 格\n2. 水溫降低 -2°C ~ -4°C (86°C~89°C)\n3. 縮短總注水時間，採用大水流分段\n4. 水柱靠近粉面中心，避免沖刷濾紙邊緣',
    },
    {
      id: 'weak',
      nameZh: '水感空洞 / 風味平淡 (Watery / Hollow)',
      nameEn: 'Watery / Low TDS',
      causeZh: '主要原因：粉水比過大 (水太多) 或萃取濃度過低。',
      fixZh: '調校方針：\n1. 調整粉水比至 1:14 ~ 1:15\n2. 增加粉量 1~2 克\n3. 採用中心點滴或多段注水提升醇厚度',
    },
    {
      id: 'clogged',
      nameZh: '下水停滯 / 泥濘積水 (Stalled Flow / Muddy)',
      nameEn: 'Stalled Drip / Muddy Bed',
      causeZh: '主要原因：刀盤細粉過多，或晃動濾杯造成微粉沉降堵塞濾紙毛孔。',
      fixZh: '調校方針：\n1. 減少下壺搖晃 (Swirl) 力度\n2. 研磨前水滴防靜電 (RDT) 減少細粉吸附\n3. 調粗研磨度或使用滲透流手法',
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-1 select-none space-y-3 font-sans text-slate-100">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between py-1 mb-2">
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-200 tracking-tight">
              {language === 'zh' ? '咖啡萃取實驗室' : 'Barista Lab'}
            </h2>
            <p className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              PRECISION EXTRACTION SUITE
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex gap-1 overflow-x-auto pb-1 p-1 rounded-2xl bg-black/40 border border-white/[0.06] mb-3 text-xs font-bold font-mono scrollbar-none">
          {[
            { id: 'tds', icon: Calculator, labelZh: '萃取率 TDS', labelEn: 'TDS & EY%' },
            { id: 'pour', icon: Droplets, labelZh: '注水手法', labelEn: 'Pour Art' },
            { id: 'water', icon: Flame, labelZh: '水質與水溫', labelEn: 'Water & Temp' },
            { id: 'grind', icon: Sliders, labelZh: '研磨與調校', labelEn: 'Tuning' },
            { id: 'tips', icon: BookOpen, labelZh: '萃取心法', labelEn: 'Wisdom' },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? tab.labelZh : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: TDS & EXTRACTION YIELD CALCULATOR */}
        {activeTab === 'tds' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* EY Calculation Result Display */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#161412] to-[#12100e] border border-white/[0.08] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  EXTRACTION YIELD (EY %)
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${eyColor}`}>
                  {eyStatus === 'ideal' ? 'GOLDEN CUP' : eyStatus === 'under' ? 'UNDER' : 'OVER'}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-4xl font-black font-mono text-white tracking-tight">
                  {eyPercentage.toFixed(2)}
                  <span className="text-xl text-amber-400 font-bold ml-1">%</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">粉水濃度比 (Ratio)</div>
                  <div className="text-sm font-bold font-mono text-slate-200">
                    1 : {(beverageWeight / (dose || 1)).toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Diagnosis box */}
              <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${eyColor}`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '萃取狀態評估' : 'Extraction Evaluation'}</span>
                </div>
                <p className="text-slate-300">
                  {language === 'zh' ? eyDiagnosisZh : eyDiagnosisEn}
                </p>
              </div>
            </div>

            {/* Interactive Inputs Card */}
            <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] space-y-3.5 shadow-lg">
              {/* Coffee Dose Input */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-bold">{language === 'zh' ? '咖啡粉重 (Dose)' : 'Coffee Dose'}</span>
                  <span className="font-mono text-amber-400 font-bold">{dose} g</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="0.5"
                  value={dose}
                  onChange={e => setDose(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Beverage Weight Input */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-bold">{language === 'zh' ? '萃取液重 (Beverage Weight)' : 'Beverage Weight'}</span>
                  <span className="font-mono text-amber-400 font-bold">{beverageWeight} g</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="450"
                  step="5"
                  value={beverageWeight}
                  onChange={e => setBeverageWeight(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* TDS Input */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-bold">{language === 'zh' ? '咖啡濃度計 TDS (%)' : 'TDS (%)'}</span>
                  <span className="font-mono text-amber-400 font-bold">{tds.toFixed(2)} %</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.0"
                  step="0.01"
                  value={tds}
                  onChange={e => setTds(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Reset defaults button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setDose(18);
                    setBeverageWeight(270);
                    setTds(1.35);
                  }}
                  className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{language === 'zh' ? '重設標準參數 (18g / 270g / 1.35%)' : 'Reset Standard'}</span>
                </button>
              </div>
            </div>

            {/* SCA Golden Cup Chart Explainer */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2 text-xs text-slate-400">
              <div className="text-[11px] font-bold font-mono text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>SCA GOLDEN CUP 標準公式</span>
              </div>
              <p className="leading-relaxed">
                萃取率 (%) = [ 萃取液重 (g) × TDS (%) ] ÷ 咖啡粉重 (g)。SCA 建議黃金杯萃取率為 18% ~ 22%，濃度 TDS 落在 1.20% ~ 1.45% 為最均衡甜感區間。
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: ART OF POURING & FLOW DYNAMICS */}
        {activeTab === 'pour' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Integrated ArtOfPouringCard */}
            <ArtOfPouringCard />

            {/* Pour Speed Guide */}
            <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] space-y-3 shadow-lg">
              <div className="text-xs font-bold text-amber-400 font-mono flex items-center justify-between">
                <span>注水流速與擾動指南 (FLOW RATE & AGITATION)</span>
                <span className="text-[10px] text-slate-400">g / sec</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">溫柔點滴</div>
                  <div className="text-sm font-black font-mono text-amber-400">2.0 ~ 3.0</div>
                  <div className="text-[10px] text-slate-300">極低擾動·花香乾淨</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="text-[10px] font-mono text-amber-300">黃金流速</div>
                  <div className="text-sm font-black font-mono text-amber-400">4.5 ~ 5.5</div>
                  <div className="text-[10px] text-slate-200">標準分段·酸甜平衡</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">大水流擾動</div>
                  <div className="text-sm font-black font-mono text-amber-400">6.5 ~ 8.0</div>
                  <div className="text-[10px] text-slate-300">高擾動·醇厚度強</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WATER MINERALS & KETTLE TEMPERATURE DECAY */}
        {activeTab === 'water' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Kettle Temperature Decay Simulator */}
            <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                  <Thermometer className="w-4 h-4" />
                  <span>手沖壺水溫熱損耗模擬 (KETTLE HEAT LOSS)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">物理衰減模型</span>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">起始水溫 (°C)</label>
                  <input
                    type="number"
                    min="80"
                    max="98"
                    value={startTemp}
                    onChange={e => setStartTemp(parseFloat(e.target.value) || 90)}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs font-mono text-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">手沖壺材質</label>
                  <select
                    value={kettleMaterial}
                    onChange={e => setKettleMaterial(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white"
                  >
                    <option value="steel">不銹鋼 (Stainless)</option>
                    <option value="copper">純銅保溫 (Copper)</option>
                    <option value="ceramic">陶瓷塗層 (Ceramic)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Temp Drops Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400">60 秒後 (第一段)</span>
                  <div className="text-base font-black font-mono text-amber-400">{temp60s}°C</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400">120 秒後 (第二段)</span>
                  <div className="text-base font-black font-mono text-amber-400">{temp120s}°C</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400">180 秒後 (尾段)</span>
                  <div className="text-base font-black font-mono text-amber-400">{temp180s}°C</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                💡 萃取心法：注水尾段水溫自然下降 3~5°C，有助於大幅減少尾段苦澀雜質萃出，正是精品手沖甘甜純淨的秘密！
              </p>
            </div>

            {/* SCA Water Standard Guide */}
            <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] space-y-2.5 shadow-lg">
              <div className="text-xs font-bold text-amber-400 font-mono">
                SCA 精品咖啡水質標準 (WATER RECIPE)
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.05]">
                  <span className="text-slate-300">總溶解固體 (TDS)</span>
                  <span className="font-mono text-amber-400 font-bold">75 ~ 150 ppm</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.05]">
                  <span className="text-slate-300">鈣鎂總硬度 (GH)</span>
                  <span className="font-mono text-amber-400 font-bold">50 ~ 70 ppm (萃取花果香)</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.05]">
                  <span className="text-slate-300">鹼度緩衝 (KH / Alkalinity)</span>
                  <span className="font-mono text-amber-400 font-bold">40 ppm (中和刺激酸感)</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.05]">
                  <span className="text-slate-300">酸鹼值 (pH)</span>
                  <span className="font-mono text-amber-400 font-bold">6.5 ~ 7.5 (中性)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GRIND CALIBRATION & DEFECT TROUBLESHOOTING */}
        {activeTab === 'grind' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Interactive Defect Troubleshooting Finder */}
            <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] space-y-3 shadow-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                <Sliders className="w-4 h-4" />
                <span>風味缺陷快速調校矩陣 (SENSORY TUNING)</span>
              </div>

              {/* Defect selector tabs */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {DEFECTS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDefect(d.id)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                      selectedDefect === d.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-black/40 border-white/[0.06] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d.nameZh.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Selected Defect Solution Box */}
              {(() => {
                const current = DEFECTS.find(d => d.id === selectedDefect) || DEFECTS[0];
                return (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                    <div className="font-black text-white">{current.nameZh}</div>
                    <div className="text-amber-400 font-mono text-[11px]">{current.causeZh}</div>
                    <div className="text-slate-200 whitespace-pre-line leading-relaxed text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/[0.05]">
                      {current.fixZh}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Popular Grinder Clicks Calibration */}
            <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] space-y-2.5 shadow-lg text-xs">
              <div className="text-xs font-bold text-amber-400 font-mono">
                主流磨豆機手沖刻度參考 (GRINDER CLICKS)
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.05]">
                  <span className="text-slate-300 font-sans">Comandante C40 MK4</span>
                  <span className="text-amber-400 font-bold">22 ~ 26 Clicks</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.05]">
                  <span className="text-slate-300 font-sans">1Zpresso K-Ultra</span>
                  <span className="text-amber-400 font-bold">7.0 ~ 8.0</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.05]">
                  <span className="text-slate-300 font-sans">Timemore 泰摩 C2 / C3</span>
                  <span className="text-amber-400 font-bold">15 ~ 18 格</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-black/30 border border-white/[0.05]">
                  <span className="text-slate-300 font-sans">Fellow Ode Gen 2</span>
                  <span className="text-amber-400 font-bold">4.1 ~ 5.2</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DAILY EXTRACTION WISDOM */}
        {activeTab === 'tips' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <BrewingTipCard />

            <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] space-y-2.5 shadow-lg text-xs">
              <div className="text-xs font-bold text-amber-400 font-mono">
                精品手沖萃取三大不可逆定律
              </div>
              <ul className="space-y-2 text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">01.</span>
                  <span><strong>前段釋放酸與花香：</strong> 悶蒸與前 40% 水量決定香氣與酸度細緻度。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">02.</span>
                  <span><strong>中段釋放焦糖甜感：</strong> 60%~80% 水量萃取豐富糖類與水果熟甜。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">03.</span>
                  <span><strong>後段只留純淨水感：</strong> 80% 後咖啡已無正面風味，維持中心溫柔水柱避免過萃苦澀。</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Navigation Link to Brew / Recipes */}
      <div className="pt-2">
        <button
          onClick={onGoToRecipes || onBack}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs tracking-wider shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
        >
          <span>{language === 'zh' ? '套用實驗心法 · 挑選手沖食譜' : 'Apply Principles & Select Recipe'}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
