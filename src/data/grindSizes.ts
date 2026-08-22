export interface GrindSize {
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
}

export const grindSizes: Record<string, GrindSize> = {
  '細研磨': {
    label: '細研磨',
    labelEn: 'Fine',
    description: '像麵粉般細緻，適用於濃縮咖啡',
    descriptionEn: 'Flour-like consistency, for espresso',
  },
  '中幼研磨': {
    label: '中幼研磨',
    labelEn: 'Medium-Fine',
    description: '像沙子般細緻，適用於手沖咖啡',
    descriptionEn: 'Sand-like consistency, for pour-over',
  },
  '中研磨': {
    label: '中研磨',
    labelEn: 'Medium',
    description: '像砂糖般顆粒，適用於滴濾咖啡',
    descriptionEn: 'Sugar-like颗粒, for drip coffee',
  },
  '中粗研磨': {
    label: '中粗研磨',
    labelEn: 'Medium-Coarse',
    description: '像粗鹽般顆粒，適用於Chemex',
    descriptionEn: 'Coarse salt-like, for Chemex',
  },
  '粗研磨': {
    label: '粗研磨',
    labelEn: 'Coarse',
    description: '像海鹽般顆粒，適用於法壓壺',
    descriptionEn: 'Sea salt-like, for French press',
  },
};
