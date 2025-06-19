"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { QuestionInterface } from "@/lib/interfaces";
import { QuestionCard } from "./QuestionCard";
import { useQuestions, useLikeQuestion, useDislikeQuestion } from "@/hooks/use-questions";

interface QuestionsFeedProps {
	userNickname?: string;
	userId?: string;
}

interface OptimisticState {
	[questionId: string]: {
		likeCount: number;
		dislikeCount: number;
		hasUserLiked: boolean;
		hasUserDisliked: boolean;
		timestamp: number; // Para controlar quando remover
	};
}

export const QuestionsFeed = ({ userNickname, userId }: QuestionsFeedProps) => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useQuestions();
	const [optimisticStates, setOptimisticStates] = useState<OptimisticState>({});

	const likeQuestionMutation = useLikeQuestion();
	const dislikeQuestionMutation = useDislikeQuestion();

	const questions = useMemo(() => {
		return (
			(data?.pages as { questions: QuestionInterface[] }[] | undefined)?.flatMap((page) => page.questions) || []
		);
	}, [data]);

	const hasUserLiked = useCallback(
		(question: QuestionInterface) => {
			if (!userNickname) return false;
			const likedUsers = JSON.parse(question.liked_by_users || "[]");
			return likedUsers.includes(userNickname);
		},
		[userNickname],
	);

	const hasUserDisliked = useCallback(
		(question: QuestionInterface) => {
			if (!userNickname) return false;
			const dislikedUsers = JSON.parse(question.desliked_by_users || "[]");
			return dislikedUsers.includes(userNickname);
		},
		[userNickname],
	);

	// Limpa estados otimísticos antigos (após 5 segundos)
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			setOptimisticStates((prev) => {
				const newState = { ...prev };
				let hasChanges = false;

				Object.keys(newState).forEach((questionId) => {
					if (now - newState[questionId].timestamp > 5000) {
						delete newState[questionId];
						hasChanges = true;
					}
				});

				return hasChanges ? newState : prev;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const handleLike = useCallback(
		(question: QuestionInterface) => {
			if (!userNickname) return;

			const currentLiked = hasUserLiked(question);
			const currentDisliked = hasUserDisliked(question);
			const currentLikeCount = JSON.parse(question.liked_by_users || "[]").length;
			const currentDislikeCount = JSON.parse(question.desliked_by_users || "[]").length;

			// Atualização otimística
			setOptimisticStates((prev) => ({
				...prev,
				[question.id]: {
					likeCount: currentLiked ? currentLikeCount - 1 : currentLikeCount + 1,
					dislikeCount: currentDisliked ? currentDislikeCount - 1 : currentDislikeCount,
					hasUserLiked: !currentLiked,
					hasUserDisliked: false,
					timestamp: Date.now(),
				},
			}));

			likeQuestionMutation.mutate(
				{
					questionId: question.id,
					nickname: userNickname,
				},
				{
					onError: () => {
						// Remove apenas em caso de erro
						setOptimisticStates((prev) => {
							const newState = { ...prev };
							delete newState[question.id];
							return newState;
						});
					},
				},
			);
		},
		[userNickname, likeQuestionMutation, hasUserLiked, hasUserDisliked],
	);

	const handleDislike = useCallback(
		(question: QuestionInterface) => {
			if (!userNickname) return;

			const currentLiked = hasUserLiked(question);
			const currentDisliked = hasUserDisliked(question);
			const currentLikeCount = JSON.parse(question.liked_by_users || "[]").length;
			const currentDislikeCount = JSON.parse(question.desliked_by_users || "[]").length;

			// Atualização otimística
			setOptimisticStates((prev) => ({
				...prev,
				[question.id]: {
					likeCount: currentLiked ? currentLikeCount - 1 : currentLikeCount,
					dislikeCount: currentDisliked ? currentDislikeCount - 1 : currentDislikeCount + 1,
					hasUserLiked: false,
					hasUserDisliked: !currentDisliked,
					timestamp: Date.now(),
				},
			}));

			dislikeQuestionMutation.mutate(
				{
					questionId: question.id,
					nickname: userNickname,
				},
				{
					onError: () => {
						// Remove apenas em caso de erro
						setOptimisticStates((prev) => {
							const newState = { ...prev };
							delete newState[question.id];
							return newState;
						});
					},
				},
			);
		},
		[userNickname, dislikeQuestionMutation, hasUserLiked, hasUserDisliked],
	);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			if (scrollTop + windowHeight >= documentHeight - 200 && hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
				<span className="ml-2 text-gray-500">Carregando...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500 text-lg">
					Erro ao carregar perguntas: {error?.message || "Erro desconhecido"}
				</p>
			</div>
		);
	}

	if (questions.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 text-lg">Nenhuma pergunta encontrada no momento.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{questions.map((question) => {
				const optimisticState = optimisticStates[question.id];

				return (
					<QuestionCard
						key={question.id}
						question={question}
						userNickname={userNickname}
						userId={userId}
						onLike={handleLike}
						onDislike={handleDislike}
						hasUserLiked={hasUserLiked(question)}
						hasUserDisliked={hasUserDisliked(question)}
						optimisticLikeCount={optimisticState?.likeCount}
						optimisticDislikeCount={optimisticState?.dislikeCount}
						optimisticHasUserLiked={optimisticState?.hasUserLiked}
						optimisticHasUserDisliked={optimisticState?.hasUserDisliked}
					/>
				);
			})}

			{isFetchingNextPage && (
				<div className="flex justify-center items-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
					<span className="ml-2 text-gray-500">Carregando mais respostas...</span>
				</div>
			)}

			{!hasNextPage && questions.length > 0 && (
				<div className="text-center py-8">
					<p className="text-gray-500 text-sm">Você chegou ao final do feed! 🎉</p>
				</div>
			)}
		</div>
	);
};
