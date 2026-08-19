export type BrewMethod = 'V60' | 'Chemex' | 'AeroPress' | 'Kalita Wave' | 'Origami' | 'Custom';

export type StepType = 'rinse' | 'bloom' | 'pour' | 'drawdown' | 'stir' | 'press' | 'rest';

export interface RecipeStep {
  type: StepType;
  durationSec: number; // total step duration
  pourDurationSec?: number; // active pour duration within step
  label: string; // e.g. "悶蒸" / "第一段注水"
  labelEn?: string; // English translation
  actionText?: string; // e.g. "現在注水" / "停止注水，等待"
  actionTextEn?: string; // English translation
  targetWeight?: number; // cumulative scale weight at end of step
  waterToAdd?: number; // water added in this specific step
  pourStyle?: string; // e.g. "輕柔打圈，令咖啡粉完全濕透。"
  pourStyleEn?: string; // English translation
  technique?: string; // detailed technique tip
  techniqueEn?: string; // English translation
}

export interface Recipe {
  id: string;
  name: string;
  nameEn?: string;
  method: BrewMethod;
  dose: number; // g
  water: number; // g
  ratio: string; // e.g. "1:15.5"
  temp: number; // °C
  grind: string; // e.g. "中幼研磨"
  grindEn?: string; // English translation
  stagesCount: number; // e.g. 3 段
  targetTimeRange: string; // e.g. "2:40–3:10"
  source: string; // attribution
  sourceEn?: string;
  reason: string; // recommendation rationale
  reasonEn?: string;
  equipment?: string[];
  equipmentEn?: string[];
  prep: string[];
  prepEn?: string[];
  steps: RecipeStep[];
  isCustom?: boolean;
}

export interface BeanInfo {
  id?: string;
  name: string;
  nameEn?: string;
  origin: string;
  originEn?: string;
  roastLevel: '極淺焙 (Ultra-Light)' | '淺焙 (Light)' | '中淺焙 (Medium-Light)' | '中焙 (Medium)' | '中深焙 (Medium-Dark)' | '深焙 (Dark)';
  roastLevelEn?: string;
  process: '水洗 (Washed)' | '日曬 (Natural)' | '蜜處理 (Honey)' | '厭氧 (Anaerobic)' | '雙重厭氧 (Double Anaerobic)' | '特殊處理 (Experimental)';
  processEn?: string;
  flavorNotes: string[];
  flavorNotesEn?: string[];
  recommendedRecipeId: string;
  rationale?: string;
  rationaleEn?: string;
  elevation?: string;
  varietal?: string;
  roastDate?: string;
  isCustom?: boolean;
  bagPhoto?: string;
}

export interface BrewLogEntry {
  id: string;
  timestamp: string; // ISO string
  recipeId: string;
  recipeName: string;
  method: BrewMethod;
  beanName?: string;
  dose: number;
  water: number;
  ratio: string;
  grind: string;
  temp: number;
  rating: number; // 1-5
  actualWeight?: number | null; // physical scale reading at finish
  deviation?: number | null; // actualWeight - theoretical water
  descriptors?: string[] | null; // taste descriptors from evaluation
  suggestion?: string | null; // generated rule heuristic
  notes?: string | null;
  durationSec?: number;
}

export interface SuggestionRule {
  descriptors: string[];
  adjust: {
    grind?: string;
    bloomSec?: string;
    dose?: string;
    water?: string;
    ratio?: string;
    temp?: string;
  };
  text: string;
  rationale?: string;
}

export interface AppliedAdjustment {
  recipeId?: string;
  grindOffset?: number;
  ratio?: string;
  doseOffset?: number;
  bloomSecOffset?: number;
  waterOffset?: number;
  tempOffset?: number;
  textSummary: string;
}

export type AppView = 
  | 'home'
  | 'beans'
  | 'methods'
  | 'recipe-detail'
  | 'prep'
  | 'brew'
  | 'finish'
  | 'history'
  | 'custom-recipe'
  | 'lab';
