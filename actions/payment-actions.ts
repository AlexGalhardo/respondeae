"use server";

import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	getUserQuestionsAnsweredPaymentDetails,
	getUserQuestionsSentPaymentDetails,
} from "@/lib/repositories/questions.repository";

export async function getAnsweredPaymentDetails(nickname: string) {
	try {
		const data = await getUserQuestionsAnsweredPaymentDetails(nickname);
		return { success: true, data };
	} catch (error) {
		console.error("Erro ao buscar dados de pagamento respondidas:", error);
		throw new Error("Erro ao carregar dados de pagamento");
	}
}

export async function getSentPaymentDetails(nickname: string) {
	try {
		const data = await getUserQuestionsSentPaymentDetails(nickname);
		return { success: true, data };
	} catch (error) {
		console.error("Erro ao buscar dados de pagamento enviadas:", error);
		throw new Error("Erro ao carregar dados de pagamento");
	}
}

export async function processWithdraw(params: {
	userId: string;
	nickname: string;
	amount: number;
	sentToPixKey: string;
	questions: any[];
}) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			throw new Error("Usuário não autenticado");
		}

		const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/payments/withdraw`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Erro ao processar saque");
		}

		const result = await response.json();

		if (!result.success) {
			throw new Error(result.error || "Erro desconhecido");
		}

		revalidateTag("user-session");
		revalidateTag(`payment-data-${params.nickname}`);

		return { success: true, data: result };
	} catch (error) {
		console.error("Erro ao processar saque:", error);
		throw error;
	}
}
