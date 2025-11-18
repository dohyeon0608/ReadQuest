import React, {useEffect, useState} from "react";
import {Quest} from "@/types.ts";
import {BookOpenIcon} from "@/components/icons.tsx";

const FocusScreen: React.FC<{ quest: Quest; onFinish: () => void; }> = ({ quest, onFinish }) => {
    const [timeRemaining, setTimeRemaining] = useState(quest.goalMinutes * 60);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (!isFinished) {
            setIsFinished(true);
        }
    }, [timeRemaining, isFinished]);

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    if (isFinished) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 text-center">
                <h2 className="text-3xl text-green-400 font-quest-title">집중 시간 완료!</h2>
                <p className="text-slate-300 mt-2 max-w-2xl">잘하셨습니다! 독서 퀘스트를 완료했어요. 이제 당신의 지식을 확인할 시간입니다.</p>
                <button
                    onClick={onFinish}
                    className="mt-8 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-8 rounded-lg hover:from-green-600 hover:to-teal-600 transition duration-300 shadow-lg transform hover:scale-105"
                >
                    퀴즈 풀기
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 text-center">
            <div className="absolute top-4 left-4 text-left p-4 bg-black/20 rounded-lg">
                <p className="text-slate-400">진행 중인 퀘스트:</p>
                <h3 className="text-xl font-bold">{quest.bookTitle}</h3>
            </div>
            <div className="p-4 bg-black/20 rounded-full mb-8">
                <BookOpenIcon className="w-16 h-16 text-purple-400" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </h1>
            <p className="text-slate-400 mt-4">집중 모드가 활성화되었습니다. 이제 독서에 흠뻑 빠져보세요.</p>

            <div className="mt-4 text-left bg-slate-800/50 p-4 rounded-lg max-h-40 overflow-y-auto border border-slate-700 w-full max-w-md">
                <h3 className="font-semibold text-slate-300 mb-2">이번 세션 목표:</h3>
                <ul className="list-disc list-inside text-slate-400 space-y-1 text-sm">
                    {quest.selectedSections.map(s => <li key={s}>{s}</li>)}
                </ul>
            </div>

            <button onClick={() => setTimeRemaining(0)} className="mt-8 bg-slate-700 text-slate-300 font-semibold py-2 px-6 rounded-lg hover:bg-slate-600 transition">
                일찍 끝내기
            </button>
        </div>
    );
};

export default FocusScreen;