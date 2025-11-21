import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppRoute, KnowledgeCategory, UserUpload } from '../types';
import { 
  ArrowRight, Send, Loader2, RotateCcw, Sparkles,
  FileText, Download, Upload, FileCheck, Mail, CheckCircle,
  X, FileSpreadsheet, Presentation, BookOpen, File, Copy, Check, Lock
} from 'lucide-react';
import { getKnowledgeCategories } from '../services/resourceService';
import { saveUserUpload } from '../services/userDataService';
import { createChatSession, sendMessageToAI } from '../services/geminiService';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

// Helper Component for Copy Button
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all opacity-0 group-hover:opacity-100"
      title="复制内容"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
    </button>
  );
};

// Helper Component for Knowledge Base Items
const ResourceItem: React.FC<{ title: string; type: 'xlsx' | 'pdf' | 'ppt' | 'doc'; size: string }> = ({ title, type, size }) => {
  const getIcon = () => {
    switch(type) {
      case 'xlsx': return <FileSpreadsheet size={20} className="text-green-600" />;
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      case 'ppt': return <Presentation size={20} className="text-orange-500" />;
      default: return <File size={20} className="text-blue-500" />;
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group bg-white">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-50 rounded border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-white transition-colors">
           {getIcon()}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">{title}</div>
          <div className="text-xs text-slate-400 uppercase flex items-center gap-1">
            <span className="font-semibold">{type}</span>
            <span>•</span>
            <span>{size}</span>
          </div>
        </div>
      </div>
      <div className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
        <Download size={16} />
      </div>
    </div>
  );
};

const Diagnosis: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<'ai' | 'expert'>('ai');

  // AI Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  // Expert Mode State
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false); // Controls the Knowledge Base Modal
  const [showContactModal, setShowContactModal] = useState(false); // Controls the WeChat QR Modal

  // Payment Gate State
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [paymentProblemInput, setPaymentProblemInput] = useState('');
  const [paymentAttachment, setPaymentAttachment] = useState<string | null>(null);

  // Knowledge Base
  const [knowledgeCategories, setKnowledgeCategories] = useState<KnowledgeCategory[]>([]);

  useEffect(() => {
     setKnowledgeCategories(getKnowledgeCategories());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'ai') {
      scrollToBottom();
    }
  }, [messages, isTyping, activeTab]);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initialIssue = location.state?.initialIssue;

    if (initialIssue) {
      const issueTextMap: Record<string, string> = {
        '核心人才留存': '我们的核心骨干流失严重，我担心留不住关键人才。',
        '薪酬与绩效': '我觉得目前的薪资没有竞争力，绩效激励也不到位，大家是为了钱走的。',
        '管理与辅导': '基层管理人员的辅导能力较弱，不知道怎么带人。',
        '高绩效人员画像': '我们缺乏清晰的高绩效人才画像，招聘和选拔标准模糊。',
        '培训效果评估': '投入了很多培训资源，但无法评估实际产出和效果。',
        '预测与人员匹配': '话务预测不准，导致排班和人员匹配经常出现偏差。',
        '客户体验评估': '客户体验指标（NPS/CSAT）停滞不前，找不到体验痛点在哪里。',
        '质量评估': '质检分数很高，但客户实际感受并不好，质量评估体系可能失效了。',
        '指标波动管理': '各项KPI经常异常波动，我们缺乏有效的监控和复盘机制。',
        '成本效率评估': '运营成本居高不下，效率提升遇到了瓶颈。',
        'other': initialIssue
      };

      const userText = issueTextMap[initialIssue] || initialIssue;

      setMessages([{ id: '0', sender: 'user', text: userText }]);
      setIsTyping(true);
      
      setTimeout(() => {
        let response = '';
        let nextStep = 1;
        
        if (userText.includes('薪') || userText.includes('钱')) {
           response = "收到。薪资确实是敏感点。除了底薪，您觉得我们的绩效奖金设计是否能拉开差距，激励到核心骨干？";
        } else if (userText.includes('流失') || userText.includes('留存')) {
           response = "明白。人员流失往往有多重因素。当骨干觉得触碰到天花板时最容易流失。目前我们除了纵向晋升（做组长），有横向发展的机会吗（如QA、培训师）？";
        } else if (userText.includes('管理') || userText.includes('辅导')) {
           response = "这是一个关键的观察。一线管理者的能力直接决定团队状态。您觉得如果我们提供针对性的管理培训（如GROW模型），情况会在短期内改善吗？";
        } else if (userText.includes('预测') || userText.includes('排班')) {
           response = "排班问题直接影响接通率和员工满意度。您目前是使用Erlang-C模型还是其他工具来进行预测的？误差率大约是多少？";
        } else if (userText.includes('画像') || userText.includes('招聘')) {
           response = "精准的画像是成功的开始。我们可以从现有Top Performer的行为特征入手。您是否对现有的绩优员工做过深度访谈？";
        } else {
           response = "好的，我已记录这个问题。为了更准确地为您提供方案，能具体描述一下目前这个情况对业务指标（如SLA、CSAT）造成的最大影响是什么吗？";
        }

        setMessages(prev => [...prev, { id: 'init-ai', sender: 'ai', text: response }]);
        setIsTyping(false);
        setStep(nextStep);
      }, 1500);

    } else {
      setMessages([{
        id: '1',
        sender: 'ai',
        text: "船长你好。我了解到您正面临运营挑战。为了更好地帮助您，能否告诉我您具体担心的是哪个方面的问题？"
      }]);
    }
  }, [location.state]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = '';
      let nextStep = step + 1;
      const lowerInput = input.toLowerCase();

      if (step === 0) {
        // Fallback generic responses for manual chat start
        if (lowerInput.includes('钱') || lowerInput.includes('工资') || lowerInput.includes('薪')) {
           aiResponseText = "我明白薪资是个问题。您觉得是内部公平性问题，还是外部市场给的实在太多？";
        } else {
           aiResponseText = "明白了。关于这个情况，您觉得目前最紧迫需要解决的具体痛点是什么？";
        }
      } else if (step === 1) {
        aiResponseText = "了解。那么您认为如果这个问题得到解决，我们最希望看到的关键结果（Key Result）是什么？";
      } else if (step === 2) {
        aiResponseText = "谢谢。根据您提供的信息，我已经为您初步匹配了相关的诊断工具和解决方案模版。";
        nextStep = 100; 
      } else {
         aiResponseText = "我已记录这一点。还有其他需要补充的背景信息吗？如果没有，我们可以生成方案了。";
         nextStep = 100;
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText }]);
      setIsTyping(false);
      setStep(nextStep);
    }, 1500);
  };

  const handleSummarize = async () => {
    if (messages.length === 0 || isTyping) return;
    
    setIsTyping(true);
    
    try {
        const chat = createChatSession();
        let summary = "";
        
        if (chat) {
            const conversationHistory = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
            const prompt = `请为以下对话生成一个简短的摘要（100字以内），总结用户的主要问题和当前的诊断进展：\n\n${conversationHistory}`;
            summary = await sendMessageToAI(chat, prompt);
        } else {
            // Fallback if API key missing
            summary = "基于当前对话，我们已探讨了您的核心运营挑战。建议继续明确关键痛点，以便匹配最佳解决方案。";
        }
        
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            sender: 'ai', 
            text: `📝 **对话摘要**：\n${summary}` 
        }]);
    } catch (e) {
        console.error(e);
         setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            sender: 'ai', 
            text: "抱歉，生成摘要时出现错误，请稍后再试。" 
        }]);
    } finally {
        setIsTyping(false);
        // Scroll to bottom
        setTimeout(scrollToBottom, 100);
    }
  };

  const restartDiagnosis = () => {
    setMessages([{
        id: 'restart',
        sender: 'ai',
        text: "好的，让我们重新开始。您想聊聊其他方面的问题吗？"
      }]);
    setStep(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadStatus('uploading');
      
      // Get user info
      const currentUser = JSON.parse(localStorage.getItem('captainUser') || '{}');

      // Simulate upload delay
      setTimeout(() => {
        setUploadStatus('success');
        
        // Save to admin service
        const newUpload: UserUpload = {
          id: Date.now().toString(),
          fileName: file.name,
          fileType: file.name.split('.').pop() || 'unknown',
          size: (file.size / 1024).toFixed(1) + ' KB',
          uploadDate: new Date().toLocaleString('zh-CN'),
          status: 'pending',
          userName: currentUser.name || 'Guest User',
          userEmail: currentUser.email
        };
        saveUserUpload(newUpload);

      }, 2000);
    }
  };

  const getCategoryStyles = (color: string) => {
    const styles: Record<string, string> = {
      blue: 'text-blue-600 bg-blue-100',
      emerald: 'text-emerald-600 bg-emerald-100',
      orange: 'text-orange-600 bg-orange-100',
      purple: 'text-purple-600 bg-purple-100',
      pink: 'text-pink-600 bg-pink-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      cyan: 'text-cyan-600 bg-cyan-100',
      teal: 'text-teal-600 bg-teal-100',
      rose: 'text-rose-600 bg-rose-100',
      slate: 'text-slate-600 bg-slate-200',
    };
    return styles[color] || styles['blue'];
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Sticky Header with Tabs */}
      <header className="bg-white border-b border-slate-200 pt-4 px-6 pb-0 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">🧭</span> 诊断罗盘
            </h1>
            <p className="text-sm text-slate-500">主题：{location.state?.initialIssue || '运营诊断'}</p>
          </div>
          
          {/* Finish Button (Only show in AI mode when ready) */}
          {activeTab === 'ai' && step >= 100 && (
            <button 
              onClick={() => navigate(AppRoute.SOLUTION)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg transition-all animate-pulse"
            >
              获取 AI 方案 <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-8">
           <button 
              onClick={() => setActiveTab('ai')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'ai' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
              }`}
           >
              AI 智能诊断
           </button>
           <button 
              onClick={() => setActiveTab('expert')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'expert' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
              }`}
           >
              专家人工诊断
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* --- TAB 1: AI Chat Interface --- */}
        {activeTab === 'ai' && (
          <div className="absolute inset-0 flex flex-col">
             <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-white shadow-sm ${msg.sender === 'user' ? 'bg-slate-200' : 'bg-blue-600 text-white'}`}>
                          {msg.sender === 'user' ? <span className="text-lg">👤</span> : <span className="text-lg">⚓</span>}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 relative group pr-10'
                        }`}>
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                          {msg.sender === 'ai' && <CopyButton text={msg.text} />}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white">
                          <span className="text-lg">⚓</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-blue-600" />
                          <span className="text-xs text-slate-400">大副正在思考...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
             </div>

             {/* Input Area */}
             <div className="p-4 bg-white border-t border-slate-200">
                <div className="max-w-3xl mx-auto relative flex items-center gap-2">
                  {step > 0 && step < 100 && (
                    <button onClick={restartDiagnosis} title="重新开始" className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                      <RotateCcw size={20} />
                    </button>
                  )}
                  {messages.length > 1 && step < 100 && (
                    <button onClick={handleSummarize} disabled={isTyping} title="生成摘要" className="p-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50">
                      <Sparkles size={20} />
                    </button>
                  )}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={step >= 100 ? "诊断已完成。请点击上方获取方案。" : "请在此输入您的回答..."}
                      disabled={step >= 100 || isTyping}
                      className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || step >= 100 || isTyping}
                      className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* --- TAB 2: Expert Interface --- */}
        {activeTab === 'expert' && (
          <div className="absolute inset-0 overflow-y-auto bg-slate-50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
              
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900">深度人工诊断服务</h2>
                <p className="text-slate-500 mt-2">当 AI 无法解决复杂问题时，我们的行业专家可以为您提供深度分析。</p>
              </div>

              {/* Step 1: Download (Updated to Open Payment Gate) */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <BookOpen size={28} />
                </div>
                <div className="flex-1">
                   <h3 className="text-lg font-bold text-slate-800">Step 1: 下载诊断材料模版</h3>
                   <p className="text-slate-500 text-sm mt-1">进入知识库下载各类诊断工具，包括 Excel 模型、PPT 汇报模版及调查问卷。</p>
                </div>
                <button 
                  onClick={() => setShowPaymentGate(true)}
                  className="px-5 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                  <Download size={18} /> 下载诊断工具模版库
                </button>
              </div>

              {/* Step 2: Upload */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
                  <Upload size={28} />
                </div>
                <div className="flex-1 w-full">
                   <h3 className="text-lg font-bold text-slate-800">Step 2: 上传填写后的报告</h3>
                   <p className="text-slate-500 text-sm mt-1">请上传完善后的诊断文件。文件将直接发送至专家组邮箱（支持 xlsx, ppt, pdf）。</p>
                   
                   {uploadStatus === 'idle' && (
                     <div className="mt-4 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                       <input 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFileUpload}
                          accept=".xlsx,.xls,.pdf,.doc,.docx,.ppt,.pptx"
                       />
                       <div className="text-slate-400 flex flex-col items-center gap-2">
                          <Upload size={24} />
                          <span className="text-sm">点击或拖拽文件至此上传</span>
                       </div>
                     </div>
                   )}

                   {uploadStatus === 'uploading' && (
                     <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center gap-3">
                       <Loader2 size={20} className="animate-spin text-blue-600" />
                       <span className="text-slate-600 text-sm">正在加密上传 {uploadedFileName}...</span>
                     </div>
                   )}

                   {uploadStatus === 'success' && (
                     <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                       <FileCheck size={20} className="text-green-600" />
                       <span className="text-green-800 text-sm font-medium">上传成功：{uploadedFileName}</span>
                     </div>
                   )}
                </div>
              </div>

              {/* Step 3: Expert Reply Window */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                    <Mail size={20} className="text-slate-500" />
                    <h3 className="font-bold text-slate-800">专家回复窗口</h3>
                 </div>
                 <div className="p-6 min-h-[160px] flex flex-col justify-center">
                    {uploadStatus === 'success' ? (
                      <div className="text-center animate-fade-in">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-3">
                          <CheckCircle size={24} />
                        </div>
                        <h4 className="text-slate-900 font-medium">报告已提交</h4>
                        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                          专家组已收到您的数据。我们将进行人工分析，预计将在 <strong>24小时内</strong> 发送详细诊断书至您的注册邮箱，并在此处同步简报。
                        </p>
                        <div className="mt-6 p-3 bg-slate-50 rounded border border-slate-100 text-xs text-slate-400">
                          工单号: #DG-20240521-0892 | 状态: <span className="text-orange-500 font-medium">排队分析中</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <p>暂无回复。</p>
                        <p className="text-sm mt-1">请先完成上方步骤，上传您的诊断数据。</p>
                      </div>
                    )}
                 </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Payment Gate Modal */}
      {showPaymentGate && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 relative">
             <button 
               onClick={() => setShowPaymentGate(false)}
               className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
             >
               <X size={24} />
             </button>
             
             <div className="p-6 pt-8">
               <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">解锁专家级诊断模版库</h2>
                  <p className="text-sm text-slate-500 mt-1">请完善信息并扫码支付以获取下载权限</p>
               </div>

               <div className="space-y-5">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">
                       当前具体要解决的问题 <span className="text-red-500">*</span>
                     </label>
                     <div className="relative">
                        <textarea 
                            value={paymentProblemInput}
                            onChange={(e) => setPaymentProblemInput(e.target.value)}
                            placeholder="请详细描述您遇到的运营难题，以便我们为您推荐最合适的工具..."
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[120px] resize-none bg-slate-50 pb-12"
                        />
                        <div className="absolute bottom-3 right-3">
                           <input 
                             type="file" 
                             id="payment-attachment-upload"
                             className="hidden"
                             accept=".xlsx,.xls,.doc,.docx,.pdf"
                             onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setPaymentAttachment(file.name);
                             }}
                           />
                           <label 
                             htmlFor="payment-attachment-upload"
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-300 cursor-pointer transition-all"
                           >
                             <Upload size={14} />
                             上传数据/文档
                           </label>
                        </div>
                     </div>
                     
                     {paymentAttachment && (
                        <div className="mt-2 flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-100 w-fit animate-in fade-in slide-in-from-top-1">
                           <FileText size={14} />
                           <span className="font-medium max-w-[200px] truncate">已添加: {paymentAttachment}</span>
                           <button 
                             onClick={() => setPaymentAttachment(null)}
                             className="ml-1 hover:bg-emerald-100 rounded p-0.5 transition-colors"
                           >
                             <X size={14} />
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                     <p className="text-sm font-bold text-slate-700 mb-3">微信扫码支付 ￥9.9</p>
                     <div className="bg-white p-2 inline-block rounded-lg shadow-sm border border-slate-100 mb-2">
                       <img 
                         src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=wxp://f2f0j38492&color=000000" 
                         alt="Payment QR Code" 
                         className="w-32 h-32 opacity-90"
                       />
                     </div>
                     <p className="text-xs text-slate-400">支付后自动解锁全站 50+ 诊断工具</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if(!paymentProblemInput.trim()) {
                         alert("为了更好地为您服务，请描述您当前遇到的问题。");
                         return;
                      }
                      setShowPaymentGate(false);
                      setShowKnowledgeBase(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                  >
                    已完成支付，进入下载
                  </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Knowledge Base Modal (Overlay) */}
      {showKnowledgeBase && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">诊断资源知识库</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Knowledge Base & Template Library</p>
                </div>
              </div>
              <button onClick={() => setShowKnowledgeBase(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={28} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {knowledgeCategories.map((category) => (
                    <div key={category.id} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                       <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-lg border-b border-slate-50 pb-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getCategoryStyles(category.color)}`}>
                            {category.id}
                          </span>
                          {category.name}
                       </h3>
                       <div className="space-y-3">
                          {category.items.map((item, idx) => (
                            <ResourceItem key={idx} title={item.title} type={item.type} size={item.size} />
                          ))}
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-blue-800">找不到需要的模版？</h4>
                    <p className="text-sm text-blue-600/80">联系专家助手，我们可以在 2 小时内为您定制。</p>
                  </div>
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    联系助手
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Assistant (WeChat QR) Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-200">
             <button 
               onClick={() => setShowContactModal(false)}
               className="absolute top-2 right-2 p-2 bg-black/5 rounded-full text-slate-500 hover:bg-black/10 z-10 hover:text-slate-900 transition-colors"
             >
               <X size={20} />
             </button>
             
             {/* Card Header with Visuals */}
             <div className="p-8 pb-4 bg-gradient-to-b from-blue-50/50 to-white relative">
                {/* Decorative Bubbles */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none overflow-hidden">
                   <div className="absolute top-4 right-8 w-12 h-12 bg-blue-600 rounded-full blur-xl"></div>
                   <div className="absolute top-12 right-2 w-16 h-16 bg-indigo-400 rounded-full blur-xl"></div>
                </div>

                <div className="relative z-10">
                  <div className="text-xs text-slate-500 font-medium mb-3">润迅</div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">有希望之处定有磨练</h2>
                  <p className="text-sm text-slate-500 mt-2 font-medium">崔恒捷</p>
                </div>
             </div>

             {/* QR Code Section */}
             <div className="p-8 pt-2 flex flex-col items-center">
                <div className="w-56 h-56 bg-white p-1 shadow-sm border border-slate-100 rounded-lg mb-6">
                   <img 
                     src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://work.weixin.qq.com/ca/qw_contact&color=2563eb" 
                     alt="WeChat QR Code" 
                     className="w-full h-full object-contain"
                   />
                </div>
                <p className="text-slate-400 text-sm">扫描二维码，添加我的企业微信</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnosis;