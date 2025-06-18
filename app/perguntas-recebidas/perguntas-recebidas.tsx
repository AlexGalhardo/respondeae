"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
	Clock,
	UserX,
	ChevronLeft,
	ChevronRight,
	Trash2,
	DollarSign,
	Flag,
	XCircle,
	CheckCircle,
	HelpCircle,
	Lock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/loading-screen";
import { FaMoneyBillWave } from "react-icons/fa6";
import { QuestionInterface } from "@/lib/interfaces";

export default function PerguntasRecebidasClient() {
	const [questions, setQuestions] = useState<QuestionInterface[]>([]);
	const router = useRouter();
	const { data: session, status, update } = useSession();
	const { toast } = useToast();

	const [currentPage, setCurrentPage] = useState(1);
	const questionsPerPage = 10;

	const [isAnswerConfirmModalOpen, setIsAnswerConfirmModalOpen] = useState(false);
	const [isDeclineConfirmModalOpen, setIsDeclineConfirmModalOpen] = useState(false);
	const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
	const [selectedQuestionForAction, setSelectedQuestionForAction] = useState<QuestionInterface | null>(null);

	useEffect(() => {
		if (status !== "loading" && !session) {
			router.push("/entrar");
		}
	}, [session, status, router]);

	const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});
	const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});
	const [deleteTimers, setDeleteTimers] = useState<{ [key: string]: string }>({});
	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [selectedQuestion, setSelectedQuestion] = useState<QuestionInterface | null>(null);
	const [reportReason, setReportReason] = useState("");

	useEffect(() => {
		if (session?.user?.questions_received) {
			setQuestions(
				session.user.questions_received.map((q: any) => ({
					...q,
					owner: q.owner ?? null,
					asked_by: q.asked_by ?? null,
				})),
			);
		}
	}, [session]);

	useEffect(() => {
		const interval = setInterval(() => {
			const updateTimers = async () => {
				const newTimeRemaining: { [key: string]: string } = {};
				const newDeleteTimers: { [key: string]: string } = {};

				for (const question of questions) {
					if (question.question_is_awaiting_answer) {
						const createdAt = new Date(question.created_at).getTime();
						const expiryTime = createdAt + 168 * 60 * 60 * 1000; // 7 dias corridos
						newTimeRemaining[question.id] = await getTimeRemaining(
							question.id,
							new Date(expiryTime).toISOString(),
						);
					}
					if (question.question_answer_was_recused && question.updated_at) {
						newDeleteTimers[question.id] = getDeleteTimer(new Date(question.created_at).toISOString());
					}
				}

				setTimeRemaining(newTimeRemaining);
				setDeleteTimers(newDeleteTimers);
			};

			updateTimers();
		}, 1000);

		return () => clearInterval(interval);
	}, [questions]);

	const getTimeRemaining = async (questionId: string, expiresAt: string) => {
		const now = new Date().getTime();
		const expiry = new Date(expiresAt).getTime();
		const diff = expiry - now;

		if (diff <= 0) {
			await fetch("/api/question/expired", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ questionId }),
			});
			await update();
		}

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return `${days}d ${hours}h ${minutes}m ${seconds}s restantes para responder essa pergunta`;
	};

	const getDeleteTimer = (declinedAt: string) => {
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
	};

	const handleConfirmAnswer = (question: QuestionInterface) => {
		const answer = answerText[question.id];
		if (!answer?.trim()) {
			toast({
				title: "Erro",
				description: "Por favor, digite uma resposta.",
				variant: "error",
			});
			return;
		}

		if (answer.length < 32) {
			toast({
				title: "Resposta muito curta",
				description: "A resposta deve ter pelo menos 32 caracteres.",
				variant: "error",
			});
			return;
		}

		if (answer.length > 512) {
			toast({
				title: "Resposta muito longa",
				description: "A resposta deve ter no máximo 512 caracteres.",
				variant: "error",
			});
			return;
		}
		setSelectedQuestionForAction(question);
		setIsAnswerConfirmModalOpen(true);
	};

	const handleAnswerQuestion = async () => {
		if (!selectedQuestionForAction || !session?.user?.id) return;

		const answer = answerText[selectedQuestionForAction.id];

		try {
			const response = await fetch("/api/question/answer", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					questionId: selectedQuestionForAction.id,
					nickname: session.user.nickname,
					answerText: answer,
				}),
			});

			if (!response.ok) {
				toast({
					title: "Erro ao enviar resposta. Tente novamente mais tarde",
					variant: "error",
				});
			}

			setQuestions((prev) =>
				prev.map((q) =>
					q.id === selectedQuestionForAction.id
						? {
								...q,
								question_answered: true,
								question_is_awaiting_answer: false,
								answer_text: answer,
								answer_timestamp: new Date(),
							}
						: q,
				),
			);
			setAnswerText((prev) => ({ ...prev, [selectedQuestionForAction.id]: "" }));
			toast({
				title: "Resposta enviada!",
				description: "Sua resposta foi publicada com sucesso.",
			});
			await update();
		} catch (error) {
			toast({
				title: "Erro ao enviar resposta. Tente novamente mais tarde",
				variant: "error",
			});
		} finally {
			setIsAnswerConfirmModalOpen(false);
			setSelectedQuestionForAction(null);
		}
	};

	const handleConfirmDecline = (question: QuestionInterface) => {
		setSelectedQuestionForAction(question);
		setIsDeclineConfirmModalOpen(true);
	};

	const handleDeclineQuestion = async () => {
		if (!selectedQuestionForAction || !session?.user?.id) return;

		try {
			const response = await fetch("/api/question/recused", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					questionId: selectedQuestionForAction.id,
					nickname: session.user.nickname,
				}),
			});

			if (!response.ok) {
				toast({
					title: "Erro ao recusar resposta. Tente novamente mais tarde",
					variant: "error",
				});
			}

			setQuestions((prev) =>
				prev.map((q) =>
					q.id === selectedQuestionForAction.id
						? {
								...q,
								question_answer_was_recused: true,
								question_is_awaiting_answer: false,
								updated_at: new Date(),
							}
						: q,
				),
			);
			toast({
				title: "Pergunta recusada",
				variant: "success",
			});
			await update();
		} catch (error) {
			toast({
				title: "Erro ao recusar pergunta. Tente novamente mais tarde",
				variant: "error",
			});
		} finally {
			setIsDeclineConfirmModalOpen(false);
			setSelectedQuestionForAction(null);
		}
	};

	const handleConfirmDelete = (question: QuestionInterface) => {
		setSelectedQuestionForAction(question);
		setIsDeleteConfirmModalOpen(true);
	};

	const handleDeleteQuestion = async () => {
		if (!selectedQuestionForAction || !session?.user?.id) return;

		try {
			const response = await fetch("/api/question/delete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					questionId: selectedQuestionForAction.id,
					nickname: session.user.nickname,
				}),
			});

			if (!response.ok) {
				toast({
					title: "Erro ao deletar pergunta. Tente novamente mais tarde.",
					variant: "error",
				});
			}

			setQuestions((prev) => prev.filter((q) => q.id !== selectedQuestionForAction.id));
			toast({
				title: "Pergunta deletada",
				description: "A pergunta foi removida permanentemente.",
			});
			await update();
		} catch (error) {
			toast({
				title: "Erro ao deletar pergunta",
				variant: "error",
			});
		} finally {
			setIsDeleteConfirmModalOpen(false);
			setSelectedQuestionForAction(null);
		}
	};

	function handleOpenReportModal(question: QuestionInterface) {
		setSelectedQuestion(question);
		setIsReportModalOpen(true);
	}

	const handleReport = async () => {
		if (!reportReason || !selectedQuestion || !session?.user?.nickname) {
			toast({
				title: "Erro",
				description:
					"Por favor, selecione um motivo para o report e certifique-se de que a pergunta e o usuário estão disponíveis.",
				variant: "error",
			});
			return;
		}

		let isOffensive = false;
		let isInappropriate = false;

		if (reportReason === "offensive") {
			isOffensive = true;
		} else if (reportReason === "inappropriate") {
			isInappropriate = true;
		} else {
			toast({
				title: "Erro de Reporte",
				description: "Motivo de reporte inválido. Por favor, selecione 'Ofensiva' ou 'Inapropriada'.",
				variant: "error",
			});
			return;
		}

		try {
			const response = await fetch("/api/question/report-question", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					questionId: selectedQuestion.id,
					nickname: session.user.nickname, // Using userNickname as requested
					isOffensive: isOffensive, // New field
					isInappropriate: isInappropriate, // New field
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				toast({
					title: "Erro ao reportar pergunta.",
					description: errorData.error || "Tente novamente mais tarde.",
					variant: "error",
				});
				return; // Stop execution if there's an error
			}

			setQuestions((prev) =>
				prev.map((q) =>
					q.id === selectedQuestion.id
						? {
								...q,
								owner_reported_offensive_question: isOffensive
									? true
									: q.owner_reported_offensive_question,
								owner_reported_inadequate_question: isInappropriate
									? true
									: q.owner_reported_inadequate_question,
								updated_at: new Date(),
							}
						: q,
				),
			);

			setIsReportModalOpen(false);
			setSelectedQuestion(null);
			setReportReason("");
			toast({
				title: "Pergunta reportada com sucesso",
				description: "Obrigado pelo seu feedback. Analisaremos o conteúdo reportado.",
			});
			await update(); // To re-fetch session data if needed
		} catch (error) {
			console.error("Error reporting question:", error);
			toast({
				title: "Erro ao reportar pergunta",
				description: "Não foi possível reportar a pergunta. Tente novamente.",
				variant: "error",
			});
		}
	};

	const handleWithdraw = () => {
		toast({
			title: "Saque solicitado",
			description: "Seu saque está sendo processado.",
		});
	};

	const pendingQuestions = session?.user?.questions_received
		?.filter(
			(q) =>
				q.question_is_awaiting_answer &&
				!q.question_answer_was_expired &&
				!q.owner_reported_offensive_question &&
				!q.owner_reported_inadequate_question,
		)
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

	const answeredQuestions = session?.user?.questions_received
		?.filter((q) => q.answered_at)
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

	const declinedQuestions = session?.user?.questions_received
		?.filter((q) => q.question_answer_was_recused)
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

	const expiredQuestions = session?.user?.questions_received
		?.filter((q) => q.question_answer_was_expired)
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

	const reportedQuestions = session?.user?.questions_received
		?.filter((q) => q.owner_reported_offensive_question || q.owner_reported_inadequate_question)
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

	const getPaginatedQuestions = (questionsList: QuestionInterface[]) => {
		const startIndex = (currentPage - 1) * questionsPerPage;
		const endIndex = startIndex + questionsPerPage;
		return questionsList.slice(startIndex, endIndex);
	};

	const getTotalPages = (questionsList: QuestionInterface[]) => {
		return Math.ceil(questionsList.length / questionsPerPage);
	};

	const renderPagination = (questionsList: QuestionInterface[]) => {
		const totalPages = getTotalPages(questionsList);
		if (totalPages <= 1) return null;

		return (
			<div className="flex items-center justify-center gap-2 mt-6">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				<span className="text-sm text-gray-600">
					Página {currentPage} de {totalPages}
				</span>

				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		);
	};

	const getQuestionStatus = (
		question: QuestionInterface,
	): "pending" | "answered" | "declined" | "expired" | "reported" => {
		if (question.question_is_awaiting_answer && !question.question_answer_was_expired) return "pending";
		if (question.answered_at) return "answered";
		if (question.question_answer_was_recused) return "declined";
		if (question.question_answer_was_expired) return "expired";
		if (question.owner_reported_inadequate_question || question.owner_reported_offensive_question)
			return "reported";
		return "pending";
	};

	const renderQuestionCard = (question: QuestionInterface, showAnswerForm = false) => {
		const status = getQuestionStatus(question);

		return (
			<Card key={question.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-3">
							{question.asker_sent_anonymous_question ? (
								<div className="flex items-center gap-2">
									<UserX className="h-5 w-5 text-gray-500 dark:text-gray-400" />
									<span className="text-sm text-gray-500 dark:text-gray-400">Pergunta Anônima</span>
								</div>
							) : (
								<div className="flex items-center gap-3">
									<Avatar className="h-10 w-10">
										<AvatarImage src={question.asked_by.avatar_url} alt={question.asked_by.name} />
										<AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
											{question.asked_by.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-semibold text-gray-900 dark:text-gray-100">
											{question.asked_by.name}
										</p>
										<a
											className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
											href={`/${question.asked_by.nickname}`}
										>
											@{question.asked_by.nickname}
										</a>
									</div>
								</div>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xl hover:bg-green-100 dark:hover:bg-green-800 border-green-200 dark:border-green-700">
								Pagou {formatCurrency(question.amount_paid)}
							</Badge>
							<span className="text-gray-500 dark:text-gray-400">
								{formatDate(
									typeof question.created_at === "string"
										? question.created_at
										: question.created_at.toISOString(),
								)}
							</span>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2 mt-4">
						<div className="flex items-start gap-2 text-gray-800 dark:text-gray-200">
							<HelpCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
							<p className="text-base leading-snug">
								<strong className="text-blue-600 dark:text-blue-400">Perguntou</strong>:{" "}
								{question.question_text}
							</p>
						</div>

						{question.asker_want_answer_to_be_private && (
							<div className="flex items-start gap-2 text-gray-800 dark:text-gray-200">
								<Lock className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-1" />
								<p className="text-base leading-snug">
									<strong className="text-yellow-600 dark:text-yellow-400">
										Essa Resposta É Privada
									</strong>
								</p>
							</div>
						)}

						{question.amount_paid_is_private && (
							<div className="flex items-start gap-2 text-gray-800 dark:text-gray-200">
								<FaMoneyBillWave className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
								<p className="text-base leading-snug">
									<strong className="text-green-600 dark:text-green-400">
										O valor pago por essa pergunta será privado
									</strong>
								</p>
							</div>
						)}
					</div>

					{status === "pending" && (
						<div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
							<Clock className="h-4 w-4" />
							<span className="text-sm font-medium">{timeRemaining[question.id] || "Calculando..."}</span>
						</div>
					)}

					{status === "declined" && (
						<div className="space-y-2">
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleConfirmDelete(question)}
									className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-white dark:bg-gray-800"
								>
									<Trash2 className="h-4 w-4 mr-1" />
									Deletar
								</Button>
							</div>
						</div>
					)}

					{question.answer_text && (
						<div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-l-4 border-green-400 dark:border-green-500 mt-10 shadow-sm dark:shadow-gray-900/20">
							<p className="text-gray-700 dark:text-gray-200">{question.answer_text}</p>
							{question.answered_at && (
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
									Você respondeu em{" "}
									{formatDate(
										typeof question.answered_at === "string"
											? question.answered_at
											: question.answered_at?.toISOString(),
									)}
								</p>
							)}
						</div>
					)}

					{status === "answered" && question.amount_already_withdraw && (
						<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
							<DollarSign className="h-4 w-4" />
							<span className="text-sm font-medium">Já Sacou</span>
						</div>
					)}

					{showAnswerForm && status === "pending" && (
						<div className="space-y-3">
							<Textarea
								placeholder="Digite sua resposta aqui..."
								value={answerText[question.id] || ""}
								onChange={(e) => setAnswerText((prev) => ({ ...prev, [question.id]: e.target.value }))}
								className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400"
							/>
							<div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
								<small>Mínimo: 32 caracteres | Máximo: 512 caracteres</small>
								<small
									className={
										(answerText[question.id]?.length || 0) > 512
											? "text-red-500 dark:text-red-400"
											: ""
									}
								>
									{answerText[question.id]?.length || 0}/512
								</small>
							</div>
							<div className="flex justify-between items-center w-full">
								<Button
									onClick={() => handleConfirmAnswer(question)} // Use confirm modal
									className="border bg-white dark:bg-gray-800 border-green-700 dark:border-green-600 text-black dark:text-gray-200 hover:bg-green-700 dark:hover:bg-green-600 hover:text-white transition-colors"
									disabled={
										!answerText[question.id]?.trim() ||
										(answerText[question.id]?.length || 0) < 32 ||
										(answerText[question.id]?.length || 0) > 512
									}
								>
									<CheckCircle className="h-4 w-4" />
									Responder
								</Button>

								<div className="flex gap-2">
									<Button
										variant="outline"
										onClick={() => handleConfirmDecline(question)} // Use confirm modal
										className="border border-red-600 dark:border-red-500 bg-white dark:bg-gray-800 text-black dark:text-gray-200 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-colors"
									>
										<XCircle className="h-4 w-4" />
										Não Quero Responder
									</Button>

									<Button
										variant="outline"
										onClick={() => handleOpenReportModal(question)}
										className="border border-orange-600 dark:border-orange-500 bg-white dark:bg-gray-800 text-black dark:text-gray-200 hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white transition-colors"
									>
										<Flag className="h-4 w-4 mr-1" />
										Reportar Pergunta
									</Button>
								</div>
							</div>
						</div>
					)}

					{status === "expired" && (
						<div className="mt-4">
							<Badge
								variant="secondary"
								className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
							>
								Pergunta Expirada
							</Badge>
							<div className="space-y-2 mt-6">
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleConfirmDelete(question)}
										className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-white dark:bg-gray-800"
									>
										<Trash2 className="h-4 w-4 mr-1" />
										Deletar
									</Button>
								</div>
							</div>
						</div>
					)}

					{status === "reported" && (
						<div className="mt-4">
							<Badge
								variant="secondary"
								className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
							>
								Pergunta Reportada
							</Badge>
							<div className="space-y-2 mt-6">
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleConfirmDelete(question)}
										className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-white dark:bg-gray-800"
									>
										<Trash2 className="h-4 w-4 mr-1" />
										Deletar
									</Button>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	if (status === "loading") return <LoadingScreen />;

	return (
		<main className="p-4 lg:p-6">
			<Tabs defaultValue="pending" className="w-full" onValueChange={() => setCurrentPage(1)}>
				<TabsList className="w-full flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-5 gap-2 sm:gap-0 px-1 sm:px-0">
					<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="pending">
						Aguardando ({pendingQuestions?.length})
					</TabsTrigger>
					<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="answered">
						Respondidas ({answeredQuestions?.length})
					</TabsTrigger>
					<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="declined">
						Recusadas ({declinedQuestions?.length})
					</TabsTrigger>
					<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="expired">
						Expiradas ({expiredQuestions?.length})
					</TabsTrigger>
					<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="reported">
						Reportadas ({reportedQuestions?.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="pending" className="space-y-6">
					{pendingQuestions?.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhuma pergunta pendente no momento.</div>
					) : (
						<>
							{getPaginatedQuestions(pendingQuestions ?? []).map((question) =>
								renderQuestionCard(question, true),
							)}
							{renderPagination(pendingQuestions ?? [])}
						</>
					)}
				</TabsContent>

				<TabsContent value="answered" className="space-y-6">
					{answeredQuestions?.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhuma pergunta respondida ainda.</div>
					) : (
						<>
							{getPaginatedQuestions(answeredQuestions ?? []).map((question) =>
								renderQuestionCard(question),
							)}
							{renderPagination(answeredQuestions ?? [])}
						</>
					)}
				</TabsContent>

				<TabsContent value="declined" className="space-y-6">
					{declinedQuestions?.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhuma pergunta recusada.</div>
					) : (
						<>
							{getPaginatedQuestions(declinedQuestions ?? []).map((question) =>
								renderQuestionCard(question),
							)}
							{renderPagination(declinedQuestions ?? [])}
						</>
					)}
				</TabsContent>

				<TabsContent value="expired" className="space-y-6">
					{expiredQuestions?.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhuma pergunta expirada.</div>
					) : (
						<>
							{getPaginatedQuestions(expiredQuestions ?? []).map((question) =>
								renderQuestionCard(question),
							)}
							{renderPagination(expiredQuestions ?? [])}
						</>
					)}
				</TabsContent>

				<TabsContent value="reported" className="space-y-6">
					{expiredQuestions?.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhuma pergunta reportada.</div>
					) : (
						<>
							{getPaginatedQuestions(reportedQuestions ?? []).map((question) =>
								renderQuestionCard(question),
							)}
							{renderPagination(reportedQuestions ?? [])}
						</>
					)}
				</TabsContent>
			</Tabs>

			<Dialog open={isAnswerConfirmModalOpen} onOpenChange={setIsAnswerConfirmModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirmar resposta?</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-700">Essa resposta não pode ser editado depois de enviada.</p>
					</div>
					<DialogFooter className="flex justify-end gap-2">
						<Button className="bg-red-600 text-white" onClick={() => setIsAnswerConfirmModalOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleAnswerQuestion} className="bg-green-600 text-white">
							Confirmar Resposta
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isDeclineConfirmModalOpen} onOpenChange={setIsDeclineConfirmModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirmar recusa?</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-700">
							Você tem certeza que não quer responder a esta pergunta? Essa ação não pode ser desfeita.
						</p>
					</div>
					<DialogFooter className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setIsDeclineConfirmModalOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleDeclineQuestion} variant="destructive">
							Confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isDeleteConfirmModalOpen} onOpenChange={setIsDeleteConfirmModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirmar exclusão?</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-700">
							Esta ação não pode ser desfeita. A pergunta será removida permanentemente.
						</p>
					</div>
					<DialogFooter className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setIsDeleteConfirmModalOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleDeleteQuestion} variant="destructive">
							Deletar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Reportar Pergunta</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-sm text-gray-600">Por que você está reportando esta pergunta?</p>

						<RadioGroup value={reportReason} onValueChange={setReportReason}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="offensive" id="offensive" />
								<Label htmlFor="offensive">Pergunta Ofensiva</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="inappropriate" id="inappropriate" />
								<Label htmlFor="inappropriate">Pergunta Inapropriada</Label>
							</div>
						</RadioGroup>

						<div className="flex gap-2 justify-end">
							<Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
								Cancelar
							</Button>
							<Button
								onClick={handleReport}
								className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
							>
								Enviar
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</main>
	);
}
