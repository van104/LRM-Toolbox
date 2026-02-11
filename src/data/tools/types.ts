export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  icon?: string;
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
  { id: 'all', name: '全部工具', icon: 'Grid' },
  { id: 'dev', name: '开发运维', icon: 'Monitor' },
  { id: 'text', name: '文本处理', icon: 'Document' },
  { id: 'image', name: '图片视频', icon: 'Picture' },
  { id: 'pdf', name: 'PDF 处理', icon: 'Document' },
  { id: 'design', name: '设计辅助', icon: 'Brush' },
  { id: 'finance', name: '金融理财', icon: 'Wallet' },
  { id: 'health', name: '健康运动', icon: 'Service' },
  { id: 'life', name: '生活常用', icon: 'Coffee' },
  { id: 'edu', name: '教育学习', icon: 'Notebook' },
  { id: 'fun', name: '趣味玩法', icon: 'IceTea' }
];
