import React from 'react';
import { Link } from 'react-router-dom';
import { AppRoute } from '../types';
import { Video, FileText, Settings, Zap, Check, ArrowUpRight } from 'lucide-react';

const Plans: React.FC = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">计划</h1>
        <p className="text-slate-500 mt-2">您目前使用的是免费套餐。请选择符合您需求的套餐。</p>
      </header>

      {/* Sub Navigation (Centered for this page maybe? Keeping consistent) */}
      <div className="flex gap-1 border-b border-slate-200 mb-12 overflow-x-auto justify-center">
        <Link to={AppRoute.MY_VIDEOS} className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2">
          <Video size={18} /> 视频
        </Link>
        <Link to={AppRoute.MY_NOTES} className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2">
          <FileText size={18} /> 笔记
        </Link>
        <Link to={AppRoute.PLANS} className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium flex items-center gap-2">
          <Zap size={18} /> 升级计划
        </Link>
        <Link to={AppRoute.SETTINGS} className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2">
          <Settings size={18} /> 设置
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
         
         {/* Basic Plan */}
         <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">基本的</h3>
            
            <div className="mb-8">
               <h2 className="text-4xl font-bold text-slate-900 mb-2">自由的</h2>
               <p className="text-slate-500 text-sm">免费试用 Captain AI，无需信用卡</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
               <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <Video size={18} /> 每月 5 个视频
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <Zap size={18} /> 人工智能精彩集锦
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <FileText size={18} /> 带文字记录的聊天
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <Check size={18} /> 保存笔记
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-700 opacity-50 line-through decoration-slate-400">
                  <ArrowUpRight size={18} /> 转录翻译
               </li>
            </ul>

            <button className="w-full py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">
               当前计划
            </button>
         </div>

         {/* Pro Plan */}
         <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
               推荐
            </div>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-slate-900">专业版</h3>
               <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">年度的</span>
                  <div className="w-10 h-5 bg-blue-600 rounded-full p-1 cursor-pointer">
                     <div className="w-3 h-3 bg-white rounded-full ml-auto"></div>
                  </div>
               </div>
            </div>
            
            <div className="mb-8">
               <div className="flex items-baseline gap-2">
                  <span className="text-slate-400 line-through text-xl">10美元</span>
                  <h2 className="text-4xl font-bold text-slate-900">8.33美元</h2>
                  <span className="text-slate-500">/ 月</span>
               </div>
               <p className="text-slate-500 text-sm mt-2">按年付费，可享两个月免费。</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
               <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <Video size={18} /> 每月 100 个视频
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <Check size={18} /> 从基础到其他一切
               </li>
               <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <ArrowUpRight size={18} /> 导出转录本
               </li>
               <li className="text-blue-600 text-sm font-medium pl-1 pt-2">
                  <a href="#" className="flex items-center gap-1 hover:underline">
                     <ArrowUpRight size={14} /> 还不顾？只需 3 美元即可观看另外 20 个视频
                  </a>
               </li>
            </ul>

            <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-slate-900/20">
               升级
            </button>
         </div>
      </div>
    </div>
  );
};

export default Plans;