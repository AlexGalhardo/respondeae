"use client";

import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/loading-screen";
import { QuestionsFeed } from "./feed/QuestionsFeed";

export default function HomePage() {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <LoadingScreen />;
	}

	return (
		<main className="p-4 lg:p-6">
			<div className="min-h-screen">
				<div className="container mx-auto px-3 py-4 max-w-6xl">
					<QuestionsFeed userNickname={session?.user?.nickname ?? undefined} userId={session?.user?.id} />
				</div>
			</div>
		</main>
	);
}
