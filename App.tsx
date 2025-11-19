
import React, { useState, useRef, useEffect } from 'react';
import { Post, User, View, Poll, PollOption, Comment } from './types';
import { PostCard } from './components/PostCard';
import { MarketPeCharcha } from './components/MarketPeCharcha';
import { GamificationSidebar } from './components/Gamification.tsx';
import { Clubs } from './components/Clubs';
import { Profile } from './components/Profile';
import { 
  LayoutGrid, 
  MessageSquare, 
  Users as UsersIcon, 
  Bell, 
  Search, 
  PlusCircle,
  Home,
  TrendingUp,
  BarChart2,
  X,
  Plus,
  Image as ImageIcon,
  Hash,
  LineChart
} from 'lucide-react';

// Initial Mock Current User
const INITIAL_USER: User = {
  id: '1',
  name: 'Arjun Mehta',
  handle: 'arjun_m',
  avatar: 'https://picsum.photos/200/200?random=1',
  xp: 4250,
  level: 14,
  badges: ['Early Adopter', 'Bull Run', 'Chartist'],
  bio: 'Swing trader focused on mid-caps. Identifying breakout patterns before they happen. NISM Certified.',
  followers: 142,
  following: 89,
  reputation: 'Analyst',
  location: 'Mumbai, IN',
  website: 'https://arjuntrades.com'
};

// Consolidated User List for Mentions
const ALL_USERS: User[] = [
  INITIAL_USER,
  { id: '2', name: 'Rahul Trader', handle: 'rahul_t', avatar: 'https://picsum.photos/40/40?random=2', xp: 1200, level: 12, badges: ['Sniper'], bio: 'Day trader. Nifty & BankNifty options.', followers: 450, following: 120, reputation: 'Analyst', location: 'Delhi, IN' },
  { id: '3', name: 'Priya Invests', handle: 'priya_i', avatar: 'https://picsum.photos/40/40?random=3', xp: 3400, level: 25, badges: ['Fundamentalist', 'HODL'], bio: 'Long term value investing. Coffee can portfolio.', followers: 1200, following: 45, reputation: 'Guru', location: 'Bangalore, IN' },
  { id: '4', name: 'Nifty King', handle: 'nifty_k', avatar: 'https://picsum.photos/40/40?random=4', xp: 500, level: 5, badges: [], bio: 'Just starting out.', followers: 20, following: 200, reputation: 'Novice' },
  { id: '5', name: 'Stock Wizard', handle: 'stock_wiz', avatar: 'https://picsum.photos/40/40?random=5', xp: 8000, level: 40, badges: ['Legend', '100x Club'], bio: 'Veteran trader with 15 years of experience.', followers: 50000, following: 10, reputation: 'Market Wizard', website: 'https://stockwiz.com' },
  { id: '6', name: 'Crypto Queen', handle: 'crypto_q', avatar: 'https://picsum.photos/40/40?random=6', xp: 4500, level: 18, badges: ['Diamond Hands'], bio: 'Web3 enthusiast.', followers: 3400, following: 400, reputation: 'Analyst' },
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
    sentiment: 'bullish',
    recentComments: [
        { id: 'c1', user: ALL_USERS[2], content: 'Agree with TCS, but INFY guidance was weak.', timestamp: new Date(Date.now() - 1000 * 60 * 50) },
        { id: 'c2', user: ALL_USERS[0], content: 'Waiting for a daily close above 1400 before entry.', timestamp: new Date(Date.now() - 1000 * 60 * 10) }
    ]
  },
  {
    id: '102',
    userId: '3',
    user: ALL_USERS[2],
    content: 'Be careful with small caps right now. Valuations are stretched for $ADANIENT and the liquidity could dry up fast if the global cues turn negative. Holding 30% cash in my portfolio.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likes: 120,
    comments: 34,
    tags: ['MarketOutlook', 'RiskManagement'],
    type: 'view',
    sentiment: 'bearish',
    recentComments: []
  },
  {
    id: '103',
    userId: '5',
    user: ALL_USERS[3],
    content: 'With the Fed meeting coming up, what is your expectation for the market reaction next week?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    likes: 230,
    comments: 85,
    tags: ['FedMeet', 'Poll'],
    type: 'view',
    sentiment: 'neutral',
    poll: {
        question: "What will the market do after the Fed meeting?",
        options: [
            { id: 'opt1', text: 'Rally (Bullish)', votes: 145 },
            { id: 'opt2', text: 'Crash (Bearish)', votes: 42 },
            { id: 'opt3', text: 'Sideways / No Change', votes: 43 }
        ],
        totalVotes: 230,
        userVotedOptionId: null
    },
    recentComments: [
        { id: 'c3', user: ALL_USERS[1], content: 'Priced in already.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) }
    ]
  }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [activeView, setActiveView] = useState<View>(View.FEED);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  
  // Post Creation State
  const [postContent, setPostContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Poll Creation State
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const handleUserClick = (userId: string) => {
      setViewProfileId(userId);
      setActiveView(View.PROFILE);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileUpdate = (updatedUser: User) => {
      setCurrentUser(updatedUser);
  };

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
        setMentionIndex(0); // Reset selection index on new query
    } else {
        setShowMentions(false);
    }
  };

  // Helper to get filtered users based on query
  const filteredUsers = ALL_USERS.filter(u => 
    u.handle.toLowerCase().includes(mentionQuery.toLowerCase()) || 
    u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const insertMention = (user: User) => {
    const textBeforeCursor = postContent.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    const prefix = textBeforeCursor.slice(0, lastAtPos);
    const suffix = postContent.slice(cursorPos);
    
    const newText = `${prefix}@${user.handle} ${suffix}`;
    setPostContent(newText);
    setShowMentions(false);
    
    // Calculate new cursor position
    const newCursorPos = prefix.length + user.handle.length + 2; // +2 for @ and space
    
    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filteredUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(filteredUsers[mentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    }
  };

  const insertTag = () => {
      const newText = postContent + " #";
      setPostContent(newText);
      if (textareaRef.current) {
          textareaRef.current.focus();
      }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
        setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
        setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const togglePollMode = () => {
    if (isPollMode) {
        setIsPollMode(false);
        setPollQuestion('');
        setPollOptions(['', '']);
    } else {
        setIsPollMode(true);
    }
  };

  const handleCreatePost = () => {
    if (!postContent.trim() && !pollQuestion.trim()) return;
    
    let newPoll: Poll | undefined = undefined;

    if (isPollMode && pollQuestion.trim()) {
        // Validate poll
        const validOptions = pollOptions.filter(o => o.trim().length > 0);
        if (validOptions.length < 2) return; 

        newPoll = {
            question: pollQuestion,
            options: validOptions.map((opt, idx) => ({
                id: `opt_${Date.now()}_${idx}`,
                text: opt,
                votes: 0
            })),
            totalVotes: 0,
            userVotedOptionId: null
        };
    }

    // Extract hashtags automatically
    const tagRegex = /#(\w+)/g;
    const extractedTags = [...postContent.matchAll(tagRegex)].map(m => m[1]);
    const finalTags = newPoll ? [...extractedTags, 'Poll'] : extractedTags;

    const newPost: Post = {
        id: Date.now().toString(),
        userId: currentUser.id,
        user: currentUser,
        content: postContent,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        tags: finalTags,
        type: 'view',
        poll: newPoll,
        recentComments: []
    };
    setPosts([newPost, ...posts]);
    setPostContent('');
    setIsPollMode(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const getUserForProfile = () => {
      if (!viewProfileId) return currentUser;
      if (viewProfileId === currentUser.id) return currentUser;
      return ALL_USERS.find(u => u.id === viewProfileId) || currentUser;
  };

  const getPostsForProfile = () => {
      const uid = viewProfileId || currentUser.id;
      return posts.filter(p => p.userId === uid);
  };

  // Navigation Item Component
  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button 
      onClick={() => { setActiveView(view); if (view === View.PROFILE) setViewProfileId(currentUser.id); }}
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
        <img 
            src={currentUser.avatar} 
            className="w-8 h-8 rounded-full cursor-pointer" 
            onClick={() => handleUserClick(currentUser.id)} 
        />
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
          <button 
            onClick={() => handleUserClick(currentUser.id)}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === View.PROFILE && viewProfileId === currentUser.id
                ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            >
            <div className="w-5 h-5 flex justify-center items-center"><UsersIcon size={20}/></div>
            <span>My Profile</span>
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100">
           <button className="flex items-center space-x-3 w-full px-4 py-3 text-slate-500 hover:text-slate-900">
             <Bell size={20} />
             <span>Notifications</span>
             <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-auto">3</span>
           </button>
           <div className="flex items-center space-x-3 px-4 py-3 mt-2 cursor-pointer hover:bg-slate-50 rounded-lg" onClick={() => handleUserClick(currentUser.id)}>
             <img src={currentUser.avatar} className="w-10 h-10 rounded-full" />
             <div className="text-sm">
               <p className="font-semibold text-slate-900">{currentUser.name}</p>
               <p className="text-slate-500 text-xs">Level {currentUser.level}</p>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-hidden bg-slate-50">
        <div className="max-w-5xl mx-auto h-full flex flex-col md:flex-row">
          
          {/* Center Feed/Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6 scrollbar-hide">
            
            {/* Top Bar (Search) */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                {activeView === View.FEED && 'My Feed'}
                {activeView === View.CHARCHA && 'Live Discussion'}
                {activeView === View.CLUBS && 'Explore Clubs'}
                {activeView === View.LEADERBOARD && 'Top Traders'}
                {activeView === View.PROFILE && 'Profile'}
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
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 relative z-30">
                    <div className="flex space-x-3">
                        <img src={currentUser.avatar} className="w-10 h-10 rounded-full" />
                        <div className="flex-1 relative">
                        <textarea 
                            ref={textareaRef}
                            value={postContent}
                            onChange={handlePostChange}
                            onKeyDown={handleKeyDown}
                            placeholder="What's on your mind? Use $TICKER for charts, @ for mentions..." 
                            className="w-full bg-slate-50 rounded-lg px-4 py-3 text-sm border border-slate-200 focus:outline-none mb-2 resize-none font-sans focus:ring-2 focus:ring-indigo-100 transition-all"
                            rows={3}
                        />
                        
                        {/* Autocomplete Dropdown */}
                        {showMentions && filteredUsers.length > 0 && (
                            <div className="absolute top-[calc(100%-10px)] left-0 z-50 w-72 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-fade-in">
                                {filteredUsers.map((user, idx) => (
                                    <button 
                                        key={user.id}
                                        onClick={() => insertMention(user)}
                                        className={`w-full text-left px-4 py-3 flex items-center justify-between border-b border-slate-50 last:border-none transition-colors group
                                            ${idx === mentionIndex ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-100' : 'hover:bg-indigo-50'}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <img src={user.avatar} className="w-9 h-9 rounded-full border border-slate-200" />
                                            <div>
                                                <p className={`text-sm font-bold group-hover:text-indigo-700 ${idx === mentionIndex ? 'text-indigo-700' : 'text-slate-900'}`}>{user.name}</p>
                                                <p className="text-xs text-slate-500">@{user.handle}</p>
                                            </div>
                                        </div>
                                        <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                                            user.reputation === 'Market Wizard' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                            user.reputation === 'Guru' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                            {user.reputation}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Poll Creation UI */}
                    {isPollMode && (
                        <div className="ml-12 mb-3 bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fade-in">
                             <div className="flex justify-between items-center mb-3">
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                    <BarChart2 size={14}/> Poll Details
                                 </span>
                                 <button onClick={togglePollMode} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                             </div>
                             <input 
                                type="text" 
                                placeholder="Ask a question..." 
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 mb-3"
                             />
                             <div className="space-y-2">
                                 {pollOptions.map((opt, idx) => (
                                     <div key={idx} className="flex items-center space-x-2">
                                         <input 
                                            type="text" 
                                            placeholder={`Option ${idx + 1}`} 
                                            value={opt}
                                            onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                                            className="flex-1 bg-white border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                                         />
                                         {pollOptions.length > 2 && (
                                            <button onClick={() => removePollOption(idx)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                         )}
                                     </div>
                                 ))}
                             </div>
                             {pollOptions.length < 4 && (
                                 <button onClick={addPollOption} className="mt-2 text-xs text-indigo-600 font-medium flex items-center space-x-1 hover:underline">
                                     <Plus size={12} />
                                     <span>Add Option</span>
                                 </button>
                             )}
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex justify-between items-center pl-12 pt-2 border-t border-slate-100">
                        <div className="flex space-x-2 mt-2">
                             <button 
                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-full transition-colors"
                                title="Add Image (Mock)"
                             >
                                <ImageIcon size={20} />
                             </button>
                             <button 
                                onClick={togglePollMode}
                                className={`p-2 rounded-full transition-colors ${isPollMode ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'}`}
                                title="Create Poll"
                             >
                                <BarChart2 size={20} />
                             </button>
                             <button 
                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-full transition-colors"
                                title="Add Chart (Use $TICKER)"
                             >
                                <LineChart size={20} />
                             </button>
                             <button 
                                onClick={insertTag}
                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 rounded-full transition-colors"
                                title="Add Hashtag"
                             >
                                <Hash size={20} />
                             </button>
                        </div>
                        <button 
                            onClick={handleCreatePost}
                            disabled={(!postContent.trim() && !pollQuestion.trim()) || (isPollMode && !pollQuestion.trim())}
                            className="mt-2 bg-indigo-600 text-white text-sm font-medium px-6 py-2 rounded-full flex items-center space-x-1 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
                        >
                            <PlusCircle size={16} />
                            <span>Post</span>
                        </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {posts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={currentUser}
                            onUserClick={handleUserClick} 
                        />
                    ))}
                  </div>
                </>
              )}

              {activeView === View.CHARCHA && <MarketPeCharcha currentUser={currentUser} />}
              
              {activeView === View.CLUBS && <Clubs />}

              {activeView === View.LEADERBOARD && (
                 <div className="md:hidden">
                    <GamificationSidebar user={currentUser} />
                 </div>
              )}

              {activeView === View.PROFILE && (
                  <Profile 
                    user={getUserForProfile()} 
                    posts={getPostsForProfile()}
                    currentUser={currentUser}
                    onBack={() => setActiveView(View.FEED)}
                    onUpdateProfile={handleProfileUpdate}
                  />
              )}

            </div>
          </div>

          {/* Right Sidebar (Desktop Only - Gamification) */}
          <div className="hidden lg:block w-80 p-6 border-l border-slate-200 bg-slate-50/50 h-[calc(100vh-0rem)] overflow-y-auto sticky top-0">
             <GamificationSidebar user={currentUser} />
             
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
