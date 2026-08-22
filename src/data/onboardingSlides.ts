export interface OnboardingSlide {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: '歡迎使用手沖伴侶',
    titleEn: 'Welcome to Pour-Over Companion',
    description: '您的個人手沖咖啡助手，從豆種選擇到風味診斷，一步步引導您沖出完美咖啡。',
    descriptionEn: 'Your personal pour-over assistant. From bean selection to flavor diagnostics, we guide you step-by-step to brew the perfect cup.',
    icon: 'Coffee',
  },
  {
    id: 'beans',
    title: '選擇您的咖啡豆',
    titleEn: 'Choose Your Beans',
    description: '從莊園精選豆單中挑選，或輸入您自己的豆種資訊。系統會自動推薦最佳沖煮參數。',
    descriptionEn: 'Select from our curated estate beans or enter your own. The system automatically recommends optimal brewing parameters.',
    icon: 'Leaf',
  },
  {
    id: 'brew',
    title: '跟隨計時器沖煮',
    titleEn: 'Brew with Timer Guidance',
    description: '即時計時器引導您完成每一段注水。支援手動與自動模式，搭配音效與觸覺回饋。',
    descriptionEn: 'Real-time timer guides you through each pour. Supports manual and auto modes with audio and haptic feedback.',
    icon: 'Timer',
  },
  {
    id: 'history',
    title: '記錄與優化',
    titleEn: 'Track & Improve',
    description: '每次沖煮都會記錄下來。系統會根據您的杯測評分提供調校建議，幫助您不斷進步。',
    descriptionEn: 'Every brew is logged. The system provides dial-in suggestions based on your cupping scores to help you improve.',
    icon: 'TrendingUp',
  },
];
