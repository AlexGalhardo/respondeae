import { QuestionInterface, QuestionStatus } from "@/types/QuestionInterface";

export function getQuestionStatus(question: QuestionInterface): QuestionStatus {
	if (question.owner_reported_offensive_question || question.onwer_reported_inadequate_question) {
		return "reported";
	}
	if (question.question_answer_was_expired) return "expired";
	if (question.answered_at) return "answered";
	if (question.question_answer_was_recused) return "declined";
	if (question.question_is_awaiting_answer && !question.question_answer_was_expired) return "pending";
	return "pending";
}

export function filterQuestionsByStatus(questions: QuestionInterface[], status: QuestionStatus): QuestionInterface[] {
	return questions
		.filter((q) => {
			switch (status) {
				case "pending":
					return (
						q.question_is_awaiting_answer &&
						!q.question_answer_was_expired &&
						!q.owner_reported_offensive_question &&
						!q.onwer_reported_inadequate_question
					);
				case "answered":
					return q.answered_at;
				case "declined":
					return q.question_answer_was_recused;
				case "expired":
					return q.question_answer_was_expired;
				case "reported":
					return q.owner_reported_offensive_question || q.onwer_reported_inadequate_question;
				default:
					return false;
			}
		})
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getTimeRemaining(createdAt: string): string {
	const now = new Date().getTime();
	const created = new Date(createdAt).getTime();
	const expiryTime = created + 168 * 60 * 60 * 1000; // 7 dias
	const diff = expiryTime - now;

	if (diff <= 0) return "Expirado";

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	return `${days}d ${hours}h ${minutes}m ${seconds}s restantes para responder essa pergunta`;
}

export function getDeleteTimer(declinedAt: string): string {
	const now = new Date().getTime();
	const declined = new Date(declinedAt).getTime();
	const deleteTime = declined + 7 * 24 * 60 * 60 * 1000;
	const diff = deleteTime - now;

	if (diff <= 0) return "Pronto para deletar";

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	return `${days}d ${hours}h ${minutes}m ${seconds}s para pergunta ser deletada`;
}

export function paginateQuestions(questions: QuestionInterface[], page: number, perPage: number) {
	const startIndex = (page - 1) * perPage;
	const endIndex = startIndex + perPage;
	return {
		questions: questions.slice(startIndex, endIndex),
		totalPages: Math.ceil(questions.length / perPage),
		hasNextPage: endIndex < questions.length,
		hasPrevPage: page > 1,
	};
}
