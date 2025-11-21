
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { DashboardProject } from '../types';
import { getDashboardProjects } from '../services/dashboardService';
import { 
  PlusCircle, TrendingUp, TrendingDown, Users, Activity, 
  ChevronDown, Target, FileText, BarChart3, Clock, Zap, Smile, Download
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [currentData, setCurrentData] = useState<DashboardProject | null>(null);

  useEffect(() => {
    const data = getDashboardProjects();
    setProjects(data);
    if (data.length > 0) {
      setSelectedProjectId(data[0].id);
      setCurrentData(data[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId && projects.length > 0) {
      const project = projects.find(p => p.id === selectedProjectId) || projects[0];
      setCurrentData(project);
    }
  }, [selectedProjectId, projects]);

  if (!currentData) return <div className="p-8 text-center">Loading Dashboard...</div>;

  // Helper to render icons dynamically
  const renderRiskIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users size={20} />;
      case 'Smile': return <Smile size={20} />;
      case 'Clock': return <Clock size={20} />;
      case 'Activity': return <Activity size={20} />;
      case 'Zap': return <Zap size={20} />;
      default: return <Activity size={20} />;
    }
  };

  // Determine trend color
  // For AHT (Time), lower is usually better (negative trend is good)
  const isInverseMetric = currentData.kpi.label.includes('时长') || currentData.kpi.label.includes('AHT');
  const trendVal = currentData.kpi.trend;
  
  let trendColor = 'text-slate-500';
  if (isInverseMetric) {
     trendColor = trendVal < 0 ? 'text-green-600' : 'text-red-500';
  } else {
     trendColor = trendVal > 0 ? 'text-green-600' : 'text-red-500';
  }

  const TrendIcon = trendVal >= 0 ? TrendingUp : TrendingDown;

  const handleDownload = (filename: string | undefined, typeLabel: string) => {
    if (!filename) {
      alert(`当前项目暂无"${typeLabel}"可供下载或查看。`);
      return;
    }
    
    // Use setTimeout to allow UI events to flush before confirm blocks
    setTimeout(() => {
        const confirmed = window.confirm(`【模拟系统】\n\n检测到文件：${filename}\n\n是否确认下载/查看？`);
        if (confirmed) {
            alert(`成功！\n\n已为您下载文件：${filename}\n\n（这只是一个演示，实际文件中会包含具体的行动细节。）`);
        }
    }, 50);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col">
      
      {/* Header with Project Selector */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
             <Target size={14} /> {currentData.category} 项目
          </div>
          <div className="relative inline-block w-full md:w-auto">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="appearance-none bg-transparent text-3xl font-bold text-slate-900 pr-10 py-1 focus:outline-none cursor-pointer hover:text-blue-700 transition-colors w-full"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 animate-pulse">
             运行中
           </span>
           <div className="text-sm text-slate-400">更新于：{currentData.updatedAt}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* LEFT COLUMN: Blog/Briefing Content */}
        <div className="lg:col-span-2 space-y-8">
           {/* Project Briefing Card */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                 <FileText size={18} className="text-blue-600" />
                 <h2 className="font-bold text-slate-800">项目改善报告</h2>
              </div>
              <div className="p-6 md:p-8">
                {/* Dynamic HTML Content */}
                <div 
                  className="prose prose-slate prose-sm md:prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentData.content }}
                />
                
                <div className="mt-8 flex flex-wrap gap-3">
                   <button 
                     onClick={() => handleDownload(currentData.actionPlanFile, '详细行动计划')}
                     className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20"
                   >
                      <Download size={16} />
                      下载详细行动计划 (PDF)
                   </button>
                   <button 
                     onClick={() => handleDownload(currentData.meetingRecordFile, '历史会议记录')}
                     className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                   >
                      <FileText size={16} />
                      查看历史会议记录
                   </button>
                </div>
              </div>
           </div>

           {/* Chart Section */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     <BarChart3 size={18} className="text-blue-600" /> 
                     趋势分析
                   </h3>
                </div>
                {/* Placeholder for quick actions */}
                <div className="text-xs text-slate-400">
                   数据来源: 商业智能系统 (BI)
                </div>
             </div>
             
             <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={currentData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                     dataKey="month" 
                     stroke="#94a3b8" 
                     tickLine={false} 
                     axisLine={false} 
                     dy={10}
                     fontSize={12}
                   />
                   <YAxis 
                     stroke="#94a3b8" 
                     tickLine={false} 
                     axisLine={false} 
                     dx={-10}
                     fontSize={12}
                     domain={['auto', 'auto']}
                   />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ color: '#fff' }}
                     cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="value" 
                     stroke="#2563eb" 
                     strokeWidth={3} 
                     fillOpacity={1} 
                     fill="url(#colorValue)" 
                     activeDot={{ r: 6, strokeWidth: 0 }}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Stats Cards */}
        <div className="space-y-6">
           
           {/* Main KPI Card */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 blur-2xl opacity-50"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-slate-500 font-medium text-sm">{currentData.kpi.label}</span>
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm"><Activity size={20} /></div>
                </div>
                <div className="flex items-baseline gap-2">
                   <div className="text-5xl font-bold text-slate-900 tracking-tight">{currentData.kpi.value}</div>
                   <div className="text-xl font-medium text-slate-400">{currentData.kpi.unit}</div>
                </div>
                <div className={`flex items-center mt-4 text-sm font-medium ${trendColor}`}>
                  <TrendIcon size={16} className="mr-1" />
                  <span>{Math.abs(currentData.kpi.trend)}% 较上月</span>
                </div>
              </div>
           </div>

           {/* Risk/Details Card */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-slate-500 font-medium text-sm">{currentData.kpi.riskLabel}</span>
                 <div className={`p-2 rounded-lg shadow-sm ${currentData.kpi.riskColor}`}>
                    {renderRiskIcon(currentData.kpi.riskIconName)}
                 </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{currentData.kpi.riskValue}</div>
              <div className="text-slate-400 text-xs mt-2 leading-relaxed">
                需重点关注的异常指标或人员名单，点击下方按钮查看详情。
              </div>
              <button className="w-full mt-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                查看详细列表
              </button>
           </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
