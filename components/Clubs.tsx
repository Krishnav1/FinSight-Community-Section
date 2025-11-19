import React from 'react';
import { Club } from '../types';
import { Users, ArrowRight } from 'lucide-react';

const MOCK_CLUBS: Club[] = [
    { id: '1', name: 'F&O Snipers', description: 'Dedicated to Nifty & BankNifty option buying strategies.', members: 12500, icon: '🎯', category: 'Trading' },
    { id: '2', name: 'Value Investors', description: 'Finding hidden gems for 5+ year horizon. Fundamental analysis only.', members: 8400, icon: '💎', category: 'Investing' },
    { id: '3', name: 'IPO Watch', description: 'Analysis and GMP discussions for upcoming listings.', members: 23000, icon: '🔔', category: 'News' },
    { id: '4', name: 'Crypto Corner', description: 'Bitcoin, ETH and Altcoin technicals.', members: 5600, icon: '₿', category: 'Crypto' },
];

export const Clubs: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_CLUBS.map(club => (
                <div key={club.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg text-2xl flex items-center justify-center border border-slate-100">
                            {club.icon}
                        </div>
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                            {club.category}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{club.name}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{club.description}</p>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-400 space-x-1">
                            <Users size={14} />
                            <span>{(club.members / 1000).toFixed(1)}k Members</span>
                        </div>
                        <button className="flex items-center space-x-1 text-indigo-600 font-medium text-xs uppercase tracking-wide hover:underline">
                            <span>Join Club</span>
                            <ArrowRight size={12} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
