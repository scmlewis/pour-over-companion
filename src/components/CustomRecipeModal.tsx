import React, { useState } from 'react';
import { Recipe, BrewMethod, RecipeStep, StepType } from '../types';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { saveCustomRecipe } from '../utils/db';

interface CustomRecipeModalProps {
  onClose: () => void;
  onSaved: (recipe: Recipe) => void;
}

const METHODS: BrewMethod[] = ['V60', 'Chemex', 'AeroPress', 'Kalita Wave', 'Custom'];
const STEP_TYPES: StepType[] = ['bloom', 'pour', 'drawdown', 'rinse', 'stir', 'press', 'rest'];

export const CustomRecipeModal: React.FC<CustomRecipeModalProps> = ({
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState<string>('自訂手沖配方');
  const [method, setMethod] = useState<BrewMethod>('V60');
  const [ratio, setRatio] = useState<string>('1:15');
  const [dose, setDose] = useState<number>(18);
  const [water, setWater] = useState<number>(270);
  const [temp, setTemp] = useState<number>(92);
  const [grind, setGrind] = useState<string>('中幼研磨');
  const [source, setSource] = useState<string>('自訂配方');
  const [reason, setReason] = useState<string>('自訂多段注水萃取流程，提供個人化風味調校。');
  const [steps, setSteps] = useState<RecipeStep[]>([
    { type: 'bloom', durationSec: 35, pourDurationSec: 15, label: '悶蒸注水', actionText: '現在注水', targetWeight: 45, waterToAdd: 45, pourStyle: '中心向外均勻繞圈 45g。' },
    { type: 'pour', durationSec: 40, pourDurationSec: 25, label: '主要注水', actionText: '現在注水', targetWeight: 160, waterToAdd: 115, pourStyle: '穩定繞圈注水至 160g。' },
    { type: 'pour', durationSec: 40, pourDurationSec: 20, label: '尾段注水', actionText: '現在注水', targetWeight: 270, waterToAdd: 110, pourStyle: '中心注水至 270g。' },
    { type: 'drawdown', durationSec: 35, pourDurationSec: 0, label: '滴濾完成', actionText: '停止注水，等待', targetWeight: 270, waterToAdd: 0, pourStyle: '等待液面完全濾乾。' }
  ]);

  const addStep = () => {
    const lastTarget = steps[steps.length - 1]?.targetWeight || 200;
    setSteps(prev => [
      ...prev,
      {
        type: 'pour',
        durationSec: 30,
        pourDurationSec: 15,
        label: `第 ${prev.length + 1} 段注水`,
        actionText: '現在注水',
        targetWeight: lastTarget + 50,
        waterToAdd: 50,
        pourStyle: '穩定繞圈注水。',
      }
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateStep = (index: number, updates: Partial<RecipeStep>) => {
    setSteps(prev => prev.map((step, idx) => idx === index ? { ...step, ...updates } : step));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const totalCalculatedWater = steps[steps.length - 1]?.targetWeight || water;

    const newRecipe: Recipe = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      method,
      dose,
      water: totalCalculatedWater,
      ratio,
      temp,
      grind,
      stagesCount: steps.filter(s => s.type === 'bloom' || s.type === 'pour').length,
      targetTimeRange: '2:30–3:00',
      source: source.trim() || '自訂',
      reason: reason.trim() || '自訂萃取步驟。',
      equipment: ['V60 濾杯', '濾紙', '分享壺', '電子磅', '手沖壺'],
      prep: [
        `將水加熱至 ${temp}°C`,
        `量好 ${dose}g 咖啡豆並進行${grind}`,
        '沖洗濾紙並預熱壺身',
        '倒走沖洗用水',
        '加入咖啡粉並整平粉床',
        '放上電子磅並歸零'
      ],
      steps,
      isCustom: true,
    };

    await saveCustomRecipe(newRecipe);
    onSaved(newRecipe);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#12141a] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in duration-150 select-none">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-white font-sans">
              自訂手沖食譜
            </h2>
            <p className="text-xs text-slate-400">
              設定專屬的注水段數、目標重量與節奏
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Basic Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">食譜名稱</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：3段高甜感手沖"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">沖煮器具</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as BrewMethod)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">比例 (粉水比)</label>
              <input
                type="text"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                placeholder="1:15"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">粉量 (g)</label>
              <input
                type="number"
                value={dose}
                onChange={(e) => setDose(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">水溫 (°C)</label>
              <input
                type="number"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">研磨度</label>
              <select
                value={grind}
                onChange={(e) => setGrind(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="細研磨">細研磨</option>
                <option value="中幼研磨">中幼研磨</option>
                <option value="中研磨">中研磨</option>
                <option value="中粗研磨">中粗研磨</option>
                <option value="粗研磨">粗研磨</option>
              </select>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              步驟清單 ({steps.length})
            </span>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增步驟</span>
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/[0.08] text-slate-300 flex items-center justify-center text-[10px] font-bold font-mono">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step.label}
                    onChange={(e) => updateStep(idx, { label: e.target.value })}
                    placeholder="步驟名稱"
                    className="flex-1 px-2 py-1 rounded bg-black/50 border border-white/[0.08] text-xs text-white font-semibold focus:outline-none"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">類型</span>
                    <select
                      value={step.type}
                      onChange={(e) => updateStep(idx, { type: e.target.value as StepType })}
                      className="w-full px-1.5 py-1 rounded bg-black/50 border border-white/[0.08] text-slate-300 text-xs"
                    >
                      {STEP_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">總秒數</span>
                    <input
                      type="number"
                      value={step.durationSec}
                      onChange={(e) => updateStep(idx, { durationSec: Number(e.target.value) })}
                      className="w-full px-1.5 py-1 rounded bg-black/50 border border-white/[0.08] text-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">磅重目標 (g)</span>
                    <input
                      type="number"
                      value={step.targetWeight ?? ''}
                      onChange={(e) => updateStep(idx, { targetWeight: Number(e.target.value) })}
                      className="w-full px-1.5 py-1 rounded bg-black/50 border border-white/[0.08] text-amber-400 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base tracking-wide shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[54px]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>儲存自訂食譜</span>
          </button>
        </div>
      </div>
    </div>
  );
};
