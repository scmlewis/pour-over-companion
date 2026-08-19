import { SuggestionRule } from '../types';
import suggestionsData from '../data/suggestions.json';
import { Language } from './i18n';

const rules: SuggestionRule[] = suggestionsData as SuggestionRule[];

export const DESCRIPTOR_ITEMS = [
  '偏酸 (Sour / Sharp)',
  '尖銳 (Under-extracted)',
  '偏淡 (Weak / Thin)',
  '水感過重 (Watery)',
  '偏苦 (Bitter / Harsh)',
  '澀口 (Astringent / Dry)',
  '厚重焦苦 (Roasty / Muddy)',
  '空洞無甜 (Hollow)',
  '乾淨明亮 (Clean & Bright)',
  '圓潤飽滿 (Balanced & Sweet)',
];

export function getDescriptorList(): string[] {
  return DESCRIPTOR_ITEMS;
}

export interface EvaluationResult {
  text: string;
  rationale: string;
  adjust: {
    grindOffset?: number;
    bloomSecOffset?: number;
    doseOffset?: number;
    waterOffset?: number;
    ratio?: string;
    tempOffset?: number;
  };
}

export function evaluateTaste(selectedDescriptors: string[], lang: Language = 'zh'): EvaluationResult | null {
  if (!selectedDescriptors || selectedDescriptors.length === 0) return null;

  const descText = selectedDescriptors.join(' ');

  if (descText.includes('偏酸') || descText.includes('尖銳') || descText.includes('空洞') || descText.includes('Sour') || descText.includes('Under-extracted')) {
    return {
      text: lang === 'zh'
        ? '研磨度調細 1 格，或將水溫提高 2°C，並拉長悶蒸時間 10 秒以提升萃取率與甜感。'
        : 'Grind 1 step finer or increase water temp by +2°C; extend bloom by +10s to enhance sweetness.',
      rationale: lang === 'zh'
        ? '果酸過於突出通常代表萃取不足，提高水溫與調細研磨能加速萃取中後段的焦糖甜感物質。'
        : 'Sharp acidity typically indicates under-extraction. Higher water temp and finer grind accelerate extraction of sweet sugars.',
      adjust: {
        grindOffset: -1,
        bloomSecOffset: 10,
        tempOffset: 2,
      },
    };
  }

  if (descText.includes('偏苦') || descText.includes('澀口') || descText.includes('焦苦') || descText.includes('Bitter') || descText.includes('Astringent')) {
    return {
      text: lang === 'zh'
        ? '研磨度調粗 1 格，或將水溫降低 2°C，並稍微減小擾流以減少過萃澀感。'
        : 'Grind 1 step coarser or decrease water temp by -2°C to reduce harsh over-extraction astringency.',
      rationale: lang === 'zh'
        ? '澀感與過多焦苦主要來自微粉過萃或水溫過高，調粗研磨或降溫能顯著提升乾淨度。'
        : 'Bitterness and drying mouthfeel come from over-extracting fines. Coarser grind and cooler water bring back cup clarity.',
      adjust: {
        grindOffset: 1,
        tempOffset: -2,
      },
    };
  }

  if (descText.includes('偏淡') || descText.includes('水感') || descText.includes('Weak') || descText.includes('Watery')) {
    return {
      text: lang === 'zh'
        ? '將粉水比微調濃 (例如從 1:16 改為 1:15)，或稍微增加 1g 咖啡豆。'
        : 'Tighten brew ratio (e.g. 1:16 to 1:15) or dose +1g extra ground coffee for higher body.',
      rationale: lang === 'zh'
        ? '濃度偏低可透過增加咖啡粉量或縮短總注水量來提升整體厚實度 (TDS)。'
        : 'Low TDS concentration can be improved by dosing more grounds or reducing total water volume.',
      adjust: {
        ratio: '1:15',
        doseOffset: 1,
      },
    };
  }

  return {
    text: lang === 'zh'
      ? '目前風味表現均衡乾淨，建議保留此組萃取參數作為日後日常基準！'
      : 'Flavor profile is clean and balanced. Keep these extraction parameters as your baseline!',
    rationale: lang === 'zh'
      ? '乾淨明亮且甜感充足是理想的萃取平衡狀態。'
      : 'Clean clarity with sweet balance indicates ideal golden cup extraction.',
    adjust: {},
  };
}

export function evaluateDescriptors(selectedDescriptors: string[], lang: Language = 'zh') {
  return evaluateTaste(selectedDescriptors, lang);
}
