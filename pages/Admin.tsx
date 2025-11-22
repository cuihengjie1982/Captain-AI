



import React, { useState, useEffect } from 'react';
import { 
  Settings, BookOpen, Video, Database, Plus, Trash2, Edit, Save, X, Bot,
  Upload, FileText, FileVideo, Image as ImageIcon, FileType, Loader2, CheckCircle,
  LayoutDashboard, Target, PieChart, BarChart3, Users, ClipboardList, File, Download,
  MonitorPlay, MessageSquare, BrainCircuit, Shield, ToggleLeft, ToggleRight, Sparkles, Quote, Link as LinkIcon, Tags, UserCog, Key
} from 'lucide-react';
import { BlogPost, Lesson, KnowledgeCategory, KnowledgeItem, DashboardProject, UserUpload, AdminNote, IntroVideo, DiagnosisIssue, PermissionConfig, PERMISSION_LABELS, PermissionKey, TranscriptLine, User } from '../types';
import { getBlogPosts, saveBlogPost, deleteBlogPost, getIntroVideo, saveIntroVideo, getDiagnosisIssues, saveDiagnosisIssue, deleteDiagnosisIssue } from '../services/contentService';
import { getLessons, saveLesson, deleteLesson } from '../services/courseService';
import { getKnowledgeCategories, saveKnowledgeCategory, deleteKnowledgeCategory } from '../services/resourceService';
import { getDashboardProjects, saveDashboardProject, deleteDashboardProject } from '../services/dashboardService';
import { getUserUploads, deleteUserUpload, getAdminNotes, deleteAdminNote, updateUserUploadStatus, getAllUsers, saveUser, deleteUser } from '../services/userDataService';
import { getPermissionConfig, savePermissionConfig } from '../services/permissionService';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blog' | 'course' | 'knowledge' | 'dashboard' | 'userdata' | 'users'>('blog');
  
  // Data States
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [introVideo, setIntroVideo] = useState<IntroVideo | null>(null);
  const [diagnosisIssues, setDiagnosisIssues] = useState<DiagnosisIssue[]>([]);
  const [userUploads, setUserUploads] = useState<UserUpload[]>([]);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [permissions, setPermissions] = useState<PermissionConfig | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Sub-tabs
  const [userDataTab, setUserDataTab] = useState<'uploads' | 'notes'>('uploads');
  const [blogTab, setBlogTab] = useState<'posts' | 'insights'>('posts');
  const [userMgmtTab, setUserMgmtTab] = useState<'list' | 'roles'>('list');

  // Editors State
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<KnowledgeCategory> | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<DashboardProject> | null>(null);
  const [editingIssue, setEditingIssue] = useState<Partial<DiagnosisIssue> | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Helper States for Knowledge Item Editing
  const [newItem, setNewItem] = useState<Partial<KnowledgeItem>>({ title: '', type: 'doc', size: '', tags: [] });
  const [showItemForm, setShowItemForm] = useState(false);

  // Helper States
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);

  const refreshData = () => {
    setBlogs(getBlogPosts());
    setLessons(getLessons());
    setCategories(getKnowledgeCategories());
    setProjects(getDashboardProjects());
    setUserUploads(getUserUploads());
    setAdminNotes(getAdminNotes());
    setIntroVideo(getIntroVideo());
    setDiagnosisIssues(getDiagnosisIssues());
    setPermissions(getPermissionConfig());
    setUsers(getAllUsers());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Permission & User Management Handlers ---
  const handlePermissionToggle = (plan: 'free' | 'pro', key: PermissionKey) => {
    if (permissions) {
      const newConfig = {
        ...permissions,
        [plan]: {
          ...permissions[plan],
          [key]: !permissions[plan][key]
        }
      };
      setPermissions(newConfig);
      savePermissionConfig(newConfig);
    }
  };

  const handleEditUser = (user: User) => {
      setEditingUser({...user});
  };

  const handleSaveUser = () => {
      if (editingUser) {
          saveUser(editingUser);
          setEditingUser(null);
          refreshData();
      }
  };

  const handleDeleteUser = (id: string) => {
      if(confirm("确定要删除该用户吗？此操作不可恢复。")) {
          deleteUser(id);
          setUsers(prev => prev.filter(u => u.id !== id));
      }
  };

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
        readTime: '5 分钟阅读',
        tags: [],
        originalUrl: ''
      });
    }
    setImportStatus('idle');
  };

  const handleImportArticle = () => {
    if(!editingBlog?.originalUrl) return;
    setImportStatus('processing');
    setImportMessage('正在分析网页内容...');
    
    setTimeout(() => {
       setEditingBlog(prev => ({
          ...prev,
          title: '【导入】如何降低呼叫中心流失率 (AI提取)',
          summary: '这是一篇通过AI自动抓取并总结的文章摘要，主要讲述了人员流失的三个核心动因...',
          content: '<h3>1. 薪资问题</h3><p>薪资是基础...</p><h3>2. 管理问题</h3><p>直接主管的管理风格...</p>',
          tags: ['人员管理', 'AI导入', '流失率']
       }));
       setImportStatus('success');
       setImportMessage('导入成功！');
       setTimeout(() => setImportStatus('idle'), 2000);
    }, 1500);
  };

  const handleBlogCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file && editingBlog) {
          const fakeUrl = URL.createObjectURL(file);
          setEditingBlog({...editingBlog, thumbnail: fakeUrl});
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
    setIsGeneratingTranscript(false);
    
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
        transcript: [],
        tags: []
      });
    }
  };

  const handleLessonFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
    const file = e.target.files?.[0];
    if (!file || !editingLesson) return;
    const fakeUrl = URL.createObjectURL(file);
    if (type === 'video') {
        setEditingLesson({ ...editingLesson, videoUrl: fakeUrl });
    } else {
        setEditingLesson({ ...editingLesson, thumbnail: fakeUrl });
    }
  };

  const handleGenerateTranscript = () => {
    if (!editingLesson) return;
    if (!editingLesson.durationSec || editingLesson.durationSec <= 0) {
        alert("请先设置有效的课程时长（秒），AI 需要根据时长生成时间戳。");
        return;
    }
    setIsGeneratingTranscript(true);
    setTimeout(() => {
        const duration = editingLesson.durationSec || 600;
        const interval = Math.max(15, Math.floor(duration / 15)); 
        const mockTranscript: TranscriptLine[] = [];
        const dummyTexts = [
            "欢迎来到本节课程，今天我们要深入探讨这个主题。",
            "大家请看屏幕上的这个数据，它非常有代表性。",
            "在实际操作中，很多管理者会忽略这一点。",
            "这里有一个关键的概念，请大家务必记录下来。",
            "如果我们换个角度思考，问题可能会迎刃而解。",
            "接下来，我们通过一个真实案例来验证这个理论。",
            "注意，这里的操作步骤非常关键，不能出错。",
            "总结一下，我们刚才讲了三个核心要素。",
            "您在实际工作中是否遇到过类似的挑战？",
            "这就是为什么我们需要建立标准化的流程。",
            "最后，希望大家能将今天学到的内容应用到实践中。"
        ];
        for (let t = 0; t < duration; t += interval) {
            const text = dummyTexts[Math.floor(Math.random() * dummyTexts.length)];
            mockTranscript.push({
                time: t,
                text: `[${Math.floor(t/60)}:${(t%60).toString().padStart(2,'0')}] ${text}`
            });
        }
        setEditingLesson(prev => ({...prev, transcript: mockTranscript}));
        setIsGeneratingTranscript(false);
    }, 2000);
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
    setShowItemForm(false);
    setNewItem({ title: '', type: 'doc', size: '', tags: [] });
    
    if (cat) {
      setEditingCategory({ ...cat });
    } else {
      setEditingCategory({
        id: Date.now().toString(),
        name: '',
        color: isAi ? 'violet' : (isProjectReports ? 'rose' : 'blue'),
        items: [],
        isAiRepository: isAi,
        isProjectReports: isProjectReports
      });
    }
  };

  const handleResourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewItem({
        ...newItem,
        title: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.name.split('.').pop() as any || 'doc'
      });
    }
  };

  const handleAddItemToCategory = () => {
    if (editingCategory && newItem.title) {
       const itemToAdd: KnowledgeItem = { 
         id: Date.now().toString(),
         title: newItem.title || '新文件', 
         type: newItem.type || 'doc', 
         size: newItem.size || '0 KB',
         tags: newItem.tags || [],
         url: '#' // Simulated URL
       };
       setEditingCategory({ ...editingCategory, items: [...(editingCategory.items || []), itemToAdd] });
       setNewItem({ title: '', type: 'doc', size: '', tags: [] });
       setShowItemForm(false);
    }
  };

  const handleRemoveItemFromCategory = (idx: number) => {
    if (editingCategory && editingCategory.items) {
      const newItems = [...editingCategory.items];
      newItems.splice(idx, 1);
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
        chartData: [ { month: '1月', value: 0 }, { month: '2月', value: 0 } ]
      });
    }
  };

  const handleDashboardImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;

    setImportStatus('uploading');
    setImportMessage(`正在上传: ${file.name}...`);

    setTimeout(() => {
      setImportStatus('processing');
      setImportMessage('AI 正在清洗数据并生成可视化图表...');

      setTimeout(() => {
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
          <p className="text-slate-500 mt-2">管理网站内容、课程、资源库与用户权限</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-8 overflow-x-auto">
        {[
          { id: 'blog', label: '博客文章管理', icon: BookOpen },
          { id: 'course', label: '视频课程管理', icon: Video },
          { id: 'knowledge', label: '知识库管理', icon: Database },
          { id: 'dashboard', label: '指挥中心管理', icon: LayoutDashboard },
          { id: 'userdata', label: '用户数据管理', icon: ClipboardList },
          { id: 'users', label: '用户与权限', icon: Users },
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

      {/* --- USERS & PERMISSIONS MANAGEMENT --- */}
      {activeTab === 'users' && (
        <div className="space-y-6">
           <div className="flex gap-4 mb-6">
             <button 
                onClick={() => setUserMgmtTab('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  userMgmtTab === 'list' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
             >
                <Users size={16} /> 用户列表管理
             </button>
             <button 
                onClick={() => setUserMgmtTab('roles')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  userMgmtTab === 'roles' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
             >
                <Shield size={16} /> 角色权限配置
             </button>
           </div>

           {/* Sub-tab 1: User List Management */}
           {userMgmtTab === 'list' && (
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
                  {editingUser && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                  <UserCog className="text-blue-600" /> 编辑用户信息
                              </h3>
                              <div className="space-y-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">用户姓名</label>
                                      <input className="w-full border p-2 rounded" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">邮箱地址</label>
                                      <input className="w-full border p-2 rounded" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-bold text-slate-500 mb-1">角色 (Role)</label>
                                          <select className="w-full border p-2 rounded" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}>
                                              <option value="user">普通用户</option>
                                              <option value="admin">管理员</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-slate-500 mb-1">订阅计划 (Plan)</label>
                                          <select className="w-full border p-2 rounded" value={editingUser.plan} onChange={e => setEditingUser({...editingUser, plan: e.target.value as any})}>
                                              <option value="free">免费版 (Free)</option>
                                              <option value="pro">专业版 (Pro)</option>
                                          </select>
                                      </div>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-6">
                                      <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">取消</button>
                                      <button onClick={handleSaveUser} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">保存更改</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                              <th className="p-4 font-medium text-slate-600">用户</th>
                              <th className="p-4 font-medium text-slate-600">角色</th>
                              <th className="p-4 font-medium text-slate-600">订阅计划</th>
                              <th className="p-4 font-medium text-slate-600">手机号</th>
                              <th className="p-4 font-medium text-slate-600 text-right">操作</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {users.map(u => (
                              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-4">
                                      <div className="font-bold text-slate-800">{u.name}</div>
                                      <div className="text-xs text-slate-400">{u.email}</div>
                                  </td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                          {u.role === 'admin' ? '管理员' : '用户'}
                                      </span>
                                  </td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1 ${u.plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                          {u.plan === 'pro' ? <Sparkles size={10} /> : null}
                                          {u.plan === 'pro' ? 'Pro' : 'Free'}
                                      </span>
                                  </td>
                                  <td className="p-4 text-slate-500">{u.phone || '-'}</td>
                                  <td className="p-4 flex justify-end gap-2">
                                      <button onClick={() => handleEditUser(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="编辑用户权限"><UserCog size={16} /></button>
                                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="删除用户"><Trash2 size={16} /></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
               </div>
           )}

           {/* Sub-tab 2: Role Configuration */}
           {userMgmtTab === 'roles' && permissions && (
            <div className="max-w-4xl mx-auto animate-in fade-in">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                   <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Key size={20} /> 角色能力矩阵</h3>
                   <p className="text-sm text-slate-500 mt-1">定义不同订阅等级所拥有的系统功能权限。</p>
                </div>
                <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                         <th className="p-5 font-bold text-slate-700 w-1/2">功能权限项</th>
                         <th className="p-5 font-bold text-slate-700 text-center">免费版 (Free)</th>
                         <th className="p-5 font-bold text-slate-700 text-center text-blue-600">专业版 (Pro)</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {(Object.keys(PERMISSION_LABELS) as PermissionKey[]).map(key => (
                        <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                           <td className="p-5 font-medium text-slate-800">{PERMISSION_LABELS[key]}</td>
                           {/* Free Column */}
                           <td className="p-5 text-center border-l border-slate-50">
                              <button 
                                onClick={() => handlePermissionToggle('free', key)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${permissions.free[key] ? 'bg-green-500' : 'bg-slate-300'}`}
                              >
                                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions.free[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                           </td>
                           {/* Pro Column */}
                           <td className="p-5 text-center bg-blue-50/10 border-l border-slate-50">
                              <button 
                                onClick={() => handlePermissionToggle('pro', key)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${permissions.pro[key] ? 'bg-blue-600' : 'bg-slate-300'}`}
                              >
                                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions.pro[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
            </div>
           )}
        </div>
      )}

      {/* --- BLOG MANAGEMENT --- */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <div className="flex gap-4 mb-2">
             <button onClick={() => setBlogTab('posts')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${blogTab === 'posts' ? 'bg-blue-100 text-blue-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><BookOpen size={16} /> 文章列表</button>
             <button onClick={() => setBlogTab('insights')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${blogTab === 'insights' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><BrainCircuit size={16} /> 诊断洞察配置</button>
          </div>

          {blogTab === 'posts' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-end">
                <button onClick={() => handleEditBlog(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"><Plus size={18} /> 新增文章</button>
              </div>
              
              {editingBlog ? (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                   <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-2">
                       <h3 className="font-bold text-lg">编辑文章</h3>
                       {/* Import Functionality */}
                       <div className="flex items-center gap-2 flex-1 justify-end max-w-lg">
                           <div className="relative flex-1">
                               <LinkIcon size={14} className="absolute left-3 top-3 text-slate-400" />
                               <input 
                                 className="w-full pl-8 pr-2 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                 placeholder="输入文章链接一键导入..." 
                                 value={editingBlog.originalUrl || ''}
                                 onChange={e => setEditingBlog({...editingBlog, originalUrl: e.target.value})}
                               />
                           </div>
                           <button 
                                onClick={handleImportArticle}
                                disabled={!editingBlog.originalUrl || importStatus !== 'idle'}
                                className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-black disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                           >
                                {importStatus === 'processing' ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                {importStatus === 'processing' ? '导入中...' : '智能导入'}
                           </button>
                       </div>
                   </div>
                   
                   {importStatus === 'success' && (
                       <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-100 animate-in fade-in">
                           <CheckCircle size={16} /> {importMessage}
                       </div>
                   )}

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm text-slate-500 mb-1">文章标题</label>
                       <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={editingBlog.title} onChange={e => setEditingBlog({...editingBlog, title: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-sm text-slate-500 mb-1">作者</label>
                       <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={editingBlog.author} onChange={e => setEditingBlog({...editingBlog, author: e.target.value})} />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm text-slate-500 mb-1">多标签 (用逗号分隔)</label>
                       <div className="relative">
                           <Tags size={16} className="absolute left-3 top-3 text-slate-400" />
                           <input 
                              className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                              placeholder="例如: 人员管理, 效率, 案例..."
                              value={editingBlog.tags?.join(', ') || ''}
                              onChange={e => setEditingBlog({...editingBlog, tags: e.target.value.split(/[,，]/).map(t => t.trim())})}
                           />
                       </div>
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm text-slate-500 mb-1">摘要</label>
                       <textarea className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-blue-500 outline-none" value={editingBlog.summary} onChange={e => setEditingBlog({...editingBlog, summary: e.target.value})} />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm text-slate-500 mb-1">封面图片</label>
                       <div className="flex gap-2">
                           <div className="relative flex-1">
                                <ImageIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input 
                                    className="w-full border p-2 pl-9 rounded bg-slate-50 text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={editingBlog.thumbnail} 
                                    onChange={e => setEditingBlog({...editingBlog, thumbnail: e.target.value})} 
                                />
                           </div>
                           <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 px-4 rounded flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors">
                                <Upload size={16} />
                                上传
                                <input type="file" className="hidden" accept="image/*" onChange={handleBlogCoverUpload} />
                            </label>
                       </div>
                       {editingBlog.thumbnail && (
                           <img src={editingBlog.thumbnail} className="mt-2 h-32 object-cover rounded-lg border border-slate-200" alt="cover preview" />
                       )}
                     </div>
                     
                     {/* Added Article Original Link Field */}
                     <div className="col-span-2">
                       <label className="block text-sm text-slate-500 mb-1">文章原文链接</label>
                       <div className="relative">
                          <LinkIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                          <input 
                            className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={editingBlog.originalUrl || ''} 
                            onChange={e => setEditingBlog({...editingBlog, originalUrl: e.target.value})} 
                            placeholder="https://example.com/original-article" 
                          />
                       </div>
                     </div>

                     <div className="col-span-2">
                       <label className="block text-sm text-slate-500 mb-1">HTML 内容</label>
                       <textarea className="w-full border p-2 rounded h-48 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none" value={editingBlog.content} onChange={e => setEditingBlog({...editingBlog, content: e.target.value})} />
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
                        <th className="p-4 font-medium text-slate-600">标签</th>
                        <th className="p-4 font-medium text-slate-600">日期</th>
                        <th className="p-4 font-medium text-slate-600 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {blogs.map(post => (
                        <tr key={post.id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium">{post.title}</td>
                          <td className="p-4 text-slate-500">
                              <div className="flex gap-1 flex-wrap">
                                  {post.tags?.map(t => (
                                      <span key={t} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">{t}</span>
                                  )) || '-'}
                              </div>
                          </td>
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
          
          {blogTab === 'insights' && (
            <div className="space-y-4 animate-in fade-in">
               {/* Reusing existing insights logic, mostly unchanged UI */}
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">智能诊断问题配置</h3>
                  <button onClick={() => handleEditIssue(null)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm"><Plus size={18} /> 新增问题</button>
               </div>
               {editingIssue ? (
                 <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                    {/* ... existing issue editor ... */}
                     <div className="grid grid-cols-1 gap-4">
                      <div><label className="block text-sm text-slate-500 mb-1">问题标题</label><input className="w-full border p-2 rounded" value={editingIssue.title} onChange={e => setEditingIssue({...editingIssue, title: e.target.value})} /></div>
                      <div><label className="block text-sm text-slate-500 mb-1">用户话术</label><textarea className="w-full border p-2 rounded h-20" value={editingIssue.userText} onChange={e => setEditingIssue({...editingIssue, userText: e.target.value})} /></div>
                      <div><label className="block text-sm text-slate-500 mb-1">AI 回复</label><textarea className="w-full border p-2 rounded h-24" value={editingIssue.aiResponse} onChange={e => setEditingIssue({...editingIssue, aiResponse: e.target.value})} /></div>
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
                       <tr><th className="p-4 font-medium">问题标题</th><th className="p-4 font-medium">用户话术</th><th className="p-4 font-medium">AI回复</th><th className="p-4 text-right">操作</th></tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {diagnosisIssues.map(issue => (
                           <tr key={issue.id} className="hover:bg-slate-50">
                             <td className="p-4 font-bold text-slate-700">{issue.title}</td>
                             <td className="p-4 text-slate-500 truncate max-w-[150px]">{issue.userText}</td>
                             <td className="p-4 text-slate-500 truncate max-w-[150px]">{issue.aiResponse}</td>
                             <td className="p-4 flex justify-end gap-2">
                               <button onClick={() => handleEditIssue(issue)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Edit size={16} /></button>
                               <button onClick={() => handleDeleteIssue(issue.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
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
      )}

      {/* --- COURSE MANAGEMENT --- */}
      {activeTab === 'course' && (
        <div className="space-y-8">
           {/* Intro Video Section */}
           {introVideo && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><MonitorPlay size={20} className="text-blue-600" /> 首页视频配置</h3><button onClick={handleSaveIntroVideo} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">保存配置</button></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm text-slate-500 mb-1">视频标题</label><input className="w-full border p-2 rounded" value={introVideo.title} onChange={e => setIntroVideo({...introVideo, title: e.target.value})} /></div>
                    <div>
                        <label className="block text-sm text-slate-500 mb-1">视频文件</label>
                        <div className="flex gap-2"><input className="flex-1 border p-2 rounded text-sm" value={introVideo.url} readOnly /><label className="bg-slate-100 px-3 py-2 rounded cursor-pointer text-sm">上传<input type="file" className="hidden" onChange={(e) => handleVideoUploadSim(e, 'video')} /></label></div>
                    </div>
                    {/* Added Cover Image Field for Intro Video */}
                    <div className="col-span-2">
                        <label className="block text-sm text-slate-500 mb-1">封面图片</label>
                        <div className="flex gap-2">
                            <input className="flex-1 border p-2 rounded text-sm" value={introVideo.thumbnail} onChange={e => setIntroVideo({...introVideo, thumbnail: e.target.value})} placeholder="封面图片链接" />
                            <label className="bg-slate-100 px-3 py-2 rounded cursor-pointer text-sm flex items-center gap-1">
                                <Upload size={14} /> 上传
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleVideoUploadSim(e, 'cover')} />
                            </label>
                        </div>
                        {introVideo.thumbnail && (
                            <img src={introVideo.thumbnail} className="mt-2 h-32 object-cover rounded-lg border border-slate-200" alt="intro cover" />
                        )}
                    </div>
                </div>
             </div>
           )}

           <div>
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Video size={20} /> 解决方案库课程</h3>
                 <button onClick={() => handleEditLesson(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm"><Plus size={18} /> 新增课程</button>
              </div>

              {editingLesson ? (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                  <h3 className="font-bold text-lg">编辑课程</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-500 mb-1">课程标题</label>
                      <input className="w-full border p-2 rounded" value={editingLesson.title} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm text-slate-500 mb-1">多标签配置</label>
                        <div className="relative">
                            <Tags size={16} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                className="w-full border p-2 pl-9 rounded" 
                                placeholder="例如: 排班, 进阶, 热门..." 
                                value={editingLesson.tags?.join(', ') || ''}
                                onChange={e => setEditingLesson({...editingLesson, tags: e.target.value.split(/[,，]/).map(t=>t.trim())})}
                            />
                        </div>
                    </div>
                    
                    {/* Added Cover Image Field for Lesson */}
                    <div className="col-span-2">
                        <label className="block text-sm text-slate-500 mb-1">课程封面</label>
                        <div className="flex gap-2">
                            <input className="flex-1 border p-2 rounded" value={editingLesson.thumbnail} onChange={e => setEditingLesson({...editingLesson, thumbnail: e.target.value})} placeholder="图片链接" />
                            <label className="bg-slate-100 px-3 py-2 rounded cursor-pointer text-sm flex items-center gap-1">
                                <Upload size={14} /> 上传
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleLessonFileUpload(e, 'image')} />
                            </label>
                        </div>
                        {editingLesson.thumbnail && (
                            <img src={editingLesson.thumbnail} className="mt-2 h-32 object-cover rounded-lg border border-slate-200" alt="lesson cover" />
                        )}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm text-slate-500 mb-1">视频源</label>
                        <div className="flex gap-2">
                            <input className="flex-1 border p-2 rounded" value={editingLesson.videoUrl} onChange={e => setEditingLesson({...editingLesson, videoUrl: e.target.value})} placeholder="视频链接 (MP4/URL)" />
                            <label className="bg-slate-100 px-3 py-2 rounded cursor-pointer text-sm flex items-center gap-1">
                                <Upload size={14} /> 上传
                                <input type="file" className="hidden" onChange={(e) => handleLessonFileUpload(e, 'video')} />
                            </label>
                        </div>
                    </div>
                    <div><label className="block text-sm text-slate-500 mb-1">时长 (10:00)</label><input className="w-full border p-2 rounded" value={editingLesson.duration} onChange={e => setEditingLesson({...editingLesson, duration: e.target.value})} /></div>
                    <div><label className="block text-sm text-slate-500 mb-1">秒数</label><input type="number" className="w-full border p-2 rounded" value={editingLesson.durationSec} onChange={e => setEditingLesson({...editingLesson, durationSec: parseInt(e.target.value)||0})} /></div>
                    
                    {/* Transcript (reusing existing logic) */}
                    <div className="col-span-2 mt-2 bg-slate-50 p-4 rounded border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-slate-600">AI 逐字稿</span>
                            <button onClick={handleGenerateTranscript} disabled={isGeneratingTranscript} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded flex items-center gap-1">
                                {isGeneratingTranscript ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 自动生成
                            </button>
                        </div>
                        <div className="text-xs text-slate-500 h-20 overflow-y-auto bg-white border p-2 rounded">
                            {editingLesson.transcript?.map(t => t.text).join(' ') || '暂无内容...'}
                        </div>
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
                      <tr><th className="p-4">封面</th><th className="p-4">标题</th><th className="p-4">标签</th><th className="p-4">时长</th><th className="p-4 text-right">操作</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lessons.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="p-4"><img src={l.thumbnail} className="w-16 h-9 object-cover rounded" alt=""/></td>
                          <td className="p-4 font-medium">{l.title}</td>
                          <td className="p-4 text-slate-500 text-xs">{l.tags?.join(', ') || '-'}</td>
                          <td className="p-4 text-slate-500">{l.duration}</td>
                          <td className="p-4 flex justify-end gap-2">
                             <button onClick={() => handleEditLesson(l)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                             <button onClick={() => handleDeleteLesson(l.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
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
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Database size={20} /> 资源库管理</h3>
                <button onClick={() => handleEditCategory(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm border border-blue-700 text-sm flex items-center gap-1 hover:bg-blue-700">
                   <Plus size={16} /> 新增分类
                </button>
             </div>
             
             {editingCategory ? (
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in zoom-in-95">
                     <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                        {editingCategory.id ? '编辑分类' : '新增分类'}
                     </h4>
                     
                     {/* Category Basic Info */}
                     <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <label className="block text-sm font-medium text-slate-700 mb-1">分类名称</label>
                           <input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} placeholder="例如：薪酬绩效" />
                        </div>
                     </div>

                     {/* Resource Items Management */}
                     <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                           <h5 className="font-bold text-sm text-slate-700">资源文件列表</h5>
                           <button onClick={() => setShowItemForm(true)} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-1">
                              <Plus size={12} /> 添加文件
                           </button>
                        </div>

                        {showItemForm && (
                           <div className="mb-4 p-4 bg-white rounded-lg border border-blue-200 shadow-sm animate-in fade-in">
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                 <div className="col-span-2">
                                    <label className="block text-xs text-slate-500 mb-1">文件标题</label>
                                    <input className="w-full border p-2 rounded text-sm" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} placeholder="文件名" />
                                 </div>
                                 <div>
                                    <label className="block text-xs text-slate-500 mb-1">文件类型</label>
                                    <select className="w-full border p-2 rounded text-sm" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})}>
                                       <option value="doc">Word (doc/docx)</option>
                                       <option value="pdf">PDF</option>
                                       <option value="xlsx">Excel (xlsx)</option>
                                       <option value="ppt">PPT</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label className="block text-xs text-slate-500 mb-1">文件大小 (自动生成)</label>
                                    <input className="w-full border p-2 rounded text-sm bg-slate-50" value={newItem.size} readOnly placeholder="上传后生成" />
                                 </div>
                                 <div className="col-span-2">
                                    <label className="block text-xs text-slate-500 mb-1">标签 (逗号分隔)</label>
                                    <div className="relative">
                                       <Tags size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                                       <input 
                                          className="w-full border p-2 pl-8 rounded text-sm" 
                                          placeholder="例如: 模板, 必读..." 
                                          value={newItem.tags?.join(', ') || ''}
                                          onChange={e => setNewItem({...newItem, tags: e.target.value.split(/[,，]/).map(t=>t.trim())})}
                                       />
                                    </div>
                                 </div>
                                 <div className="col-span-2">
                                    <label className="bg-slate-100 border border-dashed border-slate-300 text-slate-600 px-4 py-3 rounded cursor-pointer text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                                       <Upload size={16} /> 点击上传文件 (模拟)
                                       <input type="file" className="hidden" onChange={handleResourceFileUpload} />
                                    </label>
                                 </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => setShowItemForm(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded">取消</button>
                                 <button onClick={handleAddItemToCategory} disabled={!newItem.title} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50">确认添加</button>
                              </div>
                           </div>
                        )}

                        <div className="space-y-2">
                           {editingCategory.items?.length === 0 && !showItemForm && (
                              <div className="text-center py-4 text-slate-400 text-xs italic">暂无资源文件</div>
                           )}
                           {editingCategory.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg group hover:border-blue-200 transition-colors">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold uppercase ${
                                       item.type === 'pdf' ? 'bg-red-100 text-red-600' : 
                                       item.type === 'xlsx' ? 'bg-green-100 text-green-600' :
                                       item.type === 'ppt' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                       {item.type}
                                    </div>
                                    <div>
                                       <div className="text-sm font-medium text-slate-700">{item.title}</div>
                                       <div className="flex items-center gap-2 text-xs text-slate-400">
                                          <span>{item.size}</span>
                                          {item.tags && item.tags.length > 0 && (
                                             <div className="flex gap-1">
                                                {item.tags.map(t => <span key={t} className="bg-slate-100 px-1 rounded text-[10px]">{t}</span>)}
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                                 <button onClick={() => handleRemoveItemFromCategory(idx)} className="text-slate-300 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <button onClick={()=>setEditingCategory(null)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">取消</button>
                        <button onClick={handleSaveCategory} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md">保存分类</button>
                     </div>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(c => (
                       <div key={c.id} className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group">
                           <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                 <span className={`w-3 h-3 rounded-full bg-${c.color}-500`}></span>
                                 {c.name}
                              </h4>
                              <button onClick={() => handleEditCategory(c)} className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                 <Edit size={16}/>
                              </button>
                           </div>
                           <div className="text-sm text-slate-500 mb-4">
                              包含 {c.items.length} 个资源文件
                           </div>
                           <div className="flex gap-1 flex-wrap">
                              {c.items.slice(0,3).map((item, i) => (
                                 <span key={i} className="text-[10px] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-500 truncate max-w-[80px]">{item.type}</span>
                              ))}
                              {c.items.length > 3 && <span className="text-[10px] text-slate-400">+</span>}
                           </div>
                           {/* Delete Button - Top Right */}
                           <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.id); }}
                              className="absolute top-4 right-12 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <Trash2 size={16} />
                           </button>
                       </div>
                    ))}
                 </div>
             )}
          </div>
      )}

      {activeTab === 'dashboard' && (
          /* Existing Dashboard Logic */
          <div className="space-y-4">
              <div className="flex justify-end"><button onClick={() => handleEditProject(null)} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={18}/> 新增项目</button></div>
              {/* Simplified List */}
              <div className="bg-white border rounded-lg overflow-hidden">
                  {projects.map(p => <div key={p.id} className="p-4 border-b flex justify-between"><span>{p.name}</span><div className="flex gap-2"><button onClick={() => handleEditProject(p)} className="text-blue-600"><Edit size={16}/></button></div></div>)}
              </div>
              {/* Editor would be here matching previous version */}
              {editingProject && <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="bg-white p-6 rounded-xl w-full max-w-2xl h-[80vh] overflow-y-auto"><h3 className="font-bold mb-4">编辑项目</h3>{/* Fields */}<div className="flex justify-end gap-2 mt-4"><button onClick={()=>setEditingProject(null)} className="px-4 py-2 border rounded">取消</button><button onClick={handleSaveProject} className="px-4 py-2 bg-blue-600 text-white rounded">保存</button></div></div></div>}
          </div>
      )}

      {activeTab === 'userdata' && (
          /* Existing User Data (Uploads/Notes) Logic */
          <div className="space-y-6">
             <div className="flex gap-4 mb-6">
                <button onClick={() => setUserDataTab('uploads')} className={`px-4 py-2 rounded text-sm font-medium ${userDataTab==='uploads'?'bg-blue-100 text-blue-700':'bg-white border'}`}>诊断材料 ({userUploads.length})</button>
                <button onClick={() => setUserDataTab('notes')} className={`px-4 py-2 rounded text-sm font-medium ${userDataTab==='notes'?'bg-blue-100 text-blue-700':'bg-white border'}`}>用户笔记 ({adminNotes.length})</button>
             </div>
             {userDataTab === 'uploads' && (
                 <table className="w-full text-left text-sm bg-white border rounded-lg">
                     <thead><tr className="bg-slate-50 border-b"><th className="p-3">文件</th><th className="p-3">用户</th><th className="p-3">状态</th></tr></thead>
                     <tbody>{userUploads.map(u => <tr key={u.id} className="border-b"><td className="p-3">{u.fileName}</td><td className="p-3">{u.userName}</td><td className="p-3">{u.status}</td></tr>)}</tbody>
                 </table>
             )}
             {userDataTab === 'notes' && (
                 <div className="grid grid-cols-2 gap-4">{adminNotes.map(n => <div key={n.id} className="bg-white p-4 border rounded shadow-sm"><p className="text-sm">{n.content}</p><div className="text-xs text-slate-400 mt-2">{n.userName}</div></div>)}</div>
             )}
          </div>
      )}

    </div>
  );
};

export default Admin;