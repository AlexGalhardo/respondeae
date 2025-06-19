"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/loading-screen";
import { QuestionsTabs } from "@/components/questions/questions-tabs";
import {
	useReceivedQuestions,
	useAnswerQuestion,
	useDeclineQuestion,
	useDeleteQuestion,
	useReportQuestion,
	useMarkQuestionExpired,
} from "@/hooks/use-questions";
import { QuestionInterface } from "@/types/QuestionInterface";
import { ConfirmationModals } from "@/components/questions/question-confirmation-modals";
import { isQuestionExpired } from "@/lib/utils/question-utils";

export default function PerguntasRecebidasPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const { data: questions, setData: setQuestions, isLoading } = useReceivedQuestions();

	const answerMutation = useAnswerQuestion();
	const declineMutation = useDeclineQuestion();
	const deleteMutation = useDeleteQuestion();
	const reportMutation = useReportQuestion();

	const [currentPage, setCurrentPage] = useState(1);
	const questionsPerPage = 10;

	// Modal states
	const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
	const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [selectedQuestion, setSelectedQuestion] = useState<QuestionInterface | null>(null);
	const [reportReason, setReportReason] = useState("");
	const [pendingAnswer, setPendingAnswer] = useState("");

	// Loading states
	const [loadingStates, setLoadingStates] = useState({
		answering: "",
		declining: "",
		deleting: "",
	});

	useEffect(() => {
		if (status !== "loading" && !session) {
			router.push("/entrar");
		}
	}, [session, status, router]);

	const handleAnswer = (questionId: string, answerText: string) => {
		const question = questions.find((q) => q.id === questionId);
		if (!question) return;

		setSelectedQuestion(question);
		setPendingAnswer(answerText);
		setIsAnswerModalOpen(true);
	};

	const handleConfirmAnswer = async () => {
		if (!selectedQuestion || !session?.user?.nickname) return;

		setLoadingStates((prev) => ({ ...prev, answering: selectedQuestion.id }));

		try {
			await answerMutation.mutateAsync({
				questionId: selectedQuestion.id,
				nickname: session.user.nickname,
				answerText: pendingAnswer,
			});

			// Atualizar estado local
			setQuestions((prev) =>
				prev.map((q) =>
					q.id === selectedQuestion.id
						? {
								...q,
								question_answered: true,
								question_is_awaiting_answer: false,
								answer_text: pendingAnswer,
								answered_at: new Date(),
							}
						: q,
				),
			);
		} catch (error) {
			// Error handled by mutation
		} finally {
			setLoadingStates((prev) => ({ ...prev, answering: "" }));
			setIsAnswerModalOpen(false);
			setSelectedQuestion(null);
			setPendingAnswer("");
		}
	};

	const handleDecline = (questionId: string) => {
		const question = questions.find((q) => q.id === questionId);
		if (!question) return;

		setSelectedQuestion(question);
		setIsDeclineModalOpen(true);
	};

	const handleConfirmDecline = async () => {
		if (!selectedQuestion || !session?.user?.nickname) return;

		setLoadingStates((prev) => ({ ...prev, declining: selectedQuestion.id }));

		try {
			await declineMutation.mutateAsync({
				questionId: selectedQuestion.id,
				nickname: session.user.nickname,
			});

			setQuestions((prev) =>
				prev.map((q) =>
					q.id === selectedQuestion.id
						? {
								...q,
								question_answer_was_recused: true,
								question_is_awaiting_answer: false,
								updated_at: new Date(),
							}
						: q,
				),
			);
		} catch (error) {
			// Error handled by mutation
		} finally {
			setLoadingStates((prev) => ({ ...prev, declining: "" }));
			setIsDeclineModalOpen(false);
			setSelectedQuestion(null);
		}
	};

	const handleDelete = (questionId: string) => {
		const question = questions.find((q) => q.id === questionId);
		if (!question) return;

		setSelectedQuestion(question);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedQuestion || !session?.user?.nickname) return;

		setLoadingStates((prev) => ({ ...prev, deleting: selectedQuestion.id }));

		try {
			await deleteMutation.mutateAsync({
				questionId: selectedQuestion.id,
				nickname: session.user.nickname,
			});

			setQuestions((prev) => prev.filter((q) => q.id !== selectedQuestion.id));
		} catch (error) {
			// Error handled by mutation
		} finally {
			setLoadingStates((prev) => ({ ...prev, deleting: "" }));
			setIsDeleteModalOpen(false);
			setSelectedQuestion(null);
		}
	};

	const handleReport = (questionId: string) => {
		const question = questions.find((q) => q.id === questionId);
		if (!question) return;

		setSelectedQuestion(question);
		setIsReportModalOpen(true);
	};

	const handleConfirmReport = async () => {
		if (!reportReason || !selectedQuestion || !session?.user?.nickname) return;

		const isOffensive = reportReason === "offensive";
		const isInappropriate = reportReason === "inappropriate";

		try {
			await reportMutation.mutateAsync({
				questionId: selectedQuestion.id,
				nickname: session.user.nickname,
				isOffensive,
				isInappropriate,
			});

			setQuestions((prev) =>
				prev.map((q) =>
					q.id === selectedQuestion.id
						? {
								...q,
								owner_reported_offensive_question: isOffensive
									? true
									: q.owner_reported_offensive_question,
								onwer_reported_inadequate_question: isInappropriate
									? true
									: q.onwer_reported_inadequate_question,
								updated_at: new Date(),
							}
						: q,
				),
			);
		} catch (error) {
			// Error handled by mutation
		} finally {
			setIsReportModalOpen(false);
			setSelectedQuestion(null);
			setReportReason("");
		}
	};

	const markExpiredMutation = useMarkQuestionExpired();

	// Adicionar este useEffect para verificar perguntas expiradas
	useEffect(() => {
		const checkExpiredQuestions = () => {
			questions.forEach((question) => {
				if (
					question.question_is_awaiting_answer &&
					!question.question_answer_was_expired &&
					isQuestionExpired(question.created_at)
				) {
					// Marcar como expirada no backend
					markExpiredMutation.mutate(question.id);

					// Atualizar estado local
					setQuestions((prev) =>
						prev.map((q) =>
							q.id === question.id
								? {
										...q,
										question_answer_was_expired: true,
										question_is_awaiting_answer: false,
										question_answer_expired_at: new Date(),
									}
								: q,
						),
					);
				}
			});
		};

		// Verificar a cada minuto
		const interval = setInterval(checkExpiredQuestions, 60000);

		// Verificar imediatamente ao carregar
		checkExpiredQuestions();

		return () => clearInterval(interval);
	}, [questions, markExpiredMutation, setQuestions]);

	// Adicionar esta função no perguntas-recebidas.tsx
	const handleQuestionExpire = useCallback(
		(questionId: string) => {
			// Marcar como expirada no backend
			markExpiredMutation.mutate(questionId);

			// Atualizar estado local imediatamente
			setQuestions((prev) =>
				prev.map((q) =>
					q.id === questionId
						? {
								...q,
								question_answer_was_expired: true,
								question_is_awaiting_answer: false,
								question_answer_expired_at: new Date().toISOString(),
							}
						: q,
				),
			);
		},
		[markExpiredMutation, setQuestions],
	);

	if (status === "loading" || isLoading) return <LoadingScreen />;

	if (!session) {
		router.push("/entrar");
		return null;
	}

	return (
		<main className="p-4 lg:p-6">
			<QuestionsTabs
				questions={questions}
				currentPage={currentPage}
				questionsPerPage={questionsPerPage}
				onPageChange={setCurrentPage}
				onAnswer={handleAnswer}
				onDecline={handleDecline}
				onDelete={handleDelete}
				onReport={handleReport}
				onExpire={handleQuestionExpire}
				loadingStates={{
					answering: answerMutation.isPending ? answerMutation.variables?.questionId : undefined,
					declining: declineMutation.isPending ? declineMutation.variables?.questionId : undefined,
					deleting: deleteMutation.isPending ? deleteMutation.variables?.questionId : undefined,
				}}
			/>

			<ConfirmationModals
				isAnswerModalOpen={isAnswerModalOpen}
				isDeclineModalOpen={isDeclineModalOpen}
				isDeleteModalOpen={isDeleteModalOpen}
				isReportModalOpen={isReportModalOpen}
				reportReason={reportReason}
				onAnswerModalChange={setIsAnswerModalOpen}
				onDeclineModalChange={setIsDeclineModalOpen}
				onDeleteModalChange={setIsDeleteModalOpen}
				onReportModalChange={setIsReportModalOpen}
				onReportReasonChange={setReportReason}
				onConfirmAnswer={handleConfirmAnswer}
				onConfirmDecline={handleConfirmDecline}
				onConfirmDelete={handleConfirmDelete}
				onConfirmReport={handleConfirmReport}
			/>
		</main>
	);
}
