import React, {useMemo} from "react";
import {LEADERBOARD_DATA} from "@/constants.ts";
import {StarIcon} from "@/components/icons.tsx";

const Leaderboard: React.FC<{ userRp: number, userLevel: number }> = ({ userRp, userLevel }) => {
    const sortedData = useMemo(() => {
        const data = [...LEADERBOARD_DATA];
        const userDataIndex = data.findIndex(d => d.isCurrentUser);
        if (userDataIndex !== -1) {
            data[userDataIndex].rp = userRp;
            data[userDataIndex].level = userLevel;
        }
        return data.sort((a, b) => b.rp - a.rp);
    }, [userRp, userLevel]);

    return (
        <div className="bg-slate-800/50 rounded-2xl shadow-lg p-6 border border-slate-700">
            <h2 className="text-3xl text-amber-400 flex items-center gap-3 font-quest-title">
                <StarIcon className="w-8 h-8" />
                시즌 랭킹
            </h2>
            <ul className="mt-4 space-y-2">
                {sortedData.map((user, index) => (
                    <li key={user.name} className={`flex items-center justify-between p-3 rounded-lg ${user.isCurrentUser ? 'bg-purple-600/30 border border-purple-500' : 'bg-slate-700/50'}`}>
                        <div className="flex items-center">
                            <span className="font-bold text-lg w-8">{index + 1}</span>
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-slate-400">레벨 {user.level}</p>
                            </div>
                        </div>
                        <span className="font-bold text-cyan-400">{user.rp.toLocaleString()} RP</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;