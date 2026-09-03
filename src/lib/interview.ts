export type InterviewQuestionKind = "technical" | "culture";

export type InterviewQuestion = {
  id: string;
  kind: InterviewQuestionKind;
  question: string;
  expectedAnswer: string;
};

export type InterviewGuide = {
  technicalQuestions: InterviewQuestion[];
  cultureQuestions: InterviewQuestion[];
  strengths: string[];
  probeAreas: string[];
};

export type InterviewRating = {
  questionId: string;
  rating: number;
  note: string;
};

export function interviewFinalScore(ratings: InterviewRating[]) {
  const scored = ratings.filter((item) => item.rating >= 1);
  if (!scored.length) return 0;
  const average = scored.reduce((sum, item) => sum + item.rating, 0) / scored.length;
  return Math.round((average / 5) * 100);
}

export function allQuestions(guide: InterviewGuide) {
  return [...guide.technicalQuestions, ...guide.cultureQuestions];
}
