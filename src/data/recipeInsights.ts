export interface RecipeInsight {
  recipeId: string;
  whyThisRecipe: string;
  whyThisRecipeEn: string;
  keyTechniques: string[];
  keyTechniquesEn: string[];
  commonMistakes: string[];
  commonMistakesEn: string[];
}

export const recipeInsights: Record<string, RecipeInsight> = {
  'v60-classic': {
    recipeId: 'v60-classic',
    whyThisRecipe: '經典 V60 手沖法利用螺旋注水和锥形濾杯的肋骨設計，創造均勻萃取。適合追求乾淨、明亮酸質的精品咖啡。',
    whyThisRecipeEn: 'Classic V60 pour-over uses spiral pouring and the cone dripper rib design for even extraction. Ideal for clean, bright acidity in specialty coffee.',
    keyTechniques: [
      '悶蒸時确保所有咖啡粉濕透',
      '注水保持垂直、穩定的水柱',
      '避免直接沖擊濾杯邊緣',
    ],
    keyTechniquesEn: [
      'Ensure all grounds are wet during bloom',
      'Maintain a vertical, steady water stream',
      'Avoid pouring directly on filter edges',
    ],
    commonMistakes: [
      '悶蒸水量不足導致萃取不均',
      '注水過快造成通道效應',
      '沒有控制好總萃取時間',
    ],
    commonMistakesEn: [
      'Insufficient bloom water causes uneven extraction',
      'Pouring too fast causes channeling',
      'Not controlling total extraction time',
    ],
  },
};

export const defaultInsight: RecipeInsight = {
  recipeId: 'default',
  whyThisRecipe: '此食譜經過精心設計，平衡了萃取率和口感。遵循步驟指引，您將獲得一致的優質咖啡。',
  whyThisRecipeEn: 'This recipe is carefully designed to balance extraction rate and flavor. Follow the step guidance for consistent, quality coffee.',
  keyTechniques: [
    '保持穩定的注水速度',
    '控制水溫在建議範圍內',
    '注意萃取時間',
  ],
  keyTechniquesEn: [
    'Maintain a steady pouring speed',
    'Keep water temperature in recommended range',
    'Pay attention to extraction time',
  ],
  commonMistakes: [
    '沒有預熱器具',
    '研磨度不適合沖煮方法',
    '注水不均勻',
  ],
  commonMistakesEn: [
    'Not preheating equipment',
    'Grind size not matching brew method',
    'Uneven pouring',
  ],
};
