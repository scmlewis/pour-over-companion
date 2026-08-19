import React, { useState } from 'react';
import {
  ChevronLeft,
  Coffee,
  Plus,
  Trash2,
  Edit3,
  Check,
  Flame,
  Droplets,
  Compass,
  X,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Calendar,
  Mountain,
} from 'lucide-react';
import sampleBeans from '../data/sampleBeans.json';
import { BeanInfo, Recipe } from '../types';
import { ASSETS } from '../assets';
import { useLanguage } from '../utils/i18n';

interface BeanCellarScreenProps {
  activeBean: BeanInfo | null;
  customBeans: BeanInfo[];
  recipes: Recipe[];
  onBack: () => void;
  onSelectBean: (bean: BeanInfo) => void;
  onSaveBean: (bean: BeanInfo) => Promise<void>;
  onDeleteBean: (id: string) => Promise<void>;
  onBrewWithBean: (bean: BeanInfo) => void;
}

const ROAST_LEVELS: {
  id: BeanInfo['roastLevel'];
  labelZh: string;
  labelEn: string;
  tempHint: string;
  profileZh: string;
  profileEn: string;
}[] = [
  {
    id: '極淺焙 (Ultra-Light)',
    labelZh: '極淺焙 (Ultra-Light)',
    labelEn: 'Ultra-Light Roast',
    tempHint: '94°C ~ 96°C',
    profileZh: '極致花香與細緻果酸，茶感輕盈',
    profileEn: 'High floral, crisp fruit acidity, tea-like body',
  },
  {
    id: '淺焙 (Light)',
    labelZh: '淺度烘焙 (Light)',
    labelEn: 'Light Roast',
    tempHint: '92°C ~ 94°C',
    profileZh: '明亮花香、柑橘酸甜、果汁感豐富',
    profileEn: 'Bright floral, citrus acidity, juicy body',
  },
  {
    id: '中淺焙 (Medium-Light)',
    labelZh: '中淺焙 (Medium-Light)',
    labelEn: 'Medium-Light',
    tempHint: '90°C ~ 92°C',
    profileZh: '蜂蜜核果、酸甜平衡、口感滑順',
    profileEn: 'Stone fruit, honey sweetness, balanced acidity',
  },
  {
    id: '中焙 (Medium)',
    labelZh: '中度烘焙 (Medium)',
    labelEn: 'Medium Roast',
    tempHint: '88°C ~ 90°C',
    profileZh: '焦糖堅果、圓潤厚實、甜感明顯',
    profileEn: 'Caramel, roasted nuts, rounded sweetness',
  },
  {
    id: '中深焙 (Medium-Dark)',
    labelZh: '中深焙 (Medium-Dark)',
    labelEn: 'Medium-Dark',
    tempHint: '85°C ~ 88°C',
    profileZh: '黑巧克力、可可茶韻、醇厚甘苦',
    profileEn: 'Dark chocolate, cocoa, rich body',
  },
  {
    id: '深焙 (Dark)',
    labelZh: '深焙 (Dark)',
    labelEn: 'Dark Roast',
    tempHint: '83°C ~ 86°C',
    profileZh: '煙燻可可、油脂感強、低酸度厚實',
    profileEn: 'Smoky, cocoa butter, low acidity & heavy body',
  },
];

const PROCESS_METHODS: { id: BeanInfo['process']; labelZh: string; labelEn: string }[] = [
  { id: '水洗 (Washed)', labelZh: '水洗處理法 (Washed)', labelEn: 'Washed' },
  { id: '日曬 (Natural)', labelZh: '日曬處理法 (Natural)', labelEn: 'Natural' },
  { id: '蜜處理 (Honey)', labelZh: '蜜處理 (Honey)', labelEn: 'Honey' },
  { id: '厭氧 (Anaerobic)', labelZh: '厭氧發酵 (Anaerobic)', labelEn: 'Anaerobic' },
  { id: '雙重厭氧 (Double Anaerobic)', labelZh: '雙重厭氧 (Double Anaerobic)', labelEn: 'Double Anaerobic' },
  { id: '特殊處理 (Experimental)', labelZh: '特殊實驗處理 (Experimental)', labelEn: 'Experimental' },
];

const POPULAR_FLAVOR_TAGS = [
  '茉莉花香', '佛手柑', '柑橘酸甜', '白桃', '黑莓', '蜂蜜', '伯爵茶', '焦糖', '黑巧克力', '堅果榛果', '熱帶水果', '紅酒發酵'
];

export const BeanCellarScreen: React.FC<BeanCellarScreenProps> = ({
  activeBean,
  customBeans,
  recipes,
  onBack,
  onSelectBean,
  onSaveBean,
  onDeleteBean,
  onBrewWithBean,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'inventory' | 'edit'>('inventory');
  const [showFlavorWheelModal, setShowFlavorWheelModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roastFilter, setRoastFilter] = useState<string>('all');
  const [saving, setSaving] = useState<boolean>(false);

  // Edit / Add Form state
  const [editingBeanId, setEditingBeanId] = useState<string | null>(null);
  const [beanName, setBeanName] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [varietal, setVarietal] = useState<string>('');
  const [elevation, setElevation] = useState<string>('');
  const [roastDate, setRoastDate] = useState<string>('');
  const [roastLevel, setRoastLevel] = useState<BeanInfo['roastLevel']>('淺焙 (Light)');
  const [process, setProcess] = useState<BeanInfo['process']>('水洗 (Washed)');
  const [flavorNotes, setFlavorNotes] = useState<string>('');

  // Combined beans list
  const allBeans: BeanInfo[] = [
    ...customBeans,
    ...(sampleBeans as BeanInfo[]),
  ];

  // Filtered beans list
  const filteredBeans = allBeans.filter(bean => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      bean.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bean.origin && bean.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bean.flavorNotes && bean.flavorNotes.some(fn => fn.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesRoast =
      roastFilter === 'all' ||
      (roastFilter === 'light' && (bean.roastLevel.includes('Light') || bean.roastLevel.includes('淺'))) ||
      (roastFilter === 'medium' && (bean.roastLevel.includes('Medium') || bean.roastLevel.includes('中'))) ||
      (roastFilter === 'dark' && (bean.roastLevel.includes('Dark') || bean.roastLevel.includes('深')));

    return matchesSearch && matchesRoast;
  });

  // Open Form to Add New Bean
  const handleOpenAddBean = () => {
    setEditingBeanId(null);
    setBeanName('');
    setOrigin('');
    setVarietal('');
    setElevation('');
    setRoastDate(new Date().toISOString().split('T')[0]);
    setRoastLevel('中淺焙 (Medium-Light)');
    setProcess('水洗 (Washed)');
    setFlavorNotes('花香, 柑橘, 蜂蜜');
    setActiveTab('edit');
  };

  // Open Form to Edit an Existing Bean
  const handleOpenEditBean = (bean: BeanInfo) => {
    setEditingBeanId(bean.id || null);
    setBeanName(bean.name);
    setOrigin(bean.origin || '');
    setVarietal(bean.varietal || '');
    setElevation(bean.elevation || '');
    setRoastDate(bean.roastDate || '');
    setRoastLevel(bean.roastLevel);
    setProcess(bean.process);
    setFlavorNotes(bean.flavorNotes ? bean.flavorNotes.join(', ') : '');
    setActiveTab('edit');
  };

  const toggleFlavorTag = (tag: string) => {
    const existing = flavorNotes.split(',').map(s => s.trim()).filter(Boolean);
    if (existing.includes(tag)) {
      setFlavorNotes(existing.filter(t => t !== tag).join(', '));
    } else {
      setFlavorNotes([...existing, tag].join(', '));
    }
  };

  // Smart Recipe recommendation logic
  const getSmartRecommendedRecipe = () => {
    if (roastLevel.includes('Light') || roastLevel.includes('淺')) {
      return {
        id: 'hoffmann-single',
        nameZh: 'Hoffmann 極簡單次注水法',
        nameEn: 'Hoffmann Single Pour',
        reasonZh: '淺焙高溫 93°C + 大水流均勻萃取細緻花果香氣與乾淨酸質。',
        reasonEn: 'Optimal for light roast florals with 93°C water & gentle single pour.',
      };
    }
    if (roastLevel.includes('Dark') || roastLevel.includes('深')) {
      return {
        id: 'tetsu-46',
        nameZh: '粕谷哲 4:6 分段萃取法',
        nameEn: 'Tetsu Kasuya 4:6 Method',
        reasonZh: '深焙低溫 86°C 粗研磨分段萃取，前段鎖定甜感、後段避免苦澀雜味。',
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

  // Save Bean Handler
  const handleSaveForm = async () => {
    if (!beanName.trim()) return;
    setSaving(true);

    const notesArray = flavorNotes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const beanData: BeanInfo = {
      id: editingBeanId || `bean_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: beanName.trim(),
      origin: origin.trim() || (language === 'zh' ? '精品產區' : 'Specialty Origin'),
      varietal: varietal.trim() || undefined,
      elevation: elevation.trim() || undefined,
      roastDate: roastDate.trim() || undefined,
      roastLevel,
      process,
      flavorNotes: notesArray.length > 0 ? notesArray : ['花香', '柑橘', '焦糖甜感'],
      recommendedRecipeId: smartRecipe.id,
      isCustom: true,
    };

    try {
      await onSaveBean(beanData);
      onSelectBean(beanData);
      setActiveTab('inventory');
    } finally {
      setSaving(false);
    }
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
              {language === 'zh' ? '精品豆窖與豆單' : 'Bean Cellar & Profiler'}
            </h2>
            <p className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              SPECIALTY BEAN CELLAR ({allBeans.length})
            </p>
          </div>
          <button
            onClick={() => setShowFlavorWheelModal(true)}
            title={t('scan.flavorWheel')}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 hover:text-white active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Inventory vs Add/Edit */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/[0.06] mb-3 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? `豆窖清單 (${allBeans.length})` : `Cellar (${allBeans.length})`}</span>
          </button>

          <button
            onClick={handleOpenAddBean}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingBeanId ? (language === 'zh' ? '編輯豆種' : 'Edit Bean') : (language === 'zh' ? '新增豆單' : 'Add Bean')}</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY & VAULT */}
        {activeTab === 'inventory' && (
          <div className="space-y-3">
            {/* Active Bean Banner */}
            {activeBean && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#181512] to-amber-500/10 border border-amber-500/50 shadow-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'zh' ? '當前選用沖煮豆' : 'Active Bean'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                    {activeBean.roastLevel}
                  </span>
                </div>
                <div className="text-sm font-black text-white">{activeBean.name}</div>
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>{activeBean.origin} · {activeBean.process}</span>
                  <button
                    onClick={() => onBrewWithBean(activeBean)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-sm transition-all"
                  >
                    <span>{language === 'zh' ? '即刻沖煮' : 'Brew'}</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={language === 'zh' ? '搜尋豆名、產區或風味標籤...' : 'Search beans, origins, notes...'}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Roast Filters */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                {[
                  { id: 'all', labelZh: '全部烘焙', labelEn: 'All' },
                  { id: 'light', labelZh: '淺焙 / 極淺', labelEn: 'Light' },
                  { id: 'medium', labelZh: '中焙 / 中淺', labelEn: 'Medium' },
                  { id: 'dark', labelZh: '中深 / 深焙', labelEn: 'Dark' },
                ].map(rf => (
                  <button
                    key={rf.id}
                    onClick={() => setRoastFilter(rf.id)}
                    className={`px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${
                      roastFilter === rf.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                        : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {language === 'zh' ? rf.labelZh : rf.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Beans Cards List */}
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {filteredBeans.length === 0 ? (
                <div className="text-center py-8 rounded-2xl bg-black/30 border border-white/[0.05] space-y-2">
                  <Coffee className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    {language === 'zh' ? '找不到相符的咖啡豆' : 'No coffee beans match criteria'}
                  </p>
                  <button
                    onClick={handleOpenAddBean}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30"
                  >
                    + {language === 'zh' ? '建立此豆單' : 'Add New Bean'}
                  </button>
                </div>
              ) : (
                filteredBeans.map((bean, idx) => {
                  const isActive = activeBean?.name === bean.name;
                  const isCustom = Boolean(bean.isCustom);

                  return (
                    <div
                      key={bean.id || idx}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                        isActive
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                          : 'bg-[#12141a] hover:bg-[#161920] border-white/[0.06]'
                      }`}
                    >
                      {/* Top Row: Title + Tags */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white truncate">{bean.name}</span>
                            {isCustom && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                自訂
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> 已選用
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-amber-400 font-mono truncate">
                            {bean.origin} · {bean.process}
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-mono shrink-0">
                          {bean.roastLevel}
                        </span>
                      </div>

                      {/* Flavor Notes */}
                      {bean.flavorNotes && bean.flavorNotes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {bean.flavorNotes.map((note, nIdx) => (
                            <span
                              key={nIdx}
                              className="text-[9px] px-2 py-0.5 rounded-md bg-black/40 border border-white/[0.05] text-slate-300 font-medium"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                        <div className="flex items-center gap-1">
                          {isCustom && (
                            <>
                              <button
                                onClick={() => handleOpenEditBean(bean)}
                                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                                title="Edit Bean"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="text-[10px]">{language === 'zh' ? '編輯' : 'Edit'}</span>
                              </button>

                              <button
                                onClick={() => bean.id && onDeleteBean(bean.id)}
                                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all text-xs"
                                title="Delete Bean"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isActive && (
                            <button
                              onClick={() => onSelectBean(bean)}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-bold transition-all"
                            >
                              {language === 'zh' ? '設為當前豆' : 'Select'}
                            </button>
                          )}

                          <button
                            onClick={() => onBrewWithBean(bean)}
                            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 transition-all shadow-sm"
                          >
                            <span>{language === 'zh' ? '沖煮此豆' : 'Brew'}</span>
                            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD / EDIT BEAN FORM */}
        {activeTab === 'edit' && (
          <div className="space-y-3">
            <div className="p-4 rounded-3xl bg-[#12141a] border border-white/[0.08] space-y-3 shadow-xl overflow-y-auto flex-1">
              {/* Bean Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-400 font-mono flex items-center justify-between">
                  <span>{language === 'zh' ? '咖啡豆名稱 *' : 'Coffee Bean Name *'}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{language === 'zh' ? '必填' : 'Required'}</span>
                </label>
                <input
                  type="text"
                  value={beanName}
                  onChange={e => setBeanName(e.target.value)}
                  placeholder={language === 'zh' ? '例如：巴拿馬 翡翠莊園 藝妓 水洗' : 'e.g. Panama Geisha Washed'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Origin / Region */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-400 font-mono">
                    {language === 'zh' ? '產區 / 莊園' : 'Origin / Estate'}
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    placeholder={language === 'zh' ? '例如：耶加雪菲 沃卡' : 'e.g. Yirgacheffe'}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-400 font-mono">
                    {language === 'zh' ? '海拔 / 品種' : 'Elevation / Varietal'}
                  </label>
                  <input
                    type="text"
                    value={elevation}
                    onChange={e => setElevation(e.target.value)}
                    placeholder={language === 'zh' ? '例如：2000m Geisha' : 'e.g. 2000m Geisha'}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Roast Level Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-400 font-mono">
                  {language === 'zh' ? '烘焙度 (決定建議水溫與萃取手法)' : 'Roast Level'}
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
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer text-xs font-medium ${
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
                  placeholder="花香, 柑橘, 蜂蜜, 伯爵茶..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium mb-1.5"
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

              {/* Smart Extraction Preview Card */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '智能配對沖煮食譜' : 'Smart Recipe Match'}</span>
                  </div>
                  <span className="text-[10px] font-mono">100% 離線運算</span>
                </div>
                <div className="text-xs font-black text-white">
                  {language === 'zh' ? smartRecipe.nameZh : smartRecipe.nameEn}
                </div>
                <p className="text-[11px] text-slate-300">
                  {language === 'zh' ? smartRecipe.reasonZh : smartRecipe.reasonEn}
                </p>
              </div>
            </div>

            {/* Form Save Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab('inventory')}
                className="w-1/3 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold text-xs transition-all"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>

              <button
                onClick={handleSaveForm}
                disabled={saving || !beanName.trim()}
                className="w-2/3 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-xs tracking-wide shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
              >
                <span>{saving ? (language === 'zh' ? '儲存中...' : 'Saving...') : (language === 'zh' ? '儲存至豆窖並選用' : 'Save to Cellar & Select')}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SCA Flavor Wheel Modal */}
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
