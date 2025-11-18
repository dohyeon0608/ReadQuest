
import React, {useEffect, useMemo, useState} from 'react';
// FIX: Import the 'ReadingPlan' type.
import {Book, ReadingPace, ReadingPlan} from "../types";
import {BASE_POINTS_PER_SECTION, CONTENT_MULTIPLIERS, PACE_CONFIG} from "../constants";

const PlanCreator: React.FC<{ book: Book; onConfirmPlan: (plan: ReadingPlan) => void; }> = ({ book, onConfirmPlan }) => {
    const [pace, setPace] = useState<ReadingPace>('보통');
    const [customSections, setCustomSections] = useState(5);
    const [minutesPerSection, setMinutesPerSection] = useState(5);

    const allSections = useMemo(() => book.tableOfContents.flatMap(chapter => chapter.sections), [book]);

    const [startSection, setStartSection] = useState<string>(allSections[0] || '');
    const [endSection, setEndSection] = useState<string>(allSections[allSections.length - 1] || '');

    const availableEndSections = useMemo(() => {
        const startIndex = allSections.indexOf(startSection);
        return allSections.slice(startIndex);
    }, [startSection, allSections]);

    useEffect(() => {
        const startIndex = allSections.indexOf(startSection);
        const endIndex = allSections.indexOf(endSection);
        if (endIndex < startIndex) {
            setEndSection(allSections[allSections.length - 1]);
        }
    }, [startSection, endSection, allSections]);


    const planDetails = useMemo(() => {
        const sectionsPerQuest = pace === '직접 설정' ? (customSections > 0 ? customSections : 1) : PACE_CONFIG[pace].sectionsPerQuest;

        const startIndex = allSections.indexOf(startSection);
        const endIndex = allSections.indexOf(endSection);
        const sectionCount = (endIndex >= startIndex) ? (endIndex - startIndex + 1) : 0;

        const totalQuests = sectionCount > 0 ? Math.ceil(sectionCount / sectionsPerQuest) : 0;
        const rewardsPerQuest = {
            exp: Math.round(BASE_POINTS_PER_SECTION * sectionsPerQuest * CONTENT_MULTIPLIERS[book.category]),
            rp: Math.round(BASE_POINTS_PER_SECTION * sectionsPerQuest * CONTENT_MULTIPLIERS[book.category]),
        };

        return { sectionsPerQuest, totalQuests, rewardsPerQuest, sectionCount };
    }, [pace, customSections, startSection, endSection, allSections, book.category]);

    const handleConfirmPlan = () => {
        onConfirmPlan({
            pace,
            sectionsPerQuest: planDetails.sectionsPerQuest,
            minutesPerSection,
            startSection,
            endSection,
        });
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">독서 계획 세우기</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-section" className="block text-sm font-medium text-slate-300">시작</label>
                    <select id="start-section" value={startSection} onChange={e => setStartSection(e.target.value)} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500">
                        {book.tableOfContents.map(chapter => (
                            <optgroup key={chapter.title} label={chapter.title}>
                                {chapter.sections.map(section => <option key={section} value={section}>{section}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="end-section" className="block text-sm font-medium text-slate-300">종료</label>
                    <select id="end-section" value={endSection} onChange={e => setEndSection(e.target.value)} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500">
                        {book.tableOfContents.map(chapter => (
                            <optgroup key={chapter.title} label={chapter.title}>
                                {chapter.sections.filter(s => availableEndSections.includes(s)).map(section => <option key={section} value={section}>{section}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300">읽기 속도</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(['느리게', '보통', '빠르게', '직접 설정'] as ReadingPace[]).map(p => (
                        <button key={p} onClick={() => setPace(p)} className={`p-2 rounded-md font-semibold border-2 transition ${pace === p ? 'bg-green-500/20 border-green-500 text-white' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pace === '직접 설정' ? (
                    <div>
                        <label htmlFor="custom-sections" className="block text-sm font-medium text-slate-300">퀘스트당 분량</label>
                        <input type="number" id="custom-sections" value={customSections} onChange={e => setCustomSections(Number(e.target.value))} min="1" className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" />
                    </div>
                ) : <div />}
                <div>
                    <label htmlFor="minutes-per-section" className="block text-sm font-medium text-slate-300">섹션당 예상 시간 (분)</label>
                    <input type="number" id="minutes-per-section" value={minutesPerSection} onChange={e => setMinutesPerSection(Number(e.target.value))} min="1" className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" />
                </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-slate-200 text-center">계획 요약</h4>
                <div className="flex justify-between"><span className="text-slate-400">총 분량:</span> <span className="font-bold">{planDetails.sectionCount}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">퀘스트당 분량:</span> <span className="font-bold">{planDetails.sectionsPerQuest}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">예상 퀘스트 수:</span> <span className="font-bold">{planDetails.totalQuests}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">퀘스트당 보상:</span> <span className="font-bold text-yellow-400">~{planDetails.rewardsPerQuest.exp} EXP / {planDetails.rewardsPerQuest.rp} RP</span></div>
            </div>

            <button onClick={handleConfirmPlan} disabled={planDetails.sectionCount <= 0} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                계획 확정
            </button>
        </div>
    );
}

export default PlanCreator;
