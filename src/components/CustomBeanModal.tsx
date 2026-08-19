import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Check, Flame, Coffee, Tag, Calendar, Globe, Mountain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BeanInfo, Recipe } from '../types';
import { saveCustomBean, deleteCustomBean } from '../utils/db';
import { useLanguage } from '../utils/i18n';

interface CustomBeanModalProps {
  existingBean?: BeanInfo | null;
  recipes: Recipe[];
  onClose: () => void;
  onSaved: (bean: BeanInfo) => void;
  onDeleted?: (id: string) => void;
}

const COMMON_FLAVOR_TAGS_ZH = [
  '茉莉花', '橙花', '柑橘', '佛手柑', '檸檬', '白桃', '莓果', '黑醋栗',
  '熱帶水果', '芒果', '百香果', '蜂蜜', '焦糖', '牛奶巧克力', '堅果', '烏龍茶', '紅酒韻'
];

const COMMON_FLAVOR_TAGS_EN = [
  'Jasmine', 'Orange Blossom', 'Citrus', 'Bergamot', 'Lemon', 'White Peach', 'Berries', 'Blackcurrant',
  'Tropical Fruit', 'Mango', 'Passionfruit', 'Honey', 'Caramel', 'Milk Chocolate', 'Toasted Nut', 'Oolong Tea', 'Winey'
];

export const CustomBeanModal: React.FC<CustomBeanModalProps> = ({
  existingBean,
  recipes,
  onClose,
  onSaved,
  onDeleted,
}) => {
  const { t, language } = useLanguage();
  const isEditing = !!existingBean?.isCustom && !!existingBean?.id;

  const [name, setName] = useState(existingBean?.name || '');
  const [nameEn, setNameEn] = useState(existingBean?.nameEn || '');
  const [origin, setOrigin] = useState(existingBean?.origin || '');
  const [originEn, setOriginEn] = useState(existingBean?.originEn || '');
  const [roastLevel, setRoastLevel] = useState<BeanInfo['roastLevel']>(existingBean?.roastLevel || '淺焙 (Light)');
  const [process, setProcess] = useState<BeanInfo['process']>(existingBean?.process || '水洗 (Washed)');
  const [varietal, setVarietal] = useState(existingBean?.varietal || '');
  const [elevation, setElevation] = useState(existingBean?.elevation || '');
  const [roastDate, setRoastDate] = useState(existingBean?.roastDate || new Date().toISOString().split('T')[0]);
  const [flavorNotes, setFlavorNotes] = useState<string[]>(existingBean?.flavorNotes || ['茉莉花', '柑橘', '蜂蜜']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [recommendedRecipeId, setRecommendedRecipeId] = useState(existingBean?.recommendedRecipeId || recipes[0]?.id || 'standard-drip');
  const [rationale, setRationale] = useState(existingBean?.rationale || '');
  const [rationaleEn, setRationaleEn] = useState(existingBean?.rationaleEn || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleFlavorTag = (tag: string) => {
    if (flavorNotes.includes(tag)) {
      setFlavorNotes(prev => prev.filter(t => t !== tag));
    } else {
      if (flavorNotes.length < 6) {
        setFlavorNotes(prev => [...prev, tag]);
      }
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (!customTagInput.trim()) return;
    const clean = customTagInput.trim();
    if (!flavorNotes.includes(clean) && flavorNotes.length < 8) {
      setFlavorNotes(prev => [...prev, clean]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFlavorNotes(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const newBean: BeanInfo = {
      id: existingBean?.id || `bean_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      origin: origin.trim() || (language === 'zh' ? '自選產區' : 'Custom Origin'),
      originEn: originEn.trim() || origin.trim() || 'Custom Origin',
      roastLevel,
      process,
      varietal: varietal.trim(),
      elevation: elevation.trim(),
      roastDate,
      flavorNotes: flavorNotes.length > 0 ? flavorNotes : (language === 'zh' ? ['花香', '甜感'] : ['Floral', 'Sweet']),
      recommendedRecipeId,
      rationale: rationale.trim() || (language === 'zh' ? '個人化精品咖啡豆萃取調校設定。' : 'Customized artisanal bean brew profile.'),
      rationaleEn: rationaleEn.trim() || 'Customized artisanal bean brew profile.',
      isCustom: true,
    };

    await saveCustomBean(newBean);
    onSaved(newBean);
  };

  const handleDelete = async () => {
    if (existingBean?.id) {
      await deleteCustomBean(existingBean.id);
      if (onDeleted) onDeleted(existingBean.id);
      onClose();
    }
  };

  // Calculate resting days if roast date provided
  const calculateRestingDays = () => {
    if (!roastDate) return null;
    const diff = Date.now() - new Date(roastDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  };

  const restingDays = calculateRestingDays();

  const availableTags = language === 'zh' ? COMMON_FLAVOR_TAGS_ZH : COMMON_FLAVOR_TAGS_EN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-[#141311] border border-white/[0.06] rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] text-[#f0eeeb] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {isEditing
                  ? (language === 'zh' ? '編輯自訂咖啡豆' : 'Edit Custom Bean')
                  : (language === 'zh' ? '新增私房咖啡豆' : 'Add Custom Bean')}
              </h3>
              <span className="eyebrow">
                {language === 'zh' ? '精品豆窖管理' : 'BEAN CELLAR MANAGER'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0f0e0c] border border-white/[0.06] flex items-center justify-center text-[#f0eeeb]/40 hover:text-white active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10">
          {/* Bean Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#f0eeeb]/60 flex items-center gap-1.5">
              <span>{language === 'zh' ? '咖啡豆名稱 / 莊園' : 'Bean Name / Estate'}</span>
              <span className="text-amber-400 font-bold">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'zh' ? '例如：衣索比亞 罕貝拉 花蝶' : 'e.g. Ethiopia Hambela Flora G1'}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0f0e0c] border border-white/[0.04] focus:border-amber-400 focus:outline-none text-xs text-white placeholder:text-[#f0eeeb]/30 font-medium"
            />
          </div>

          {/* English / Subtitle Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#f0eeeb]/40 flex items-center gap-1.5">
              <span>{language === 'zh' ? '英文品名 (選填)' : 'English / Label Name (Optional)'}</span>
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Hambela Wamena Washed"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0f0e0c] border border-white/[0.04] focus:border-amber-400 focus:outline-none text-xs text-white placeholder:text-[#f0eeeb]/30 font-mono"
            />
          </div>

          {/* Origin & Varietal Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#f0eeeb]/60 flex items-center gap-1">
                <Globe className="w-3 h-3 text-amber-400" />
                <span>{language === 'zh' ? '產區 / 國家' : 'Origin / Region'}</span>
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder={language === 'zh' ? '衣索比亞 古吉' : 'Guji, Ethiopia'}
                className="w-full px-3 py-2 rounded-xl bg-[#0f0e0c] border border-white/[0.04] focus:border-amber-400 focus:outline-none text-xs text-white placeholder:text-[#f0eeeb]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#f0eeeb]/60 flex items-center gap-1">
                <Mountain className="w-3 h-3 text-amber-400" />
                <span>{language === 'zh' ? '品種 / 海拔' : 'Varietal / Alt.'}</span>
              </label>
              <input
                type="text"
                value={varietal}
                onChange={(e) => setVarietal(e.target.value)}
                placeholder={language === 'zh' ? '原生種 · 2100m' : 'Heirloom · 2,100m'}
                className="w-full px-3 py-2 rounded-xl bg-[#0f0e0c] border border-white/[0.04] focus:border-amber-400 focus:outline-none text-xs text-white placeholder:text-[#f0eeeb]/30"
              />
            </div>
          </div>

          {/* Roast Level & Process Selection */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#f0eeeb]/60 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>{language === 'zh' ? '烘焙度' : 'Roast Level'}</span>
              </label>
              <select
                value={roastLevel}
                onChange={(e) => setRoastLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0f0e0c] border border-white/[0.04] focus:border-amber-400 focus:outline-none text-xs text-amber-300 font-bold"
              >
                <option value="極淺焙 (Ultra-Light)">{language === 'zh' ? '極淺焙 (Ultra-Light)' : 'Ultra-Light Roast'}</option>
                <option value="淺焙 (Light)">{language === 'zh' ? '淺焙 (Light)' : 'Light Roast'}</option>
                <option value="中淺焙 (Medium-Light)">{language === 'zh' ? '中淺焙 (Medium-Light)' : 'Medium-Light Roast'}</option>
                <option value="中焙 (Medium)">{language === 'zh' ? '中焙 (Medium)' : 'Medium Roast'}</option>
                <option value="中深焙 (Medium-Dark)">{language === 'zh' ? '中深焙 (Medium-Dark)' : 'Medium-Dark Roast'}</option>
                <option value="深焙 (Dark)">{language === 'zh' ? '深焙 (Dark)' : 'Dark Roast'}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#f0eeeb]/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{language === 'zh' ? '處理法' : 'Process'}</span>
              </label>
              <select
                value={process}
                onChange={(e) => setProcess(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0f0e0c] border border-white/[0.04] focus:border-amber-400 focus:outline-none text-xs text-amber-300 font-bold"
              >
                <option value="水洗 (Washed)">{language === 'zh' ? '水洗 (Washed)' : 'Washed Process'}</option>
                <option value="日曬 (Natural)">{language === 'zh' ? '日曬 (Natural)' : 'Natural Process'}</option>
                <option value="蜜處理 (Honey)">{language === 'zh' ? '蜜處理 (Honey)' : 'Honey Process'}</option>
                <option value="厭氧 (Anaerobic)">{language === 'zh' ? '厭氧 (Anaerobic)' : 'Anaerobic Process'}</option>
                <option value="雙重厭氧 (Double Anaerobic)">{language === 'zh' ? '雙重厭氧 (Double Anaerobic)' : 'Double Anaerobic'}</option>
                <option value="特殊處理 (Experimental)">{language === 'zh' ? '特殊處理 (Experimental)' : 'Experimental Process'}</option>
              </select>
            </div>
          </div>

          {/* Roast Date & Resting Days Calculator */}
          <div className="p-3 rounded-2xl bg-[#0f0e0c] border border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#f0eeeb]/60 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'zh' ? '烘焙日期' : 'Roast Date'}</span>
              </label>
              {restingDays !== null && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
                  {language === 'zh' ? `已養豆 ${restingDays} 天` : `Rested ${restingDays} days`}
                </span>
              )}
            </div>
            <input
              type="date"
              value={roastDate}
              onChange={(e) => setRoastDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0f0e0c] border border-white/[0.04] focus:border-amber-400 focus:outline-none text-xs text-white font-mono"
            />
          </div>

          {/* Flavor Notes Picker & Custom Tags */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#f0eeeb]/60 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'zh' ? '風味筆記標籤' : 'Flavor Notes Tags'}</span>
              </span>
              <span className="text-[10px] text-[#f0eeeb]/30 font-mono">{flavorNotes.length}/8</span>
            </label>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-2xl bg-[#0f0e0c] border border-white/[0.04]">
              {flavorNotes.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-amber-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {flavorNotes.length === 0 && (
                <span className="text-xs text-[#f0eeeb]/30 italic p-1">
                  {language === 'zh' ? '點擊下方熱門標籤或自行輸入' : 'Select tags below or type custom notes'}
                </span>
              )}
            </div>

            {/* Quick Tag Selector Chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {availableTags.map((tag) => {
                const isSelected = flavorNotes.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleFlavorTag(tag)}
                    className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-[#0a0a08] border-amber-500 font-bold'
                        : 'bg-[#0f0e0c] hover:bg-[#141311] text-[#f0eeeb]/40 border-white/[0.04]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder={language === 'zh' ? '自訂風味標籤 (例如：藍莓卡士達)...' : 'Add custom flavor note...'}
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#0f0e0c] border border-white/[0.04] focus:border-amber-400 focus:outline-none text-xs text-white placeholder:text-[#f0eeeb]/30"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 rounded-xl bg-[#0f0e0c] hover:bg-[#141311] text-xs font-bold text-amber-300 border border-white/[0.04]"
              >
                {language === 'zh' ? '新增' : 'Add'}
              </button>
            </div>
          </div>

          {/* Recommended Brew Recipe */}
          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-bold text-[#f0eeeb]/60 flex items-center gap-1.5">
              <span>{language === 'zh' ? '推薦搭配手沖食譜' : 'Recommended Brew Recipe'}</span>
            </label>
            <select
              value={recommendedRecipeId}
              onChange={(e) => setRecommendedRecipeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f0e0c] border border-white/[0.04] focus:border-amber-400 focus:outline-none text-xs text-amber-300 font-bold"
            >
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {language === 'zh' ? `${r.name} (${r.method} · ${r.ratio})` : `${r.nameEn || r.name} (${r.method} · ${r.ratio})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              {isDeleting ? (
                <div className="flex items-center gap-1.5 animate-in fade-in">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold active:scale-95"
                  >
                    {language === 'zh' ? '確認刪除' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleting(false)}
                    className="px-2.5 py-2 rounded-xl bg-[#0f0e0c] text-[#f0eeeb]/40 text-xs font-medium"
                  >
                    {language === 'zh' ? '取消' : 'Cancel'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 active:scale-95 transition-all"
                  title={language === 'zh' ? '刪除此豆' : 'Delete Bean'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#0f0e0c] hover:bg-[#141311] text-xs font-bold text-[#f0eeeb]/60 transition-colors"
            >
              {language === 'zh' ? '取消' : 'Cancel'}
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-[#0a0a08] font-black text-xs tracking-wide active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-1.5 min-h-[44px]"
            style={{ transitionTimingFunction: 'var(--ease-spring)' }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isEditing ? (language === 'zh' ? '儲存變更' : 'Save Changes') : (language === 'zh' ? '儲存咖啡豆' : 'Save Bean')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
