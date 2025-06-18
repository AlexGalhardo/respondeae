"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { QuestionInterface } from "@/lib/interfaces";

interface QuestionActionsProps {
	question: QuestionInterface;
	userNickname?: string;
	userId?: string;
	onLike: (question: QuestionInterface) => void;
	onDislike: (question: QuestionInterface) => void;
	hasUserLiked: boolean;
	hasUserDisliked: boolean;
}

export const QuestionActions = memo(
	({ question, userNickname, userId, onLike, onDislike, hasUserLiked, hasUserDisliked }: QuestionActionsProps) => {
		const isOwner = userId === question.owner.id;
		const canInteract = userNickname && !isOwner;

		const likeCount = JSON.parse(question.liked_by_users || "[]").length;
		const dislikeCount = JSON.parse(question.desliked_by_users || "[]").length;

		return (
			<div className="flex items-center gap-6 sm:gap-4 pt-2">
				<Button
					variant="ghost"
					size="sm"
					className={`p-2 h-auto ${
						hasUserLiked
							? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
							: "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
					}`}
					disabled={!canInteract}
					onClick={() => onLike(question)}
				>
					<ThumbsUp className={`h-4 w-4 mr-2 ${hasUserLiked ? "fill-current" : ""}`} />
					{question.owner.privacy_show_likes_each_answer_public && (
						<span className="text-sm font-medium">{likeCount}</span>
					)}
				</Button>

				<Button
					variant="ghost"
					size="sm"
					className={`p-2 h-auto ${
						hasUserDisliked
							? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
							: "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
					}`}
					disabled={!canInteract}
					onClick={() => onDislike(question)}
				>
					<ThumbsDown className={`h-4 w-4 mr-2 ${hasUserDisliked ? "fill-current" : ""}`} />
					{question.owner.privacy_show_dislikes_each_answer_public && (
						<span className="text-sm font-medium">{dislikeCount}</span>
					)}
				</Button>
			</div>
		);
	},
);

QuestionActions.displayName = "QuestionActions";
