
import React, {useEffect, useState} from "react";
import {Quest, QuizQuestion, QuizResult} from "../types";
import {generateQuizFromTopics} from "../services/geminiService";

const QuizScreen: React.FC<{ quest: Quest; onFinish: (result: Omit<QuizResult, 'earnedExp' | 'earnedRp' | 'bonusRp' | 'isStreakBonus'>) => void; }> = ({ quest, onFinish }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                if (!quest.selectedSections || quest.selectedSections.length === 0) {
                    throw new Error("퀴즈 생성을 위한 주제가 선택되지 않았습니다.");
                }
                const numberOfQuestions = Math.min(5, Math.max(2, quest.selectedSections.length));
                const quizData = await generateQuizFromTopics(quest.selectedSections, quest.category, numberOfQuestions);
                setQuestions(quizData);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quest]);

    const handleAnswer = (answer: string) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            let correctAnswers = 0;
            questions.forEach((q, i) => {
                if (newAnswers[i] === q.correctAnswer) {
                    correctAnswers++;
                }
            });

            onFinish({ correctAnswers, totalQuestions: questions.length });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
                <p className="mt-4 text-lg">확인 퀴즈를 만들고 있어요...</p>
            </div>
        );
    }

    if (error || questions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 text-center">
                <p className="text-red-400 text-xl">오류 발생!</p>
                <p className="mt-2 text-slate-300 max-w-md">{error || "문제를 만들 수 없어요."}</p>
                <button onClick={() => onFinish({ correctAnswers: 0, totalQuestions: 0 })} className="mt-6 bg-slate-700 text-slate-300 font-semibold py-2 px-6 rounded-lg hover:bg-slate-600 transition">
                    퀴즈 건너뛰기
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-2xl bg-slate-800/50 rounded-2xl shadow-lg p-8 border border-slate-700">
                <p className="text-sm font-semibold text-purple-400">문제 {currentQuestionIndex + 1}/{questions.length}</p>
                <h2 className="text-2xl font-bold mt-2">{currentQuestion.question}</h2>
                <div className="mt-6 space-y-4">
                    {currentQuestion.options.map(option => (
                        <button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            className="w-full text-left bg-slate-700/50 p-4 rounded-lg hover:bg-purple-600/30 border-2 border-transparent hover:border-purple-500 transition duration-200"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuizScreen;
