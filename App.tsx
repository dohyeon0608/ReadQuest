
import React, { useState } from 'react';
import { AppView, UserStats, Quest, QuizResult, ReadingPlan, JournalEntry } from './types';
import { LEVEL_TITLES, QUIZ_PASS_THRESHOLD } from './constants';
import MainDashboard from './components/MainDashboard';
import FocusScreen from './components/FocusScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import AppBar from './components/AppBar';

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const App: React.FC = () => {
    const [view, setView] = useState<AppView>(AppView.DASHBOARD);
    const [userStats, setUserStats] = useState<UserStats>({
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        rp: 0,
        streak: 0,
        lastQuestDate: null,
        titles: ["초보 독서가"],
        progress: {},
        journal: [],
    });
    const [readingPlans, setReadingPlans] = useState<Record<string, ReadingPlan>>({});
    const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [leveledUp, setLeveledUp] = useState(false);

    const handleStartQuest = (quest: Quest) => {
        setCurrentQuest(quest);
        setView(AppView.FOCUS);
    };

    const handleSetPlan = (bookTitle: string, plan: ReadingPlan) => {
        setReadingPlans(prev => ({...prev, [bookTitle]: plan}));
    };

    const handleProceedToQuiz = () => {
        setView(AppView.QUIZ);
    };

    const handleFinishQuiz = (result: Omit<QuizResult, 'earnedExp' | 'earnedRp' | 'bonusRp' | 'isStreakBonus'>) => {
        if (currentQuest) {
            const today = new Date();
            const lastQuestDate = userStats.lastQuestDate ? new Date(userStats.lastQuestDate) : null;
            let isStreakBonus = false;
            if (lastQuestDate) {
                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);
                if (isSameDay(lastQuestDate, yesterday)) {
                    isStreakBonus = true;
                }
            }

            const correctRatio = result.totalQuestions > 0 ? result.correctAnswers / result.totalQuestions : 0;
            const passedQuiz = correctRatio >= QUIZ_PASS_THRESHOLD;

            let earnedExp = 0;
            let earnedRp = 0;

            if (passedQuiz) {
                earnedExp = Math.round(currentQuest.potentialExp * correctRatio);
                earnedRp = Math.round(currentQuest.potentialRp * correctRatio);
                if (isStreakBonus) {
                    earnedExp = Math.round(earnedExp * 1.2);
                    earnedRp = Math.round(earnedRp * 1.2);
                }
            }

            const finalResult: QuizResult = {
                ...result,
                earnedExp,
                earnedRp,
                isStreakBonus: passedQuiz && isStreakBonus, // Streak bonus only if passed
                bonusRp: 0,
            };

            setQuizResult(finalResult);
            updateUserStats(finalResult, currentQuest);
        }
        setView(AppView.RESULTS);
    };

    const updateUserStats = (result: QuizResult, quest: Quest) => {
        setUserStats(prevStats => {
            let newExp = prevStats.exp + result.earnedExp;
            let newLevel = prevStats.level;
            let newExpToNextLevel = prevStats.expToNextLevel;
            let newTitles = [...prevStats.titles];
            setLeveledUp(false);

            while (newExp >= newExpToNextLevel) {
                newExp -= newExpToNextLevel;
                newLevel++;
                newExpToNextLevel = Math.floor(newExpToNextLevel * 1.5);
                setLeveledUp(true);
                if (LEVEL_TITLES[newLevel]) {
                    newTitles.push(LEVEL_TITLES[newLevel]);
                }
            }

            const today = new Date();
            const lastQuest = prevStats.lastQuestDate ? new Date(prevStats.lastQuestDate) : null;
            let newStreak = prevStats.streak;

            if (lastQuest) {
                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);
                if (isSameDay(lastQuest, yesterday)) {
                    newStreak++;
                } else if (!isSameDay(lastQuest, today)) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            const newProgress = { ...prevStats.progress };
            // Only update progress if the user earned EXP (i.e., passed the quiz)
            if (result.earnedExp > 0 && quest.selectedSections) {
                const currentBookProgress = newProgress[quest.bookTitle] || [];
                newProgress[quest.bookTitle] = [...new Set([...currentBookProgress, ...quest.selectedSections])];
            }

            const newJournalEntry: JournalEntry = {
                date: new Date().toISOString(),
                bookTitle: quest.bookTitle,
                selectedSections: quest.selectedSections,
                goalMinutes: quest.goalMinutes,
                earnedExp: result.earnedExp,
                earnedRp: result.earnedRp,
                quizCorrect: result.correctAnswers,
                quizTotal: result.totalQuestions,
            };


            return {
                ...prevStats,
                level: newLevel,
                exp: newExp,
                expToNextLevel: newExpToNextLevel,
                rp: prevStats.rp + result.earnedRp,
                streak: newStreak,
                lastQuestDate: today.toISOString(),
                titles: newTitles,
                progress: newProgress,
                journal: [newJournalEntry, ...prevStats.journal],
            };
        });
    };

    const handleReturnToDashboard = () => {
        setCurrentQuest(null);
        setQuizResult(null);
        setLeveledUp(false);
        setView(AppView.DASHBOARD);
    };

    const showAppBar = view === AppView.DASHBOARD || view === AppView.RESULTS;

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-purple-500 selection:text-white">
            {showAppBar && <AppBar userStats={userStats} />}
            
            {view === AppView.FOCUS && <FocusScreen quest={currentQuest!} onFinish={handleProceedToQuiz} />}
            {view === AppView.QUIZ && <QuizScreen quest={currentQuest!} onFinish={handleFinishQuiz} />}
            {view === AppView.RESULTS && <ResultsScreen result={quizResult!} leveledUp={leveledUp} onContinue={handleReturnToDashboard} />}
            {view === AppView.DASHBOARD && (
                <MainDashboard
                    userStats={userStats}
                    readingPlans={readingPlans}
                    handleStartQuest={handleStartQuest}
                    handleSetPlan={handleSetPlan}
                />
            )}
        </div>
    );
};

export default App;
