

import { DashboardProject } from '../types';

const STORAGE_KEY = 'captain_dashboard_projects_v2';

const DEFAULT_PROJECTS: DashboardProject[] = [
  {
    id: 'p1',
    name: '核心骨干留存计划',
    category: '人力运营',
    updatedAt: '今天 09:30',
    content: `
      <h3 class="text-lg font-bold text-slate-900 mb-2">项目背景</h3>
      <p class="text-slate-600 mb-4">
        针对Q1季度高绩效员工（Top Performer）流失率上升至15%的情况，我们启动了此专项计划。核心目标是在Q3结束前将骨干流失率控制在5%以内。
      </p>
      <h3 class="text-lg font-bold text-slate-900 mb-2">本月策略重点</h3>
      <ul class="list-disc pl-5 space-y-1 text-slate-600 mb-4">
        <li><strong>薪酬结构调整</strong>：已完成30%核心员工的绩效奖金系数优化，侧重于长期激励。</li>
        <li><strong>职业双通道</strong>：正式发布“专家岗”与“管理岗”双通道晋升标准，解决天花板问题。</li>
        <li><strong>EAP辅助</strong>：引入第三方心理咨询服务，缓解一线压力。</li>
      </ul>
    `,
    kpi: {
      label: '核心留存率',
      value: 85,
      unit: '%',
      trend: 3.2,
      riskLabel: '高风险名单',
      riskValue: '3 人',
      riskIconName: 'Users',
      riskColor: 'text-orange-600 bg-orange-50'
    },
    chartData: [
      { month: '1月', value: 85 },
      { month: '2月', value: 82 },
      { month: '3月', value: 78 },
      { month: '4月', value: 80 },
      { month: '5月', value: 83 },
      { month: '6月', value: 85 },
    ],
    actionPlanFile: "Q3_核心骨干留存_行动计划_v2.pdf",
    meetingRecordFile: "Q3_核心骨干留存_会议纪要.doc",
    riskDetails: [
      { id: 'r1', name: '王强 (工号8921)', desc: '薪资满意度低，近期频繁请假', metric: '离职风险 85%', status: 'critical' },
      { id: 'r2', name: '李娜 (工号7732)', desc: '职业晋升受阻，连续两季度S级绩效但无空缺', metric: '离职风险 78%', status: 'critical' },
      { id: 'r3', name: '陈思 (工号1102)', desc: '外部猎头接触频繁，工作状态波动', metric: '离职风险 72%', status: 'warning' },
      { id: 'r4', name: '赵敏 (工号3301)', desc: '对新排班制度不满', metric: '离职风险 60%', status: 'warning' },
    ]
  },
  {
    id: 'p2',
    name: '全渠道客户体验升级 (NPS)',
    category: '质量管理',
    updatedAt: '昨天 14:20',
    content: `
      <h3 class="text-lg font-bold text-slate-900 mb-2">项目背景</h3>
      <p class="text-slate-600 mb-4">
        客户净推荐值（NPS）在过去两个月出现波动。分析显示，客户对“问题解决时效”和“客服共情能力”的评价是主要扣分项。
      </p>
      <h3 class="text-lg font-bold text-slate-900 mb-2">近期行动</h3>
      <p class="text-slate-600 mb-4">
        我们正在从“标准化服务”向“有温度的服务”转型。重点实施<strong>FCR（首问解决率）</strong>提升计划，授权一线客服拥有更高额度的退款/赔偿权限，减少升级投诉。
      </p>
      <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
        <strong>💡 洞察：</strong> 数据显示，通话时长增加30秒用于情感安抚，NPS可提升1.5分。
      </div>
    `,
    kpi: {
      label: '客户满意度 (CSAT)',
      value: 4.6,
      unit: '分',
      trend: 0.2,
      riskLabel: '本周差评',
      riskValue: '12 条',
      riskIconName: 'Smile',
      riskColor: 'text-blue-600 bg-blue-50'
    },
    chartData: [
      { month: '1月', value: 4.2 },
      { month: '2月', value: 4.3 },
      { month: '3月', value: 4.1 },
      { month: '4月', value: 4.4 },
      { month: '5月', value: 4.5 },
      { month: '6月', value: 4.6 },
    ],
    actionPlanFile: "NPS提升_全渠道体验_实施方案.pdf",
    meetingRecordFile: "NPS项目_周会记录_0520.doc",
    riskDetails: [
      { id: 'n1', name: '用户 138****1234', desc: '“客服态度极其敷衍，问题没解决就挂电话”', metric: '评分 1.0', status: 'critical' },
      { id: 'n2', name: '用户 139****5678', desc: '“退款流程太繁琐，等了3天没动静”', metric: '评分 2.0', status: 'warning' },
      { id: 'n3', name: '用户 186****9988', desc: '“对解决方案不满意，没有体现诚意”', metric: '评分 2.0', status: 'warning' },
      { id: 'n4', name: '用户 150****2233', desc: '“接通等待时间太长了”', metric: '评分 3.0', status: 'info' },
    ]
  },
  {
    id: 'p3',
    name: 'AHT (平均处理时长) 缩减行动',
    category: '效率优化',
    updatedAt: '3天前',
    content: `
      <h3 class="text-lg font-bold text-slate-900 mb-2">项目背景</h3>
      <p class="text-slate-600 mb-4">
        随着业务复杂度增加，AHT已突破480秒，导致排班成本激增。目标是通过知识库优化和流程简化，将AHT降至420秒以内。
      </p>
      <h3 class="text-lg font-bold text-slate-900 mb-2">执行方案</h3>
      <ul class="list-disc pl-5 space-y-1 text-slate-600">
        <li><strong>AI 辅助</strong>：上线 Captain AI 实时话术推荐，减少坐席查阅文档时间（预计节省 25s）。</li>
        <li><strong>静音去除</strong>：针对通话中超过10秒的静默段进行专项听音分析。</li>
        <li><strong>系统集成</strong>：打通CRM与订单系统，实现单屏操作。</li>
      </ul>
    `,
    kpi: {
      label: '平均处理时长 (AHT)',
      value: 425,
      unit: '秒',
      trend: -15, // Negative is good for AHT, handled in logic
      riskLabel: '长时通话占比',
      riskValue: '8.5%',
      riskIconName: 'Clock',
      riskColor: 'text-purple-600 bg-purple-50'
    },
    chartData: [
      { month: '1月', value: 490 },
      { month: '2月', value: 485 },
      { month: '3月', value: 480 },
      { month: '4月', value: 460 },
      { month: '5月', value: 440 },
      { month: '6月', value: 425 },
    ],
    actionPlanFile: "AHT缩减_流程优化指南.pdf",
    meetingRecordFile: "AHT项目_复盘会议记录.doc",
    riskDetails: [
      { id: 'c1', name: 'Call-20240520-001', desc: '业务流程不熟练，多次Hold查询知识库', metric: '1200s', status: 'critical' },
      { id: 'c2', name: 'Call-20240520-003', desc: '客户情绪激动，安抚耗时较长', metric: '980s', status: 'warning' },
      { id: 'c3', name: 'Call-20240521-012', desc: '系统故障导致查询缓慢', metric: '850s', status: 'warning' },
      { id: 'c4', name: 'Call-20240521-045', desc: '新人操作不熟练', metric: '780s', status: 'info' },
    ]
  }
];

const loadProjects = (): DashboardProject[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load dashboard projects", e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
  return DEFAULT_PROJECTS;
};

export const getDashboardProjects = (): DashboardProject[] => {
  return loadProjects();
};

export const saveDashboardProject = (project: DashboardProject): void => {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const deleteDashboardProject = (id: string): void => {
  const projects = loadProjects();
  const newProjects = projects.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
};