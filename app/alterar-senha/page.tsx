"use client";

import LoadingScreen from "@/components/loading-screen";
import { Suspense } from "react";
import ResetarSenhaComponent from "./ResetartSenhaComponent";

export default function ResetarSenhaPage() {
	return (
		<div>
			<Suspense fallback={<LoadingScreen />}>
				<ResetarSenhaComponent />
			</Suspense>
		</div>
	);
}
