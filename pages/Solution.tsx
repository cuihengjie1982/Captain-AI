
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, CheckSquare, Download, 
  MessageCircle, Send, Bookmark, Loader2, FileText, 
  ListVideo, Clock, ChevronRight, Search, Sparkles,
  Highlighter, PenTool, Maximize, Minimize, Settings
} from 'lucide-react';
import { Note, ChatMessage, Lesson, Highlight } from '../types';
import { createChatSession, sendMessageToAI } from '../services/geminiService';
import { getLessons } from '../services/courseService';

const Solution: React.FC = () => {
  // State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'transcript' | 'chat' | 'notes'>('transcript');
  
  // Playback Controls State
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Highlight Generation State
  const [highlightInput, setHighlightInput] = useState('');
  const [isGeneratingHighlights, setIsGeneratingHighlights] = useState(false);
  const [displayedHighlights, setDisplayedHighlights] = useState<Highlight[]>([]);

  // Selection Menu State
  const [selectionMenu, setSelectionMenu] = useState<{x: number, y: number, text: string} | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null); // Ref for Fullscreen
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);
  
  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState('');

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: "你好！我是本课程的AI助教。关于这节课的内容，无论是概念解释还是实操建议，随时问我！" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Load Lessons
  useEffect(() => {
    const data = getLessons();
    setLessons(data);
    if (data.length > 0) {
      setCurrentLessonId(data[0].id);
    }
  }, []);

  // Derived State
  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];

  // Sync displayed highlights when lesson changes
  useEffect(() => {
    if (currentLesson) {
      setDisplayedHighlights(currentLesson.highlights || []);
      setHighlightInput('');
      setSelectionMenu(null);
    }
  }, [currentLessonId, currentLesson]);

  // Initialize Chat
  useEffect(() => {
    if (currentLessonId) {
      chatSessionRef.current = createChatSession();
    }
  }, [currentLessonId]);

  // Video Time Update Mock (Adjusted for playbackRate)
  useEffect(() => {
    let interval: any;
    if (isPlaying && currentLesson) {
      const tickRate = 1000 / playbackRate; // Adjust interval based on speed
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentLesson.durationSec) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, tickRate);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentLesson, playbackRate]);

  // Auto-scroll Transcript
  useEffect(() => {
    if (activeTab === 'transcript' && transcriptContainerRef.current) {
      // Only auto-scroll if user isn't interacting with text selection
      if (!selectionMenu) {
        const activeElement = transcriptContainerRef.current.querySelector('.active-transcript');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, activeTab, selectionMenu]);

  // Fullscreen Event Listener
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  if (!currentLesson) return <div className="flex items-center justify-center h-full">Loading...</div>;

  // Handlers
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  
  const handleJumpToTime = (time: number) => {
    setCurrentTime(time);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleLessonChange = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setCurrentTime(0);
    setIsPlaying(false);
    setPlaybackRate(1.0); // Reset speed on lesson change
    setChatMessages([{ id: Date.now().toString(), role: 'model', text: "新课程已加载。有什么我可以帮您的吗？" }]);
  };

  const handleToggleFullScreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleSaveNote = (text?: string) => {
    const content = text || noteInput;
    if (!content.trim()) return;
    
    const newNote: Note = {
      id: Date.now().toString(),
      timestamp: currentTime,
      content: content
    };
    setNotes([newNote, ...notes]);
    if (!text) setNoteInput(''); // Only clear input if manually typed
  };

  const handleGenerateHighlights = async () => {
    if (!highlightInput.trim()) return;
    setIsGeneratingHighlights(true);

    try {
      const chat = createChatSession(); // Use a temporary session for this task
      if (!chat) throw new Error("AI Service Unavailable");

      // Prepare context from transcript
      const transcriptText = currentLesson.transcript
        .map(t => `[${t.time}s] ${t.text}`)
        .join('\n');

      const prompt = `
        任务：基于以下视频字幕，找出与主题“${highlightInput}”最相关的2-3个关键时间点。
        字幕：
        ${transcriptText}

        请严格按此格式返回（不要包含任何其他文字）：
        简短标签(4-8字)|秒数
        简短标签(4-8字)|秒数

        要求：
        1. 标签要精准概括该片段内容。
        2. 秒数必须是整数。
        3. 如果找不到相关内容，请返回空字符串。
      `;

      const responseText = await sendMessageToAI(chat, prompt);
      
      // Parse response
      const newHighlights: Highlight[] = [];
      const lines = responseText.split('\n');
      
      // Distinct colors for generated highlights to differentiate them
      const genColors = [
        'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200',
        'bg-violet-100 text-violet-700 border border-violet-200', 
        'bg-cyan-100 text-cyan-700 border border-cyan-200'
      ];

      let colorIdx = 0;
      for (const line of lines) {
        const parts = line.split('|');
        if (parts.length >= 2) {
            const label = parts[0].trim().replace(/[\*\-]/g, '');
            const time = parseInt(parts[1].trim());
            if (label && !isNaN(time)) {
                newHighlights.push({
                    label: label,
                    time: time,
                    color: genColors[colorIdx % genColors.length]
                });
                colorIdx++;
            }
        }
      }

      if (newHighlights.length > 0) {
        setDisplayedHighlights(prev => [...prev, ...newHighlights]);
        setHighlightInput(''); // Clear input on success
      }
      
    } catch (error) {
      console.error("Error generating highlights:", error);
    } finally {
      setIsGeneratingHighlights(false);
    }
  };

  const sendMessageInternal = async (messageText: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: messageText };
    setChatMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // Context-aware prompt
    const currentTranscriptLine = [...currentLesson.transcript].reverse().find(t => t.time <= currentTime)?.text || "";
    const contextPrompt = `
      Context: The user is watching a video titled "${currentLesson.title}".
      Current timestamp: ${formatTime(currentTime)}.
      Current transcript line: "${currentTranscriptLine}".
      User Question: ${userMsg.text}
    `;

    let replyText = '';
    if (chatSessionRef.current) {
      replyText = await sendMessageToAI(chatSessionRef.current, contextPrompt);
    } else {
      replyText = "AI 服务连接中断。";
    }

    setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: replyText }]);
    setIsThinking(false);
  }

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    await sendMessageInternal(chatInput);
    setChatInput('');
  };

  // --- Text Selection Handler ---
  const handleTranscriptMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionMenu(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // We'll position it relative to the viewport (fixed) for simplicity
    setSelectionMenu({
      x: rect.left + (rect.width / 2),
      y: rect.top - 10, // Slightly above selection
      text: text
    });
  };

  const handleMenuExplain = () => {
    if (!selectionMenu) return;
    setActiveTab('chat');
    sendMessageInternal(`请解释一下这段话：“${selectionMenu.text}”`);
    setSelectionMenu(null);
    // Clear selection visually
    window.getSelection()?.removeAllRanges();
  };

  const handleMenuNote = () => {
    if (!selectionMenu) return;
    setActiveTab('notes');
    handleSaveNote(selectionMenu.text);
    setSelectionMenu(null);
     // Clear selection visually
     window.getSelection()?.removeAllRanges();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50 overflow-hidden font-sans">
      
      {/* Selection Popup Menu */}
      {selectionMenu && (
        <div 
          className="fixed z-50 bg-slate-900 text-white rounded-lg shadow-xl flex items-center p-1 gap-1 transform -translate-x-1/2 -translate-y-full animate-in zoom-in duration-200"
          style={{ left: selectionMenu.x, top: selectionMenu.y }}
          onMouseDown={(e) => e.stopPropagation()} // Prevent clearing on click
        >
          <button 
            onClick={handleMenuExplain}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-700 rounded-md text-xs font-medium transition-colors"
          >
            <MessageCircle size={14} />
            AI 解释
          </button>
          <div className="w-px h-4 bg-slate-700"></div>
          <button 
            onClick={handleMenuNote}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-700 rounded-md text-xs font-medium transition-colors"
          >
            <CheckSquare size={14} />
            记笔记
          </button>
          {/* Triangle Arrow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
        </div>
      )}
      
      {/* --- LEFT COLUMN: Video Player & List (70%) --- */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200 bg-white">
        
        {/* Video Player Container */}
        <div 
          ref={playerContainerRef}
          className={`bg-black w-full relative group shadow-lg z-30 transition-all ${isFullScreen ? 'fixed inset-0 z-50 h-screen' : 'aspect-video'}`}
        >
          <img 
            src={currentLesson.thumbnail} 
            alt={currentLesson.title}
            className={`w-full h-full object-cover opacity-80 transition-all ${isFullScreen ? 'object-contain' : ''}`}
          />
          
          {/* Custom Controls Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between transition-opacity duration-300">
            
            {/* Center Play Button (Only show when not playing or hovering in non-fullscreen) */}
            <div className="flex-1 flex items-center justify-center group-hover:opacity-100 opacity-0 transition-opacity">
               <button 
                 onClick={handlePlayPause}
                 className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-105 transition-all shadow-xl border border-white/10"
               >
                 {isPlaying ? <Pause size={36} className="text-white fill-current" /> : <Play size={36} className="text-white fill-current ml-2" />}
               </button>
            </div>

            {/* Bottom Bar */}
            <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-12">
              
              {/* Progress Bar Row */}
              <div className="mb-3 flex items-center gap-0">
                <div 
                  className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer relative group/progress hover:h-2 transition-all"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = x / rect.width;
                    handleJumpToTime(Math.floor(percent * currentLesson.durationSec));
                  }}
                >
                  <div 
                    className="h-full bg-blue-500 rounded-full relative transition-all" 
                    style={{ width: `${(currentTime / currentLesson.durationSec) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity transform scale-125"></div>
                  </div>
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-white">
                
                {/* Left Controls */}
                <div className="flex items-center gap-4">
                   <button onClick={handlePlayPause} className="hover:text-blue-400 transition-colors">
                      {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                   </button>
                   <span className="text-xs font-medium tracking-wide font-mono">
                     {formatTime(currentTime)} / {currentLesson.duration}
                   </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-4 relative">
                   {/* Speed Control */}
                   <div className="relative">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="text-xs font-bold hover:bg-white/20 px-2 py-1 rounded transition-colors flex items-center gap-1 w-12 justify-center"
                      >
                         {playbackRate}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur border border-white/10 rounded-lg overflow-hidden flex flex-col text-xs text-white z-50 min-w-[80px] shadow-xl animate-in slide-in-from-bottom-2 fade-in">
                          {[2.0, 1.5, 1.25, 1.0, 0.8].map(rate => (
                            <button
                              key={rate}
                              onClick={(e) => { e.stopPropagation(); setPlaybackRate(rate); setShowSpeedMenu(false); }}
                              className={`px-3 py-2 hover:bg-blue-600/50 text-center transition-colors ${playbackRate === rate ? 'text-blue-400 font-bold bg-white/5' : ''}`}
                            >
                              {rate.toFixed(1)}x
                            </button>
                          ))}
                        </div>
                      )}
                   </div>

                   {/* Fullscreen Control */}
                   <button onClick={handleToggleFullScreen} className="hover:text-blue-400 transition-colors">
                     {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info & Highlights (Hide in fullscreen) */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-bold text-slate-900 line-clamp-1" title={currentLesson.title}>{currentLesson.title}</h1>
            
            {/* Highlights Section with Input */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
               {/* Input for Custom Highlights */}
               <div className="relative flex items-center w-full sm:w-64 flex-shrink-0">
                  <Sparkles size={14} className="absolute left-3 text-blue-600" />
                  <input 
                     className="pl-9 pr-16 py-1.5 text-xs border border-blue-100 bg-blue-50/50 rounded-full w-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none placeholder:text-blue-400"
                     placeholder="输入主题生成高亮..."
                     value={highlightInput}
                     onChange={(e) => setHighlightInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleGenerateHighlights()}
                     disabled={isGeneratingHighlights}
                  />
                  <button 
                     onClick={handleGenerateHighlights}
                     disabled={isGeneratingHighlights || !highlightInput.trim()}
                     className="absolute right-1 top-1 bottom-1 px-3 bg-white text-blue-600 text-[10px] font-bold rounded-full shadow-sm border border-blue-100 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                     {isGeneratingHighlights ? <Loader2 size={10} className="animate-spin" /> : '生成'}
                  </button>
               </div>

               {/* Highlight Chips */}
               <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar flex-1 w-full">
                  {displayedHighlights.length === 0 && <span className="text-xs text-slate-300 italic flex-shrink-0">暂无标记</span>}
                  {displayedHighlights.map((hl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleJumpToTime(hl.time)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all hover:shadow-md hover:-translate-y-0.5 animate-in fade-in zoom-in duration-300 ${hl.color}`}
                    >
                      <Play size={10} className="fill-current" />
                      {hl.label}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Playlist (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
               <ListVideo size={18} /> 课程列表 ({lessons.length})
             </h3>
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="搜索课程..." className="pl-8 pr-4 py-1.5 text-xs border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
             </div>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson) => {
              const isActive = lesson.id === currentLessonId;
              return (
                <div 
                  key={lesson.id}
                  onClick={() => handleLessonChange(lesson.id)}
                  className={`flex gap-4 p-3 rounded-xl cursor-pointer transition-all group border ${
                    isActive 
                      ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' 
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                    <img src={lesson.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {lesson.duration}
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-blue-900/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                          <Play size={14} className="text-white fill-current" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className={`text-sm font-bold line-clamp-2 mb-1 ${isActive ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}`}>
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>第 {lesson.id} 讲</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {Math.floor(Math.random() * 1000) + 500} 次学习</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: Sidebar (30%) --- */}
      <div className="w-full lg:w-[400px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
        
        {/* Tabs Header */}
        <div className="flex items-center justify-around border-b border-slate-200 bg-slate-50/50">
          {[
            { id: 'transcript', label: '文稿', icon: FileText },
            { id: 'chat', label: '助教', icon: MessageCircle },
            { id: 'notes', label: '笔记', icon: Bookmark },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- TAB CONTENT --- */}
        <div className="flex-1 overflow-hidden relative bg-white">
          
          {/* 1. TRANSCRIPT TAB */}
          {activeTab === 'transcript' && (
            <div 
              className="absolute inset-0 overflow-y-auto p-6 custom-scrollbar" 
              ref={transcriptContainerRef}
              onMouseUp={handleTranscriptMouseUp}
            >
              <div className="space-y-6">
                {currentLesson.transcript.map((line, idx) => {
                  // Check if this line is currently active
                  const isActive = currentTime >= line.time && 
                    (idx === currentLesson.transcript.length - 1 || currentTime < currentLesson.transcript[idx + 1].time);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`transition-all duration-300 cursor-pointer rounded-lg p-2 -ml-2 ${isActive ? 'active-transcript bg-blue-50' : 'hover:bg-slate-50 text-slate-400'}`}
                      onClick={() => {
                         // Avoid jumping when selecting text
                         if (!window.getSelection()?.toString()) {
                           handleJumpToTime(line.time);
                         }
                      }}
                    >
                      <div className="flex gap-3">
                        <span className={`text-xs font-mono mt-1 flex-shrink-0 w-10 ${isActive ? 'text-blue-500 font-bold' : 'text-slate-300'}`}>
                          {formatTime(line.time)}
                        </span>
                        <p className={`text-sm leading-relaxed selection:bg-blue-200 selection:text-blue-900 ${isActive ? 'text-slate-900 font-medium' : ''}`}>
                          {line.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-12 text-center text-xs text-slate-300 border-t border-slate-100 pt-4">
                End of Transcript
              </div>
            </div>
          )}

          {/* 2. CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="absolute inset-0 flex flex-col bg-slate-50">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${
                       msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
                     }`}>
                       {msg.text}
                     </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2 text-slate-500 text-xs shadow-sm">
                       <Loader2 size={14} className="animate-spin text-blue-600" /> 正在思考...
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white border-t border-slate-200">
                 <div className="relative">
                   <input
                     type="text"
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                     placeholder="向助教提问..."
                     className="w-full pl-4 pr-12 py-3 bg-slate-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl text-sm focus:outline-none transition-all"
                     disabled={isThinking}
                   />
                   <button 
                     onClick={handleSendChat}
                     disabled={!chatInput.trim() || isThinking}
                     className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                   >
                     <Send size={16} />
                   </button>
                 </div>
              </div>
            </div>
          )}

          {/* 3. NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="absolute inset-0 flex flex-col bg-slate-50">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                    <Bookmark size={48} className="mb-2 opacity-20" />
                    <p className="text-sm">暂无笔记</p>
                    <p className="text-xs mt-1">在下方输入框记录灵感，或从文稿中摘录</p>
                  </div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-blue-300 transition-all">
                      <div 
                        onClick={() => handleJumpToTime(note.timestamp)}
                        className="flex items-center gap-2 mb-2 cursor-pointer hover:text-blue-600 text-slate-400 text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Play size={10} className="fill-current" />
                        {formatTime(note.timestamp)}
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-white border-t border-slate-200 shadow-lg z-10">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    当前时间: {formatTime(currentTime)}
                  </span>
                </div>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="记录此刻的想法..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none mb-3 transition-all"
                  rows={3}
                />
                <button 
                  onClick={() => handleSaveNote()}
                  disabled={!noteInput.trim()}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckSquare size={16} /> 保存笔记
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Solution;
