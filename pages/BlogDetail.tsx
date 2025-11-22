

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, ThumbsUp, MessageSquare, Send, CheckSquare, BookOpen, MessageCircle, X, PenTool, Loader2, Sparkles, User as UserIcon, Clock, Heart, Share2, Quote } from 'lucide-react';
import { getPostById, getComments, addComment, addReply, toggleCommentLike } from '../services/contentService';
import { saveReadArticle, saveAdminNote } from '../services/userDataService';
import { createChatSession, sendMessageToAI } from '../services/geminiService';
import { AppRoute, BlogPostComment, User, ChatMessage, Note, AdminNote } from '../types';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = id ? getPostById(id) : undefined;
  
  // Comment States
  const [comments, setComments] = useState<BlogPostComment[]>([]);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({ name: '访客' });
  const [commentInput, setCommentInput] = useState('');
  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({}); 
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Side Panel States
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); // Hidden by default on mobile
  const [activePanelTab, setActivePanelTab] = useState<'chat' | 'notes'>('chat');
  
  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatSessionRef = useRef<any>(null);

  // Note States
  const [notes, setNotes] = useState<Note[]>([]); 
  const [noteInput, setNoteInput] = useState('');
  const [currentQuote, setCurrentQuote] = useState<string | null>(null);

  // Text Selection Menu State
  const [selectionMenu, setSelectionMenu] = useState<{x: number, y: number, text: string} | null>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Refs for scroll handling and focus
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id) {
      setComments(getComments(id));
      saveReadArticle(id); // Track history
    }
    const storedUser = localStorage.getItem('captainUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    // Initialize Chat
    chatSessionRef.current = createChatSession();
    if (post) {
       setChatMessages([{ 
         id: 'init', 
         role: 'model', 
         text: `您正在阅读《${post.title}》。关于文章内容，有什么我可以帮您解释的吗？` 
       }]);
    }
  }, [id, post]);

  // --- Refined Text Selection Logic ---
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      // If user is clicking/dragging inside the menu, do nothing
      if (menuRef.current && selection && selection.anchorNode && menuRef.current.contains(selection.anchorNode)) {
        return;
      }

      // If selection is empty, hide menu
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setSelectionMenu(null);
        return;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Prevent menu from closing if clicking inside the menu itself
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionMenu(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text) return;

      // Ensure selection is inside the article content
      if (articleContentRef.current && !articleContentRef.current.contains(selection.anchorNode)) {
         setSelectionMenu(null);
         return;
      }

      // Calculate position
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Instant update, no delay
      setSelectionMenu({
        x: rect.left + (rect.width / 2),
        y: rect.top + window.scrollY - 10, // Add scrollY to handle page scroll correctly
        text: text
      });
    };

    // Listen globally for mouseup to catch end of selection anywhere
    document.addEventListener('mouseup', handleMouseUp);
    // Listen for selection clear (e.g. clicking away)
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Auto-focus note textarea when panel opens
  useEffect(() => {
    if (isSidePanelOpen && activePanelTab === 'notes' && noteTextareaRef.current) {
        noteTextareaRef.current.focus();
        // Place cursor at end
        const len = noteTextareaRef.current.value.length;
        noteTextareaRef.current.setSelectionRange(len, len);
    }
  }, [isSidePanelOpen, activePanelTab]);

  const handlePostComment = () => {
    if (!id || !commentInput.trim()) return;
    addComment(id, commentInput, currentUser);
    setComments(getComments(id));
    setCommentInput('');
  };

  const handleReplySubmit = (commentId: string) => {
    if (!id || !replyInput[commentId]?.trim()) return;
    addReply(id, commentId, replyInput[commentId], currentUser);
    setComments(getComments(id));
    setReplyInput({ ...replyInput, [commentId]: '' });
    setActiveReplyId(null);
  };

  const handleLike = (commentId: string, replyId?: string) => {
    toggleCommentLike(commentId, replyId);
    if (id) setComments(getComments(id));
  };

  // --- AI & Note Handlers ---

  const sendMessageInternal = async (text: string) => {
    if (!isSidePanelOpen) setIsSidePanelOpen(true);
    setActivePanelTab('chat');
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    const contextPrompt = `
      Context: User is reading an article titled "${post?.title}".
      Article Content Excerpt: "${post?.summary}".
      User Question: ${text}
    `;

    let replyText = '';
    if (chatSessionRef.current) {
      replyText = await sendMessageToAI(chatSessionRef.current, contextPrompt);
    } else {
      replyText = "AI 服务连接中断。";
    }
    
    setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: replyText }]);
    setIsThinking(false);
  };

  const handleMenuExplain = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectionMenu || !selectionMenu.text) return;
    
    const textToExplain = selectionMenu.text;
    
    setIsSidePanelOpen(true);
    setActivePanelTab('chat');
    
    sendMessageInternal(`请解释这段话的含义：“${textToExplain}”`);
    
    setSelectionMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleMenuTakeNote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectionMenu || !selectionMenu.text) return;
    
    const textToQuote = selectionMenu.text;
    
    setIsSidePanelOpen(true);
    setActivePanelTab('notes');
    
    // Set the quote to state, separate from user input
    setCurrentQuote(textToQuote);
    
    setSelectionMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendMessageInternal(chatInput);
    setChatInput('');
  };

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    
    const newNote: Note = {
        id: Date.now().toString(),
        timestamp: 0,
        content: noteInput,
        quote: currentQuote || undefined
    };
    setNotes([newNote, ...notes]);

    if (post) {
        const adminNote: AdminNote = {
            id: Date.now().toString(),
            content: noteInput,
            quote: currentQuote || undefined,
            lessonTitle: post.title,
            timestampDisplay: '文章摘录',
            createdAt: new Date().toLocaleString('zh-CN'),
            userName: currentUser.name || 'Guest User',
            sourceType: 'article',
            sourceId: post.id
        };
        saveAdminNote(adminNote);
    }

    setNoteInput('');
    setCurrentQuote(null);
  };

  if (!post) {
    return (
      <div className="p-8 text-center">
        <p>文章未找到</p>
        <button onClick={() => navigate(AppRoute.BLOG)} className="text-blue-600 mt-4">返回列表</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full relative flex flex-col lg:flex-row overflow-hidden h-screen">
      
      {/* --- Text Selection Menu --- */}
      {selectionMenu && (
        <div 
          ref={menuRef}
          className="absolute z-50 bg-slate-900 text-white rounded-lg shadow-xl flex items-center p-1 gap-1 transform -translate-x-1/2 -translate-y-full animate-in zoom-in duration-150 origin-bottom"
          style={{ left: selectionMenu.x, top: selectionMenu.y }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} // Prevent menu click from clearing selection
        >
          <button 
            onClick={handleMenuExplain}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-700 rounded-md text-xs font-medium transition-colors"
          >
            <Sparkles size={14} className="text-blue-400" />
            AI 解释
          </button>
          <div className="w-px h-4 bg-slate-700"></div>
          <button 
            onClick={handleMenuTakeNote}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-700 rounded-md text-xs font-medium transition-colors"
          >
            <CheckSquare size={14} className="text-green-400" />
            记笔记
          </button>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
        </div>
      )}

      {/* --- Main Content Area --- */}
      <div className="flex-1 overflow-y-auto bg-white relative">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(AppRoute.BLOG)} className="text-slate-700 p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-medium text-slate-900 text-sm truncate max-w-[200px] opacity-0 md:opacity-100 transition-opacity">
                    {post.title}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                    className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-medium ${isSidePanelOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <BookOpen size={20} />
                    <span className="hidden md:inline">学习助手</span>
                </button>
                <button className="text-slate-600 p-2 hover:bg-slate-100 rounded-full">
                    <Share2 size={20} />
                </button>
            </div>
        </div>

        <div className="max-w-[680px] mx-auto px-6 py-8 pb-32">
            {/* Title Area */}
            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
                {post.title}
            </h1>

            {/* Meta Data */}
            <div className="flex items-center gap-4 text-sm mb-8 pb-8 border-b border-slate-100">
                <span className="font-bold text-slate-900">{post.author}</span>
                <span className="text-slate-400">{post.date}</span>
                <span className="text-slate-400 flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
            </div>

            {/* Content Body */}
            <div 
                ref={articleContentRef}
                id="article-content"
                className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 selection:bg-blue-100 selection:text-blue-900"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Footer Actions */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">
                        <ThumbsUp size={18} /> 赞
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
                <span className="text-sm text-slate-400">阅读 3256</span>
            </div>

            {/* Comments Section */}
            <div className="mt-16">
                <h3 className="font-bold text-xl text-slate-900 mb-6">精选评论 ({comments.length})</h3>
                
                {/* Comment Input */}
                <div className="flex gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                        <UserIcon className="w-full h-full p-2 text-slate-400" />
                    </div>
                    <div className="flex-1">
                        <div className="relative">
                            <textarea 
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="写下您的想法..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24 transition-all"
                            />
                            <button 
                                onClick={handlePostComment}
                                disabled={!commentInput.trim()}
                                className="absolute bottom-3 right-3 px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                发布
                            </button>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="space-y-8">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <img src={comment.userAvatar} alt={comment.userName} className="w-10 h-10 rounded-full bg-slate-100 object-cover" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-800 text-sm">{comment.userName}</span>
                                    <span className="text-xs text-slate-400">{comment.date}</span>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed mb-2">{comment.content}</p>
                                
                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                    <button 
                                        onClick={() => handleLike(comment.id)}
                                        className={`flex items-center gap-1 hover:text-blue-600 ${comment.isLiked ? 'text-blue-600' : ''}`}
                                    >
                                        <Heart size={14} className={comment.isLiked ? 'fill-current' : ''} />
                                        {comment.likes || '赞'}
                                    </button>
                                    <button 
                                        onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                        className="hover:text-blue-600 flex items-center gap-1"
                                    >
                                        <MessageSquare size={14} /> 回复
                                    </button>
                                </div>

                                {/* Reply Input */}
                                {activeReplyId === comment.id && (
                                    <div className="flex gap-3 mt-3 mb-4 animate-in fade-in slide-in-from-top-2">
                                        <input 
                                            type="text"
                                            value={replyInput[comment.id] || ''}
                                            onChange={(e) => setReplyInput({ ...replyInput, [comment.id]: e.target.value })}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`回复 ${comment.userName}...`}
                                        />
                                        <button 
                                            onClick={() => handleReplySubmit(comment.id)}
                                            className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
                                        >
                                            发送
                                        </button>
                                    </div>
                                )}

                                {/* Replies */}
                                {comment.replies.length > 0 && (
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-4 mt-2">
                                        {comment.replies.map(reply => (
                                            <div key={reply.id} className="flex gap-3">
                                                <img src={reply.userAvatar} className="w-6 h-6 rounded-full bg-slate-200" alt="" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className="font-bold text-slate-700 text-xs">{reply.userName}</span>
                                                    </div>
                                                    <p className="text-slate-600 text-xs leading-relaxed mb-1.5">
                                                        {reply.content}
                                                    </p>
                                                    <button 
                                                        onClick={() => handleLike(comment.id, reply.id)}
                                                        className={`text-[10px] flex items-center gap-1 hover:text-blue-600 ${reply.isLiked ? 'text-blue-600' : 'text-slate-400'}`}
                                                    >
                                                        <Heart size={10} className={reply.isLiked ? 'fill-current' : ''} />
                                                        {reply.likes || '赞'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE PANEL (Chat & Notes) --- */}
      <div 
         className={`fixed inset-y-0 right-0 w-full md:w-[380px] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
            isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'
         } lg:relative lg:transform-none lg:w-[380px] lg:border-l lg:shadow-none ${!isSidePanelOpen && 'lg:hidden'}`}
      >
         {/* Panel Header */}
         <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex gap-4">
                <button 
                    onClick={() => setActivePanelTab('chat')}
                    className={`text-sm font-bold pb-3 -mb-3.5 border-b-2 transition-colors ${activePanelTab === 'chat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                >
                    AI 助手
                </button>
                <button 
                    onClick={() => setActivePanelTab('notes')}
                    className={`text-sm font-bold pb-3 -mb-3.5 border-b-2 transition-colors ${activePanelTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
                >
                    我的笔记
                </button>
            </div>
            <button onClick={() => setIsSidePanelOpen(false)} className="p-1 hover:bg-slate-100 rounded lg:hidden">
                <X size={20} className="text-slate-500" />
            </button>
         </div>

         {/* Panel Content */}
         <div className="flex-1 overflow-hidden bg-slate-50/50 relative">
            
            {/* CHAT TAB */}
            {activePanelTab === 'chat' && (
                <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin text-blue-600" />
                                    <span className="text-xs text-slate-500">思考中...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-white border-t border-slate-200">
                        <div className="relative">
                            <input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                placeholder="关于这篇文章的疑问..."
                                className="w-full pl-4 pr-10 py-3 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none transition-all"
                            />
                            <button 
                                onClick={handleSendChat}
                                disabled={!chatInput.trim() || isThinking}
                                className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTES TAB */}
            {activePanelTab === 'notes' && (
                <div className="absolute inset-0 flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        {/* Display Active Quote */}
                        {currentQuote && (
                            <div className="mb-3 p-3 bg-slate-50 border-l-4 border-blue-500 rounded-r-lg relative group animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Quote size={12} className="text-blue-500 fill-current" />
                                    <span className="text-[10px] font-bold text-blue-600 uppercase">原文摘录</span>
                                </div>
                                <p className="text-xs text-slate-600 italic line-clamp-3">“{currentQuote}”</p>
                                <button 
                                    onClick={() => setCurrentQuote(null)}
                                    className="absolute top-1 right-1 p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                    title="移除引用"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}

                        <div className="relative">
                            <textarea
                                ref={noteTextareaRef}
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder={currentQuote ? "针对这段文字，您的想法是..." : "记录阅读心得..."}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none h-24"
                            />
                            <button
                                onClick={handleSaveNote}
                                disabled={!noteInput.trim()}
                                className="absolute bottom-2 right-2 px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {notes.length === 0 && (
                            <div className="text-center text-slate-400 mt-10">
                                <PenTool size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">暂无笔记</p>
                                <p className="text-xs mt-1">选中文本可快速添加引用</p>
                            </div>
                        )}
                        {notes.map((note) => (
                            <div key={note.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                {note.quote && (
                                    <div className="mb-3 pl-3 border-l-2 border-slate-200">
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <Quote size={10} className="text-slate-300 fill-current" />
                                            <span className="text-[10px] font-medium text-slate-400">原文</span>
                                        </div>
                                        <p className="text-xs text-slate-500 italic line-clamp-3">“{note.quote}”</p>
                                    </div>
                                )}
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default BlogDetail;