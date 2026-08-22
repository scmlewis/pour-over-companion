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
  'standard-drip': {
    recipeId: 'standard-drip',
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
  'hoffmann-single': {
    recipeId: 'hoffmann-single',
    whyThisRecipe: 'James Hoffmann 的單杯法以高溫悶蒸和旋轉搖晃技術，實現極高均勻萃取。適合淺焙精品咖啡。',
    whyThisRecipeEn: "James Hoffmann's single-cup method uses high-temp bloom and swirl for exceptionally uniform extraction. Perfect for light roasts.",
    keyTechniques: [
      '悶蒸後輕輕晃動濾杯確保所有粉濕透',
      '以沸水溫度維持高萃取率',
      '注水完成後用匙攪動一次再反轉一次',
    ],
    keyTechniquesEn: [
      'Swirl dripper after bloom to ensure full saturation',
      'Use near-boiling water for high extraction yield',
      'Stir clockwise once, counter-clockwise once after final pour',
    ],
    commonMistakes: [
      '水溫不夠高導致萃取不足',
      '沒有充分旋轉搖晃造成乾粉',
      '注水過慢使水溫下降',
    ],
    commonMistakesEn: [
      'Water too cool causes under-extraction',
      'Insufficient swirling leaves dry pockets',
      'Pouring too slowly drops water temperature',
    ],
  },
  'tetsu-46': {
    recipeId: 'tetsu-46',
    whyThisRecipe: '粕谷哲的 4:6 法將注水分為五段，前 40% 控制酸甜平衡，後 60% 調整濃度。世界咖啡沖煮大賽冠軍方法。',
    whyThisRecipeEn: "Tetsu Kasuya's 4:6 method splits pours into 5 stages. First 40% controls acidity/sweetness, last 60% adjusts strength.",
    keyTechniques: [
      '前兩段注水決定風味基調（酸質與甜感）',
      '後三段均勻注水控制醇厚度',
      '每段等待完全滴乾再注下一段',
    ],
    keyTechniquesEn: [
      'First two pours set acidity/sweetness foundation',
      'Last three equal pulses build body strength',
      'Wait for full drain between each pour',
    ],
    commonMistakes: [
      '前段注水比例不當導致酸甜失衡',
      '注水間隔不一致影響萃取均勻度',
      '研磨過細導致後段滴濾過慢',
    ],
    commonMistakesEn: [
      'Wrong front-pour ratio throws off acidity/sweetness balance',
      'Inconsistent pour intervals affect extraction uniformity',
      'Grind too fine causes slow drawdown in later stages',
    ],
  },
  'lance-121': {
    recipeId: 'lance-121',
    whyThisRecipe: 'Lance Hedrick 的雙悶蒸法透過兩次悶蒸大幅提高淺焙與日曬豆的可溶性萃取，同時保持乾淨度與極致甜感。',
    whyThisRecipeEn: "Lance Hedrick's double bloom technique maximizes soluble extraction for light and natural roasts while maintaining clarity.",
    keyTechniques: [
      '第一次悶蒸充分浸潤所有咖啡粉',
      '第二次悶蒸深化可溶物釋放',
      '最後單次注滿後輕晃濾杯平整滴濾',
    ],
    keyTechniquesEn: [
      'First bloom thoroughly saturates all grounds',
      'Second bloom unlocks deeper soluble release',
      'Single final pour then swirl for flat drawdown',
    ],
    commonMistakes: [
      '兩次悶蒸之間等待太久導致水溫下降',
      '第二次悶蒸水量過多造成過度萃取',
      '沒有在最後充分旋轉平整粉床',
    ],
    commonMistakesEn: [
      'Waiting too long between blooms drops water temperature',
      'Second bloom pour too large causes over-extraction',
      'Not swirling adequately at the end for flat bed',
    ],
  },
  'april-wave': {
    recipeId: 'april-wave',
    whyThisRecipe: 'April 六段注水法專為平底濾杯設計，節奏性的微擾流提升萃取均勻度，帶來茶感花香與極致甜感。',
    whyThisRecipeEn: "April's 6-pulse method is designed for flat-bottom drippers. Rhythmic micro-turbulence unlocks tea-like floral delicacy.",
    keyTechniques: [
      '每段注水保持穩定的節奏',
      '利用平底濾杯的均勻萃取特性',
      '控制每段注水量一致（50g）',
    ],
    keyTechniquesEn: [
      'Maintain steady rhythm across all 6 pours',
      'Leverage flat-bottom dripper even extraction',
      'Keep each pour consistent at 50g',
    ],
    commonMistakes: [
      '注水節奏不穩定導致萃取不均',
      '濾紙底部沒有沖洗導致紙味',
      '研磨過細造成六段注水間滴濾過慢',
    ],
    commonMistakesEn: [
      'Unstable pour rhythm causes uneven extraction',
      'Not rinsing filter bottom causes papery taste',
      'Grind too fine makes drawdown too slow between pulses',
    ],
  },
  'scott-rao-chemex': {
    recipeId: 'scott-rao-chemex',
    whyThisRecipe: 'Scott Rao 的 Chemex 慢萃法專為厚重 Chemex 專用濾紙設計。充分攪拌悶蒸與大水量平穩注水，消除細粉堵塞與通道效應。',
    whyThisRecipeEn: "Engineered for thick Chemex bonded filters. Vigorous bloom swirl and controlled percolation eliminate clogging and channeling.",
    keyTechniques: [
      '悶蒸時充分旋轉 Chemex 壺身確保厚濾紙底層濕透',
      '大水量平穩注水維持高水溫',
      '最終注水後旋轉一次使粉床平整',
    ],
    keyTechniquesEn: [
      'Swirl Chemex during bloom to hydrate deep grounds in thick filter',
      'Large volume steady pour maintains high thermal mass',
      'Final swirl after last pour for flat bed drawdown',
    ],
    commonMistakes: [
      '沒有充分悶蒸導致厚濾紙底層乾粉',
      '注水過快造成通道效應',
      '研磨過細堵塞 Chemex 厚濾紙',
    ],
    commonMistakesEn: [
      'Insufficient bloom leaves dry grounds at bottom of thick filter',
      'Pouring too fast causes channeling',
      'Grind too fine clogs the Chemex bonded filter',
    ],
  },
  'wendelboe-aeropress': {
    recipeId: 'wendelboe-aeropress',
    whyThisRecipe: 'Tim Wendelboe 的北歐極簡愛樂壓以倒置浸泡和溫和下壓，萃取出如茶般澄澈、極高甜感的淺焙風味。',
    whyThisRecipeEn: "Tim Wendelboe's Nordic inverted AeroPress delivers sweet, crisp, tea-like perfection from light roasts through immersion.",
    keyTechniques: [
      '一次性注入全部 200g 水',
      '攪拌棒前後攪拌 3 次確保均勻浸泡',
      '下壓時以手臂重量平穩緩慢施力',
    ],
    keyTechniquesEn: [
      'Pour all 200g water in one go',
      'Stir back and forth 3 times for even immersion',
      'Press using forearm weight for steady, gentle pressure',
    ],
    commonMistakes: [
      '下壓過快導致過度萃取和苦澀味',
      '沒有在聽到嘶嘶聲時停止下壓',
      '研磨過細導致下壓困難',
    ],
    commonMistakesEn: [
      'Pressing too fast causes over-extraction and bitterness',
      'Not stopping when you hear the hiss of air',
      'Grind too fine makes pressing difficult',
    ],
  },
  'origami-sensory': {
    recipeId: 'origami-sensory',
    whyThisRecipe: 'Origami 濾杯 20 條深凹槽導流極快，透過 4 段快速小水量注水，激發花果香氣的高揚爆發感。',
    whyThisRecipeEn: "Leverages Origami's 20 deep vertical ribs. 4 rapid pulses maximize aromatics and explosive fruit acidity.",
    keyTechniques: [
      '利用 Origami 深凹槽的快流速特性',
      '每段注水快速且水量小',
      '保持水柱穩定不擾動粉床',
    ],
    keyTechniquesEn: [
      'Leverage Origami deep ribs for fast flow rate',
      'Each pour should be quick with small water volume',
      'Keep stream steady without agitating the bed',
    ],
    commonMistakes: [
      '注水過慢失去快流速優勢',
      '注水量過大導致通道效應',
      '研磨過細抵消 Origami 的快導流設計',
    ],
    commonMistakesEn: [
      'Pouring too slowly loses the fast flow rate advantage',
      'Too much water per pour causes channeling',
      'Grind too fine negates Origami rapid drainage design',
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
