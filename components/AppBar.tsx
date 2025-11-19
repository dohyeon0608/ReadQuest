
import React from "react";
import {UserStats} from "../types";
import {BellIcon, BookOpenIcon, Cog6ToothIcon, ShieldCheckIcon, UserCircleIcon} from "./icons";

const AppBar: React.FC<{ userStats: UserStats }> = ({ userStats }) => {
    return (
        <div className="sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 px-4 py-3 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo Area */}
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-1.5 rounded-lg shadow-lg">
                        <BookOpenIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-quest-title bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                        리드퀘스트
                    </h1>
                </div>

                {/* Actions Area */}
                <div className="flex items-center gap-4">
                    {/* User Quick Stats Pill */}
                    <div className="hidden md:flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-600">
                        <div className="flex items-center gap-1.5">
                            <UserCircleIcon className="w-5 h-5 text-yellow-400" />
                            <span className="font-bold text-sm text-slate-200">Lv.{userStats.level}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-600"></div>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />
                            <span className="font-semibold text-xs text-slate-300">{userStats.rp.toLocaleString()} RP</span>
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition">
                            <BellIcon className="w-6 h-6" />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition">
                            <Cog6ToothIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppBar;
