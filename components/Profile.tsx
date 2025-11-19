
import React, { useState, useEffect } from 'react';
import { User, Post } from '../types';
import { PostCard } from './PostCard';
import { ArrowLeft, MapPin, Link as LinkIcon, Calendar, Shield, Trophy, Users, Pencil, Check, X } from 'lucide-react';

interface ProfileProps {
    user: User;
    posts: Post[];
    currentUser?: User;
    onBack: () => void;
    onUpdateProfile?: (updatedUser: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, posts, currentUser, onBack, onUpdateProfile }) => {
    const isOwnProfile = currentUser?.id === user.id;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        bio: user.bio,
        location: user.location || '',
        website: user.website || ''
    });

    useEffect(() => {
        setFormData({
            name: user.name,
            bio: user.bio,
            location: user.location || '',
            website: user.website || ''
        });
    }, [user]);

    const handleSave = () => {
        if (onUpdateProfile) {
            onUpdateProfile({
                ...user,
                name: formData.name,
                bio: formData.bio,
                location: formData.location,
                website: formData.website
            });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user.name,
            bio: user.bio,
            location: user.location || '',
            website: user.website || ''
        });
        setIsEditing(false);
    };

    const handleStatClick = (type: 'followers' | 'following') => {
        alert(`View ${type} list for ${user.name} (Feature coming soon)`);
    };

    return (
        <div className="animate-fade-in">
            {/* Navigation */}
            <button 
                onClick={onBack}
                className="mb-4 flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
            >
                <ArrowLeft size={16} />
                <span>Back to Feed</span>
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
                
                <div className="px-6 pb-6 relative">
                    {/* Avatar & Actions */}
                    <div className="flex justify-between items-end -mt-10 mb-4">
                        <div className="relative">
                            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
                            <div className="absolute bottom-1 right-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                                Lvl {user.level}
                            </div>
                        </div>
                        
                        <div className="flex space-x-2 mb-2">
                            {isOwnProfile ? (
                                isEditing ? (
                                    <>
                                        <button 
                                            onClick={handleSave}
                                            className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Check size={16} />
                                            <span>Save</span>
                                        </button>
                                        <button 
                                            onClick={handleCancel}
                                            className="flex items-center space-x-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <X size={16} />
                                            <span>Cancel</span>
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <Pencil size={16} />
                                        <span>Edit Profile</span>
                                    </button>
                                )
                            ) : (
                                <>
                                    <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                                        Follow
                                    </button>
                                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                                        Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            {isEditing ? (
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="text-2xl font-bold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-md"
                                />
                            ) : (
                                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                            )}
                            
                            {!isEditing && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                                    user.reputation === 'Market Wizard' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                    user.reputation === 'Guru' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-slate-50 text-slate-600 border-slate-100'
                                }`}>
                                    <div className="flex items-center space-x-1">
                                        <Shield size={10} />
                                        <span>{user.reputation}</span>
                                    </div>
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm font-medium mb-3">@{user.handle}</p>
                        
                        {isEditing ? (
                            <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-2 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                                rows={3}
                                placeholder="Tell us about your investment style..."
                            />
                        ) : (
                            <p className="text-slate-700 leading-relaxed max-w-2xl mb-4">
                                {user.bio || "No bio available."}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-500 mb-6">
                            <div className="flex items-center space-x-1.5">
                                <MapPin size={14} />
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        placeholder="Location"
                                        className="border border-slate-300 rounded px-2 py-0.5 text-xs w-32"
                                    />
                                ) : (
                                    <span>{user.location || "Global"}</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <LinkIcon size={14} />
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                                        placeholder="Website URL"
                                        className="border border-slate-300 rounded px-2 py-0.5 text-xs w-48"
                                    />
                                ) : (
                                    <a href={user.website || "#"} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline">
                                        {user.website ? user.website.replace(/^https?:\/\//, '') : `investmate.in/${user.handle}`}
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <Calendar size={14} />
                                <span>Joined March 2023</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                             <div 
                                onClick={() => handleStatClick('followers')}
                                className="p-2 -m-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                             >
                                 <div className="text-2xl font-bold text-slate-900">{user.followers}</div>
                                 <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Followers</div>
                             </div>
                             <div
                                onClick={() => handleStatClick('following')}
                                className="p-2 -m-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                             >
                                 <div className="text-2xl font-bold text-slate-900">{user.following}</div>
                                 <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Following</div>
                             </div>
                             <div className="p-2 -m-2">
                                 <div className="text-2xl font-bold text-slate-900">{user.xp.toLocaleString()}</div>
                                 <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total XP</div>
                             </div>
                             <div className="p-2 -m-2">
                                 <div className="text-2xl font-bold text-slate-900">{posts.length}</div>
                                 <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Posts</div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Badges & Achievements */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
                            <Trophy size={18} className="text-amber-500" />
                            <span>Badges & Achievements</span>
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {user.badges && user.badges.length > 0 ? user.badges.map((badge, i) => (
                                <div key={i} className="aspect-square bg-slate-50 rounded-lg flex flex-col items-center justify-center p-2 border border-slate-100 text-center group relative cursor-help">
                                    <span className="text-xl mb-1">🏅</span>
                                    <span className="text-[8px] font-bold text-slate-600 leading-tight line-clamp-2">{badge}</span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        {badge}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-4 text-sm text-slate-500 italic">No badges yet.</div>
                            )}
                        </div>
                    </div>

                     <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
                            <Users size={18} className="text-indigo-500" />
                            <span>Shared Groups</span>
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-lg">🎯</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">F&O Snipers</p>
                                    <p className="text-xs text-slate-500">12.5k Members</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-lg">💎</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Value Investors</p>
                                    <p className="text-xs text-slate-500">8.4k Members</p>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="lg:col-span-2">
                     <div className="bg-white px-4 pt-4 pb-2 rounded-t-xl border-b border-slate-100 mb-4 sticky top-0 z-10">
                         <h3 className="font-bold text-slate-900 text-lg">Recent Activity</h3>
                     </div>
                     <div className="space-y-4">
                         {posts.length > 0 ? (
                             posts.map(post => (
                                 <PostCard key={post.id} post={post} currentUser={currentUser} />
                             ))
                         ) : (
                             <div className="text-center py-12 bg-white rounded-xl border border-slate-100 border-dashed">
                                 <p className="text-slate-500">No recent activity to show.</p>
                             </div>
                         )}
                     </div>
                </div>
            </div>
        </div>
    );
};
