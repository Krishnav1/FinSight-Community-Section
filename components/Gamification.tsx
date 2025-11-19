import React from 'react';
import { User } from '../types';
import { Trophy, Award, Flame, TrendingUp, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ACTIVITY_DATA = [
  { day: 'Mon', xp: 120 },
  { day: 'Tue', xp: 250 },
  { day: 'Wed', xp: 180 },
  { day: 'Thu', xp: 300 },
  { day: 'Fri', xp: 210 },
  { day: 'Sat', xp: 90 },
  { day: 'Sun', xp: 150 },
];

interface Props {
    user: User;
}

export const GamificationSidebar: React.FC<Props> = ({ user }) => {
  return (
    <div className="space-y-6">
        {/* User Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                <div className="flex items-center space-x-3 mb-4">
                    <img src={user.avatar} className="w-14 h-14 rounded-full border-2 border-white/30" />
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{user.name}</h3>
                        <div className="flex items-center space-x-1 text-indigo-100 text-sm">
                            <Shield size={14} />
                            <span>{user.reputation}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-wider opacity-90">
                        <span>Level {user.level}</span>
                        <span>{user.xp} / {user.level * 1000} XP</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(user.xp % 1000) / 10}%` }}></div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-amber-500 flex justify-center mb-1"><Flame size={20} /></div>
                    <div className="font-bold text-xl text-slate-800">12</div>
                    <div className="text-xs text-slate-500">Day Streak</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-purple-500 flex justify-center mb-1"><Trophy size={20} /></div>
                    <div className="font-bold text-xl text-slate-800">Top 5%</div>
                    <div className="text-xs text-slate-500">Weekly Rank</div>
                </div>
            </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <TrendingUp size={18} className="text-indigo-600" />
                <span>XP Activity</span>
            </h4>
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ACTIVITY_DATA}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
                            {ACTIVITY_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.xp > 200 ? '#4f46e5' : '#cbd5e1'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                <span>Top Contributors</span>
                <span className="text-xs text-indigo-600 font-medium cursor-pointer">View All</span>
            </h4>
            <div className="space-y-3">
                {[1, 2, 3].map((rank) => (
                    <div key={rank} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold 
                                ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                                  rank === 2 ? 'bg-slate-100 text-slate-600' : 
                                  'bg-orange-50 text-orange-700'}`}>
                                {rank}
                            </span>
                            <img src={`https://picsum.photos/30/30?random=${rank+10}`} className="w-8 h-8 rounded-full" />
                            <div className="text-sm">
                                <p className="font-semibold text-slate-800">Trader_{rank}</p>
                                <p className="text-xs text-slate-500">Level {20-rank}</p>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400">{5000 - (rank*200)} XP</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
