"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QuestionInterface } from "@/lib/interfaces";
import { getAllLatestDescPublicQuestionsAnswered } from "@/lib/repositories/questions.repository";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
	answerQuestion,
	declineQuestion,
	deleteQuestion,
	reportQuestion,
	markQuestionExpired,
} from "@/actions/question-actions";

const QUESTIONS_PER_PAGE = 10;

interface QuestionsPageData {
	questions: QuestionInterface[];
	nextCursor: number | undefined;
	hasMore: boolean;
	total: number;
}

interface QuestionsError {
	message: string;
	status?: number;
}

// Tipos para as mutations
interface LikeDislikeParams {
	questionId: string;
	nickname: string;
}

interface ApiResponse {
	success: boolean;
	message?: string;
	data?: any;
}

// Hook para perguntas do feed público
export const useQuestions = () => {
	const { toast } = useToast();

	const queryResult = useInfiniteQuery<QuestionsPageData, QuestionsError>({
		queryKey: ["questions", "public", "answered"],
		queryFn: async ({ pageParam = 0 }): Promise<QuestionsPageData> => {
			const allQuestions = await getAllLatestDescPublicQuestionsAnswered();
			const start = (pageParam as number) * QUESTIONS_PER_PAGE;
			const end = start + QUESTIONS_PER_PAGE;

			return {
				questions: allQuestions.slice(start, end),
				nextCursor: end < allQuestions.length ? (pageParam as number) + 1 : undefined,
				hasMore: end < allQuestions.length,
				total: allQuestions.length,
			};
		},
		getNextPageParam: (lastPage: QuestionsPageData) => lastPage.nextCursor,
		initialPageParam: 0,
		staleTime: 1000 * 60 * 5, // 5 minutos
		refetchOnWindowFocus: true,
		refetchInterval: 1000 * 60 * 2, // 2 minutos
		retry: 3,
		retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
		throwOnError: false,
	});

	if (queryResult.error) {
		toast({
			title: "Erro ao carregar perguntas",
			description: queryResult.error?.message || "Aconteceu um erro inesperado",
			variant: "error",
		});
	}

	return queryResult;
};

// Hook para perguntas recebidas (da sessão)
export function useReceivedQuestions() {
	const { data: session } = useSession();
	const [questions, setQuestions] = useState<QuestionInterface[]>([]);

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
	}, [session?.user?.questions_received]);

	return {
		data: questions,
		setData: setQuestions,
		isLoading: false,
		error: null,
	};
}

// Mutations para like/dislike (existentes)
export const useLikeQuestion = () => {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation<ApiResponse, QuestionsError, LikeDislikeParams>({
		mutationFn: async ({ questionId, nickname }: LikeDislikeParams): Promise<ApiResponse> => {
			const response = await fetch("/api/question/update-like", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					questionId,
					nickname,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || "Erro ao curtir pergunta");
			}

			return response.json();
		},
		onError: (error: QuestionsError) => {
			toast({
				title: "Erro ao curtir pergunta!",
				description: error?.message || "Erro ao curtir pergunta",
				variant: "error",
			});

			// Reverte o cache
			queryClient.invalidateQueries({ queryKey: ["questions"] });
		},
		onSettled: () => {
			// Atualiza o cache independente do resultado
			queryClient.invalidateQueries({ queryKey: ["questions"] });
		},
	});
};

export const useDislikeQuestion = () => {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation<ApiResponse, QuestionsError, LikeDislikeParams>({
		mutationFn: async ({ questionId, nickname }: LikeDislikeParams): Promise<ApiResponse> => {
			const response = await fetch("/api/question/update-deslike", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					questionId,
					nickname,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || "Erro ao descurtir pergunta");
			}

			return response.json();
		},
		onError: (error: QuestionsError) => {
			toast({
				title: "Erro ao descurtir pergunta!",
				description: error?.message || "Erro ao descurtir pergunta",
				variant: "error",
			});

			// Reverte o cache
			queryClient.invalidateQueries({ queryKey: ["questions"] });
		},
		onSettled: () => {
			// Atualiza o cache independente do resultado
			queryClient.invalidateQueries({ queryKey: ["questions"] });
		},
	});
};

// Novas mutations para gerenciamento de perguntas recebidas
export function useAnswerQuestion() {
	return useMutation({
		mutationFn: async ({
			questionId,
			nickname,
			answerText,
		}: {
			questionId: string;
			nickname: string;
			answerText: string;
		}) => {
			await answerQuestion(questionId, nickname, answerText);
			return { questionId, answerText };
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Erro ao enviar resposta");
		},
		onSuccess: () => {
			toast.success("Resposta enviada com sucesso!");
		},
	});
}

export function useDeclineQuestion() {
	return useMutation({
		mutationFn: async ({
			questionId,
			nickname,
		}: {
			questionId: string;
			nickname: string;
		}) => {
			await declineQuestion(questionId, nickname);
			return { questionId };
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Erro ao recusar pergunta");
		},
		onSuccess: () => {
			toast.success("Pergunta recusada");
		},
	});
}

export function useDeleteQuestion() {
	return useMutation({
		mutationFn: async ({
			questionId,
			nickname,
		}: {
			questionId: string;
			nickname: string;
		}) => {
			await deleteQuestion(questionId, nickname);
			return { questionId };
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Erro ao deletar pergunta");
		},
		onSuccess: () => {
			toast.success("Pergunta deletada");
		},
	});
}

export function useReportQuestion() {
	return useMutation({
		mutationFn: async ({
			questionId,
			nickname,
			isOffensive,
			isInappropriate,
		}: {
			questionId: string;
			nickname: string;
			isOffensive: boolean;
			isInappropriate: boolean;
		}) => {
			await reportQuestion(questionId, nickname, isOffensive, isInappropriate);
			return { questionId, isOffensive, isInappropriate };
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Erro ao reportar pergunta");
		},
		onSuccess: () => {
			toast.success("Pergunta reportada com sucesso");
		},
	});
}

export function useMarkQuestionExpired() {
	return useMutation({
		mutationFn: markQuestionExpired,
		onError: (error) => {
			console.error("Erro ao marcar pergunta como expirada:", error);
		},
	});
}
