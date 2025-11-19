import React, { useState } from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, TrendingUp, TrendingDown, Bot, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { analyzePostSentiment } from '../services/geminiService';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ sentiment: string; risk: string; summary: string } | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

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

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-900">{post.user.name}</h3>
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

      {/* Content */}
      <div className="mb-3 text-slate-800 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map(tag => (
          <span key={tag} className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">#{tag}</span>
        ))}
      </div>

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
          <button className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors">
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments}</span>
          </button>
          <button className="flex items-center space-x-1.5 hover:text-green-500 transition-colors">
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
    </div>
  );
};
