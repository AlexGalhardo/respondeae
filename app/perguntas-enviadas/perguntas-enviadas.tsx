"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UserX, ChevronLeft, ChevronRight, Flag, HelpCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/loading-screen";
import { QuestionInterface } from "@/lib/interfaces";
import { getInitials } from "@/lib/functions";
import { FaMoneyBillWave } from "react-icons/fa6";

export default function PerguntasEnviadasClient() {
	const [loading, setLoading] = useState(true);
	const [questions, setQuestions] = useState<QuestionInterface[]>([]);
	const router = useRouter();
	const { data: session, status } = useSession();
	const { toast } = useToast();

	const [currentPage, setCurrentPage] = useState(1);
	const questionsPerPage = 10;

	const [isReportModalOpen, setIsReportModalOpen] = useState(false);
	const [selectedQuestion, setSelectedQuestion] = useState<QuestionInterface | null>(null);
	const [reportReason, setReportReason] = useState("");

	const [userInteractions, setUserInteractions] = useState<{
		[questionId: string]: { liked: boolean; disliked: boolean };
	}>({});

	useEffect(() => {
		if (status !== "loading" && !session) {
			router.push("/entrar");
		}
	}, [session, status, router]);

	useEffect(() => {
		if (session?.user?.questions_sent) {
			setQuestions(session.user.questions_sent);
			setLoading(false);
		}
	}, [session]);

	const financialData = {
		totalPaid: questions.filter((q) => q.question_answered).reduce((sum, q) => sum + q.amount_paid, 0),
		totalDeclined: questions
			.filter((q) => q.question_answer_was_recused)
			.reduce((sum, q) => sum + q.amount_paid, 0),
		totalExpired: questions.filter((q) => q.question_answer_was_expired).reduce((sum, q) => sum + q.amount_paid, 0),
	};

	const handleLike = async (questionId: string) => {
		const currentInteraction = userInteractions[questionId] || { liked: false, disliked: false };
		const wasLiked = currentInteraction.liked;
		const wasDisliked = currentInteraction.disliked;

		// Atualizar estado local imediatamente para responsividade
		setUserInteractions((prev) => ({
			...prev,
			[questionId]: {
				liked: !wasLiked,
				disliked: false,
			},
		}));

		setQuestions((prev) =>
			prev.map((q) => {
				if (q.id === questionId) {
					return {
						...q,
						total_likes: wasLiked ? q.liked_by_users.length - 1 : q.liked_by_users.length,
						total_dislikes: wasDisliked ? q.desliked_by_users.length - 1 : q.desliked_by_users.length + 1,
					};
				}
				return q;
			}),
		);

		// Aqui você faria a chamada para a API
		try {
			// await api.post(`/questions/${questionId}/like`);
		} catch (error) {
			// Reverter mudanças em caso de erro
			setUserInteractions((prev) => ({
				...prev,
				[questionId]: currentInteraction,
			}));
			toast({
				title: "Erro",
				description: "Não foi possível curtir a resposta.",
				variant: "error",
			});
		}
	};

	const handleDislike = async (questionId: string) => {
		const currentInteraction = userInteractions[questionId] || { liked: false, disliked: false };
		const wasLiked = currentInteraction.liked;
		const wasDisliked = currentInteraction.disliked;

		// Atualizar estado local imediatamente para responsividade
		setUserInteractions((prev) => ({
			...prev,
			[questionId]: {
				liked: false,
				disliked: !wasDisliked,
			},
		}));

		setQuestions((prev) =>
			prev.map((q) => {
				if (q.id === questionId) {
					return {
						...q,
						total_likes: wasLiked ? q.liked_by_users.length - 1 : q.liked_by_users.length,
						total_dislikes: wasDisliked ? q.desliked_by_users.length - 1 : q.desliked_by_users.length + 1,
					};
				}
				return q;
			}),
		);

		// Aqui você faria a chamada para a API
		try {
			// await api.post(`/questions/${questionId}/dislike`);
		} catch (error) {
			// Reverter mudanças em caso de erro
			setUserInteractions((prev) => ({
				...prev,
				[questionId]: currentInteraction,
			}));
			toast({
				title: "Erro",
				description: "Não foi possível descurtir a resposta.",
				variant: "error",
			});
		}
	};

	const handleReport = async () => {
		if (!reportReason || !selectedQuestion) {
			toast({
				title: "Erro",
				description: "Por favor, selecione um motivo para o report.",
				variant: "error",
			});
			return;
		}

		try {
			// Aqui você faria a chamada para a API
			// await api.post(`/questions/${selectedQuestion.id}/report`, { reason: reportReason });

			setIsReportModalOpen(false);
			setSelectedQuestion(null);
			setReportReason("");

			toast({
				title: "Resposta reportada com sucesso",
				description: "Obrigado pelo seu feedback. Analisaremos o conteúdo reportado.",
			});
		} catch (error) {
			toast({
				title: "Erro",
				description: "Não foi possível reportar a resposta.",
				variant: "error",
			});
		}
	};

	const handleWithdrawUnanswered = async () => {
		try {
			// Aqui você faria a chamada para a API
			// await api.post('/withdraw/unanswered');

			toast({
				title: "Saque solicitado",
				description: "Seu saque de perguntas não respondidas está sendo processado.",
			});
		} catch (error) {
			toast({
				title: "Erro",
				description: "Não foi possível processar o saque.",
				variant: "error",
			});
		}
	};

	const getStatusBadge = (question: QuestionInterface) => {
		if (question.question_answered) {
			return <Badge className="bg-green-100 text-green-700">Respondida</Badge>;
		} else if (question.question_answer_was_recused) {
			return <Badge className="bg-red-100 text-red-700">Recusada</Badge>;
		} else if (question.question_answer_was_expired) {
			return <Badge className="bg-gray-100 text-gray-700">Expirada</Badge>;
		} else if (question.question_is_awaiting_answer) {
			return <Badge className="bg-yellow-100 text-yellow-700">Aguardando</Badge>;
		}
		return <Badge className="bg-yellow-100 text-yellow-700">Aguardando</Badge>;
	};

	const getQuestionStatus = (question: QuestionInterface): string => {
		if (question.question_is_awaiting_answer && !question.question_answer_was_expired) return "pending";
		if (question.question_answered) return "answered";
		if (question.question_answer_was_recused) return "declined";
		if (question.question_answer_was_expired) return "expired";
		if (question.owner_reported_inadequate_question || question.owner_reported_offensive_question)
			return "reported";
		return "answered";
	};

	const answeredQuestions = questions.filter((q) => q.question_answered);
	const pendingQuestions = questions.filter(
		(q) =>
			q.question_is_awaiting_answer ||
			(!q.question_answered && !q.question_answer_was_recused && !q.question_answer_was_expired),
	);
	const declinedQuestions = questions.filter((q) => q.question_answer_was_recused);
	const expiredQuestions = questions.filter((q) => q.question_answer_was_expired);

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

	const renderQuestionCard = (question: QuestionInterface) => {
		const status = getQuestionStatus(question);

		return (
			<Card key={question.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-2">
							<Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xl hover:bg-green-100 dark:hover:bg-green-800 border-green-200 dark:border-green-700">
								Você Pagou {formatCurrency(question.amount_paid)}
							</Badge>
							<span className="text-gray-500 dark:text-gray-400">
								Em{" "}
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
					<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
						{question.asker_sent_anonymous_question && (
							<>
								<UserX className="h-4 w-4" />
								<span>Enviada anonimamente</span>
								<span>•</span>
							</>
						)}
					</div>

					<div className="space-y-2">
						<div className="flex items-start gap-2 text-gray-800 dark:text-gray-200">
							<HelpCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
							<p className="text-lg leading-snug">
								<strong className="text-blue-600 dark:text-blue-400">Você Perguntou</strong>:{" "}
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

					{question.answer_text && (
						<>
							<div className="flex items-start gap-2 sm:gap-3 mb-3">
								<Avatar className="h-8 w-8 flex-shrink-0">
									<AvatarImage src={question.owner.avatar_url} alt={question.owner.name} />
									<AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
										{getInitials(question.owner.name)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
										<span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
											{question.owner.name}
										</span>
										<Link
											href={`/${question.owner.nickname}`}
											className="text-sm font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 truncate transition-colors"
										>
											@{question.owner.nickname}
										</Link>
									</div>
									<div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs text-green-600 dark:text-green-400">
										<span>respondeu</span>
										<span className="text-gray-500 dark:text-gray-400">
											{formatDate(
												typeof question.answered_at === "string"
													? question.answered_at
													: question.answered_at.toISOString(),
											)}
										</span>
									</div>
									<div className="rounded bg-green-50 dark:bg-green-900/20 px-6 py-6 mt-6 mb-3 border border-green-200 dark:border-green-800">
										<p className="text-gray-700 dark:text-gray-200">{question.answer_text}</p>
										{question.answered_at && (
											<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
												Respondida em{" "}
												{formatDate(
													typeof question.answered_at === "string"
														? question.answered_at
														: question.answered_at?.toISOString(),
												)}
											</p>
										)}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setSelectedQuestion(question);
										setIsReportModalOpen(true);
									}}
									className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
								>
									<Flag className="h-4 w-4 mr-1" />
									Reportar resposta
								</Button>
							</div>
						</>
					)}

					{status === "declined" && (
						<div className="flex items-start gap-2 sm:gap-3 mb-3">
							<Avatar className="h-8 w-8 flex-shrink-0">
								<AvatarImage src={question.owner.avatar_url} alt={question.owner.name} />
								<AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
									{getInitials(question.owner.name)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
									<span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
										{question.owner.name}
									</span>
									<Link
										href={`/${question.owner.nickname}`}
										className="text-sm font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 truncate transition-colors"
									>
										@{question.owner.nickname}
									</Link>
								</div>
							</div>
							<div className="mt-4">
								<Badge
									variant="secondary"
									className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-3 border-red-200 dark:border-red-800"
								>
									Pergunta Recusada
								</Badge>
							</div>
						</div>
					)}

					{status === "expired" && (
						<div className="flex items-start gap-2 sm:gap-3 mb-3">
							<Avatar className="h-8 w-8 flex-shrink-0">
								<AvatarImage src={question.owner.avatar_url} alt={question.owner.name} />
								<AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
									{getInitials(question.owner.name)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
									<span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
										{question.owner.name}
									</span>
									<Link
										href={`/${question.owner.nickname}`}
										className="text-sm font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 truncate transition-colors"
									>
										@{question.owner.nickname}
									</Link>
								</div>
							</div>
							<div className="mt-4">
								<Badge
									variant="secondary"
									className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-3 border-gray-200 dark:border-gray-600"
								>
									Pergunta Expirada
								</Badge>
							</div>
						</div>
					)}

					{status === "pending" && (
						<div className="flex items-start gap-2 sm:gap-3 mb-3">
							<Avatar className="h-8 w-8 flex-shrink-0">
								<AvatarImage src={question.owner.avatar_url} alt={question.owner.name} />
								<AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
									{getInitials(question.owner.name)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
									<span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
										{question.owner.name}
									</span>
									<Link
										href={`/${question.owner.nickname}`}
										className="text-sm font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 truncate transition-colors"
									>
										@{question.owner.nickname}
									</Link>
								</div>
							</div>
							<div className="mt-4">
								<Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-3 border-blue-200 dark:border-blue-800">
									Aguardando Resposta...
								</Badge>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	};

	if (loading) return <LoadingScreen />;

	return (
		<main className="p-4 lg:p-6">
			<Tabs defaultValue="answered" className="w-full" onValueChange={() => setCurrentPage(1)}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="answered">Respondidas ({answeredQuestions.length})</TabsTrigger>
					<TabsTrigger value="declined">Recusadas ({declinedQuestions.length})</TabsTrigger>
					<TabsTrigger value="expired">Expiradas ({expiredQuestions.length})</TabsTrigger>
					<TabsTrigger value="pending">Aguardando ({pendingQuestions.length})</TabsTrigger>
				</TabsList>

				<TabsContent value="answered" className="space-y-6">
					{answeredQuestions.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhuma pergunta respondida ainda.</div>
					) : (
						<>
							{renderPagination(answeredQuestions)}
							{getPaginatedQuestions(answeredQuestions).map((question) => renderQuestionCard(question))}
							{renderPagination(answeredQuestions)}
						</>
					)}
				</TabsContent>

				<TabsContent value="declined" className="space-y-6">
					{declinedQuestions.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhuma pergunta recusada.</div>
					) : (
						<>
							{renderPagination(declinedQuestions)}
							{getPaginatedQuestions(declinedQuestions).map((question) => renderQuestionCard(question))}
							{renderPagination(declinedQuestions)}
						</>
					)}
				</TabsContent>

				<TabsContent value="expired" className="space-y-6">
					{expiredQuestions.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhuma pergunta expirada.</div>
					) : (
						<>
							{renderPagination(expiredQuestions)}
							{getPaginatedQuestions(expiredQuestions).map((question) => renderQuestionCard(question))}
							{renderPagination(expiredQuestions)}
						</>
					)}
				</TabsContent>

				<TabsContent value="pending" className="space-y-6">
					{pendingQuestions.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhuma pergunta aguardando resposta.</div>
					) : (
						<>
							{renderPagination(pendingQuestions)}
							{getPaginatedQuestions(pendingQuestions).map((question) => renderQuestionCard(question))}
							{renderPagination(pendingQuestions)}
						</>
					)}
				</TabsContent>
			</Tabs>

			{questions.length === 0 && !loading && (
				<div className="text-center py-12 text-gray-500">Você ainda não enviou nenhuma pergunta.</div>
			)}

			<Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Reportar Resposta</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-white">
							Por que você está reportando esta resposta?
						</p>

						<RadioGroup value={reportReason} onValueChange={setReportReason}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="offensive" id="offensive" />
								<Label htmlFor="offensive">Resposta ofensiva</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="inappropriate" id="inappropriate" />
								<Label htmlFor="inappropriate">Resposta inadequada</Label>
							</div>
						</RadioGroup>

						<div className="flex gap-2 justify-end">
							<Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
								Cancelar
							</Button>
							<Button onClick={handleReport} className="bg-red text-white">
								Reportar Essa Resposta
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</main>
	);
}
