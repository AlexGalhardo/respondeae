"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { QuestionInterface } from "@/lib/interfaces";
import { QuestionCard } from "./QuestionCard";
import { useQuestions, useLikeQuestion, useDislikeQuestion } from "@/hooks/use-questions";

interface QuestionsFeedProps {
	userNickname?: string;
	userId?: string;
}

export const QuestionsFeed = ({ userNickname, userId }: QuestionsFeedProps) => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useQuestions();

	const likeQuestionMutation = useLikeQuestion();
	const dislikeQuestionMutation = useDislikeQuestion();

	// Flatten todas as páginas em uma única lista
	const questions = useMemo(() => {
		return (
			(data?.pages as { questions: QuestionInterface[] }[] | undefined)?.flatMap((page) => page.questions) || []
		);
	}, [data]);

	// Verificar se usuário curtiu uma pergunta
	const hasUserLiked = useCallback(
		(question: QuestionInterface) => {
			if (!userNickname) return false;
			const likedUsers = JSON.parse(question.liked_by_users || "[]");
			return likedUsers.includes(userNickname);
		},
		[userNickname],
	);

	// Verificar se usuário descurtiu uma pergunta
	const hasUserDisliked = useCallback(
		(question: QuestionInterface) => {
			if (!userNickname) return false;
			const dislikedUsers = JSON.parse(question.desliked_by_users || "[]");
			return dislikedUsers.includes(userNickname);
		},
		[userNickname],
	);

	// Handlers para like/dislike
	const handleLike = useCallback(
		(question: QuestionInterface) => {
			if (!userNickname) return;

			likeQuestionMutation.mutate({
				questionId: question.id,
				nickname: userNickname,
			});
		},
		[userNickname, likeQuestionMutation],
	);

	const handleDislike = useCallback(
		(question: QuestionInterface) => {
			if (!userNickname) return;

			dislikeQuestionMutation.mutate({
				questionId: question.id,
				nickname: userNickname,
			});
		},
		[userNickname, dislikeQuestionMutation],
	);

	// Infinite scroll
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
			{questions.map((question) => (
				<QuestionCard
					key={question.id}
					question={question}
					userNickname={userNickname}
					userId={userId}
					onLike={handleLike}
					onDislike={handleDislike}
					hasUserLiked={hasUserLiked(question)}
					hasUserDisliked={hasUserDisliked(question)}
				/>
			))}

			{isFetchingNextPage && (
				<div className="flex justify-center items-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
					<span className="ml-2 text-gray-500">Carregando mais perguntas...</span>
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
