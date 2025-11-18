
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, UserStats, Quest, QuizQuestion, QuizResult, ContentCategory, Book, ReadingPlan, ReadingPace, JournalEntry } from './types';
import { BASE_POINTS_PER_SECTION, CONTENT_MULTIPLIERS, LEVEL_TITLES, LEADERBOARD_DATA, BOOK_DATABASE, PACE_CONFIG, QUIZ_PASS_THRESHOLD } from './constants';
import { BookOpenIcon, SwordIcon, StarIcon, ShieldCheckIcon, FireIcon, ScrollIcon } from './components/icons';
import { generateQuizFromTopics } from './services/geminiService';

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

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
    
    switch (view) {
        case AppView.FOCUS:
            return <FocusScreen quest={currentQuest!} onFinish={handleProceedToQuiz} />;
        case AppView.QUIZ:
            return <QuizScreen quest={currentQuest!} onFinish={handleFinishQuiz} />;
        case AppView.RESULTS:
            return <ResultsScreen result={quizResult!} leveledUp={leveledUp} onContinue={handleReturnToDashboard} />;
        case AppView.DASHBOARD:
        default:
            return <MainDashboard 
                userStats={userStats}
                readingPlans={readingPlans}
                handleStartQuest={handleStartQuest}
                handleSetPlan={handleSetPlan}
            />;
    }
};

const ProfileDashboard: React.FC<{ stats: UserStats }> = ({ stats }) => {
    const expPercentage = (stats.exp / stats.expToNextLevel) * 100;
    const currentTitle = stats.titles[stats.titles.length - 1];

    return (
        <div className="bg-slate-800/50 rounded-2xl shadow-lg p-6 border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                    <h1 className="text-3xl text-purple-400 font-quest-title">내 진행 상황</h1>
                    <p className="text-slate-400 mt-1">{currentTitle}</p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-full">
                        <FireIcon className="w-5 h-5 text-orange-400" />
                        <span className="font-semibold">{stats.streak}일 연속</span>
                    </div>
                     <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-full">
                        <ShieldCheckIcon className="w-5 h-5 text-cyan-400" />
                        <span className="font-semibold">{stats.rp.toLocaleString()} RP</span>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-lg text-yellow-400">레벨 {stats.level}</span>
                    <span className="text-sm text-slate-400">{stats.exp.toLocaleString()} / {stats.expToNextLevel.toLocaleString()} EXP</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-4 rounded-full transition-all duration-500" style={{ width: `${expPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

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

interface QuestBoardProps {
    onSetPlan: (bookTitle: string, plan: ReadingPlan) => void;
    onCancel: () => void;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ onSetPlan, onCancel }) => {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-3xl text-green-400 flex items-center gap-3 font-quest-title">
                    <BookOpenIcon className="w-8 h-8" />
                    새로운 독서 계획
                </h2>
                <button onClick={onCancel} className="text-slate-400 hover:text-white">취소</button>
            </div>
           
            <div className="mt-6 space-y-4">
                 <div>
                    <label htmlFor="book" className="block text-sm font-medium text-slate-300">책 선택</label>
                    <select id="book" value={selectedBook?.title || ''} onChange={e => {
                        const book = BOOK_DATABASE.find(b => b.title === e.target.value) || null;
                        setSelectedBook(book);
                    }} className="mt-1 block w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500">
                        <option value="" disabled>-- 책을 선택하세요 --</option>
                        {BOOK_DATABASE.map(book => <option key={book.title} value={book.title}>{book.title} ({book.category})</option>)}
                    </select>
                </div>
                {selectedBook && <PlanCreator book={selectedBook} onConfirmPlan={(plan) => onSetPlan(selectedBook.title, plan)} />}
            </div>
        </div>
    );
};

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


const Leaderboard: React.FC<{ userRp: number, userLevel: number }> = ({ userRp, userLevel }) => {
    const sortedData = useMemo(() => {
        const data = [...LEADERBOARD_DATA];
        const userDataIndex = data.findIndex(d => d.isCurrentUser);
        if (userDataIndex !== -1) {
            data[userDataIndex].rp = userRp;
            data[userDataIndex].level = userLevel;
        }
        return data.sort((a, b) => b.rp - a.rp);
    }, [userRp, userLevel]);
    
    return (
        <div className="bg-slate-800/50 rounded-2xl shadow-lg p-6 border border-slate-700">
            <h2 className="text-3xl text-amber-400 flex items-center gap-3 font-quest-title">
                <StarIcon className="w-8 h-8" />
                시즌 랭킹
            </h2>
            <ul className="mt-4 space-y-2">
                {sortedData.map((user, index) => (
                    <li key={user.name} className={`flex items-center justify-between p-3 rounded-lg ${user.isCurrentUser ? 'bg-purple-600/30 border border-purple-500' : 'bg-slate-700/50'}`}>
                        <div className="flex items-center">
                            <span className="font-bold text-lg w-8">{index + 1}</span>
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-slate-400">레벨 {user.level}</p>
                            </div>
                        </div>
                        <span className="font-bold text-cyan-400">{user.rp.toLocaleString()} RP</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

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

export default App;
