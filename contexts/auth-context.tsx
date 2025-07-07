"use client";

import type React from "react";

import { createContext, useContext } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import TelegramLog from "@/lib/telegram-logger";

interface AuthContextType {
	user: any;
	status: "loading" | "authenticated" | "unauthenticated";
	signIn: (provider: string, options?: any) => Promise<any>;
	signOut: () => Promise<any>;
	loginWithCredentials: (email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession();
	const router = useRouter();

	const loginWithCredentials = async (email: string, password: string) => {
		try {
			const result = await signIn("credentials", {
				redirect: false,
				email,
				password,
			});

			if (result?.error) {
				throw new Error(result.error);
			}

			return result;
		} catch (error: any) {
			await TelegramLog.error(`Error logging in with credentials: ${error?.message}`);
		}
	};

	const value = {
		user: session?.user,
		status,
		signIn,
		signOut,
		loginWithCredentials,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
