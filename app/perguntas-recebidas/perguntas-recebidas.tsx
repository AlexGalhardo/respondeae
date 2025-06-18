"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/loading-screen";
import { QuestionsTabs } from "@/components/questions/questions-tabs";
import {
	useQuestions,
	useAnswerQuestion,
	useDeclineQuestion,
	useDeleteQuestion,
	useReportQuestion,
} from "@/hooks/use-questions";
import { QuestionInterface } from "@/types/QuestionInterface";
import { ConfirmationModals } from "@/components/questions/question-confirmation-modals";

export default function PerguntasRecebidasPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const { data: questionsData } = useQuestions();
	const [questions, setQuestions] = useState<QuestionInterface[]>([]);

	useEffect(() => {
		if (Array.isArray(questionsData)) {
			setQuestions(questionsData);
		} else if (questionsData?.pages) {
			setQuestions(questionsData.pages.flatMap((page: any) => page.questions));
		}
	}, [questionsData]);

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

	if (status === "loading") return <LoadingScreen />;

	if (!session) {
		router.push("/entrar");
		return null;
	}

	return (
		<main className="p-4 lg:p-6">
			<QuestionsTabs
				questions={
					Array.isArray(questions)
						? questions
						: questions &&
								typeof questions === "object" &&
								"pages" in questions &&
								Array.isArray((questions as any).pages)
							? (questions as any).pages.flatMap((page: any) => page.questions)
							: []
				}
				currentPage={currentPage}
				questionsPerPage={questionsPerPage}
				onPageChange={setCurrentPage}
				onAnswer={handleAnswer}
				onDecline={handleDecline}
				onDelete={handleDelete}
				onReport={handleReport}
				loadingStates={loadingStates}
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
