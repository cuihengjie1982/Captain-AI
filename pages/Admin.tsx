
import React, { useState, useEffect } from 'react';
import { 
  Settings, BookOpen, Video, Database, Plus, Trash2, Edit, Save, X, Bot,
  Upload, FileText, FileVideo, Image as ImageIcon, FileType, Loader2, CheckCircle,
  LayoutDashboard, Target, PieChart, BarChart3, Users, ClipboardList, File, Download,
  MonitorPlay, MessageSquare, BrainCircuit
} from 'lucide-react';
import { BlogPost, Lesson, KnowledgeCategory, KnowledgeItem, DashboardProject, UserUpload, AdminNote, IntroVideo, DiagnosisIssue } from '../types';
import { getBlogPosts, saveBlogPost, deleteBlogPost, getIntroVideo, saveIntroVideo, getDiagnosisIssues, saveDiagnosisIssue, deleteDiagnosisIssue } from '../services/contentService';
import { getLessons, saveLesson, deleteLesson } from '../services/courseService';
import { getKnowledgeCategories, saveKnowledgeCategory, deleteKnowledgeCategory } from '../services/resourceService';
import { getDashboardProjects, saveDashboardProject, deleteDashboardProject } from '../services/dashboardService';
import { getUserUploads, deleteUserUpload, getAdminNotes, deleteAdminNote, updateUserUploadStatus } from '../services/userDataService';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blog' | 'course' | 'knowledge' | 'dashboard' | 'userdata'>('blog');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [introVideo, setIntroVideo] = useState<IntroVideo | null>(null);
  const [diagnosisIssues, setDiagnosisIssues] = useState<DiagnosisIssue[]>([]);
  
  // User Data State
  const [userUploads, setUserUploads] = useState<UserUpload[]>([]);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [userDataTab, setUserDataTab] = useState<'uploads' | 'notes'>('uploads');
  
  // Blog Tab State
  const [blogTab, setBlogTab] = useState<'posts' | 'insights'>('posts');

  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<KnowledgeCategory> | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<DashboardProject> | null>(null);
  const [editingIssue, setEditingIssue] = useState<Partial<DiagnosisIssue> | null>(null);

  // Import Simulation State
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const refreshData = () => {
    setBlogs(getBlogPosts());
    setLessons(getLessons());
    setCategories(getKnowledgeCategories());
    setProjects(getDashboardProjects());
    setUserUploads(getUserUploads());
    setAdminNotes(getAdminNotes());
    setIntroVideo(getIntroVideo());
    setDiagnosisIssues(getDiagnosisIssues());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Blog Handlers ---
  const handleEditBlog = (post: BlogPost | null) => {
    if (post) {
      setEditingBlog({ ...post });
    } else {
      setEditingBlog({ 
        id: Date.now().toString(), 
        title: '', 
        summary: '', 
        author: 'Captain AI',
        date: new Date().toISOString().split('T')[0],
        thumbnail: 'https://picsum.photos/600/400',
        content: '<p>请输入文章内容...</p>',
        readTime: '5 分钟阅读'
      });
    }
  };

  const handleSaveBlog = () => {
    if (editingBlog && editingBlog.title) {
      saveBlogPost(editingBlog as BlogPost);
      setEditingBlog(null);
      refreshData();
    }
  };

  const handleDeleteBlog = (id: string) => {
    deleteBlogPost(id);
    // Optimistic update for immediate UI feedback
    setBlogs(prev => prev.filter(p => p.id !== id));
    setTimeout(refreshData, 100);
  };

  // --- Diagnosis Issue Handlers ---
  const handleEditIssue = (issue: DiagnosisIssue | null) => {
    if (issue) {
      setEditingIssue({ ...issue });
    } else {
      setEditingIssue({
        id: Date.now().toString(),
        title: '',
        userText: '',
        aiResponse: ''
      });
    }
  };

  const handleSaveIssue = () => {
    if (editingIssue && editingIssue.title) {
      saveDiagnosisIssue(editingIssue as DiagnosisIssue);
      setEditingIssue(null);
      refreshData();
    }
  };

  const handleDeleteIssue = (id: string) => {
    deleteDiagnosisIssue(id);
    setDiagnosisIssues(prev => prev.filter(i => i.id !== id));
    setTimeout(refreshData, 100);
  };


  // --- Intro Video Handlers ---
  const handleSaveIntroVideo = () => {
    if (introVideo) {
      saveIntroVideo(introVideo);
      alert('平台视频配置已保存');
      refreshData();
    }
  };

  const handleVideoUploadSim = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !introVideo) return;

    // For demo purposes, we use object URL for immediate feedback.
    // In a real app, this would be an upload to S3/Cloud Storage.
    const fakeUrl = URL.createObjectURL(file);
    
    if (type === 'video') {
        setIntroVideo({ ...introVideo, url: fakeUrl });
    } else {
        setIntroVideo({ ...introVideo, thumbnail: fakeUrl });
    }
  };


  // --- Course Handlers ---
  const handleEditLesson = (lesson: Lesson | null) => {
    setImportStatus('idle');
    setImportMessage('');
    
    if (lesson) {
      setEditingLesson({ ...lesson });
    } else {
      setEditingLesson({
        id: Date.now().toString(),
        title: '',
        duration: '10:00',
        durationSec: 600,
        thumbnail: 'https://picsum.photos/800/450',
        highlights: [],
        transcript: []
      });
    }
  };

  const handleSaveLesson = () => {
    if (editingLesson && editingLesson.title) {
      saveLesson(editingLesson as Lesson);
      setEditingLesson(null);
      refreshData();
    }
  };

  const handleDeleteLesson = (id: string) => {
    deleteLesson(id);
    setLessons(prev => prev.filter(l => l.id !== id));
    setTimeout(refreshData, 100);
  };

  // --- Knowledge Base Handlers ---
  const handleEditCategory = (cat: KnowledgeCategory | null, isAi: boolean = false, isProjectReports: boolean = false) => {
    if (cat) {
      setEditingCategory({ ...cat });
    } else {
      setEditingCategory({
        id: Date.now().toString(),
        name: '',
        color: isAi ? 'violet' : (isProjectReports ? 'rose' : 'blue'),
        items: [],
        isAiRepository: isAi, // Set flag for new items
        isProjectReports: isProjectReports
      });
    }
  };

  const handleAddItemToCategory = () => {
    if (editingCategory) {
       const newItem: KnowledgeItem = { title: '新文件', type: 'doc', size: '0 KB' };
       setEditingCategory({
         ...editingCategory,
         items: [...(editingCategory.items || []), newItem]
       });
    }
  };

  const handleRemoveItemFromCategory = (idx: number) => {
    if (editingCategory && editingCategory.items) {
      const newItems = [...editingCategory.items];
      newItems.splice(idx, 1);
      setEditingCategory({ ...editingCategory, items: newItems });
    }
  };

  const handleUpdateItem = (idx: number, field: keyof KnowledgeItem, value: string) => {
    if (editingCategory && editingCategory.items) {
        const newItems = [...editingCategory.items];
        newItems[idx] = { ...newItems[idx], [field]: value };
        setEditingCategory({ ...editingCategory, items: newItems });
    }
  };

  const handleSaveCategory = () => {
    if (editingCategory && editingCategory.name) {
      saveKnowledgeCategory(editingCategory as KnowledgeCategory);
      setEditingCategory(null);
      refreshData();
    }
  };

  const handleDeleteCategory = (id: string) => {
    deleteKnowledgeCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
    setTimeout(refreshData, 100);
  };

  // --- Dashboard Project Handlers ---
  const handleEditProject = (project: DashboardProject | null) => {
    setImportStatus('idle');
    setImportMessage('');
    
    if (project) {
      setEditingProject({ ...project });
    } else {
      setEditingProject({
        id: Date.now().toString(),
        name: '',
        category: '运营优化',
        content: '<h3 class="text-lg font-bold text-slate-900 mb-2">项目背景</h3><p>请输入项目描述...</p>',
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
        kpi: {
          label: '核心指标',
          value: 0,
          unit: '',
          trend: 0,
          riskLabel: '风险项',
          riskValue: '无',
          riskIconName: 'Activity',
          riskColor: 'text-blue-600 bg-blue-50'
        },
        chartData: [
          { month: '1月', value: 0 },
          { month: '2月', value: 0 }
        ]
      });
    }
  };

  const handleDashboardImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setImportStatus('uploading');
    setImportMessage(`正在上传: ${file.name}...`);

    // Simulate upload and data parsing
    setTimeout(() => {
      setImportStatus('processing');
      setImportMessage('AI 正在清洗数据并生成可视化图表...');

      setTimeout(() => {
        // Mock logic to update project data based on "file"
        const randomBase = Math.floor(Math.random() * 50) + 50;
        const newChartData = [
          { month: '1月', value: randomBase },
          { month: '2月', value: randomBase + Math.floor(Math.random() * 10) - 5 },
          { month: '3月', value: randomBase + Math.floor(Math.random() * 15) - 5 },
          { month: '4月', value: randomBase + 5 },
          { month: '5月', value: randomBase + 10 },
          { month: '6月', value: randomBase + 12 },
        ];

        const newKPI = {
          ...editingProject.kpi,
          value: randomBase + 12,
          trend: 5.5,
          riskValue: Math.floor(Math.random() * 10) + ' 项'
        };

        setEditingProject(prev => ({ 
          ...prev, 
          chartData: newChartData,
          kpi: newKPI as any,
          updatedAt: '刚刚'
        }));
        
        setImportStatus('success');
        setImportMessage('数据导入成功：图表与指标已自动更新');
      }, 1500);
    }, 1000);
  };

  const handleSaveProject = () => {
    if (editingProject && editingProject.name) {
      saveDashboardProject(editingProject as DashboardProject);
      setEditingProject(null);
      refreshData();
    }
  };

  const handleDeleteProject = (id: string) => {
    deleteDashboardProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setTimeout(refreshData, 100);
  };

  // --- User Data Handlers ---
  const handleDeleteUserUpload = (id: string) => {
    deleteUserUpload(id);
    setUserUploads(prev => prev.filter(u => u.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: UserUpload['status']) => {
    updateUserUploadStatus(id, newStatus);
    setUserUploads(prev => prev.map(u => u.id === id ? {...u, status: newStatus} : u));
  };

  const handleDeleteNote = (id: string) => {
    deleteAdminNote(id);
    setAdminNotes(prev => prev.filter(n => n.id !== id));
  };

  // Filter Categories
  const aiCategories = categories.filter(c => c.isAiRepository);
  const projectReportCategories = categories.filter(c => c.isProjectReports);
  const generalCategories = categories.filter(c => !c.isAiRepository && !c.isProjectReports);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="text-slate-400" /> 后台管理系统
          </h1>
          <p className="text-slate-500 mt-2">管理网站内容、课程、资源库与指挥中心</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-8 overflow-x-auto">
        {[
          { id: 'blog', label: '博客文章管理', icon: BookOpen },
          { id: 'course', label: '视频课程管理', icon: Video },
          { id: 'knowledge', label: '知识库管理', icon: Database },
          { id: 'dashboard', label: '指挥中心管理', icon: LayoutDashboard },
          { id: 'userdata', label: '用户数据管理', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- BLOG MANAGEMENT (Contains Articles & Diagnosis Insights) --- */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          {/* Sub-tabs for Blog Section */}
          <div className="flex gap-4 mb-2">
             <button 
                onClick={() => setBlogTab('posts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  blogTab === 'posts' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
             >
                <BookOpen size={16} /> 文章列表
             </button>
             <button 
                onClick={() => setBlogTab('insights')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  blogTab === 'insights' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
             >
                <BrainCircuit size={16} /> 诊断洞察配置
             </button>
          </div>

          {/* 1. Blog Posts Management */}
          {blogTab === 'posts' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-end">
                <button onClick={() => handleEditBlog(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                  <Plus size={18} /> 新增文章
                </button>
              </div>
              
              {editingBlog ? (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                   <h3 className="font-bold text-lg mb-4">编辑文章</h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm text-slate-500 mb-1">标题</label>
                       <input className="w-full border p-2 rounded" value={editingBlog.title} onChange={e => setEditingBlog({...editingBlog, title: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-sm text-slate-500 mb-1">作者</label>
                       <input className="w-full border p-2 rounded" value={editingBlog.author} onChange={e => setEditingBlog({...editingBlog, author: e.target.value})} />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm text-slate-500 mb-1">摘要</label>
                       <textarea className="w-full border p-2 rounded h-20" value={editingBlog.summary} onChange={e => setEditingBlog({...editingBlog, summary: e.target.value})} />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm text-slate-500 mb-1">缩略图 URL</label>
                       <input className="w-full border p-2 rounded" value={editingBlog.thumbnail} onChange={e => setEditingBlog({...editingBlog, thumbnail: e.target.value})} />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm text-slate-500 mb-1">HTML 内容</label>
                       <textarea className="w-full border p-2 rounded h-48 font-mono text-xs" value={editingBlog.content} onChange={e => setEditingBlog({...editingBlog, content: e.target.value})} />
                     </div>
                   </div>
                   <div className="flex justify-end gap-3 pt-4">
                     <button onClick={() => setEditingBlog(null)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">取消</button>
                     <button onClick={handleSaveBlog} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
                   </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 font-medium text-slate-600">标题</th>
                        <th className="p-4 font-medium text-slate-600">作者</th>
                        <th className="p-4 font-medium text-slate-600">日期</th>
                        <th className="p-4 font-medium text-slate-600 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {blogs.map(post => (
                        <tr key={post.id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium">{post.title}</td>
                          <td className="p-4 text-slate-500">{post.author}</td>
                          <td className="p-4 text-slate-500">{post.date}</td>
                          <td className="p-4 flex justify-end gap-2">
                            <button onClick={() => handleEditBlog(post)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteBlog(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. Diagnosis Insights Management */}
          {blogTab === 'insights' && (
            <div className="space-y-4 animate-in fade-in">
               <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">智能诊断问题配置</h3>
                    <p className="text-xs text-slate-500 mt-1">管理“博客”页面诊断工具下拉菜单中的选项及 AI 回复策略</p>
                  </div>
                  <button onClick={() => handleEditIssue(null)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm">
                    <Plus size={18} /> 新增问题
                  </button>
               </div>

               {editingIssue ? (
                 <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                    <h3 className="font-bold text-lg mb-4">编辑诊断问题</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm text-slate-500 mb-1">问题标题 (下拉菜单显示)</label>
                        <input 
                          className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                          placeholder="例如：核心人才留存"
                          value={editingIssue.title} 
                          onChange={e => setEditingIssue({...editingIssue, title: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-500 mb-1">用户预设话术 (模拟用户发送的消息)</label>
                        <textarea 
                          className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-indigo-500 outline-none" 
                          placeholder="例如：我们的核心骨干流失严重..."
                          value={editingIssue.userText} 
                          onChange={e => setEditingIssue({...editingIssue, userText: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-500 mb-1">AI 初始回复 (诊断开始时的第一句话)</label>
                        <textarea 
                          className="w-full border p-2 rounded h-24 focus:ring-2 focus:ring-indigo-500 outline-none" 
                          placeholder="例如：明白。人员流失往往有多重因素..."
                          value={editingIssue.aiResponse} 
                          onChange={e => setEditingIssue({...editingIssue, aiResponse: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button onClick={() => setEditingIssue(null)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">取消</button>
                      <button onClick={handleSaveIssue} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">保存配置</button>
                    </div>
                 </div>
               ) : (
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                         <th className="p-4 font-medium text-slate-600 w-1/4">问题标题</th>
                         <th className="p-4 font-medium text-slate-600 w-1/3">用户话术预览</th>
                         <th className="p-4 font-medium text-slate-600 w-1/3">AI 回复预览</th>
                         <th className="p-4 font-medium text-slate-600 text-right">操作</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {diagnosisIssues.length === 0 ? (
                         <tr>
                           <td colSpan={4} className="p-8 text-center text-slate-400 italic">暂无诊断问题配置</td>
                         </tr>
                       ) : (
                         diagnosisIssues.map(issue => (
                           <tr key={issue.id} className="hover:bg-slate-50">
                             <td className="p-4 font-bold text-slate-700">{issue.title}</td>
                             <td className="p-4 text-slate-500"><div className="line-clamp-2 text-xs">{issue.userText}</div></td>
                             <td className="p-4 text-slate-500"><div className="line-clamp-2 text-xs bg-slate-100 p-1 rounded">{issue.aiResponse}</div></td>
                             <td className="p-4 flex justify-end gap-2">
                               <button onClick={() => handleEditIssue(issue)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Edit size={16} /></button>
                               <button onClick={() => handleDeleteIssue(issue.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          )}
        </div>
      )}

      {/* --- USER DATA MANAGEMENT --- */}
      {activeTab === 'userdata' && (
        <div className="space-y-6">
           <div className="flex gap-4 mb-6">
             <button 
                onClick={() => setUserDataTab('uploads')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  userDataTab === 'uploads' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
             >
                <FileText size={16} /> 诊断材料上传 ({userUploads.length})
             </button>
             <button 
                onClick={() => setUserDataTab('notes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  userDataTab === 'notes' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
             >
                <ClipboardList size={16} /> 用户学习笔记 ({adminNotes.length})
             </button>
           </div>

           {userDataTab === 'uploads' && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b border-slate-200">
                   <tr>
                     <th className="p-4 font-medium text-slate-600">文件名</th>
                     <th className="p-4 font-medium text-slate-600">上传用户</th>
                     <th className="p-4 font-medium text-slate-600">上传时间</th>
                     <th className="p-4 font-medium text-slate-600">大小</th>
                     <th className="p-4 font-medium text-slate-600">状态</th>
                     <th className="p-4 font-medium text-slate-600 text-right">操作</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {userUploads.length === 0 ? (
                     <tr>
                       <td colSpan={6} className="p-8 text-center text-slate-400 italic">暂无用户上传文件</td>
                     </tr>
                   ) : (
                     userUploads.map(upload => (
                       <tr key={upload.id} className="hover:bg-slate-50">
                         <td className="p-4">
                           <div className="flex items-center gap-2 font-medium text-slate-800">
                             <File size={16} className="text-blue-500" />
                             {upload.fileName}
                           </div>
                         </td>
                         <td className="p-4 text-slate-600">
                            <div>{upload.userName}</div>
                            <div className="text-xs text-slate-400">{upload.userEmail}</div>
                         </td>
                         <td className="p-4 text-slate-500">{upload.uploadDate}</td>
                         <td className="p-4 text-slate-500 font-mono text-xs">{upload.size}</td>
                         <td className="p-4">
                           <select 
                              value={upload.status}
                              onChange={(e) => handleStatusChange(upload.id, e.target.value as any)}
                              className={`text-xs font-bold px-2 py-1 rounded border-0 cursor-pointer outline-none ${
                                upload.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                upload.status === 'analyzing' ? 'bg-blue-100 text-blue-700' : 
                                'bg-orange-100 text-orange-700'
                              }`}
                           >
                             <option value="pending">待处理</option>
                             <option value="analyzing">分析中</option>
                             <option value="completed">已完成</option>
                           </select>
                         </td>
                         <td className="p-4 flex justify-end gap-2">
                           <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="下载查看 (模拟)"><Download size={16} /></button>
                           <button onClick={() => handleDeleteUserUpload(upload.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           )}

           {userDataTab === 'notes' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {adminNotes.length === 0 ? (
                  <div className="col-span-2 p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                    暂无用户笔记
                  </div>
               ) : (
                 adminNotes.map(note => (
                   <div key={note.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center gap-2 mb-3">
                         <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {note.userName.charAt(0)}
                         </div>
                         <div>
                            <div className="text-sm font-bold text-slate-800">{note.userName}</div>
                            <div className="text-xs text-slate-400">{note.createdAt}</div>
                         </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 mb-3 leading-relaxed border border-slate-100">
                         "{note.content}"
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded">
                         <Video size={12} />
                         <span className="font-medium truncate max-w-[200px]">{note.lessonTitle}</span>
                         <span className="text-slate-300">|</span>
                         <span className="font-mono">{note.timestampDisplay}</span>
                      </div>
                   </div>
                 ))
               )}
             </div>
           )}
        </div>
      )}

      {/* --- COURSE MANAGEMENT --- */}
      {activeTab === 'course' && (
        <div className="space-y-8">
           {/* 1. Intro Video Section (Moved from Config) */}
           {introVideo && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MonitorPlay size={20} className="text-blue-600" /> 首页视频 (Blog Intro)
                  </h3>
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-slate-500">启用展示</span>
                     <div 
                       onClick={() => setIntroVideo({...introVideo, isVisible: !introVideo.isVisible})}
                       className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${introVideo.isVisible ? 'bg-blue-600' : 'bg-slate-300'}`}
                     >
                       <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${introVideo.isVisible ? 'left-6' : 'left-1'}`}></div>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">视频标题</label>
                        <input 
                          className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={introVideo.title}
                          onChange={(e) => setIntroVideo({...introVideo, title: e.target.value})}
                        />
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">视频源文件 (MP4)</label>
                        <div className="flex gap-2">
                            <input 
                              className="flex-1 border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-slate-600 text-sm"
                              value={introVideo.url}
                              readOnly
                            />
                            <label className="px-3 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 font-medium text-sm flex items-center gap-2 whitespace-nowrap">
                               <Upload size={16} /> 
                               上传
                               <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => handleVideoUploadSim(e, 'video')} />
                            </label>
                        </div>
                      </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">封面缩略图</label>
                    <div className="flex gap-3 items-start">
                        <div className="w-32 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                           <img src={introVideo.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex gap-2">
                                <input 
                                  className="flex-1 border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-slate-600 text-sm"
                                  value={introVideo.thumbnail}
                                  readOnly
                                />
                                <label className="px-3 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 font-medium text-sm flex items-center gap-2 whitespace-nowrap">
                                  <ImageIcon size={16} /> 
                                  上传
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleVideoUploadSim(e, 'cover')} />
                                </label>
                            </div>
                        </div>
                    </div>
                  </div>
               </div>
               
               <div className="flex justify-end mt-4">
                  <button 
                    onClick={handleSaveIntroVideo}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                     <Save size={16} /> 保存首页视频配置
                  </button>
               </div>
             </div>
           )}

           <div className="border-t border-slate-200"></div>

           {/* 2. Lessons Section */}
           <div>
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Video size={20} className="text-slate-600" /> 解决方案库课程
                 </h3>
                 <button onClick={() => handleEditLesson(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm">
                    <Plus size={18} /> 手动新增
                 </button>
              </div>

              {editingLesson ? (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">编辑课程</h3>
                  </div>

                  {/* Manual Edit Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-500 mb-1">课程标题</label>
                      <div className="relative">
                        <FileText size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={editingLesson.title} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} placeholder="课程标题或文件名" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">时长显示 (如 10:00)</label>
                      <div className="relative">
                        <FileVideo size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={editingLesson.duration} onChange={e => setEditingLesson({...editingLesson, duration: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">时长 (秒)</label>
                      <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={editingLesson.durationSec} onChange={e => setEditingLesson({...editingLesson, durationSec: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-500 mb-1">缩略图 URL</label>
                      <div className="relative">
                        <ImageIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={editingLesson.thumbnail} onChange={e => setEditingLesson({...editingLesson, thumbnail: e.target.value})} />
                      </div>
                      {editingLesson.thumbnail && (
                        <img src={editingLesson.thumbnail} alt="Preview" className="mt-2 h-20 object-cover rounded border border-slate-200" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setEditingLesson(null)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">取消</button>
                    <button onClick={handleSaveLesson} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 font-medium text-slate-600">封面</th>
                        <th className="p-4 font-medium text-slate-600">课程标题</th>
                        <th className="p-4 font-medium text-slate-600">时长</th>
                        <th className="p-4 font-medium text-slate-600 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lessons.map(lesson => (
                        <tr key={lesson.id} className="hover:bg-slate-50">
                          <td className="p-4">
                            <img src={lesson.thumbnail} className="w-16 h-9 object-cover rounded" alt="" />
                          </td>
                          <td className="p-4 font-medium">{lesson.title}</td>
                          <td className="p-4 text-slate-500">{lesson.duration}</td>
                          <td className="p-4 flex justify-end gap-2">
                            <button onClick={() => handleEditLesson(lesson)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
           </div>
        </div>
      )}

      {/* --- KNOWLEDGE BASE MANAGEMENT --- */}
      {activeTab === 'knowledge' && (
        <div className="space-y-8">
          {editingCategory ? (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
               <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {editingCategory.isAiRepository && <Bot size={20} className="text-violet-600" />}
                    {editingCategory.isProjectReports && <LayoutDashboard size={20} className="text-rose-600" />}
                    {editingCategory.id ? '编辑知识分类' : (editingCategory.isAiRepository ? '新增 AI 智能回复库' : (editingCategory.isProjectReports ? '新增项目改善报告库' : '新增常规资源库'))}
                  </h3>
               </div>
               
               <div className="flex gap-4 mb-4">
                 <div className="flex-1">
                   <label className="block text-sm text-slate-500 mb-1">分类名称</label>
                   <input className="w-full border p-2 rounded" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm text-slate-500 mb-1">颜色标签</label>
                   <select className="w-full border p-2 rounded" value={editingCategory.color} onChange={e => setEditingCategory({...editingCategory, color: e.target.value})}>
                     {['blue','emerald','orange','purple','pink','indigo','cyan','teal','rose','slate','violet'].map(c => (
                       <option key={c} value={c}>{c}</option>
                     ))}
                   </select>
                 </div>
               </div>
               
               <div className="border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center mb-2">
                     <h4 className="text-sm font-bold text-slate-700">分类下属文件</h4>
                     <button type="button" onClick={handleAddItemToCategory} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">添加文件</button>
                  </div>
                  <div className="space-y-2">
                    {editingCategory.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded">
                         <input 
                           className="flex-1 border p-1 text-sm rounded" 
                           placeholder="文件标题"
                           value={item.title}
                           onChange={e => handleUpdateItem(idx, 'title', e.target.value)}
                         />
                         <select 
                           className="border p-1 text-sm rounded w-20"
                           value={item.type}
                           onChange={e => handleUpdateItem(idx, 'type', e.target.value)}
                         >
                           <option value="xlsx">xlsx</option>
                           <option value="pdf">pdf</option>
                           <option value="ppt">ppt</option>
                           <option value="doc">doc</option>
                         </select>
                         <input 
                           className="w-20 border p-1 text-sm rounded" 
                           placeholder="大小"
                           value={item.size}
                           onChange={e => handleUpdateItem(idx, 'size', e.target.value)}
                         />
                         <button onClick={() => handleRemoveItemFromCategory(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-4">
                 <button onClick={() => setEditingCategory(null)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">取消</button>
                 <button onClick={handleSaveCategory} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
               </div>
            </div>
          ) : (
            <>
              {/* AI Repository Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Bot size={20} className="text-violet-600" />
                    AI 智能回复库
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">AI 调用资源</span>
                  </h3>
                  <button onClick={() => handleEditCategory(null, true, false)} className="text-sm bg-violet-50 text-violet-700 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-violet-200">
                    <Plus size={16} /> 新增 AI 库
                  </button>
                </div>
                {aiCategories.length === 0 ? (
                   <div className="text-sm text-slate-400 italic p-4 border border-dashed border-slate-200 rounded-xl text-center">暂无 AI 智能回复资源</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiCategories.map(cat => (
                      <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-violet-100 relative group">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                              {cat.name}
                            </h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditCategory(cat, true, false)} className="p-1 text-violet-600 hover:bg-violet-50 rounded"><Edit size={14} /></button>
                              <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <div className="space-y-1">
                          {cat.items.map((item, i) => (
                            <div key={i} className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              {item.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200"></div>

              {/* Project Reports Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <LayoutDashboard size={20} className="text-rose-600" />
                    项目改善报告库 (指挥中心)
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">项目附件</span>
                  </h3>
                  <button onClick={() => handleEditCategory(null, false, true)} className="text-sm bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-rose-200">
                    <Plus size={16} /> 新增报告库
                  </button>
                </div>
                {projectReportCategories.length === 0 ? (
                   <div className="text-sm text-slate-400 italic p-4 border border-dashed border-slate-200 rounded-xl text-center">暂无项目报告资源</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectReportCategories.map(cat => (
                      <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 relative group">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                              {cat.name}
                            </h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditCategory(cat, false, true)} className="p-1 text-rose-600 hover:bg-rose-50 rounded"><Edit size={14} /></button>
                              <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <div className="space-y-1">
                          {cat.items.map((item, i) => (
                            <div key={i} className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              {item.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200"></div>

              {/* General Resources Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Database size={20} className="text-blue-600" />
                    常规资源库
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">用户下载资源</span>
                  </h3>
                  <button onClick={() => handleEditCategory(null, false, false)} className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-blue-200">
                    <Plus size={16} /> 新增分类
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generalCategories.map(cat => (
                    <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative group">
                      <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-slate-800">{cat.name}</h3>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditCategory(cat, false, false)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                          </div>
                      </div>
                      <div className="space-y-1">
                        {cat.items.map((item, i) => (
                          <div key={i} className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            {item.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* --- DASHBOARD MANAGEMENT --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => handleEditProject(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <Plus size={18} /> 新增指挥中心项目
            </button>
          </div>
          
          {editingProject ? (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
               <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">编辑项目</h3>
               </div>
               
               {/* Smart Data Import */}
               <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                      <PieChart size={18} /> 数据自动上传更新
                    </h4>
                    <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">上传 Excel/CSV 自动生成图表</span>
                  </div>
                  
                  {importStatus === 'idle' && (
                    <div className="relative border-2 border-dashed border-indigo-200 rounded-lg bg-white/50 hover:bg-white transition-colors text-center py-6 cursor-pointer group">
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        accept=".xlsx,.csv"
                        onChange={handleDashboardImport}
                      />
                      <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-indigo-500">
                        <div className="p-2 bg-indigo-100 rounded-full">
                          <Upload size={20} className="text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium">点击上传数据列表文件</span>
                      </div>
                    </div>
                  )}
                  
                  {importStatus === 'processing' && (
                     <div className="flex items-center justify-center gap-3 py-4">
                        <Loader2 size={20} className="animate-spin text-indigo-600" />
                        <span className="text-sm text-indigo-700">{importMessage}</span>
                     </div>
                  )}
                  
                  {importStatus === 'success' && (
                     <div className="flex items-center justify-center gap-2 py-4 text-green-700 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle size={18} />
                        <span className="text-sm font-medium">{importMessage}</span>
                        <button onClick={() => setImportStatus('idle')} className="ml-2 text-xs underline text-slate-500">重新上传</button>
                     </div>
                  )}
               </div>

               {/* Basic Info */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm text-slate-500 mb-1">项目名称</label>
                   <input className="w-full border p-2 rounded" value={editingProject.name} onChange={e => setEditingProject({...editingProject, name: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm text-slate-500 mb-1">分类 (如: 人力运营)</label>
                   <input className="w-full border p-2 rounded" value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value})} />
                 </div>
                 
                 {/* KPI Fields */}
                 <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                    <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2"><Target size={16} /> 核心指标配置</h4>
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                       <div>
                          <label className="block text-xs text-slate-400 mb-1">指标名称</label>
                          <input className="w-full border p-2 rounded text-sm" value={editingProject.kpi?.label} onChange={e => setEditingProject({...editingProject, kpi: {...editingProject.kpi!, label: e.target.value}})} />
                       </div>
                       <div>
                          <label className="block text-xs text-slate-400 mb-1">当前数值</label>
                          <input type="number" className="w-full border p-2 rounded text-sm" value={editingProject.kpi?.value} onChange={e => setEditingProject({...editingProject, kpi: {...editingProject.kpi!, value: parseFloat(e.target.value)}})} />
                       </div>
                       <div>
                          <label className="block text-xs text-slate-400 mb-1">单位</label>
                          <input className="w-full border p-2 rounded text-sm" value={editingProject.kpi?.unit} onChange={e => setEditingProject({...editingProject, kpi: {...editingProject.kpi!, unit: e.target.value}})} />
                       </div>
                       <div>
                          <label className="block text-xs text-slate-400 mb-1">风险项名称</label>
                          <input className="w-full border p-2 rounded text-sm" value={editingProject.kpi?.riskLabel} onChange={e => setEditingProject({...editingProject, kpi: {...editingProject.kpi!, riskLabel: e.target.value}})} />
                       </div>
                       <div>
                          <label className="block text-xs text-slate-400 mb-1">风险项数值</label>
                          <input className="w-full border p-2 rounded text-sm" value={editingProject.kpi?.riskValue} onChange={e => setEditingProject({...editingProject, kpi: {...editingProject.kpi!, riskValue: e.target.value}})} />
                       </div>
                    </div>
                 </div>

                 {/* Project Files */}
                 <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                    <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2"><FileText size={16} /> 项目文档配置</h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                       <div>
                          <label className="block text-xs text-slate-400 mb-1">详细行动计划 (PDF)</label>
                          <div className="flex gap-2">
                             <div className="relative flex-1">
                                <input 
                                   className="w-full border p-2 pl-8 rounded text-sm bg-white text-slate-600" 
                                   value={editingProject.actionPlanFile || ''} 
                                   readOnly
                                   placeholder="暂未上传文件"
                                />
                                <FileText size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                             </div>
                             <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 rounded text-sm flex items-center justify-center transition-colors" title="上传文件">
                                <Upload size={16} />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept=".pdf"
                                  onChange={(e) => {
                                     const file = e.target.files?.[0];
                                     if(file) setEditingProject({...editingProject, actionPlanFile: file.name});
                                  }}
                                />
                             </label>
                             {editingProject.actionPlanFile && (
                                <button 
                                  onClick={() => setEditingProject({...editingProject, actionPlanFile: undefined})}
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 rounded transition-colors"
                                  title="清除"
                                >
                                  <Trash2 size={16} />
                                </button>
                             )}
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs text-slate-400 mb-1">历史会议记录 (DOC/PDF)</label>
                           <div className="flex gap-2">
                             <div className="relative flex-1">
                                <input 
                                   className="w-full border p-2 pl-8 rounded text-sm bg-white text-slate-600" 
                                   value={editingProject.meetingRecordFile || ''} 
                                   readOnly
                                   placeholder="暂未上传文件"
                                />
                                <FileText size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                             </div>
                             <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 rounded text-sm flex items-center justify-center transition-colors" title="上传文件">
                                <Upload size={16} />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept=".doc,.docx,.pdf"
                                  onChange={(e) => {
                                     const file = e.target.files?.[0];
                                     if(file) setEditingProject({...editingProject, meetingRecordFile: file.name});
                                  }}
                                />
                             </label>
                             {editingProject.meetingRecordFile && (
                                <button 
                                  onClick={() => setEditingProject({...editingProject, meetingRecordFile: undefined})}
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 rounded transition-colors"
                                  title="清除"
                                >
                                  <Trash2 size={16} />
                                </button>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="col-span-2">
                   <label className="block text-sm text-slate-500 mb-1">项目简报 (HTML)</label>
                   <textarea className="w-full border p-2 rounded h-32 font-mono text-xs" value={editingProject.content} onChange={e => setEditingProject({...editingProject, content: e.target.value})} />
                 </div>
               </div>

               <div className="flex justify-end gap-3 pt-4">
                 <button onClick={() => setEditingProject(null)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">取消</button>
                 <button onClick={handleSaveProject} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">保存项目</button>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-medium text-slate-600">项目名称</th>
                    <th className="p-4 font-medium text-slate-600">分类</th>
                    <th className="p-4 font-medium text-slate-600">核心指标</th>
                    <th className="p-4 font-medium text-slate-600">更新时间</th>
                    <th className="p-4 font-medium text-slate-600 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map(proj => (
                    <tr key={proj.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium">{proj.name}</td>
                      <td className="p-4 text-slate-500">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{proj.category}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-700">{proj.kpi.value} {proj.kpi.unit}</td>
                      <td className="p-4 text-slate-400 text-xs">{proj.updatedAt}</td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => handleEditProject(proj)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteProject(proj.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Admin;
