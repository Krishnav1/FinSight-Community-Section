
import React, { useState } from 'react';
import { Club } from '../types';
import { Users, ArrowRight, Search } from 'lucide-react';

const MOCK_CLUBS: Club[] = [
    { id: '1', name: 'F&O Snipers', description: 'Dedicated to Nifty & BankNifty option buying strategies.', members: 12500, icon: '🎯', category: 'Trading' },
    { id: '2', name: 'Value Investors', description: 'Finding hidden gems for 5+ year horizon. Fundamental analysis only.', members: 8400, icon: '💎', category: 'Investing' },
    { id: '3', name: 'IPO Watch', description: 'Analysis and GMP discussions for upcoming listings.', members: 23000, icon: '🔔', category: 'News' },
    { id: '4', name: 'Crypto Corner', description: 'Bitcoin, ETH and Altcoin technicals.', members: 5600, icon: '₿', category: 'Crypto' },
    { id: '5', name: 'Swing Kings', description: 'Weekly swing trading setups and chart patterns.', members: 9200, icon: '📈', category: 'Trading' },
    { id: '6', name: 'Dividend Yielders', description: 'Focus on high dividend paying PSU and private stocks.', members: 4100, icon: '💰', category: 'Investing' },
];

const CATEGORIES = ['All', 'Trading', 'Investing', 'News', 'Crypto'];

export const Clubs: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredClubs = MOCK_CLUBS.filter(club => {
        const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              club.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                    <div className="relative w-full md:w-1/2">
                        <input 
                            type="text" 
                            placeholder="Search clubs..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                                    selectedCategory === cat 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Clubs Grid */}
            {filteredClubs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {filteredClubs.map(club => (
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
            ) : (
                <div className="text-center py-12 text-slate-500">
                    <Users size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No clubs found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};
