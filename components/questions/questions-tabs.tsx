"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionInterface } from "@/types/QuestionInterface";
import { QuestionsList } from "./questions-list";
import { QuestionsPagination } from "./questions-pagination";
import { filterQuestionsByStatus, paginateQuestions } from "@/lib/utils/question-utils";

interface QuestionsTabsProps {
	questions: QuestionInterface[];
	currentPage: number;
	questionsPerPage: number;
	onPageChange: (page: number) => void;
	onAnswer?: (questionId: string, answerText: string) => void;
	onDecline?: (questionId: string) => void;
	onDelete?: (questionId: string) => void;
	onReport?: (questionId: string) => void;
	onExpire?: (questionId: string) => void; // NOVO
	loadingStates?: {
		answering?: string;
		declining?: string;
		deleting?: string;
	};
}

export function QuestionsTabs({
	questions,
	currentPage,
	questionsPerPage,
	onPageChange,
	onAnswer,
	onDecline,
	onDelete,
	onReport,
	onExpire, // NOVO
	loadingStates = {},
}: QuestionsTabsProps) {
	const validQuestions = Array.isArray(questions) ? questions : [];

	const pendingQuestions = filterQuestionsByStatus(validQuestions, "pending");
	const answeredQuestions = filterQuestionsByStatus(validQuestions, "answered");
	const declinedQuestions = filterQuestionsByStatus(validQuestions, "declined");
	const expiredQuestions = filterQuestionsByStatus(validQuestions, "expired");
	const reportedQuestions = filterQuestionsByStatus(validQuestions, "reported");

	const renderTabContent = (
		questionsList: QuestionInterface[],
		showAnswerForm: boolean = false,
		emptyMessage: string = "Nenhuma pergunta encontrada.",
	) => {
		if (questionsList.length === 0) {
			return <div className="text-center py-12 text-gray-500">{emptyMessage}</div>;
		}

		const paginatedData = paginateQuestions(questionsList, currentPage, questionsPerPage);

		return (
			<>
				<QuestionsList
					questions={paginatedData.questions}
					showAnswerForm={showAnswerForm}
					onAnswer={onAnswer}
					onDecline={onDecline}
					onDelete={onDelete}
					onReport={onReport}
					onExpire={onExpire} // NOVO
					loadingStates={loadingStates}
				/>
				<QuestionsPagination
					currentPage={currentPage}
					totalPages={paginatedData.totalPages}
					onPageChange={onPageChange}
				/>
			</>
		);
	};

	return (
		<Tabs defaultValue="pending" className="w-full" onValueChange={() => onPageChange(1)}>
			<TabsList className="w-full flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-5 gap-2 sm:gap-0 px-1 sm:px-0">
				<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="pending">
					Aguardando ({pendingQuestions.length})
				</TabsTrigger>
				<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="answered">
					Respondidas ({answeredQuestions.length})
				</TabsTrigger>
				<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="declined">
					Recusadas ({declinedQuestions.length})
				</TabsTrigger>
				<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="expired">
					Expiradas ({expiredQuestions.length})
				</TabsTrigger>
				<TabsTrigger className="flex-1 min-w-max sm:min-w-0 text-sm px-4 py-2" value="reported">
					Reportadas ({reportedQuestions.length})
				</TabsTrigger>
			</TabsList>

			<TabsContent value="pending" className="space-y-6">
				{renderTabContent(pendingQuestions, true, "Nenhuma pergunta pendente no momento.")}
			</TabsContent>

			<TabsContent value="answered" className="space-y-6">
				{renderTabContent(answeredQuestions, false, "Nenhuma pergunta respondida ainda.")}
			</TabsContent>

			<TabsContent value="declined" className="space-y-6">
				{renderTabContent(declinedQuestions, false, "Nenhuma pergunta recusada.")}
			</TabsContent>

			<TabsContent value="expired" className="space-y-6">
				{renderTabContent(expiredQuestions, false, "Nenhuma pergunta expirada.")}
			</TabsContent>

			<TabsContent value="reported" className="space-y-6">
				{renderTabContent(reportedQuestions, false, "Nenhuma pergunta reportada.")}
			</TabsContent>
		</Tabs>
	);
}
