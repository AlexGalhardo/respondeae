"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionInterface } from "@/lib/interfaces";
import { QuestionHeader } from "./QuestionHeader";
import { QuestionActions } from "./QuestionActions";
import { QuestionAnswer } from "./QuestionAnswer";

interface QuestionCardProps {
	question: QuestionInterface;
	userNickname?: string;
	userId?: string;
	onLike: (question: QuestionInterface) => void;
	onDislike: (question: QuestionInterface) => void;
	hasUserLiked: boolean;
	hasUserDisliked: boolean;
}

export const QuestionCard = memo(
	({ question, userNickname, userId, onLike, onDislike, hasUserLiked, hasUserDisliked }: QuestionCardProps) => {
		return (
			<Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
				<CardContent className="p-4 sm:p-6">
					<QuestionHeader question={question} />

					<div className="mb-4">
						<h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2 leading-relaxed">
							<span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Perguntou</span>:{" "}
							{question.question_text}
						</h3>
					</div>

					{question.question_answered && question.answer_text && <QuestionAnswer question={question} />}

					<QuestionActions
						question={question}
						userNickname={userNickname}
						userId={userId}
						onLike={onLike}
						onDislike={onDislike}
						hasUserLiked={hasUserLiked}
						hasUserDisliked={hasUserDisliked}
					/>
				</CardContent>
			</Card>
		);
	},
);

QuestionCard.displayName = "QuestionCard";
