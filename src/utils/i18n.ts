import { useState, useEffect } from 'react';

export type Language = 'zh' | 'en';

const STORAGE_KEY = 'hand_drip_app_lang';

export const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh';
  }
  return 'zh';
};

const listeners = new Set<(lang: Language) => void>();
let currentLanguage: Language = getInitialLanguage();

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
  listeners.forEach(fn => fn(lang));
};

export const getLanguage = (): Language => currentLanguage;

export const useLanguage = () => {
  const [lang, setLangState] = useState<Language>(currentLanguage);

  useEffect(() => {
    const listener = (newLang: Language) => setLangState(newLang);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    language: lang,
    setLanguage,
    t: (key: string, defaultText?: string): string => {
      const dict = translations[lang] || translations.zh;
      return dict[key] || defaultText || key;
    },
  };
};

export const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Header
    'app.title': '手沖伴侶',
    'app.subtitle': 'BARISTA POUR-OVER COMPANION',
    'app.offline': '離線',
    'app.install': '安裝',
    'app.customRecipe': '建立自訂食譜',
    'app.soundOn': '提示音開啟',
    'app.soundMuted': '靜音中',
    'app.history': '沖煮日誌',

    // Home
    'home.topTag': 'ARTISANAL POUR-OVER',
    'home.headline': '手沖咖啡大師',
    'home.subhead': '精準萃取每一滴咖啡，從烘焙度配對到智能注水計時。',
    'home.scanBag': '自訂咖啡豆 / 豆單',
    'home.scanBagSub': '手動填寫或選取莊園豆種，自動推薦最佳水溫與手法',
    'home.chooseMethod': '揀沖煮方法',
    'home.chooseMethodSub': '探索 4:6 法、極簡手沖與各名家流派',
    'home.quickStart': '即刻開始沖煮',
    'home.continueWith': '使用「{name}」',
    'home.customRecipeBtn': '自訂個人手沖食譜',
    'home.recentLogs': '最近手沖紀錄',
    'home.viewAll': '查看全部',
    'home.beanVault': '精品咖啡豆庫 (點選切換)',
    'home.emptyLog': '尚無紀錄，開始沖煮第一杯！',

    // Scan / Bean Profile
    'scan.title': '咖啡豆設定與產區',
    'scan.subtitle': 'MANUAL BEAN PROFILER',
    'scan.frontBag': '正面包裝',
    'scan.backBag': '背面 / 產區標籤',
    'scan.captureOrUpload': '拍攝或上傳',
    'scan.roastAndProcess': '烘焙度與處理法',
    'scan.frontLoaded': '正面已載入',
    'scan.backLoaded': '背面標籤已載入',
    'scan.scanning': '正在辨識咖啡豆風味與烘焙度...',
    'scan.scanningDetail': '比對衣索比亞、藝妓、肯亞等產區風味中',
    'scan.tipsTitle': '提高辨識準確度技巧',
    'scan.tip1': '確保相片清晰對焦在產區、莊園與處理法字樣。',
    'scan.tip2': '正面拍攝豆袋名稱，背面拍攝烘焙日期與風味筆記。',
    'scan.tip3': '系統將自動推算最適粉水比、研磨度及水溫注水曲線。',
    'scan.privacy': '✓ 相片只在本地裝置安全分析，不作外部雲端儲存',
    'scan.useSample': '用莊園示範標籤 (快速體驗)',
    'scan.manualInput': '改為手動輸入豆種資訊',
    'scan.flavorWheel': '精品咖啡風味輪',
    'scan.flavorWheelTitle': 'SCA 精品咖啡風味輪',
    'scan.flavorWheelDesc': '精品咖啡涵蓋花香 (茉莉/橙花)、果酸 (柑橘/漿果/核果)、焦糖甜感及可可茶韻。烘焙度越淺，果酸與花香越細緻。',

    // Method Selector
    'methods.title': '揀沖煮方法',
    'methods.subtitle': 'BREW METHOD VAULT',
    'methods.dose': '粉量',
    'methods.water': '總水量',
    'methods.temp': '水溫',
    'methods.stages': '注水段數',
    'methods.selected': '已選取',
    'methods.selectThis': '選擇此法',
    'methods.createCustom': '建立專屬個人化手沖食譜 (多段水溫/注水調整)',
    'methods.continueBtn': '繼續使用「{name}」',

    // Recipe Detail
    'recipe.details': '沖煮食譜詳情',
    'recipe.subtitle': 'RECIPE PROFILE',
    'recipe.equipment': '沖煮器材',
    'recipe.targetTime': '目標總時間',
    'recipe.grind': '研磨度',
    'recipe.stages': '注水段數',
    'recipe.flowBreakdown': '每段注水與萃取細節',
    'recipe.useThis': '進入沖煮準備',
    'recipe.chooseOther': '選擇其他沖煮方法',

    // Prep Checklist
    'prep.title': '沖煮準備',
    'prep.subtitle': 'MISE EN PLACE',
    'prep.specs': '萃取參數配置',
    'prep.coffeeGround': '咖啡粉',
    'prep.totalWater': '總注水',
    'prep.ratio': '比例',
    'prep.waterTemp': '水溫',
    'prep.advanceMode': '計時步驟切換模式',
    'prep.manualMode': '手動 (手按下一步)',
    'prep.autoMode': '自動 (倒數完自動進階)',
    'prep.manualDesc': '適合依照電子磅滴濾流速手動按鍵進入下一段注水。',
    'prep.autoDesc': '每段注水時間倒數結束時，將自動發出蜂鳴聲並切換下一段。',
    'prep.checklist': '手沖前置清單',
    'prep.checkAll': '全部完成',
    'prep.uncheckAll': '全部取消',
    'prep.waterQuality': '水質建議：TDS 75–125 ppm · 鈣鎂離子適中',
    'prep.requiredEquipment': '所需器材',
    'prep.startBrew': '進入沖煮計時',

    // Brew Screen
    'brew.title': '正在沖煮',
    'brew.category': '手沖咖啡',
    'brew.step': '步驟',
    'brew.soundOn': '音效開啟',
    'brew.soundMuted': '靜音中',
    'brew.pourRemaining': '注水 · {time} 剩餘',
    'brew.waitRemaining': '滴濾 · {time} 剩餘',
    'brew.overtime': '超時 +{time}',
    'brew.totalTime': '總沖煮時間',
    'brew.target': '目標',
    'brew.elapsed': '實時累計',
    'brew.auto': '自動',
    'brew.manual': '手動',
    'brew.pourNow': '現在注水',
    'brew.waitDrawdown': '等待滴濾',
    'brew.stepFinished': '步驟完成',
    'brew.pourDesc': '在 {time} 內加入 {water} 克水 · 磅重達 {target} 克。',
    'brew.waitDesc': '停止注水 · 靜置咖啡粉床等待完全透水滴濾。',
    'brew.overtimeDesc': '此段時間已滿 · 請點擊下方按鈕進入「{next}」。',
    'brew.finishStepName': '完成手沖',
    'brew.scaleTarget': '電子磅應顯示',
    'brew.stepAdd': '本段注水 +{water}g',
    'brew.technique': '技巧',
    'brew.viewDetails': '查看詳情',
    'brew.pourCapsule': '注水 · {time}',
    'brew.waitCapsule': '等待 · {time} (點擊提前進入下一步)',
    'brew.nextCapsule': '進入下一步',
    'brew.finishCapsule': '完成手沖',
    'brew.prevStep': '上一步',
    'brew.pause': '暫停',
    'brew.resume': '繼續',
    'brew.restart': '重新開始',
    'brew.restartStep': '重置本段',
    'brew.guideTitle': '萃取指南',
    'brew.guidePourStyle': '注水方式',
    'brew.guideTechnique': '萃取心法',
    'brew.guideTip': '💡 建議保持水柱垂直柔和，離咖啡粉面約 8–10 公分，避免猛烈衝擊造成通道效應。',
    'brew.close': '關閉',

    // Finish
    'finish.completeTitle': '沖煮完成 · 享受這杯咖啡',
    'finish.totalDuration': '總計萃取耗時 {time}',
    'finish.summaryTitle': '手沖萃取摘要',
    'finish.cuppingScore': '杯測整體評分',
    'finish.actualScale': '實際電子磅讀數',
    'finish.exactMatch': '完全符合目標',
    'finish.tastingNotes': '品飲筆記 (可選)',
    'finish.tastingPlaceholder': '例如：花香撲鼻，乾淨度極高，尾韻帶有甘甜蜜桃感...',
    'finish.diagnoseBtn': '立即進行風味診斷與調校',
    'finish.saveToHistory': '儲存並返回歷史紀錄',

    // History & Evaluation
    'history.title': '沖煮日誌',
    'history.subtitle': 'BREW LOG JOURNAL',
    'history.totalBrews': '總沖煮紀錄',
    'history.avgRating': '平均杯測評分',
    'history.all': '全部',
    'history.empty': '尚無沖煮紀錄',
    'history.emptySub': '開始手沖一壺咖啡，記錄每一滴甘醇！',
    'history.viewDiagnostic': '查看診斷與調校',
    'history.backHome': '返回首頁',

    'eval.title': '杯測風味與萃取校正',
    'eval.subtitle': 'BARISTA CUPPING & DIALING-IN',
    'eval.selectFlavor': '點選此杯口感與風味特徵 (可多選)：',
    'eval.baristaAdvice': '咖啡師調校建議 (EXTRACTION HEURISTICS)',
    'eval.applyBtn': '套用建議並準備下一杯',

    // Setup screen
    'setup.title': '沖煮參數微調',
    'setup.subtitle': 'DOSE & RATIO TUNER',
    'setup.groundDose': '咖啡粉量',
    'setup.ratioAndWater': '粉水比例與總注水',
    'setup.grindSetting': '研磨刻度配置',
    'setup.proceedToPrep': '進入沖煮準備清單',
  },
  en: {
    // Header
    'app.title': 'Pour-Over Companion',
    'app.subtitle': 'BARISTA DRIP COMPANION',
    'app.offline': 'Offline',
    'app.install': 'Install',
    'app.customRecipe': 'Create Custom Recipe',
    'app.soundOn': 'Sound On',
    'app.soundMuted': 'Muted',
    'app.history': 'Brew Logs',

    // Home
    'home.topTag': 'ARTISANAL POUR-OVER',
    'home.headline': 'Master Pour-Over',
    'home.subhead': 'Precision pour-over brewing with bean profiling and smart timer guidance.',
    'home.scanBag': 'Bean Profile & Origins',
    'home.scanBagSub': 'Enter bean specs or choose estate beans for tailored recipes',
    'home.chooseMethod': 'Select Brew Method',
    'home.chooseMethodSub': 'Explore 4:6 method, Hoffmann technique & champion recipes',
    'home.quickStart': 'Start Brewing Now',
    'home.continueWith': 'Use "{name}"',
    'home.customRecipeBtn': 'Create Custom Recipe',
    'home.recentLogs': 'Recent Brew History',
    'home.viewAll': 'View All',
    'home.beanVault': 'Specialty Bean Vault (Tap to select)',
    'home.emptyLog': 'No brew logs yet. Start your first pour!',

    // Scan / Bean Profile
    'scan.title': 'Bean Profile & Origins',
    'scan.subtitle': 'MANUAL BEAN PROFILER',
    'scan.frontBag': 'Front Bag',
    'scan.backBag': 'Back / Region Label',
    'scan.captureOrUpload': 'Capture or Upload',
    'scan.roastAndProcess': 'Roast Level & Process',
    'scan.frontLoaded': 'Front Bag Loaded',
    'scan.backLoaded': 'Back Label Loaded',
    'scan.scanning': 'Recognizing coffee flavor notes & roast profile...',
    'scan.scanningDetail': 'Matching Ethiopian, Geisha, Kenyan bean profiles...',
    'scan.tipsTitle': 'Tips for Higher Recognition Accuracy',
    'scan.tip1': 'Ensure photo is sharply focused on origin, estate, and process names.',
    'scan.tip2': 'Capture bag title on front and roast date / flavor notes on back.',
    'scan.tip3': 'System will automatically calibrate ratio, grind size, and water curve.',
    'scan.privacy': '✓ Images analyzed securely on your local device without external storage',
    'scan.useSample': 'Use Sample Estate Beans',
    'scan.manualInput': 'Enter Bean Details Manually',
    'scan.flavorWheel': 'SCA Flavor Wheel',
    'scan.flavorWheelTitle': 'SCA Specialty Coffee Flavor Wheel',
    'scan.flavorWheelDesc': 'Specialty coffee spans floral, fruity acidity, caramel sweetness, and cocoa/tea notes. Lighter roasts highlight delicate florals and berry brightness.',

    // Method Selector
    'methods.title': 'Select Brew Method',
    'methods.subtitle': 'BREW METHOD VAULT',
    'methods.dose': 'Dose',
    'methods.water': 'Water',
    'methods.temp': 'Temp',
    'methods.stages': 'Stages',
    'methods.selected': 'Selected',
    'methods.selectThis': 'Select',
    'methods.createCustom': 'Create Custom Drip Recipe (Multi-stage temp & pours)',
    'methods.continueBtn': 'Continue with "{name}"',

    // Recipe Detail
    'recipe.details': 'Recipe Details',
    'recipe.subtitle': 'RECIPE PROFILE',
    'recipe.equipment': 'Equipment',
    'recipe.targetTime': 'Target Time',
    'recipe.grind': 'Grind Size',
    'recipe.stages': 'Stages',
    'recipe.flowBreakdown': 'Step-by-step Pour Breakdown',
    'recipe.useThis': 'Proceed to Prep',
    'recipe.chooseOther': 'Choose Other Method',

    // Prep Checklist
    'prep.title': 'Mise en Place (Prep)',
    'prep.subtitle': 'MISE EN PLACE',
    'prep.specs': 'Extraction Parameters',
    'prep.coffeeGround': 'Coffee Ground',
    'prep.totalWater': 'Total Water',
    'prep.ratio': 'Ratio',
    'prep.waterTemp': 'Temp',
    'prep.advanceMode': 'Timer Step Advance Mode',
    'prep.manualMode': 'Manual (Tap to advance)',
    'prep.autoMode': 'Auto (Timer auto-advances)',
    'prep.manualDesc': 'Ideal for adjusting pours according to live scale drip flow rate.',
    'prep.autoDesc': 'Beeps and auto-advances to the next stage when timer reaches zero.',
    'prep.checklist': 'Pour-Over Prep Checklist',
    'prep.checkAll': 'Check All',
    'prep.uncheckAll': 'Uncheck All',
    'prep.waterQuality': 'Water Recommendation: TDS 75–125 ppm · Balanced minerals',
    'prep.requiredEquipment': 'Required Gear',
    'prep.startBrew': 'Start Brewing Timer',

    // Brew Screen
    'brew.title': 'Brewing Active',
    'brew.category': 'Pour-Over',
    'brew.step': 'Step',
    'brew.soundOn': 'Sound On',
    'brew.soundMuted': 'Muted',
    'brew.pourRemaining': 'Pour · {time} left',
    'brew.waitRemaining': 'Drawdown · {time} left',
    'brew.overtime': 'Overtime +{time}',
    'brew.totalTime': 'Total Brew Time',
    'brew.target': 'Target',
    'brew.elapsed': 'Elapsed',
    'brew.auto': 'Auto',
    'brew.manual': 'Manual',
    'brew.pourNow': 'Pour Water Now',
    'brew.waitDrawdown': 'Wait for Drawdown',
    'brew.stepFinished': 'Step Finished',
    'brew.pourDesc': 'Pour {water}g of water in {time} · scale target reaching {target}g.',
    'brew.waitDesc': 'Stop pouring · allow coffee bed to filter through completely.',
    'brew.overtimeDesc': 'Step duration reached · tap button below to advance to "{next}".',
    'brew.finishStepName': 'Finish Brew',
    'brew.scaleTarget': 'Scale Target Weight',
    'brew.stepAdd': 'Step Pour +{water}g',
    'brew.technique': 'Technique',
    'brew.viewDetails': 'Details',
    'brew.pourCapsule': 'Pour · {time}',
    'brew.waitCapsule': 'Wait · {time} (Tap to advance)',
    'brew.nextCapsule': 'Next Step',
    'brew.finishCapsule': 'Finish Brew',
    'brew.prevStep': 'Prev',
    'brew.pause': 'Pause',
    'brew.resume': 'Resume',
    'brew.restart': 'Restart',
    'brew.restartStep': 'Restart Step',
    'brew.guideTitle': 'Extraction Guide',
    'brew.guidePourStyle': 'Pour Style',
    'brew.guideTechnique': 'Extraction Insight',
    'brew.guideTip': '💡 Maintain a gentle, vertical stream ~8-10cm above bed to prevent channelling.',
    'brew.close': 'Close',

    // Finish
    'finish.completeTitle': 'Brew Complete · Enjoy Your Coffee',
    'finish.totalDuration': 'Total Extraction Time: {time}',
    'finish.summaryTitle': 'Pour-Over Extraction Summary',
    'finish.cuppingScore': 'Cupping Score',
    'finish.actualScale': 'Actual Scale Weight',
    'finish.exactMatch': 'Exact Match',
    'finish.tastingNotes': 'Tasting Notes (Optional)',
    'finish.tastingPlaceholder': 'e.g. Floral jasmine aroma, clean body, sweet peach finish...',
    'finish.diagnoseBtn': 'Run Taste Diagnostics & Dial-In',
    'finish.saveToHistory': 'Save & View History',

    // History & Evaluation
    'history.title': 'Brew Log Journal',
    'history.subtitle': 'BREW LOG JOURNAL',
    'history.totalBrews': 'Total Brews',
    'history.avgRating': 'Avg Rating',
    'history.all': 'All',
    'history.empty': 'No brew records yet',
    'history.emptySub': 'Brew a cup of coffee and record every note!',
    'history.viewDiagnostic': 'View Diagnostics & Dial-In',
    'history.backHome': 'Back to Home',

    'eval.title': 'Cupping & Dial-In Correction',
    'eval.subtitle': 'BARISTA CUPPING & DIALING-IN',
    'eval.selectFlavor': 'Select taste & tactile attributes (multiple):',
    'eval.baristaAdvice': 'Barista Dial-In Recommendation',
    'eval.applyBtn': 'Apply Advice & Prep Next Brew',

    // Setup screen
    'setup.title': 'Dose & Ratio Tuner',
    'setup.subtitle': 'DOSE & RATIO TUNER',
    'setup.groundDose': 'Coffee Dose',
    'setup.ratioAndWater': 'Brew Ratio & Total Water',
    'setup.grindSetting': 'Grind Size Calibration',
    'setup.proceedToPrep': 'Proceed to Prep Checklist',
  },
};
