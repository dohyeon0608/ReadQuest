
import React from "react";
import {QuizResult} from "../types";
import {FireIcon} from "./icons";

const ResultsScreen: React.FC<{ result: QuizResult; leveledUp: boolean; onContinue: () => void; }> = ({ result, leveledUp, onContinue }) => {
    const passed = result.earnedExp > 0 || result.totalQuestions === 0;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 text-center animate-fade-in-up">
                <h1 className={`text-4xl font-quest-title ${passed ? 'text-green-400' : 'text-red-400'}`}>
                    {passed ? '퀘스트 완료!' : '퀘스트 실패'}
                </h1>
                {leveledUp && <p className="text-2xl font-bold text-yellow-400 mt-2 animate-pulse">레벨 업!</p>}

                <div className="mt-6 space-y-3 text-lg">
                    <div className="flex justify-between bg-slate-700/50 p-3 rounded-lg">
                        <span className="text-slate-300">퀴즈 성적:</span>
                        <span className="font-bold text-slate-200">{result.correctAnswers} / {result.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between bg-slate-700/50 p-3 rounded-lg">
                        <span className="text-slate-300">획득 EXP:</span>
                        <span className={`font-bold ${passed ? 'text-yellow-400' : 'text-slate-500'}`}>+{result.earnedExp.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between bg-slate-700/50 p-3 rounded-lg">
                        <span className="text-slate-300">획득 RP:</span>
                        <span className={`font-bold ${passed ? 'text-cyan-400' : 'text-slate-500'}`}>+{result.earnedRp.toLocaleString()}</span>
                    </div>
                    {result.isStreakBonus && (
                        <div className="flex justify-between bg-orange-500/20 p-3 rounded-lg">
                            <span className="text-orange-300 flex items-center gap-1"><FireIcon className="w-5 h-5" />연속 보너스!</span>
                            <span className="font-bold text-orange-300">모든 보상 x1.2</span>
                        </div>
                    )}
                </div>

                <button onClick={onContinue} className="mt-8 w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition duration-300 shadow-lg transform hover:scale-105">
                    대시보드로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default ResultsScreen;
