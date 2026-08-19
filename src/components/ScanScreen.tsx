import React, { useState } from 'react';
import { ChevronLeft, Coffee, Sparkles, Compass, Check, Flame, Droplets, BookOpen, X, ArrowRight } from 'lucide-react';
import sampleBeans from '../data/sampleBeans.json';
import { BeanInfo, Recipe } from '../types';
import { ASSETS } from '../assets';
import { useLanguage } from '../utils/i18n';

interface ScanScreenProps {
  onBack: () => void;
  onBeanIdentified: (bean: BeanInfo) => void;
  recipes: Recipe[];
}

const ROAST_LEVELS: { id: BeanInfo['roastLevel']; labelZh: string; labelEn: string; tempHint: string; profileZh: string; profileEn: string }[] = [
  {
    id: '淺焙 (Light)',
    labelZh: '極淺焙 / 淺焙',
    labelEn: 'Light Roast',
    tempHint: '93°C ~ 95°C',
    profileZh: '明亮花香、細緻果酸、茶感清爽',
    profileEn: 'Floral, Bright Citrus Acidity, Tea-like',
  },
  {
    id: '中淺焙 (Medium-Light)',
    labelZh: '中淺焙',
    labelEn: 'Medium-Light',
    tempHint: '91°C ~ 93°C',
    profileZh: '果甜平衡、蜂蜜核果、微酸柔和',
    profileEn: 'Balanced Sweetness, Honey & Stone Fruit',
  },
  {
    id: '中焙 (Medium)',
    labelZh: '中度烘焙',
    labelEn: 'Medium Roast',
    tempHint: '88°C ~ 90°C',
    profileZh: '焦糖堅果、圓潤厚實、甜感明顯',
    profileEn: 'Caramel, Nutty, Rounded Body & Sweetness',
  },
  {
    id: '中深焙 (Medium-Dark)',
    labelZh: '中深焙',
    labelEn: 'Medium-Dark',
    tempHint: '85°C ~ 88°C',
    profileZh: '黑巧克力、可可茶韻、醇厚甘苦',
    profileEn: 'Dark Chocolate, Cocoa, Rich Body',
  },
  {
    id: '深焙 (Dark)',
    labelZh: '深焙 / 義式',
    labelEn: 'Dark Roast',
    tempHint: '83°C ~ 86°C',
    profileZh: '煙燻可可、油脂感強、極低酸度',
    profileEn: 'Smoky, Heavy Body, Zero Acidity',
  },
];

const PROCESS_METHODS: { id: BeanInfo['process']; labelZh: string; labelEn: string }[] = [
  { id: '水洗 (Washed)', labelZh: '水洗處理法 (Washed)', labelEn: 'Washed' },
  { id: '日曬 (Natural)', labelZh: '日曬處理法 (Natural)', labelEn: 'Natural' },
  { id: '蜜處理 (Honey)', labelZh: '蜜處理 (Honey)', labelEn: 'Honey' },
  { id: '厭氧 (Anaerobic)', labelZh: '厭氧發酵 (Anaerobic)', labelEn: 'Anaerobic / Experimental' },
];

const POPULAR_FLAVOR_TAGS = [
  '茉莉花香', '佛手柑', '柑橘酸甜', '白桃', '黑莓', '蜂蜜', '伯爵茶', '焦糖', '黑巧克力', '堅果榛果', '熱帶水果', '紅酒發酵'
];

export const ScanScreen: React.FC<ScanScreenProps> = ({
  onBack,
  onBeanIdentified,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'preset' | 'manual'>('preset');
  const [showFlavorWheelModal, setShowFlavorWheelModal] = useState<boolean>(false);

  // Manual input fields
  const [beanName, setBeanName] = useState<string>('衣索比亞 耶加雪菲 沃卡 G1');
  const [origin, setOrigin] = useState<string>('衣索比亞 耶加雪菲 (Ethiopia Yirgacheffe)');
  const [roastLevel, setRoastLevel] = useState<BeanInfo['roastLevel']>('中淺焙 (Medium-Light)');
  const [process, setProcess] = useState<BeanInfo['process']>('水洗 (Washed)');
  const [flavorNotes, setFlavorNotes] = useState<string>('白色花香, 柑橘, 蜂蜜檸檬, 綠茶尾韻');

  // Pick sample preset
  const handleSelectSample = (sample: BeanInfo) => {
    setBeanName(sample.name);
    setOrigin(sample.origin || '');
    setRoastLevel(sample.roastLevel);
    setProcess(sample.process);
    setFlavorNotes(sample.flavorNotes.join(', '));
  };

  const toggleFlavorTag = (tag: string) => {
    const existing = flavorNotes.split(',').map(s => s.trim()).filter(Boolean);
    if (existing.includes(tag)) {
      setFlavorNotes(existing.filter(t => t !== tag).join(', '));
    } else {
      setFlavorNotes([...existing, tag].join(', '));
    }
  };

  // Determine smart recipe mapping
  const getSmartRecommendedRecipe = () => {
    if (roastLevel.includes('Light') || roastLevel.includes('淺')) {
      return {
        id: 'hoffmann-single',
        nameZh: 'Hoffmann 極簡單次注水法',
        nameEn: 'Hoffmann Single Pour',
        reasonZh: '適合高海拔淺焙豆，高溫 93°C + 大水流均勻萃取細緻花果香氣。',
        reasonEn: 'Optimal for light roast florals with 93°C water & gentle single pour.',
      };
    }
    if (roastLevel.includes('Dark') || roastLevel.includes('深')) {
      return {
        id: 'tetsu-46',
        nameZh: '粕谷哲 4:6 分段萃取法',
        nameEn: 'Tetsu Kasuya 4:6 Method',
        reasonZh: '深焙專用低溫 86°C 分段萃取，前段鎖定甜感、後段調整醇厚度與乾淨度。',
        reasonEn: '86°C staged pour to highlight dark chocolate sweetness with zero bitterness.',
      };
    }
    if (process.includes('Anaerobic') || process.includes('厭氧')) {
      return {
        id: 'osmotic-flow',
        nameZh: '河野式 點滴滲透流手法',
        nameEn: 'Osmotic Flow Method',
        reasonZh: '特殊發酵豆中心點滴注水，極致放大酒香與發酵果甜層次。',
        reasonEn: 'Center osmotic drip to extract maximum fermented fruit & wine aromatics.',
      };
    }
    return {
      id: 'standard-drip',
      nameZh: '經典黃金三段式手沖',
      nameEn: 'Classic 3-Stage Drip',
      reasonZh: '三段式均衡釋放酸質、甜感與回甘，展現最均衡的產區風味。',
      reasonEn: 'Balanced 3-stage pour for optimal sweetness and clean acidity.',
    };
  };

  const smartRecipe = getSmartRecommendedRecipe();

  const handleApplyBean = () => {
    const notesArray = flavorNotes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newBean: BeanInfo = {
      name: beanName.trim() || (language === 'zh' ? '精品手沖咖啡豆' : 'Specialty Drip Bean'),
      origin: origin.trim() || (language === 'zh' ? '經典精品產區' : 'Specialty Origin'),
      roastLevel,
      process,
      flavorNotes: notesArray.length > 0 ? notesArray : ['花香', '柑橘', '焦糖甜感'],
      recommendedRecipeId: smartRecipe.id,
    };

    onBeanIdentified(newBean);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between pb-6 pt-1 select-none space-y-4 font-sans text-slate-100">
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
              {t('scan.title')}
            </h2>
          </div>
          <button
            onClick={() => setShowFlavorWheelModal(true)}
            title={t('scan.flavorWheel')}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 hover:text-white active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Preset Estates vs Manual Builder */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/[0.06] mb-3 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab('preset')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'preset'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '世界名莊示範豆' : 'Estate Presets'}</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '手動填寫/自訂' : 'Custom Input'}</span>
          </button>
        </div>

        {/* Tab 1: Preset Estates List */}
        {activeTab === 'preset' && (
          <div className="space-y-2.5 mb-3">
            <div className="text-[11px] font-mono text-slate-400 px-1 font-semibold flex items-center justify-between">
              <span>{language === 'zh' ? '點選快速載入產區風味與烘焙度：' : 'Select to load origin & roast specs:'}</span>
              <span className="text-amber-400">{sampleBeans.length} 款經典莊園</span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {sampleBeans.map((bean, idx) => {
                const isSelected = beanName === bean.name;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectSample(bean as BeanInfo)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'bg-[#12141a] hover:bg-[#181b22] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5 max-w-[80%]">
                        <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                          <span>{bean.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          {bean.origin} · {bean.process}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-mono shrink-0">
                        {bean.roastLevel}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {bean.flavorNotes.map((note, nIdx) => (
                        <span
                          key={nIdx}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-black/40 border border-white/[0.05] text-slate-300 font-medium"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Manual Builder Form */}
        {activeTab === 'manual' && (
          <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] mb-3 space-y-3 shadow-xl">
            {/* Bean Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-amber-400 font-mono">
                {language === 'zh' ? '咖啡豆名稱' : 'Coffee Bean Name'}
              </label>
              <input
                type="text"
                value={beanName}
                onChange={e => setBeanName(e.target.value)}
                placeholder={language === 'zh' ? '例如：巴拿馬 翡翠莊園 藝妓' : 'e.g. Panama Geisha'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Origin & Region Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-amber-400 font-mono">
                {language === 'zh' ? '產區 / 莊園 / 海拔' : 'Origin / Estate / Elevation'}
              </label>
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder={language === 'zh' ? '例如：衣索比亞 耶加雪菲 2000m' : 'e.g. Ethiopia Yirgacheffe 2000m'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Roast Level Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-amber-400 font-mono">
                {language === 'zh' ? '烘焙度 (決定萃取水溫與手法)' : 'Roast Level'}
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {ROAST_LEVELS.map(rl => {
                  const isSelected = roastLevel === rl.id;
                  return (
                    <div
                      key={rl.id}
                      onClick={() => setRoastLevel(rl.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/60 text-white font-bold'
                          : 'bg-black/30 hover:bg-black/50 border-white/[0.06] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span>{language === 'zh' ? rl.labelZh : rl.labelEn}</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400/90">{rl.tempHint}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Process Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-amber-400 font-mono">
                {language === 'zh' ? '生豆處理法' : 'Processing Method'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PROCESS_METHODS.map(pm => {
                  const isSelected = process === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setProcess(pm.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-medium ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                          : 'bg-black/30 hover:bg-black/50 border-white/[0.06] text-slate-300'
                      }`}
                    >
                      {language === 'zh' ? pm.labelZh.split(' ')[0] : pm.labelEn}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flavor Notes Tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-amber-400 font-mono flex items-center justify-between">
                <span>{language === 'zh' ? '風味筆記 / 特徵' : 'Flavor Notes'}</span>
                <span className="text-[10px] text-slate-400 font-normal">{language === 'zh' ? '點擊標籤快速加入' : 'Tap to add'}</span>
              </label>
              <input
                type="text"
                value={flavorNotes}
                onChange={e => setFlavorNotes(e.target.value)}
                placeholder="花香, 柑橘, 蜂蜜..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {POPULAR_FLAVOR_TAGS.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleFlavorTag(tag)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.05] hover:bg-amber-500/20 hover:text-amber-300 border border-white/[0.06] text-slate-300 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Smart Extraction Heuristics Recommendation Preview Card */}
        <div className="p-4 rounded-3xl bg-[#12141a] border border-amber-500/30 mb-3 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '智能手沖推薦手法' : 'Recommended Brew Profile'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              100% 離線本地運算
            </span>
          </div>

          <div className="text-sm font-extrabold text-white">
            {language === 'zh' ? smartRecipe.nameZh : smartRecipe.nameEn}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {language === 'zh' ? smartRecipe.reasonZh : smartRecipe.reasonEn}
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={handleApplyBean}
          className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[54px]"
        >
          <span>{language === 'zh' ? '套用此豆並配對沖煮手法' : 'Apply Bean & Match Recipe'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Specialty Flavor Wheel Modal */}
      {showFlavorWheelModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-[#12141a] border border-white/[0.1] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">SCA FLAVOR WHEEL</div>
                <h3 className="text-lg font-black text-slate-100">{t('scan.flavorWheelTitle')}</h3>
              </div>
              <button
                onClick={() => setShowFlavorWheelModal(false)}
                className="p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-slate-950 aspect-square">
              <img
                src={ASSETS.coffeeFlavor}
                alt="SCA Coffee Flavor Wheel"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t('scan.flavorWheelDesc')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
