
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { Ship, ArrowRight, User, Phone, Mail, KeyRound } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone && email) {
      // Simple Admin check logic
      const role = email.includes('admin@captain.ai') ? 'admin' : 'user';

      // Store user info with default plan 'free'
      try {
        localStorage.setItem('captainUser', JSON.stringify({ 
          name, 
          phone, 
          email, 
          role,
          plan: role === 'admin' ? 'pro' : 'free', // Default plan
          isAuthenticated: true 
        }));
      } catch (err) {
        console.error("Could not save user to local storage", err);
      }
      
      if (role === 'admin') {
        navigate(AppRoute.ADMIN);
      } else {
        navigate(AppRoute.BLOG);
      }
    }
  };

  const fillAdminCredentials = () => {
    setName('Captain Admin');
    setPhone('13800000000');
    setEmail('admin@captain.ai');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-600/20">
            <Ship size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">欢迎登船</h1>
          <p className="text-slate-500 mt-2">登录 Captain AI 开启智能诊断</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="请输入您的姓名"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">手机号码</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-slate-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="请输入手机号码"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">工作邮箱</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-right">我们将向此邮箱发送详细的诊断报告</p>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
          >
            启动引擎 <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
           <button 
             type="button"
             onClick={fillAdminCredentials}
             className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-1 mx-auto transition-colors"
           >
             <KeyRound size={14} />
             我是管理员 (一键填充演示账号)
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
