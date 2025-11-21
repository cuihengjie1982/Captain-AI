
import { KnowledgeCategory } from '../types';

const STORAGE_KEY = 'captain_resources';

const DEFAULT_RESOURCES: KnowledgeCategory[] = [
  // AI Repository Item
  {
    id: 'ai-lib-1', 
    name: 'AI 智能回复附件库', 
    color: 'violet',
    isAiRepository: true,
    items: [
       { title: "标准诊断报告模版.docx", type: "doc", size: "1.2 MB" },
       { title: "AI 建议实施路径图.pdf", type: "pdf", size: "0.8 MB" },
       { title: "自动化数据采集脚本.xlsx", type: "xlsx", size: "45 KB" }
    ]
  },
  // General Resources
  {
    id: '1', name: '核心人才留存', color: 'blue',
    items: [
       { title: "离职倾向调查问卷", type: "xlsx", size: "45 KB" },
       { title: "核心骨干盘点表 (9-Box)", type: "xlsx", size: "32 KB" },
       { title: "留存访谈话术指南", type: "pdf", size: "1.2 MB" },
       { title: "人才流失预警模型", type: "ppt", size: "4.5 MB" }
    ]
  },
  {
    id: '2', name: '薪酬与绩效', color: 'emerald',
    items: [
       { title: "薪资竞争力分析计算器", type: "xlsx", size: "156 KB" },
       { title: "绩效奖金测算工具", type: "xlsx", size: "88 KB" },
       { title: "非物质激励方案清单", type: "pdf", size: "620 KB" }
    ]
  },
  {
    id: '3', name: '管理与辅导', color: 'orange',
    items: [
       { title: "1对1辅导标准化手册", type: "ppt", size: "5.4 MB" },
       { title: "GROW模型教练卡", type: "pdf", size: "2.1 MB" },
       { title: "团队氛围诊断工具", type: "doc", size: "45 KB" }
    ]
  },
  {
    id: '4', name: '高绩效人员画像', color: 'purple',
    items: [
       { title: "胜任力模型构建指南", type: "pdf", size: "3.2 MB" },
       { title: "明星员工访谈提纲", type: "doc", size: "45 KB" },
       { title: "行为面试打分表", type: "xlsx", size: "56 KB" }
    ]
  },
  {
    id: '5', name: '培训效果评估', color: 'pink',
    items: [
       { title: "柯氏四级评估模型", type: "ppt", size: "2.8 MB" },
       { title: "培训ROI计算器", type: "xlsx", size: "92 KB" },
       { title: "岗前培训通关测试卷", type: "doc", size: "120 KB" }
    ]
  },
  {
    id: '6', name: '预测与人员匹配', color: 'indigo',
    items: [
       { title: "Erlang-C排班计算器", type: "xlsx", size: "450 KB" },
       { title: "话务量预测模型", type: "xlsx", size: "210 KB" },
       { title: "Shrinkage(损耗)分析表", type: "xlsx", size: "65 KB" }
    ]
  },
  {
    id: '7', name: '客户体验评估', color: 'cyan',
    items: [
       { title: "客户旅程地图模板", type: "ppt", size: "6.5 MB" },
       { title: "NPS/CSAT驱动因素分析", type: "xlsx", size: "180 KB" },
       { title: "痛点分析报告模板", type: "ppt", size: "2.2 MB" }
    ]
  },
  {
    id: '8', name: '质量评估', color: 'teal',
    items: [
       { title: "QA评分标准表(COPC参考)", type: "xlsx", size: "115 KB" },
       { title: "质检校准(Calibration)记录", type: "xlsx", size: "78 KB" }
    ]
  },
  {
    id: '9', name: '指标波动管理', color: 'rose',
    items: [
       { title: "KPI异常波动鱼骨图", type: "ppt", size: "1.5 MB" },
       { title: "指标复盘报告模板", type: "doc", size: "55 KB" }
    ]
  },
  {
    id: '10', name: '成本效率评估', color: 'slate',
    items: [
       { title: "单次联络成本(CPC)模型", type: "xlsx", size: "130 KB" },
       { title: "运营效率仪表盘", type: "xlsx", size: "240 KB" },
       { title: "ROI分析工具", type: "xlsx", size: "95 KB" }
    ]
  }
];

const loadCategories = (): KnowledgeCategory[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error(e); }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RESOURCES));
  return DEFAULT_RESOURCES;
};

export const getKnowledgeCategories = (): KnowledgeCategory[] => loadCategories();

export const saveKnowledgeCategory = (category: KnowledgeCategory): void => {
  const categories = loadCategories();
  const idx = categories.findIndex(c => c.id === category.id);
  if (idx >= 0) categories[idx] = category;
  else categories.push(category);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
};

export const deleteKnowledgeCategory = (id: string): void => {
  const categories = loadCategories();
  const newCategories = categories.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
};