import React from "react";
import {Quest} from "@/types.ts";

const QuestConfirmationModal: React.FC<{ quest: Quest; onConfirm: (quest: Quest) => void; onCancel: () => void; }> = ({ quest, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700 text-center animate-fade-in-up">
                <h2 className="text-2xl font-quest-title text-green-400">다음 퀘스트</h2>
                <p className="mt-2 text-lg font-bold text-slate-200">{quest.bookTitle}</p>

                <div className="mt-4 text-left bg-slate-900/50 p-4 rounded-lg max-h-48 overflow-y-auto">
                    <h3 className="font-semibold text-slate-300 mb-2">학습할 섹션:</h3>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                        {quest.selectedSections.map(s => <li key={s}>{s}</li>)}
                    </ul>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                        <p className="text-sm text-slate-400">예상 시간</p>
                        <p className="font-bold text-lg">{quest.goalMinutes}분</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                        <p className="text-sm text-slate-400">최대 보상</p>
                        <p className="font-bold text-lg text-yellow-400">{quest.potentialExp} EXP</p>
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button onClick={onCancel} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition">
                        취소
                    </button>
                    <button onClick={() => onConfirm(quest)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition">
                        시작하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestConfirmationModal;