
import { ContentCategory, Book, ReadingPace } from './types';

export const BASE_POINTS_PER_MINUTE = 10;
export const BASE_POINTS_PER_SECTION = 50;
export const QUIZ_PASS_THRESHOLD = 0.5; // 50% 정답률을 통과 기준으로 설정

export const CONTENT_MULTIPLIERS: Record<ContentCategory, number> = {
  [ContentCategory.FICTION]: 1.0,
  [ContentCategory.ACADEMIC]: 1.5,
  [ContentCategory.TECHNICAL]: 2.0,
};

// Kept for manual mode fallback
export const GOAL_INTENSITY_MULTIPLIERS: Record<number, number> = {
  15: 1.0,
  30: 1.2,
  45: 1.4,
  60: 1.6,
  90: 2.0,
};

export const PACE_CONFIG: Record<Exclude<ReadingPace, '직접 설정'>, { sectionsPerQuest: number }> = {
  '느리게': { sectionsPerQuest: 2 },
  '보통': { sectionsPerQuest: 4 },
  '빠르게': { sectionsPerQuest: 6 },
};


export const BOOK_DATABASE: Book[] = [
  {
    title: "논리 회로",
    category: ContentCategory.ACADEMIC,
    tableOfContents: [
      {
        title: "6장: 논리식의 간소화",
        sections: [
          "01 2변수 카르노 맵", "02 3변수 카르노 맵", "03 4변수 카르노 맵",
          "04 선택적 카르노 맵", "05 논리식의 카르노 맵 작성", "06 5변수, 6변수 카르노 맵",
          "07 퀸-맥클러스키 간소화 알고리즘", "08 여러 개의 출력 함수", "09 NAND와 NOR 게이트로의 변환",
          "10 XOR와 XNOR 게이트",
        ],
      },
      {
        title: "7장: 조합논리회로",
        sections: [
          "01 가산기", "02 비교기", "03 디코더", "04 인코더", "05 멀티플렉서",
          "06 디멀티플렉서", "07 코드 변환기", "08 패리티 발생기/검출기",
        ],
      },
      {
        title: "8장: 플립플롭",
        sections: [
          "01 기본적인 플립플롭", "02 SR 플립플롭", "03 D 플립플롭", "04 JK 플립플롭",
          "05 T 플립플롭", "06 비동기 입력", "07 플립플롭의 동작 특성", "08 멀티바이브레이터",
        ],
      },
      {
        title: "9장: 동기 순서논리회로",
        sections: [
          "01 동기 순서논리회로 개요", "02 동기 순서논리회로의 해석 과정", "03 플립플롭의 여기표",
          "04 동기 순서논리회로의 설계 과정", "05 동기 순서논리회로의 설계 예", "06 미사용 상태의 설계",
          "07 카운터의 설계", "08 상태방정식을 이용한 설계", "09 디코더와 플립플롭을 사용한 설계",
        ],
      },
      {
        title: "10장: 카운터",
        sections: [
          "01 비동기식 카운터", "02 동기식 카운터", "03 기타 카운터", "04 IC 카운터",
          "05 카운터의 응용",
        ],
      },
    ],
  },
  {
    title: "내 영혼이 따뜻했던 날들",
    category: ContentCategory.FICTION,
    tableOfContents: [
      { title: "1-3장", sections: ["1장", "2장", "3장"] },
      { title: "4-6장", sections: ["4장", "5장", "6장"] },
      { title: "7-9장", sections: ["7장", "8장", "9장"] },
    ]
  },
  {
    title: "선형대수학",
    category: ContentCategory.ACADEMIC,
    tableOfContents: [
      {
        title: "Ch. 1: Vectors",
        sections: [
          "1.1 Vectors and Matrices in Engineering and Mathematics; n-Space",
          "1.2 Dot Product and Orthogonality",
          "1.3 Vector Equations of Lines and Planes",
        ],
      },
      {
        title: "Ch. 2: Systems of Linear Equations",
        sections: [
          "2.1 Introduction to Systems of Linear Equations",
          "2.2 Solving Linear Systems by Row Reduction",
          "2.3 Applications of Linear Systems",
        ],
      },
      {
        title: "Ch. 3: Matrices and Matrix Algebra",
        sections: [
            "3.1 Operations on Matrices",
            "3.2 Inverses; Algebraic Properties of Matrices",
            "3.3 Elementary Matrices; A Method for Finding A⁻¹",
            "3.4 Subspaces and Linear Independence",
            "3.5 The Geometry of Linear Systems",
            "3.6 Matrices with Special Forms",
            "3.7 Matrix Factorizations; LU-Decomposition",
            "3.8 Partitioned Matrices and Parallel Processing",
        ],
      },
      {
        title: "Ch. 4: Determinants",
        sections: [
            "4.1 Determinants; Cofactor Expansion",
            "4.2 Properties of Determinants",
            "4.3 Cramer's Rule; Formula for A⁻¹: Applications of Determinants",
            "4.4 A First Look at Eigenvalues and Eigenvectors",
        ],
      },
      {
        title: "Ch. 5: Matrix Models",
        sections: [
            "5.1 Dynamical Systems and Markov Chains",
            "5.2 Leontief Input-Output Models",
            "5.3 Gauss-Seidel and Jacobi Iteration; Sparse Linear Systems",
            "5.4 The Power Method; Application to Internet Search Engines",
        ],
      },
      {
        title: "Ch. 6: Linear Transformations",
        sections: [
            "6.1 Matrices as Transformations",
            "6.2 Geometry of Linear Operators",
            "6.3 Kernel and Range",
            "6.4 Composition and Invertibility of Linear Transformations",
            "6.5 Computer Graphics",
        ],
      },
      {
        title: "Ch. 7: Dimension and Structure",
        sections: [
            "7.1 Basis and Dimension",
            "7.2 Properties of Bases",
            "7.3 The Fundamental Spaces of a Matrix",
            "7.4 The Dimension Theorem and Its Implications",
            "7.5 The Rank Theorem and Its Implications",
            "7.6 The Pivot Theorem and Its Implications",
            "7.7 The Projection Theorem and Its Implications",
            "7.8 Best Approximation and Least Squares",
            "7.9 Orthonormal Bases and the Gram-Schmidt Process",
            "7.10 QR-Decomposition; Householder Transformations",
            "7.11 Coordinates with Respect to a Basis",
        ],
      },
    ],
  },
  {
    title: "프로그래밍",
    category: ContentCategory.ACADEMIC,
    tableOfContents: [
        { title: "Chapter 1: 프로그래밍 언어 개요", sections: ["1.1 ‘프로그램’은 무엇일까?", "1.2 프로그래밍 언어의 계층과 번역", "1.3 왜 C 언어를 배워야 할까?", "1.4 프로그래밍의 자료 표현", "1.5 소프트웨어 개발", "1.6 다양한 ‘프로그래밍 언어’"] },
        { title: "Chapter 2: C 프로그래밍 첫걸음", sections: ["2.1 프로그램 구현 과정과 통합개발환경", "2.2 비주얼 스튜디오 설치와 C 프로그램의 첫 개발", "2.3 C 프로그램 실행 과정의 이해", "2.4 오류와 디버깅"] },
        { title: "Chapter 3: 자료형과 변수", sections: ["3.1 프로그래밍 기초", "3.2 자료형과 변수선언", "3.3 기본 자료형", "3.4 상수 표현 방법"] },
        { title: "Chapter 4: 전처리와 입출력", sections: ["4.1 전처리", "4.2 출력함수 printf()", "4.3 입력함수 scanf()"] },
        { title: "Chapter 5: 연산자와 연산식", sections: ["5.1 연산식과 다양한 연산자", "5.2 관계와 논리, 조건, 비트연산자", "5.3 형변환 연산자와 연산자 우선순위"] },
        { title: "Chapter 6: 조건", sections: ["6.1 제어문 개요", "6.2 조건에 따른 선택 if 문", "6.3 다양한 선택 switch 문"] },
        { title: "Chapter 7: 반복", sections: ["7.1 반복 개요와 while 문", "7.2 do while 문과 for 문", "7.3 분기문", "7.4 중첩된 반복문"] },
        { title: "Chapter 8: 배열", sections: ["8.1 배열 선언과 초기화", "8.2 2차원과 3차원 배열"] },
        { title: "Chapter 9: 함수 기초", sections: ["9.1 함수 정의와 호출", "9.2 함수의 매개변수 활용", "9.3 재귀와 라이브러리 함수"] },
        { title: "Chapter 10: 변수 유효범위", sections: ["10.1 전역변수와 지역변수", "10.2 정적 변수와 레지스터 변수", "10.3 메모리 영역과 변수 이용"] },
        { title: "Chapter 11: 포인터 기초", sections: ["11.1 포인터 변수와 선언", "11.2 간접연산자 *와 포인터 연산", "11.3 포인터 형변환과 다중 포인터", "11.4 포인터를 사용한 배열 활용"] },
        { title: "Chapter 12: 문자와 문자열", sections: ["12.1 문자와 문자열", "12.2 문자열 관련 함수", "12.3 여러 문자열 처리"] },
        { title: "Chapter 13: 구조체와 공용체", sections: ["13.1 구조체와 공용체", "13.2 자료형 재정의", "13.3 구조체와 공용체의 포인터와 배열"] },
        { title: "Chapter 14: 함수와 포인터 활용", sections: ["14.1 함수의 인자전달 방식", "14.2 포인터 전달과 반환", "14.3 함수 포인터와 void 포인터"] },
        { title: "Chapter 15: 파일 처리", sections: ["15.1 파일 기초", "15.2 텍스트 파일 입출력", "15.3 이진 파일 입출력", "15.4 파일 접근 처리"] },
        { title: "Chapter 16: 동적 메모리와 전처리", sections: ["16.1 동적 메모리와 자기참조 구조체", "16.2 연결 리스트", "16.3 전처리"] },
    ],
  },
  {
    title: "이산수학",
    category: ContentCategory.ACADEMIC,
    tableOfContents: [
      { title: "Chapter 1: The Foundations: Logic and Proofs", sections: ["1.1 Propositional Logic", "1.2 Applications of Propositional Logic", "1.3 Propositional Equivalences", "1.4 Predicates and Quantifiers", "1.5 Nested Quantifiers", "1.6 Rules of Inference", "1.7 Introduction to Proofs", "1.8 Proof Methods and Strategy"] },
      { title: "Chapter 2: Basic Structures: Sets, Functions, Sequences, Sums, and Matrices", sections: ["2.1 Sets", "2.2 Set Operations", "2.3 Functions", "2.4 Sequences and Summations", "2.5 Cardinality of Sets", "2.6 Matrices"] },
      { title: "Chapter 3: Algorithms", sections: ["3.1 Algorithms", "3.2 The Growth of Functions", "3.3 Complexity of Algorithms"] },
      { title: "Chapter 4: Number Theory and Cryptography", sections: ["4.1 Divisibility and Modular Arithmetic", "4.2 Integer Representations and Algorithms", "4.3 Primes and Greatest Common Divisors", "4.4 Solving Congruences", "4.5 Applications of Congruences", "4.6 Cryptography"] },
      { title: "Chapter 5: Induction and Recursion", sections: ["5.1 Mathematical Induction", "5.2 Strong Induction and Well-Ordering", "5.3 Recursive Definitions and Structural Induction", "5.4 Recursive Algorithms", "5.5 Program Correctness"] },
      { title: "Chapter 6: Counting", sections: ["6.1 The Basics of Counting", "6.2 The Pigeonhole Principle", "6.3 Permutations and Combinations", "6.4 Binomial Coefficients and Identities", "6.5 Generalized Permutations and Combinations", "6.6 Generating Permutations and Combinations"] },
      { title: "Chapter 7: Discrete Probability", sections: ["7.1 An Introduction to Discrete Probability", "7.2 Probability Theory", "7.3 Bayes’ Theorem", "7.4 Expected Value and Variance"] },
      { title: "Chapter 8: Advanced Counting Techniques", sections: ["8.1 Applications of Recurrence Relations", "8.2 Solving Linear Recurrence Relations", "8.3 Divide-and-Conquer Algorithms and Recurrence Relations", "8.4 Generating Functions", "8.5 Inclusion–Exclusion", "8.6 Applications of Inclusion–Exclusion"] },
      { title: "Chapter 9: Relations", sections: ["9.1 Relations and Their Properties", "9.2 n-ary Relations and Their Applications", "9.3 Representing Relations", "9.4 Closures of Relations", "9.5 Equivalence Relations", "9.6 Partial Orderings"] },
      { title: "Chapter 10: Graphs", sections: ["10.1 Graphs and Graph Models", "10.2 Graph Terminology and Special Types of Graphs", "10.3 Representing Graphs and Graph Isomorphism", "10.4 Connectivity", "10.5 Euler and Hamilton Paths", "10.6 Shortest-Path Problems", "10.7 Planar Graphs", "10.8 Graph Coloring"] },
      { title: "Chapter 11: Trees", sections: ["11.1 Introduction to Trees", "11.2 Applications of Trees", "11.3 Tree Traversal", "11.4 Spanning Trees", "11.5 Minimum Spanning Trees"] },
      { title: "Chapter 12: Boolean Algebra", sections: ["12.1 Boolean Functions", "12.2 Representing Boolean Functions", "12.3 Logic Gates", "12.4 Minimization of Circuits"] },
      { title: "Chapter 13: Modeling Computation", sections: ["13.1 Languages and Grammars", "13.2 Finite-State Machines with Output", "13.3 Finite-State Machines with No Output", "13.4 Language Recognition", "13.5 Turing Machines"] },
    ],
  },
];


export const LEVEL_TITLES: Record<number, string> = {
  1: "초보 독서가",
  3: "견습 책벌레",
  5: "책 탐험가",
  10: "고서 탐독가",
  15: "학자의 필경사",
  20: "논문 정복자",
  25: "주말의 학자",
  30: "이야기꾼",
};

export const LEADERBOARD_DATA = [
    { name: "책책책을읽읍시다", rp: 15200, level: 42, major: "문헌정보학과", isFriend: false },
    { name: "CAUCSE", rp: 12500, level: 35, major: "소프트웨어학부", isFriend: true },
    { name: "백트래킹", rp: 11000, level: 31, major: "소프트웨어학부", isFriend: false },
    { name: "나", rp: 0, level: 1, major: "소프트웨어학부", isCurrentUser: true, isFriend: false },
    { name: "와샌즈", rp: 9800, level: 28, major: "소프트웨어학부", isFriend: true },
    { name: "교양인", rp: 8500, level: 25, major: "경영학과", isFriend: false },
    { name: "지나가는사람", rp: 7200, level: 22, major: "기계공학과", isFriend: false },
    { name: "정립반정립종합", rp: 6100, level: 20, major: "철학과", isFriend: true },
    { name: "HelloWorld", rp: 2400, level: 8, major: "소프트웨어학부", isFriend: false },
    { name: "배달의민족", rp: 14500, level: 38, major: "역사학과", isFriend: false },
    { name: "채찍피티", rp: 5500, level: 16, major: "AI학과", isFriend: false },
    { name: "잼민이", rp: 300, level: 4, major: "AI학과", isFriend: true },
];
