import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, ThumbsUp, Eye } from 'lucide-react';
import { getPostById } from '../services/contentService';
import { AppRoute } from '../types';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = id ? getPostById(id) : undefined;

  if (!post) {
    return (
      <div className="p-8 text-center">
        <p>文章未找到</p>
        <button onClick={() => navigate(AppRoute.BLOG)} className="text-blue-600 mt-4">返回列表</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full pb-12">
      {/* Fake WeChat/Browser Navbar for effect */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={() => navigate(AppRoute.BLOG)} className="text-slate-700 p-1">
          <ArrowLeft size={24} />
        </button>
        <span className="font-medium text-slate-900 text-sm truncate w-48 text-center">{post.title}</span>
        <button className="text-slate-700 p-1">
          <MoreHorizontal size={24} />
        </button>
      </div>

      <div className="max-w-[677px] mx-auto px-5 py-6">
        {/* Title Area */}
        <h1 className="text-[22px] font-bold text-[#333333] leading-[1.4] mb-4 tracking-tight">
          {post.title}
        </h1>

        {/* Meta Data */}
        <div className="flex items-center gap-3 text-[15px] mb-8">
          <span className="text-slate-400">{post.date}</span>
          <span className="text-[#576b95] font-medium cursor-pointer">Captain AI</span>
          <span className="text-[#576b95] font-medium cursor-pointer ml-auto">关注</span>
        </div>

        {/* Content Body - Simulating Rich Text */}
        <div 
          className="text-[17px] leading-[1.6] text-[#333333] tracking-wide space-y-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer Area */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <span className="flex items-center gap-1">阅读 3256</span>
            <span className="flex items-center gap-1"><ThumbsUp size={16} /> 128</span>
            <span className="flex items-center gap-1 ml-auto text-[#576b95]">投诉</span>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            AI
          </div>
          <div>
            <div className="font-medium text-slate-900">Captain AI</div>
            <div className="text-xs text-slate-500">呼叫中心智能副驾</div>
          </div>
          <button 
            onClick={() => navigate(AppRoute.DIAGNOSIS)}
            className="ml-auto px-4 py-1.5 border border-blue-600 text-blue-600 rounded text-sm font-medium hover:bg-blue-50"
          >
            去诊断
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;