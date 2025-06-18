"use server";

import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function answerQuestion(questionId: string, nickname: string, answerText: string) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			throw new Error("Usuário não autenticado");
		}

		const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/question/answer`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				questionId,
				nickname,
				answerText,
			}),
		});

		if (!response.ok) {
			throw new Error("Erro ao enviar resposta");
		}

		revalidateTag("user-session");

		return { success: true };
	} catch (error) {
		console.error("Erro ao responder pergunta:", error);
		throw error;
	}
}

export async function declineQuestion(questionId: string, nickname: string) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			throw new Error("Usuário não autenticado");
		}

		const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/question/recused`, {
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
			throw new Error("Erro ao recusar pergunta");
		}

		revalidateTag("user-session");

		return { success: true };
	} catch (error) {
		console.error("Erro ao recusar pergunta:", error);
		throw error;
	}
}

export async function deleteQuestion(questionId: string, nickname: string) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			throw new Error("Usuário não autenticado");
		}

		const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/question/delete`, {
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
			throw new Error("Erro ao deletar pergunta");
		}

		revalidateTag("user-session");

		return { success: true };
	} catch (error) {
		console.error("Erro ao deletar pergunta:", error);
		throw error;
	}
}

export async function reportQuestion(
	questionId: string,
	nickname: string,
	isOffensive: boolean,
	isInappropriate: boolean,
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			throw new Error("Usuário não autenticado");
		}

		const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/question/report-question`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				questionId,
				nickname,
				isOffensive,
				isInappropriate,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Erro ao reportar pergunta");
		}

		revalidateTag("user-session");

		return { success: true };
	} catch (error) {
		console.error("Erro ao reportar pergunta:", error);
		throw error;
	}
}

export async function markQuestionExpired(questionId: string) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/question/expired`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ questionId }),
		});

		if (!response.ok) {
			throw new Error("Erro ao marcar pergunta como expirada");
		}

		revalidateTag("user-session");

		return { success: true };
	} catch (error) {
		console.error("Erro ao marcar pergunta como expirada:", error);
		throw error;
	}
}
