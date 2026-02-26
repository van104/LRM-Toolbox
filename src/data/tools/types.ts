export interface Category {
  id: string;
  name: string;
  icon: string;
  svgIcon?: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  icon?: string;
  svgIcon?: string;
  customIcon?: string;
  summary: string;
  description: string;
  usage: string;
  route: string;
  isLocal: boolean;
  isAi?: boolean;
  tags: string[];
}

export const categoriesBase: Category[] = [
  { id: 'all', name: '全部工具', icon: 'Grid', svgIcon: 'AllCategoryIcon' },
  { id: 'dev', name: '开发运维', icon: 'Monitor', svgIcon: 'DevCategoryIcon' },
  { id: 'text', name: '文本处理', icon: 'Document', svgIcon: 'TextCategoryIcon' },
  { id: 'image', name: '图片视频', icon: 'Picture', svgIcon: 'ImageCategoryIcon' },
  { id: 'pdf', name: 'PDF 处理', icon: 'Document', svgIcon: 'PdfCategoryIcon' },
  { id: 'design', name: '设计辅助', icon: 'Brush', svgIcon: 'DesignCategoryIcon' },
  { id: 'finance', name: '金融理财', icon: 'Wallet', svgIcon: 'FinanceCategoryIcon' },
  { id: 'health', name: '健康运动', icon: 'Service', svgIcon: 'HealthCategoryIcon' },
  { id: 'life', name: '生活常用', icon: 'Coffee', svgIcon: 'LifeCategoryIcon' },
  { id: 'edu', name: '教育学习', icon: 'Notebook', svgIcon: 'EduCategoryIcon' },
  { id: 'fun', name: '趣味玩法', icon: 'IceTea', svgIcon: 'FunCategoryIcon' }
];
