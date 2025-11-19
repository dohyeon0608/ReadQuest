
import React from "react";
import {UserStats} from "../types";
import {FireIcon, ShieldCheckIcon} from "./icons";

const ProfileDashboard: React.FC<{ stats: UserStats }> = ({ stats }) => {
    const expPercentage = (stats.exp / stats.expToNextLevel) * 100;
    const currentTitle = stats.titles[stats.titles.length - 1];

    return (
        <div className="bg-slate-800/50 rounded-2xl shadow-lg p-6 border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                    <h1 className="text-3xl text-purple-400 font-quest-title">내 진행 상황</h1>
                    <p className="text-slate-400 mt-1">{currentTitle}</p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-full">
                        <FireIcon className="w-5 h-5 text-orange-400" />
                        <span className="font-semibold">{stats.streak}일 연속</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-full">
                        <ShieldCheckIcon className="w-5 h-5 text-cyan-400" />
                        <span className="font-semibold">{stats.rp.toLocaleString()} RP</span>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg text-yellow-400">레벨 {stats.level}</span>
                    <span className="text-sm text-slate-400">{stats.exp.toLocaleString()} / {stats.expToNextLevel.toLocaleString()} EXP</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-4 rounded-full transition-all duration-500" style={{ width: `${expPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;
