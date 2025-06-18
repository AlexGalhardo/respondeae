// hooks/use-session-verification.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface SessionUser {
	id: string;
	nickname: string;
	questions_received?: Array<{
		question_is_awaiting_answer: boolean;
	}>;
	pix_key?: string;
}

interface VerifiedSession {
	user: SessionUser;
	expires: string;
}

export function useSessionVerification() {
	const { data: nextAuthSession, status: nextAuthStatus } = useSession();

	const {
		data: verifiedSession,
		isLoading: isVerifying,
		error,
		refetch,
	} = useQuery({
		queryKey: ["session-verification", nextAuthSession?.user?.id],
		queryFn: async (): Promise<VerifiedSession | null> => {
			if (!nextAuthSession?.user?.id) return null;

			const response = await fetch("/api/auth/verify-session", {
				method: "GET",
				credentials: "include",
			});

			if (!response.ok) {
				if (response.status === 401) {
					// Sessão expirada ou inválida
					return null;
				}
				throw new Error("Erro ao verificar sessão");
			}

			return response.json();
		},
		enabled: !!nextAuthSession?.user?.id && nextAuthStatus === "authenticated",
		staleTime: 5 * 60 * 1000, // 5 minutos
		gcTime: 10 * 60 * 1000, // 10 minutos
		retry: (failureCount, error: any) => {
			// Não retry em caso de 401 (não autorizado)
			if (error?.message?.includes("401")) return false;
			return failureCount < 2;
		},
	});

	const isAuthenticated = !!verifiedSession && nextAuthStatus === "authenticated";
	const isLoading = nextAuthStatus === "loading" || isVerifying;

	return {
		session: verifiedSession,
		isAuthenticated,
		isLoading,
		error,
		refetch,
	};
}
