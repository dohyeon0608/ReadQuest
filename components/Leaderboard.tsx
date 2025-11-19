
import React, {useMemo, useState} from "react";
import {LEADERBOARD_DATA} from "../constants";
import {StarIcon} from "./icons";

type FilterType = 'all' | 'major' | 'friends';

const Leaderboard: React.FC<{ userRp: number, userLevel: number }> = ({ userRp, userLevel }) => {
    const [filter, setFilter] = useState<FilterType>('all');

    const currentUserInfo = LEADERBOARD_DATA.find(d => d.isCurrentUser);
    const userMajor = currentUserInfo?.major || "소프트웨어학부";

    const sortedData = useMemo(() => {
        let data = [...LEADERBOARD_DATA];
        
        // Update current user's realtime stats
        const userDataIndex = data.findIndex(d => d.isCurrentUser);
        if (userDataIndex !== -1) {
            data[userDataIndex] = { ...data[userDataIndex], rp: userRp, level: userLevel };
        }

        // Apply filters
        if (filter === 'major') {
            data = data.filter(d => d.major === userMajor);
        } else if (filter === 'friends') {
            data = data.filter(d => d.isFriend || d.isCurrentUser);
        }

        // Sort by RP
        return data.sort((a, b) => b.rp - a.rp);
    }, [userRp, userLevel, filter, userMajor]);

    const totalParticipants = sortedData.length;

    return (
        <div className="bg-slate-800/50 rounded-2xl shadow-lg p-6 border border-slate-700">
            <h2 className="text-3xl text-amber-400 flex items-center gap-3 font-quest-title mb-6">
                <StarIcon className="w-8 h-8" />
                시즌 랭킹
            </h2>

            <div className="flex space-x-2 mb-6 bg-slate-900/50 p-1 rounded-lg">
                <button 
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${filter === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    전체
                </button>
                <button 
                    onClick={() => setFilter('major')}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${filter === 'major' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    {userMajor}
                </button>
                <button 
                    onClick={() => setFilter('friends')}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${filter === 'friends' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    친구
                </button>
            </div>

            {sortedData.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    랭킹 데이터가 없습니다.
                </div>
            ) : (
                <ul className="space-y-2">
                    {sortedData.map((user, index) => {
                        const rank = index + 1;
                        const percentile = Math.ceil((rank / totalParticipants) * 100);
                        
                        return (
                            <li key={user.name} className={`flex items-center justify-between p-3 rounded-lg transition-all ${user.isCurrentUser ? 'bg-purple-600/30 border border-purple-500 transform scale-[1.02]' : 'bg-slate-700/50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${rank <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {rank}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className={`font-semibold ${user.isCurrentUser ? 'text-white' : 'text-slate-200'}`}>{user.name}</p>
                                            {user.isFriend && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">친구</span>}
                                        </div>
                                        <p className="text-xs text-slate-400">Lv.{user.level} • {user.major}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-cyan-400">{user.rp.toLocaleString()} RP</span>
                                    <span className="text-xs text-slate-500 font-medium">상위 {percentile}%</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Leaderboard;
