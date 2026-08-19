export interface CoffeeTip {
  id: string;
  category: 'EXTRACTION' | 'WATER' | 'GRIND' | 'ROAST' | 'TECHNIQUE';
  categoryLabelZh: string;
  categoryLabelEn: string;
  titleZh: string;
  titleEn: string;
  insightZh: string;
  insightEn: string;
  baristaRuleZh: string;
  baristaRuleEn: string;
  tagZh: string;
  tagEn: string;
}

export const COFFEE_TIPS: CoffeeTip[] = [
  {
    id: 'tip-1',
    category: 'EXTRACTION',
    categoryLabelZh: '萃取理論 · EXTRACTION',
    categoryLabelEn: 'EXTRACTION THEORY',
    titleZh: '悶蒸排氣與細胞壁滲透',
    titleEn: 'Degassing & Cell Wall Osmosis in Blooming',
    insightZh: '新鮮淺焙咖啡豆含有大量二氧化碳。悶蒸注水量建議為粉重的 2.5–3 倍，等待 35–45 秒讓氣體完全釋放，後續注水才能均勻萃取深層芳香物質。',
    insightEn: 'Fresh roasted coffee contains abundant CO2. Bloom with 2.5–3x dose weight for 35–45s to fully release trapped gases and allow subsequent pours to penetrate evenly.',
    baristaRuleZh: '悶蒸水重 = 粉重 × 2.5~3 · 觀察粉層如蘑菇般膨脹',
    baristaRuleEn: 'Bloom water = Dose × 2.5~3 · Observe mushroom dome expansion',
    tagZh: '悶蒸膨脹 (Bloom)',
    tagEn: 'Bloom Degassing',
  },
  {
    id: 'tip-2',
    category: 'WATER',
    categoryLabelZh: '水質科學 · WATER TDS',
    categoryLabelEn: 'WATER CHEMISTRY',
    titleZh: '鎂鈣離子與果酸表現',
    titleEn: 'Magnesium & Calcium Balance for Acidity',
    insightZh: '手沖理想水質 TDS 介於 75–125 ppm。水中鎂離子 (Mg²⁺) 能抓取明亮果酸與花香，而適量鈣離子 (Ca²⁺) 能帶出焦糖甜感與圓潤醇厚度。',
    insightEn: 'Ideal brew water TDS is 75–125 ppm. Magnesium ions (Mg²⁺) extract bright florals and fruit acids, while calcium (Ca²⁺) enhances body and caramel sweetness.',
    baristaRuleZh: '理想 TDS 75–125 ppm · 避免使用過純之純水或過硬自來水',
    baristaRuleEn: 'Target 75–125 ppm TDS · Avoid distilled or overly hard tap water',
    tagZh: '萃取水質 (Minerals)',
    tagEn: 'Water Minerals',
  },
  {
    id: 'tip-3',
    category: 'TECHNIQUE',
    categoryLabelZh: '注水手法 · LAMINAR FLOW',
    categoryLabelEn: 'POUR TECHNIQUE',
    titleZh: '防止通道效應與濾紙旁流',
    titleEn: 'Preventing Channeling and Paper Bypass',
    insightZh: '水柱過高或沖刷濾紙邊緣會導致熱水未接觸咖啡粉即直接流下 (Bypass)。保持壺嘴離粉面 10–12 cm 垂直注水，自中心向外同心圓輕柔攪動。',
    insightEn: 'Pouring too high or washing the paper walls causes bypass without extracting grounds. Keep spout 10–12cm above bed with gentle concentric rings.',
    baristaRuleZh: '壺嘴高度 10–12cm · 流速穩定在 4–5 g/秒',
    baristaRuleEn: 'Spout height 10–12cm · Steady stream 4–5 g/second',
    tagZh: '層流水柱 (Channeling)',
    tagEn: 'Laminar Stream',
  },
  {
    id: 'tip-4',
    category: 'ROAST',
    categoryLabelZh: '烘焙與水溫 · THERMAL DYNAMICS',
    categoryLabelEn: 'THERMAL DYNAMICS',
    titleZh: '烘焙程度與最適萃取水溫',
    titleEn: 'Roast Degree & Water Temperature Matching',
    insightZh: '淺焙豆質地緻密，需要 92–96°C 高溫以充分溶出花果香氣與有機酸；深焙豆細胞壁孔隙率大易萃取，建議降溫至 86–89°C 抑制尾段焦苦。',
    insightEn: 'Dense light roasts thrive with 92–96°C water to unlock florals and organic acids. Porous dark roasts prefer 86–89°C to suppress harsh astringency.',
    baristaRuleZh: '淺焙 93°C~96°C · 中焙 90°C~92°C · 深焙 86°C~89°C',
    baristaRuleEn: 'Light 93–96°C · Medium 90–92°C · Dark 86–89°C',
    tagZh: '水溫調控 (Temperature)',
    tagEn: 'Water Temperature',
  },
  {
    id: 'tip-5',
    category: 'GRIND',
    categoryLabelZh: '研磨分佈 · FINES MIGRATION',
    categoryLabelEn: 'GRIND DISTRIBUTION',
    titleZh: '細粉沉降與流速堵塞控制',
    titleEn: 'Fines Migration & Drawdown Control',
    insightZh: '注水攪動過劇會使微米級細粉 (Fines) 隨重力沉降至濾紙底層造成堵塞 (Clogging)。若後段滴濾過慢且帶有澀感，可嘗試將研磨度調粗半格。',
    insightEn: 'Excess agitation causes fines to migrate to the paper tip, clogging flow. If drawdown stalls with drying astringency, grind half a step coarser.',
    baristaRuleZh: '尾段滴水過慢過澀 ➔ 研磨度微調粗半格 / 減少注水擾動',
    baristaRuleEn: 'Slow drawdown / astringent ➔ Grind slightly coarser / lower agitation',
    tagZh: '細粉沉降 (Fines)',
    tagEn: 'Fines Migration',
  },
  {
    id: 'tip-6',
    category: 'EXTRACTION',
    categoryLabelZh: '金杯準則 · SCA GOLDEN CUP',
    categoryLabelEn: 'SCA GOLDEN CUP',
    titleZh: '萃取率 (EY) 與濃度 (TDS) 平衡',
    titleEn: 'Extraction Yield (EY) & TDS Balance',
    insightZh: 'SCA 理想萃取率為 18%–22%，濃度為 1.15%–1.45%。欠萃 (<18%) 會產生尖銳刺酸與空洞水感，過萃 (>22%) 則帶來舌根乾澀與焦苦。',
    insightEn: 'SCA golden cup targets 18%–22% EY and 1.15%–1.45% TDS. Under-extracted (<18%) tastes sour and hollow; over-extracted (>22%) is bitter and astringent.',
    baristaRuleZh: '風味欠萃 ➔ 提高水溫或調細研磨 · 過萃 ➔ 降低水溫或調粗',
    baristaRuleEn: 'Under-extracted ➔ Finer / hotter · Over-extracted ➔ Coarser / cooler',
    tagZh: '金杯準則 (Golden Cup)',
    tagEn: 'Golden Cup Ratio',
  },
  {
    id: 'tip-7',
    category: 'TECHNIQUE',
    categoryLabelZh: '濾杯預熱 · THERMAL MASS',
    categoryLabelEn: 'THERMAL MASS',
    titleZh: '洗紙去味與濾杯蓄熱平衡',
    titleEn: 'Filter Rinsing & Thermal Pre-heating',
    insightZh: '陶瓷與厚玻璃濾杯熱容量大，若未以足量熱水預熱，注入的第一道熱水會瞬間降溫 3–5°C，影響前段香氣萃取。熱水潤濕濾紙亦能去除木質紙漿味。',
    insightEn: 'Ceramic and thick glass drippers sink heat quickly. Thorough pre-heating prevents immediate 3–5°C slurry drop while washing away papery notes.',
    baristaRuleZh: '熱水充分浸潤濾紙 ➔ 倒淨分享壺預熱水 ➔ 倒入乾粉',
    baristaRuleEn: 'Rinse paper thoroughly ➔ Discard rinse water ➔ Add dry grounds',
    tagZh: '熱容量 (Pre-heat)',
    tagEn: 'Pre-heating',
  },
  {
    id: 'tip-8',
    category: 'EXTRACTION',
    categoryLabelZh: '粉水比調校 · BREW RATIO',
    categoryLabelEn: 'BREW RATIO CALIBRATION',
    titleZh: '粉水比例與風味層次延伸',
    titleEn: 'Brew Ratio & Flavor Spectrum Tuning',
    insightZh: '1:14–1:15 比例能展現厚實油脂感與深色堅果可可調；1:16–1:16.5 則能拉開風味光譜，突顯日曬藝妓或水洗耶加雪菲的精緻花香與茶感。',
    insightEn: '1:14–1:15 ratios produce tactile mouthfeel and chocolate/nut tones. 1:16–1:16.5 opens up delicate jasmine, bergamot, and tea-like elegance.',
    baristaRuleZh: '追求厚實甜感選 1:15 · 追求明亮花香茶韻選 1:16',
    baristaRuleEn: 'Sweet & rich body: 1:15 · Vibrant florals & tea clarity: 1:16',
    tagZh: '粉水比 (Brew Ratio)',
    tagEn: 'Brew Ratio',
  },
];
