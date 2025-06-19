import { QuestionInterface, QuestionStatus } from "@/types/QuestionInterface";

export function isQuestionExpired(createdAt: string | Date): boolean {
	const created = new Date(createdAt);
	const now = new Date();
	const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 7);
	return diffInHours >= 168; // 7 dias em horas
}

export function getTimeRemaining(createdAt: string | Date): {
	hours: number;
	minutes: number;
	seconds: number;
	isExpired: boolean;
} {
	const created = new Date(createdAt);
	const now = new Date();
	const expirationTime = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias corridos
	const timeLeft = expirationTime.getTime() - now.getTime();

	if (timeLeft <= 0) {
		return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
	}

	const hours = Math.floor(timeLeft / (1000 * 60 * 60));
	const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

	return { hours, minutes, seconds, isExpired: false };
}

export function paginateQuestions(questions: QuestionInterface[], currentPage: number, questionsPerPage: number) {
	const startIndex = (currentPage - 1) * questionsPerPage;
	const endIndex = startIndex + questionsPerPage;
	const paginatedQuestions = questions.slice(startIndex, endIndex);
	const totalPages = Math.ceil(questions.length / questionsPerPage);

	return {
		questions: paginatedQuestions,
		totalPages,
		currentPage,
		hasNextPage: currentPage < totalPages,
		hasPreviousPage: currentPage > 1,
	};
}

export function getQuestionStatus(question: QuestionInterface): QuestionStatus {
	// Verificar se foi reportada
	if (
		question.owner_reported_offensive_question ||
		question.onwer_reported_inadequate_question ||
		question.onwer_reported_question_at
	) {
		return "reported";
	}

	// Verificar se foi recusada
	if (question.question_answer_was_recused || question.question_answer_recused_at) {
		return "declined";
	}

	// Verificar se expirou
	if (question.question_answer_was_expired || question.question_answer_expired_at) {
		return "expired";
	}

	// Verificar se expirou por tempo (24h)
	if (isQuestionExpired(question.created_at)) {
		return "expired";
	}

	// Verificar se foi respondida
	if (
		question.question_answered &&
		!question.question_is_awaiting_answer &&
		question.answer_text &&
		question.answered_at
	) {
		return "answered";
	}

	// Se está aguardando resposta
	if (
		question.question_is_awaiting_answer &&
		!question.question_answered &&
		!question.question_answer_was_recused &&
		!question.question_answer_was_expired
	) {
		return "pending";
	}

	return "pending";
}

// export function getTimeRemaining(createdAt: string): string {
// 	const now = new Date().getTime();
// 	const created = new Date(createdAt).getTime();
// 	const expiryTime = created + 168 * 60 * 60 * 1000; // 7 dias
// 	const diff = expiryTime - now;

// 	if (diff <= 0) return "Expirado";

// 	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
// 	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
// 	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
// 	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

// 	return `${days}d ${hours}h ${minutes}m ${seconds}s restantes para responder essa pergunta`;
// }

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

export function sortQuestionsByDate(questions: QuestionInterface[]): QuestionInterface[] {
	return [...questions].sort((a, b) => {
		// Para perguntas respondidas, usar answered_at
		if (a.question_answered && b.question_answered) {
			const dateA = new Date(a.answered_at || a.created_at);
			const dateB = new Date(b.answered_at || b.created_at);
			return dateB.getTime() - dateA.getTime(); // DESC
		}

		// Para perguntas recusadas, usar question_answer_recused_at ou created_at
		if (a.question_answer_was_recused && b.question_answer_was_recused) {
			const dateA = new Date(a.question_answer_recused_at || a.created_at);
			const dateB = new Date(b.question_answer_recused_at || b.created_at);
			return dateB.getTime() - dateA.getTime(); // DESC
		}

		// Para perguntas expiradas, usar question_answer_expired_at ou created_at
		if (a.question_answer_was_expired && b.question_answer_was_expired) {
			const dateA = new Date(a.question_answer_expired_at || a.created_at);
			const dateB = new Date(b.question_answer_expired_at || b.created_at);
			return dateB.getTime() - dateA.getTime(); // DESC
		}

		// Para perguntas reportadas, usar onwer_reported_question_at ou created_at
		if (
			(a.owner_reported_offensive_question || a.onwer_reported_inadequate_question) &&
			(b.owner_reported_offensive_question || b.onwer_reported_inadequate_question)
		) {
			const dateA = new Date(a.onwer_reported_question_at || a.created_at);
			const dateB = new Date(b.onwer_reported_question_at || b.created_at);
			return dateB.getTime() - dateA.getTime(); // DESC
		}

		// Para perguntas pendentes ou casos mistos, usar created_at
		const dateA = new Date(a.created_at);
		const dateB = new Date(b.created_at);
		return dateB.getTime() - dateA.getTime(); // DESC
	});
}

export function filterQuestionsByStatus(questions: QuestionInterface[], status: QuestionStatus): QuestionInterface[] {
	if (!Array.isArray(questions)) return [];

	let filteredQuestions: QuestionInterface[] = [];

	switch (status) {
		case "pending":
			filteredQuestions = questions.filter(
				(q) =>
					q.question_is_awaiting_answer === true &&
					q.question_answered === false &&
					q.question_answer_was_recused === false &&
					q.question_answer_was_expired === false &&
					q.owner_reported_offensive_question === false &&
					q.onwer_reported_inadequate_question === false &&
					!q.onwer_reported_question_at &&
					!q.question_answer_recused_at &&
					!q.question_answer_expired_at,
			);
			break;

		case "answered":
			filteredQuestions = questions.filter(
				(q) =>
					q.question_answered === true &&
					q.question_is_awaiting_answer === false &&
					q.answer_text !== null &&
					q.answered_at !== null,
			);
			break;

		case "declined":
			filteredQuestions = questions.filter(
				(q) => q.question_answer_was_recused === true || q.question_answer_recused_at !== null,
			);
			break;

		case "expired":
			filteredQuestions = questions.filter(
				(q) => q.question_answer_was_expired === true || q.question_answer_expired_at !== null,
			);
			break;

		case "reported":
			filteredQuestions = questions.filter(
				(q) =>
					q.owner_reported_offensive_question === true ||
					q.onwer_reported_inadequate_question === true ||
					q.onwer_reported_question_at !== null,
			);
			break;

		default:
			filteredQuestions = questions;
	}

	// APLICAR ORDENAÇÃO DESC
	return sortQuestionsByDate(filteredQuestions);
}
