import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';
import { Send, Zap, Users, Sparkles } from 'lucide-react';
import { summarizeChat } from '../services/geminiService';

const MOCK_CHAT_USERS: User[] = [
  { id: '2', name: 'Rahul Trader', handle: 'rahul_t', avatar: 'https://picsum.photos/40/40?random=2', xp: 1200, level: 12, badges: [], bio: '', followers: 0, following: 0, reputation: 'Analyst' },
  { id: '3', name: 'Priya Invests', handle: 'priya_i', avatar: 'https://picsum.photos/40/40?random=3', xp: 3400, level: 25, badges: [], bio: '', followers: 0, following: 0, reputation: 'Guru' },
  { id: '4', name: 'Nifty King', handle: 'nifty_k', avatar: 'https://picsum.photos/40/40?random=4', xp: 500, level: 5, badges: [], bio: '', followers: 0, following: 0, reputation: 'Novice' },
];

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', user: MOCK_CHAT_USERS[0], content: 'Bank Nifty facing resistance at 44500 levels. Watch out.', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: '2', user: MOCK_CHAT_USERS[1], content: 'Agree, huge call writing visible there.', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
  { id: '3', user: MOCK_CHAT_USERS[2], content: 'Anyone tracking Tata Motors today? Breakout soon?', timestamp: new Date(Date.now() - 1000 * 60 * 2) },
];

interface Props {
    currentUser: User;
}

export const MarketPeCharcha: React.FC<Props> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: currentUser,
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // Simulate a reply
    setTimeout(() => {
        const randomUser = MOCK_CHAT_USERS[Math.floor(Math.random() * MOCK_CHAT_USERS.length)];
        const reply: ChatMessage = {
            id: (Date.now() + 1).toString(),
            user: randomUser,
            content: "Valid point! Let's see how the 15min candle closes.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleSummarize = async () => {
      setLoadingSummary(true);
      const textLogs = messages.map(m => `${m.user.name}: ${m.content}`);
      const result = await summarizeChat(textLogs);
      setSummary(result);
      setLoadingSummary(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Zap className="text-yellow-400 fill-yellow-400 animate-pulse" size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </div>
          <h2 className="font-bold text-lg tracking-tight">Market pe Charcha</h2>
        </div>
        <div className="flex items-center space-x-3 text-sm text-slate-300">
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>1.2k Online</span>
          </div>
          <button 
            onClick={handleSummarize}
            disabled={loadingSummary}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 transition-colors disabled:opacity-50"
          >
            <Sparkles size={12} />
            <span>{loadingSummary ? 'Thinking...' : 'Catch Me Up'}</span>
          </button>
        </div>
      </div>

      {/* AI Summary Overlay */}
      {summary && (
          <div className="bg-indigo-50 border-b border-indigo-100 p-3 flex justify-between items-start animate-fade-in shrink-0">
              <div className="text-sm text-indigo-900">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-indigo-500 mb-1">AI Summary</h4>
                  <div className="whitespace-pre-line">{summary}</div>
              </div>
              <button onClick={() => setSummary(null)} className="text-indigo-400 hover:text-indigo-600">×</button>
          </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => {
          const isMe = msg.user.id === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <img src={msg.user.avatar} alt={msg.user.name} className="w-8 h-8 rounded-full mr-2 self-end mb-1" />
              )}
              <div className={`max-w-[80%] ${isMe ? 'order-1' : 'order-2'}`}>
                 {!isMe && <span className="text-xs text-slate-500 ml-1 mb-0.5 block">{msg.user.name}</span>}
                 <div className={`px-4 py-2 rounded-2xl text-sm ${
                   isMe 
                   ? 'bg-indigo-600 text-white rounded-br-none' 
                   : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                 }`}>
                   {msg.content}
                 </div>
                 <span className={`text-[10px] text-slate-400 mt-1 block ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Share your market view..."
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
          />
          <button 
            type="submit" 
            className={`p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!inputValue.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
