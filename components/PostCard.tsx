
import React, { useState } from 'react';
import { Post, User, Comment } from '../types';
import { Heart, MessageCircle, Share2, TrendingUp, TrendingDown, Bot, AlertTriangle, Send, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { analyzePostSentiment } from '../services/geminiService';
import { StockChart } from './StockChart';

interface PostCardProps {
  post: Post;
  currentUser?: User;
  onUserClick?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onUserClick }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ sentiment: string; risk: string; summary: string } | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  
  // Comments State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.recentComments || []);
  const [newComment, setNewComment] = useState('');

  // Poll State
  const [pollData, setPollData] = useState(post.poll);

  const handleAnalyze = async () => {
    if (aiAnalysis) return;
    setAnalyzing(true);
    try {
      const result = await analyzePostSentiment(post.content);
      setAiAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    // Mock share
    alert(`Post shared to clipboard!`);
  };

  const handleVote = (optionId: string) => {
    if (!pollData || pollData.userVotedOptionId) return;

    const updatedOptions = pollData.options.map(opt =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );

    setPollData({
      ...pollData,
      options: updatedOptions,
      totalVotes: pollData.totalVotes + 1,
      userVotedOptionId: optionId
    });
  };

  const handlePostComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !currentUser) return;

      const comment: Comment = {
          id: Date.now().toString(),
          user: currentUser,
          content: newComment,
          timestamp: new Date()
      };

      setComments([...comments, comment]);
      setNewComment('');
  };

  // Extract ticker symbols like $INFY, $TCS
  const tickerRegex = /\$([A-Z0-9]+)/g;
  const tickers = [...post.content.matchAll(tickerRegex)].map(match => match[0]);
  // We will render a chart for the first ticker found in the post to keep it clean
  const primaryTicker = tickers.length > 0 ? tickers[0] : null;

  const renderContent = (content: string) => {
      // Regex to match $TICKER or #TAG or @MENTION
      const parts = content.split(/(\$[A-Z0-9]+|#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
      return parts.map((part, index) => {
          if (part.match(/^\$[A-Z0-9]+$/)) {
              return <span key={index} className="font-bold text-indigo-600 cursor-pointer hover:underline bg-indigo-50 px-1 rounded-sm">{part}</span>;
          }
          if (part.match(/^#[a-zA-Z0-9_]+$/)) {
              return <span key={index} className="text-blue-500 hover:underline cursor-pointer">{part}</span>;
          }
          if (part.match(/^@[a-zA-Z0-9_]+$/)) {
            return <span key={index} className="font-semibold text-slate-800 hover:text-indigo-600 cursor-pointer bg-slate-100 px-1 rounded-sm">{part}</span>;
          }
          return part;
      });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onUserClick?.(post.userId)}>
          <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 ring-indigo-100 transition-all" />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{post.user.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                post.user.reputation === 'Market Wizard' ? 'bg-purple-100 text-purple-700' :
                post.user.reputation === 'Guru' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {post.user.reputation}
              </span>
            </div>
            <p className="text-xs text-slate-500">@{post.user.handle} • {formatDistanceToNow(post.timestamp)} ago</p>
          </div>
        </div>
        {post.sentiment && (
          <span className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded ${
            post.sentiment === 'bullish' ? 'bg-green-50 text-green-600' :
            post.sentiment === 'bearish' ? 'bg-red-50 text-red-600' :
            'bg-slate-100 text-slate-600'
          }`}>
            {post.sentiment === 'bullish' ? <TrendingUp size={14} /> : post.sentiment === 'bearish' ? <TrendingDown size={14} /> : null}
            <span className="uppercase">{post.sentiment}</span>
          </span>
        )}
      </div>

      {/* Content with Highlighted Tickers */}
      <div className="mb-3 text-slate-800 whitespace-pre-wrap leading-relaxed">
        {renderContent(post.content)}
      </div>

      {/* Interactive Stock Chart Widget */}
      {primaryTicker && (
         <div className="mb-4 animate-fade-in">
            <StockChart symbol={primaryTicker} />
         </div>
      )}

      {/* Poll Widget */}
      {pollData && (
        <div className="mb-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
           <h4 className="font-bold text-slate-900 mb-3">{pollData.question}</h4>
           <div className="space-y-2">
             {pollData.options.map(option => {
                const percentage = pollData.totalVotes > 0 ? Math.round((option.votes / pollData.totalVotes) * 100) : 0;
                const isSelected = pollData.userVotedOptionId === option.id;
                const isVoted = !!pollData.userVotedOptionId;

                return (
                   <button
                      key={option.id}
                      disabled={isVoted}
                      onClick={() => handleVote(option.id)}
                      className="relative w-full text-left group focus:outline-none"
                   >
                      {/* Progress Bar Background */}
                      <div className={`absolute top-0 left-0 h-full rounded-lg transition-all duration-500 ${
                          isVoted 
                            ? (isSelected ? 'bg-indigo-100' : 'bg-slate-200/50')
                            : 'bg-transparent'
                          }`} 
                          style={{ width: isVoted ? `${percentage}%` : '0%' }}>
                      </div>

                      {/* Content */}
                      <div className={`relative z-10 px-4 py-2.5 border rounded-lg flex justify-between items-center transition-all
                          ${isVoted
                              ? (isSelected ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-600')
                              : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
                          }
                      `}>
                          <span className="font-medium text-sm">{option.text}</span>
                          {isVoted && <span className="text-sm font-bold">{percentage}%</span>}
                      </div>
                   </button>
                )
             })}
           </div>
           <div className="mt-3 text-xs text-slate-500 font-medium flex justify-between px-1">
              <span>{pollData.totalVotes} votes</span>
              <span>{pollData.userVotedOptionId ? 'Voting Closed' : 'Poll Open'}</span>
           </div>
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">#{tag}</span>
            ))}
          </div>
      )}

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <div className="mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-sm animate-fade-in">
          <div className="flex items-center space-x-2 text-indigo-800 font-semibold mb-1">
            <Bot size={16} />
            <span>Gemini Insight</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
             <div className="flex justify-between">
                <span className="text-slate-600">Sentiment:</span>
                <span className={`font-bold ${
                    aiAnalysis.sentiment === 'Bullish' ? 'text-green-600' : 
                    aiAnalysis.sentiment === 'Bearish' ? 'text-red-600' : 'text-slate-600'
                }`}>{aiAnalysis.sentiment}</span>
             </div>
             <div>
                <span className="text-slate-600 block mb-1">Summary:</span>
                <p className="text-slate-800 italic">"{aiAnalysis.summary}"</p>
             </div>
             <div className="mt-1 pt-2 border-t border-indigo-200">
                <div className="flex items-start space-x-1 text-amber-700">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{aiAnalysis.risk}</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-slate-500">
        <div className="flex space-x-6">
          <button 
            onClick={toggleLike}
            className={`flex items-center space-x-1.5 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center space-x-1.5 transition-colors ${showComments ? 'text-indigo-600' : 'hover:text-indigo-600'}`}
          >
            <MessageCircle size={18} />
            <span className="text-sm">{comments.length}</span>
          </button>
          <button onClick={handleShare} className="flex items-center space-x-1.5 hover:text-green-500 transition-colors">
            <Share2 size={18} />
          </button>
        </div>
        
        {!aiAnalysis && (
            <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex items-center space-x-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-200 transition-colors disabled:opacity-50"
            >
                <Bot size={14} />
                <span>{analyzing ? 'Analyzing...' : 'AI Analyze'}</span>
            </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
              <div className="space-y-4 mb-4">
                  {comments.map(comment => (
                      <div key={comment.id} className="flex space-x-3">
                          <img src={comment.user.avatar} className="w-8 h-8 rounded-full" alt={comment.user.name} />
                          <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none flex-1">
                              <div className="flex justify-between items-baseline mb-1">
                                  <span className="text-sm font-bold text-slate-900">{comment.user.name}</span>
                                  <span className="text-xs text-slate-500">{formatDistanceToNow(comment.timestamp, { addSuffix: true })}</span>
                              </div>
                              <p className="text-sm text-slate-700">{comment.content}</p>
                          </div>
                      </div>
                  ))}
                  {comments.length === 0 && <p className="text-center text-slate-500 text-sm py-2">No comments yet. Be the first!</p>}
              </div>

              {/* Add Comment */}
              <form onSubmit={handlePostComment} className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                  >
                      <Send size={16} />
                  </button>
              </form>
          </div>
      )}
    </div>
  );
};
