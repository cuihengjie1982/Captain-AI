import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoute, BlogPost } from '../types';
import { ArrowRight, Clock, ChevronDown, Stethoscope } from 'lucide-react';
import { getBlogPosts } from '../services/contentService';

const Blog: React.FC = () => {
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setPosts(getBlogPosts());
  }, []);
  
  // Diagnosis Widget State
  const [selectedIssue, setSelectedIssue] = useState('核心人才留存');
  const [customIssue, setCustomIssue] = useState('');

  const handleStartDiagnosis = () => {
    const issueToSend = selectedIssue === 'other' ? customIssue : selectedIssue;
    navigate(AppRoute.DIAGNOSIS, { 
      state: { initialIssue: issueToSend } 
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Captain's Log</h1>
        <p className="text-slate-500 mt-2">运营卓越的最新洞察</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Interactive Diagnosis Widget */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
           <div className="flex flex-col md:flex-row">
              {/* Left: Visual/Title */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white md:w-1/2 flex flex-col justify-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold mb-4 self-start border border-white/20">
                    <Stethoscope size={14} />
                    <span>智能诊断工具</span>
                 </div>
                 <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">您在苦恼些什么？</h2>
                 <p className="text-blue-100 opacity-90">
                    不要等到更加恶化了才发现问题。填写右侧表单，AI 和专家团队将立即为您分析团队现状并提供解决方案。
                 </p>
              </div>

              {/* Right: Interactive Form */}
              <div className="p-8 md:w-1/2 bg-white flex flex-col justify-center">
                 <label className="block text-sm font-medium text-slate-700 mb-3">
                    您目前最头疼的问题是：
                 </label>
                 
                 <div className="relative mb-4">
                    <select 
                      value={selectedIssue}
                      onChange={(e) => setSelectedIssue(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      <option value="核心人才留存">核心人才留存</option>
                      <option value="薪酬与绩效">薪酬与绩效</option>
                      <option value="管理与辅导">管理与辅导</option>
                      <option value="高绩效人员画像">高绩效人员画像</option>
                      <option value="培训效果评估">培训效果评估</option>
                      <option value="预测与人员匹配">预测与人员匹配</option>
                      <option value="客户体验评估">客户体验评估</option>
                      <option value="质量评估">质量评估</option>
                      <option value="指标波动管理">指标波动管理</option>
                      <option value="成本效率评估">成本效率评估</option>
                      <option value="other">其他原因...</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <ChevronDown size={16} />
                    </div>
                 </div>

                 {selectedIssue === 'other' && (
                   <input
                      type="text"
                      value={customIssue}
                      onChange={(e) => setCustomIssue(e.target.value)}
                      placeholder="请描述具体问题..."
                      className="w-full mb-4 bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                   />
                 )}

                 <button 
                   onClick={handleStartDiagnosis}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-blue-600/20"
                 >
                   开始诊断 <ArrowRight size={18} className="ml-2" />
                 </button>
              </div>
           </div>
        </div>

        {/* Blog Posts List */}
        {posts.map((post) => (
          <Link 
            to={`/blog/${post.id}`} 
            key={post.id} 
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-100 group block"
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src={post.thumbnail} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                <span className="text-white text-xs font-medium bg-black/30 backdrop-blur px-2 py-1 rounded">
                  {post.author}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center text-slate-400 text-xs mb-3">
                <Clock size={14} className="mr-1" />
                {post.readTime}
                <span className="mx-2">•</span>
                {post.date}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                {post.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                {post.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;