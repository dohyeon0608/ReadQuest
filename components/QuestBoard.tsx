import {Book, ReadingPlan} from "@/types.ts";
import React, {useState} from "react";
import {BookOpenIcon} from "@/components/icons.tsx";
import {BOOK_DATABASE} from "@/constants.ts";
import PlanCreator from "@/components/PlanCreator.tsx";

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

export default QuestBoard;