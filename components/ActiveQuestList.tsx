
import React from "react";
import {Quest, ReadingPlan, UserStats} from "../types";
import {BASE_POINTS_PER_SECTION, BOOK_DATABASE, CONTENT_MULTIPLIERS} from "../constants";

const ActiveQuestList: React.FC<{ readingPlans: Record<string, ReadingPlan>; userStats: UserStats; onConfirmQuest: (quest: Quest) => void;}> = ({ readingPlans, userStats, onConfirmQuest }) => {
    const activeBooks = BOOK_DATABASE.filter(book => readingPlans[book.title]);

    if (activeBooks.length === 0) {
        return (
            <div className="text-center p-8">
                <p className="text-slate-400">진행 중인 독서 계획이 없습니다.</p>
                <p className="text-slate-500 text-sm mt-1">새로운 계획을 추가하여 독서 여정을 시작하세요.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activeBooks.map(book => {
                const plan = readingPlans[book.title];
                const allBookSections = book.tableOfContents.flatMap(c => c.sections);

                const startIndex = allBookSections.indexOf(plan.startSection);
                const endIndex = allBookSections.indexOf(plan.endSection);

                if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
                    return null;
                }

                const planSections = allBookSections.slice(startIndex, endIndex + 1);
                const completedSections = userStats.progress[book.title] || [];
                const completedInPlan = planSections.filter(s => completedSections.includes(s)).length;
                const totalInPlan = planSections.length;
                const progressPercent = totalInPlan > 0 ? (completedInPlan / totalInPlan) * 100 : 0;

                const remainingSections = planSections.filter(s => !completedSections.includes(s));
                const nextQuestSections = remainingSections.slice(0, plan.sectionsPerQuest);

                const handleInitiateQuest = () => {
                    if (nextQuestSections.length === 0) return;
                    const potentialRewards = {
                        potentialExp: Math.round(BASE_POINTS_PER_SECTION * nextQuestSections.length * CONTENT_MULTIPLIERS[book.category]),
                        potentialRp: Math.round(BASE_POINTS_PER_SECTION * nextQuestSections.length * CONTENT_MULTIPLIERS[book.category]),
                    };
                    onConfirmQuest({
                        bookTitle: book.title,
                        category: book.category,
                        selectedSections: nextQuestSections,
                        goalMinutes: nextQuestSections.length * plan.minutesPerSection,
                        ...potentialRewards,
                    });
                };

                return (
                    <div key={book.title} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-slate-200">{book.title}</h3>
                                <p className="text-sm text-slate-400">{book.category}</p>
                            </div>
                            {progressPercent >= 100 ? (
                                <span className="text-sm font-semibold bg-green-500/20 text-green-400 px-2 py-1 rounded">완료</span>
                            ) : (
                                <button onClick={handleInitiateQuest} disabled={nextQuestSections.length === 0} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded-md transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed">
                                    계속하기
                                </button>
                            )}
                        </div>
                        <div className="mt-3">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-slate-400">진행도</span>
                                <span className="font-semibold text-slate-300">{completedInPlan} / {totalInPlan} ({Math.round(progressPercent)}%)</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{width: `${progressPercent}%`}}></div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ActiveQuestList;
