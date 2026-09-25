"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

interface ReactQueryProviderProps {
	children: ReactNode;
}

export const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 2,
						refetchOnWindowFocus: false,
						retry: (failureCount, error: any) => {
							if (error?.status >= 400 && error?.status < 500) {
								return false;
							}
							return failureCount < 3;
						},
						retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
					},
					mutations: {
						retry: 1,
						retryDelay: 1000,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
};
