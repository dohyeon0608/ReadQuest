import React from "react";
import {JournalEntry} from "@/types.ts";
import {ScrollIcon} from "@/components/icons.tsx";

const Journal: React.FC<{ entries: JournalEntry[] }> = ({ entries }) => {
    if (entries.length === 0) {
        return (
            <div className="bg-slate-800/50 rounded-2xl shadow-lg p-6 border border-slate-700 text-center">
                <ScrollIcon className="w-16 h-16 mx-auto text-slate-500" />
                <h3 className="mt-4 text-xl font-bold text-slate-300">일지가 비어있어요</h3>
                <p className="mt-2 text-slate-400">퀘스트를 완료하고 당신의 전설을 써내려가세요. 모든 독서 기록이 여기에 남게 됩니다.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 rounded-2xl shadow-lg p-6 border border-slate-700">
            <h2 className="text-3xl text-sky-400 flex items-center gap-3 font-quest-title">
                <ScrollIcon className="w-8 h-8" />
                모험 일지
            </h2>
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {entries.map((entry) => {
                    const failed = entry.earnedExp === 0 && entry.quizTotal > 0;
                    return (
                        <div key={entry.date} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-200">{entry.bookTitle}</h4>
                                    <p className="text-sm text-slate-400">{new Date(entry.date).toLocaleDateString()}</p>
                                </div>
                                {failed && <span className="text-sm font-semibold bg-red-500/20 text-red-400 px-2 py-1 rounded">실패</span>}
                            </div>
                            <div className="mt-3">
                                <p className="text-sm font-semibold text-slate-300">읽은 분량 ({entry.goalMinutes}분):</p>
                                <ul className="list-disc list-inside text-slate-400 mt-1 text-sm">
                                    {entry.selectedSections.map(s => <li key={s}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center gap-4">
                                <span className="text-sm text-slate-400 font-semibold">
                                    퀴즈 결과: {entry.quizCorrect} / {entry.quizTotal}
                                </span>
                                <div className="flex items-center gap-4">
                                    <span className={`font-semibold text-sm ${failed ? 'text-slate-500' : 'text-yellow-400'}`}>+{entry.earnedExp} EXP</span>
                                    <span className={`font-semibold text-sm ${failed ? 'text-slate-500' : 'text-cyan-400'}`}>+{entry.earnedRp} RP</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Journal;