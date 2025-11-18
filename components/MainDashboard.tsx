import React, {useState} from "react";
import {Quest, ReadingPlan, UserStats} from "@/types.ts";
import QuestConfirmationModal from "@/components/QuestConfirmationModal.tsx";
import QuestBoard from "@/components/QuestBoard.tsx";
import ProfileDashboard from "@/components/ProfileDashboard.tsx";
import {ScrollIcon, StarIcon, SwordIcon} from "@/components/icons.tsx";
import ActiveQuestList from "@/components/ActiveQuestList.tsx";
import Leaderboard from "@/components/Leaderboard.tsx";
import Journal from "@/components/Journal.tsx";

interface MainDashboardProps {
    userStats: UserStats;
    readingPlans: Record<string, ReadingPlan>;
    handleStartQuest: (quest: Quest) => void;
    handleSetPlan: (bookTitle: string, plan: ReadingPlan) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ userStats, readingPlans, handleStartQuest, handleSetPlan }) => {
    const [activeTab, setActiveTab] = useState('quest');
    const [questView, setQuestView] = useState<'list' | 'new'>('list');
    const [questToConfirm, setQuestToConfirm] = useState<Quest | null>(null);

    const startQuest = (quest: Quest) => {
        handleStartQuest(quest);
        setQuestToConfirm(null);
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <ProfileDashboard stats={userStats} />
            <div className="flex border-b border-slate-700 mb-6">
                <button onClick={() => setActiveTab('quest')} className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${activeTab === 'quest' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}>
                    <SwordIcon className="w-5 h-5" /> 퀘스트
                </button>
                <button onClick={() => setActiveTab('rankings')} className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${activeTab === 'rankings' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'}`}>
                    <StarIcon className="w-5 h-5" /> 랭킹
                </button>
                <button onClick={() => setActiveTab('journal')} className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${activeTab === 'journal' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}>
                    <ScrollIcon className="w-5 h-5" /> 일지
                </button>
            </div>

            {activeTab === 'quest' && (
                <div className="bg-slate-800/50 rounded-2xl shadow-lg p-6 border border-slate-700">
                    {questView === 'list' ? (
                        <>
                            <h2 className="text-3xl text-green-400 flex items-center gap-3 font-quest-title mb-4">
                                <SwordIcon className="w-8 h-8" />
                                진행 중인 계획
                            </h2>
                            <ActiveQuestList
                                readingPlans={readingPlans}
                                userStats={userStats}
                                onConfirmQuest={setQuestToConfirm}
                            />
                            <button onClick={() => setQuestView('new')} className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                                + 새 독서 계획 추가
                            </button>
                        </>
                    ) : (
                        <QuestBoard
                            onSetPlan={(bookTitle, plan) => {
                                handleSetPlan(bookTitle, plan);
                                setQuestView('list');
                            }}
                            onCancel={() => setQuestView('list')}
                        />
                    )}
                </div>
            )}
            {activeTab === 'rankings' && <Leaderboard userRp={userStats.rp} userLevel={userStats.level} />}
            {activeTab === 'journal' && <Journal entries={userStats.journal} />}

            {questToConfirm && (
                <QuestConfirmationModal
                    quest={questToConfirm}
                    onConfirm={startQuest}
                    onCancel={() => setQuestToConfirm(null)}
                />
            )}
        </div>
    );
};

export default MainDashboard;