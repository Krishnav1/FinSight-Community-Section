import React, { useState, useRef } from 'react';
import { Post, User, View } from './types';
import { PostCard } from './components/PostCard';
import { MarketPeCharcha } from './components/MarketPeCharcha';
import { GamificationSidebar } from './components/Gamification.tsx';
import { Clubs } from './components/Clubs';
import { 
  LayoutGrid, 
  MessageSquare, 
  Users as UsersIcon, 
  Bell, 
  Search, 
  Menu, 
  PlusCircle,
  Home,
  TrendingUp
} from 'lucide-react';

// Mock Current User
const CURRENT_USER: User = {
  id: '1',
  name: 'Arjun Mehta',
  handle: 'arjun_m',
  avatar: 'https://picsum.photos/200/200?random=1',
  xp: 4250,
  level: 14,
  badges: ['Early Adopter', 'Bull Run'],
  bio: 'Swing trader focused on mid-caps.',
  followers: 142,
  following: 89,
  reputation: 'Analyst'
};

// Consolidated User List for Mentions
const ALL_USERS: User[] = [
  CURRENT_USER,
  { id: '2', name: 'Rahul Trader', handle: 'rahul_t', avatar: 'https://picsum.photos/40/40?random=2', xp: 1200, level: 12, badges: [], bio: '', followers: 0, following: 0, reputation: 'Analyst' },
  { id: '3', name: 'Priya Invests', handle: 'priya_i', avatar: 'https://picsum.photos/40/40?random=3', xp: 3400, level: 25, badges: [], bio: '', followers: 0, following: 0, reputation: 'Guru' },
  { id: '4', name: 'Nifty King', handle: 'nifty_k', avatar: 'https://picsum.photos/40/40?random=4', xp: 500, level: 5, badges: [], bio: '', followers: 0, following: 0, reputation: 'Novice' },
  { id: '5', name: 'Stock Wizard', handle: 'stock_wiz', avatar: 'https://picsum.photos/40/40?random=5', xp: 8000, level: 40, badges: [], bio: '', followers: 0, following: 0, reputation: 'Market Wizard' },
  { id: '6', name: 'Crypto Queen', handle: 'crypto_q', avatar: 'https://picsum.photos/40/40?random=6', xp: 4500, level: 18, badges: [], bio: '', followers: 0, following: 0, reputation: 'Analyst' },
];

// Mock Posts
const MOCK_POSTS: Post[] = [
  {
    id: '101',
    userId: '2',
    user: ALL_USERS[1],
    content: 'The IT sector looks oversold on the weekly timeframe. RSI divergence is clear on $INFY and $TCS. I am initiating long positions here with a 2-month view. What do you guys think?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 45,
    comments: 12,
    tags: ['INFY', 'TCS', 'TechnicalAnalysis'],
    type: 'view',
    sentiment: 'bullish'
  },
  {
    id: '102',
    userId: '3',
    user: ALL_USERS[2],
    content: 'Be careful with small caps right now. Valuations are stretched and the liquidity could dry up fast if the global cues turn negative. Holding 30% cash in my portfolio.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likes: 120,
    comments: 34,
    tags: ['MarketOutlook', 'RiskManagement'],
    type: 'view',
    sentiment: 'bearish'
  }
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.FEED);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  
  // Post Creation State
  const [postContent, setPostContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setPostContent(val);
    setCursorPos(pos);

    const textBeforeCursor = val.slice(0, pos);
    // Check for @mention pattern: space or start of line followed by @ and optional chars
    const match = textBeforeCursor.match(/(?:\s|^)@(\w*)$/);

    if (match) {
        setMentionQuery(match[1]);
        setShowMentions(true);
    } else {
        setShowMentions(false);
    }
  };

  const insertMention = (user: User) => {
    const textBeforeCursor = postContent.slice(0, cursorPos);
    // Find the last @ which triggered the menu
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    const prefix = textBeforeCursor.slice(0, lastAtPos);
    const suffix = postContent.slice(cursorPos);
    
    const newText = `${prefix}@${user.handle} ${suffix}`;
    setPostContent(newText);
    setShowMentions(false);
    
    // Refocus and ensure cursor is at the end of the inserted mention
    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            // We could optionally place cursor, but default focus behavior is usually fine
        }
    }, 0);
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) return;
    
    const newPost: Post = {
        id: Date.now().toString(),
        userId: CURRENT_USER.id,
        user: CURRENT_USER,
        content: postContent,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        tags: [],
        type: 'view'
    };
    setPosts([newPost, ...posts]);
    setPostContent('');
  };

  const filteredUsers = ALL_USERS.filter(u => 
    u.handle.toLowerCase().includes(mentionQuery.toLowerCase()) || 
    u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Navigation Item Component
  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button 
      onClick={() => setActiveView(view)}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
        activeView === view 
        ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2 font-bold text-xl text-indigo-600">
           <LayoutGrid size={24} />
           <span>InvestMate</span>
        </div>
        <img src={CURRENT_USER.avatar} className="w-8 h-8 rounded-full" />
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 p-4 z-40">
        <div className="flex items-center space-x-2 font-bold text-2xl text-indigo-600 mb-8 px-4">
           <LayoutGrid className="fill-indigo-600" size={28} />
           <span>InvestMate</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem view={View.FEED} icon={Home} label="Community Feed" />
          <NavItem view={View.CHARCHA} icon={MessageSquare} label="Market pe Charcha" />
          <NavItem view={View.CLUBS} icon={UsersIcon} label="Clubs" />
          <NavItem view={View.LEADERBOARD} icon={TrendingUp} label="Leaderboard" />
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100">
           <button className="flex items-center space-x-3 w-full px-4 py-3 text-slate-500 hover:text-slate-900">
             <Bell size={20} />
             <span>Notifications</span>
             <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-auto">3</span>
           </button>
           <div className="flex items-center space-x-3 px-4 py-3 mt-2">
             <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full" />
             <div className="text-sm">
               <p className="font-semibold text-slate-900">{CURRENT_USER.name}</p>
               <p className="text-slate-500 text-xs">Level {CURRENT_USER.level}</p>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-hidden bg-slate-50">
        <div className="max-w-5xl mx-auto h-full flex flex-col md:flex-row">
          
          {/* Center Feed/Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6">
            
            {/* Top Bar (Search) */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                {activeView === View.FEED && 'My Feed'}
                {activeView === View.CHARCHA && 'Live Discussion'}
                {activeView === View.CLUBS && 'Explore Clubs'}
                {activeView === View.LEADERBOARD && 'Top Traders'}
              </h1>
              <div className="relative w-64">
                <input 
                  type="text" 
                  placeholder="Search stocks, users..." 
                  className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="animate-fade-in">
              
              {activeView === View.FEED && (
                <>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex space-x-3 relative">
                    <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 relative">
                      <textarea 
                        ref={textareaRef}
                        value={postContent}
                        onChange={handlePostChange}
                        placeholder="What's on your mind? Type @ to mention..." 
                        className="w-full bg-slate-50 rounded-lg px-4 py-2 text-sm border border-slate-200 focus:outline-none mb-2 resize-none font-sans"
                        rows={3}
                      />
                      
                      {/* Autocomplete Dropdown */}
                      {showMentions && filteredUsers.length > 0 && (
                        <div className="absolute top-[calc(100%-50px)] left-0 z-20 w-64 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {filteredUsers.map(user => (
                                <button 
                                    key={user.id}
                                    onClick={() => insertMention(user)}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center space-x-2 border-b border-slate-50 last:border-none transition-colors"
                                >
                                    <img src={user.avatar} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                        <p className="text-xs text-slate-500">@{user.handle}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                      )}

                      <div className="flex justify-end">
                         <button 
                            onClick={handleCreatePost}
                            disabled={!postContent.trim()}
                            className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                         >
                            <PlusCircle size={16} />
                            <span>Post</span>
                         </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {posts.map(post => <PostCard key={post.id} post={post} />)}
                  </div>
                </>
              )}

              {activeView === View.CHARCHA && <MarketPeCharcha currentUser={CURRENT_USER} />}
              
              {activeView === View.CLUBS && <Clubs />}

              {activeView === View.LEADERBOARD && (
                 <div className="md:hidden">
                    <GamificationSidebar user={CURRENT_USER} />
                 </div>
              )}

            </div>
          </div>

          {/* Right Sidebar (Desktop Only - Gamification) */}
          <div className="hidden lg:block w-80 p-6 border-l border-slate-200 bg-slate-50/50 h-[calc(100vh-0rem)] overflow-y-auto sticky top-0">
             <GamificationSidebar user={CURRENT_USER} />
             
             {/* Trending Stocks Micro-widget */}
             <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Trending Stocks</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">TATASTEEL</span>
                        <span className="text-green-600 text-sm font-bold">+2.4%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">HDFCBANK</span>
                        <span className="text-red-600 text-sm font-bold">-1.1%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">RELIANCE</span>
                        <span className="text-green-600 text-sm font-bold">+0.5%</span>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
          <button onClick={() => setActiveView(View.FEED)} className={`${activeView === View.FEED ? 'text-indigo-600' : 'text-slate-400'}`}><Home size={24} /></button>
          <button onClick={() => setActiveView(View.CHARCHA)} className={`${activeView === View.CHARCHA ? 'text-indigo-600' : 'text-slate-400'}`}><MessageSquare size={24} /></button>
          <button onClick={() => setActiveView(View.CLUBS)} className={`${activeView === View.CLUBS ? 'text-indigo-600' : 'text-slate-400'}`}><UsersIcon size={24} /></button>
          <button onClick={() => setActiveView(View.LEADERBOARD)} className={`${activeView === View.LEADERBOARD ? 'text-indigo-600' : 'text-slate-400'}`}><TrendingUp size={24} /></button>
      </div>

    </div>
  );
};

export default App;