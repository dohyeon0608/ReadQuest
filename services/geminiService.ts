
import { GoogleGenAI, Type } from "@google/genai";
import { ContentCategory, QuizQuestion } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder check. In a real environment, the key is expected to be set.
  // We will proceed assuming it's available, as per instructions.
  console.warn("API_KEY environment variable not set. The application will not work without it.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.STRING }
        },
        required: ["question", "options", "correctAnswer"]
    }
};

const getCategoryPrompt = (category: ContentCategory) => {
    switch (category) {
        case ContentCategory.ACADEMIC:
            return "다음 토픽은 학술 서적에서 발췌되었습니다. 주제와 관련된 주요 정의, 공식 또는 핵심 개념에 집중하세요.";
        case ContentCategory.TECHNICAL:
            return "다음 토픽은 기술 논문에서 발췌되었습니다. 주제와 관련된 방법론, 주요 발견 또는 기술 용어에 집중하세요.";
        case ContentCategory.FICTION:
        default:
            return "다음 토픽은 소설에서 발췌되었습니다. 주제와 관련된 줄거리, 등장인물의 행동 또는 중요한 대화에 집중하세요.";
    }
};

export const generateQuizFromTopics = async (topics: string[], category: ContentCategory, numberOfQuestions: number): Promise<QuizQuestion[]> => {
    try {
        const prompt = `
            당신은 사용자가 방금 읽은 특정 주제에 대한 이해도를 확인하기 위해 퀴즈를 만드는 데 도움을 주는 어시스턴트입니다. 제공된 주제에 대한 지식을 바탕으로, 간단한 객관식 문제 ${numberOfQuestions}개를 생성해주세요. 각 문제에는 4개의 선택지가 있어야 합니다. 제공된 선택지 중 하나는 정답이어야 합니다.

            ${getCategoryPrompt(category)}

            주제:
            - ${topics.join('\n- ')}

            제공된 스키마를 준수하는 유효한 JSON 배열 형식으로 퀴즈를 반환해주세요.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });

        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);
        
        if (!Array.isArray(quizData) || quizData.length === 0) {
            throw new Error("생성된 퀴즈 데이터가 유효한 배열이 아닙니다.");
        }

        return quizData.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
        }));

    } catch (error) {
        console.error("퀴즈 생성 중 오류 발생:", error);
        throw new Error("퀴즈 생성에 실패했습니다. 다시 시도해주세요.");
    }
};
