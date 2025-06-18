// hooks/use-profile-queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getUserByNicknameAction,
	followUserAction,
	likeQuestionAction,
	dislikeQuestionAction,
} from "@/actions/user-actions";

export const useProfile = (nickname: string) => {
	return useQuery({
		queryKey: ["profile", nickname],
		queryFn: () => getUserByNicknameAction(nickname),
		enabled: !!nickname,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useFollowUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ followingId, followerId }: { followingId: string; followerId: string }) =>
			followUserAction(followingId, followerId),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
			queryClient.setQueryData(["profile", variables.followingId], (oldData: any) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					followers: data.isFollowing
						? [...oldData.followers, variables.followerId]
						: oldData.followers.filter((id: string) => id !== variables.followerId),
				};
			});
		},
	});
};

export const useLikeQuestion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ questionId, nickname }: { questionId: string; nickname: string }) =>
			likeQuestionAction(questionId, nickname),
		onMutate: async ({ questionId, nickname }) => {
			await queryClient.cancelQueries({ queryKey: ["profile"] });

			const previousData = queryClient.getQueriesData({ queryKey: ["profile"] });

			queryClient.setQueriesData({ queryKey: ["profile"] }, (oldData: any) => {
				if (!oldData?.questions_received) return oldData;

				return {
					...oldData,
					questions_received: oldData.questions_received.map((q: any) => {
						if (q.id === questionId) {
							const likedUsers = JSON.parse(q.liked_by_users || "[]");
							const dislikedUsers = JSON.parse(q.desliked_by_users || "[]");
							const userAlreadyLiked = likedUsers.includes(nickname);

							return {
								...q,
								liked_by_users: JSON.stringify(
									userAlreadyLiked
										? likedUsers.filter((u: string) => u !== nickname)
										: [...likedUsers, nickname],
								),
								desliked_by_users: JSON.stringify(dislikedUsers.filter((u: string) => u !== nickname)),
							};
						}
						return q;
					}),
				};
			});

			return { previousData };
		},
		onError: (err, variables, context) => {
			if (context?.previousData) {
				context.previousData.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
	});
};

export const useDislikeQuestion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ questionId, nickname }: { questionId: string; nickname: string }) =>
			dislikeQuestionAction(questionId, nickname),
		onMutate: async ({ questionId, nickname }) => {
			await queryClient.cancelQueries({ queryKey: ["profile"] });

			const previousData = queryClient.getQueriesData({ queryKey: ["profile"] });

			queryClient.setQueriesData({ queryKey: ["profile"] }, (oldData: any) => {
				if (!oldData?.questions_received) return oldData;

				return {
					...oldData,
					questions_received: oldData.questions_received.map((q: any) => {
						if (q.id === questionId) {
							const likedUsers = JSON.parse(q.liked_by_users || "[]");
							const dislikedUsers = JSON.parse(q.desliked_by_users || "[]");
							const userAlreadyDisliked = dislikedUsers.includes(nickname);

							return {
								...q,
								liked_by_users: JSON.stringify(likedUsers.filter((u: string) => u !== nickname)),
								desliked_by_users: JSON.stringify(
									userAlreadyDisliked
										? dislikedUsers.filter((u: string) => u !== nickname)
										: [...dislikedUsers, nickname],
								),
							};
						}
						return q;
					}),
				};
			});

			return { previousData };
		},
		onError: (err, variables, context) => {
			if (context?.previousData) {
				context.previousData.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
	});
};
