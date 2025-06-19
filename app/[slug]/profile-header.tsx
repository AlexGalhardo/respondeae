"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFollowUser } from "@/hooks/use-profile-queries";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Clock, Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BlockUserButton } from "./block-user-button";
import { ProfileSocialLinks } from "./profile-social-linkts";

interface ProfileHeaderProps {
	profile: any;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
	const { data: session } = useSession();
	const { toast } = useToast();
	const followMutation = useFollowUser();

	// Use os dados que vêm do servidor como estado inicial
	const [localIsFollowing, setLocalIsFollowing] = useState(profile.isFollowing || false);
	const [localHasPendingRequest, setLocalHasPendingRequest] = useState(profile.hasPendingRequest || false);

	// Atualiza os estados locais quando o profile muda (ex: após invalidação do cache)
	useEffect(() => {
		setLocalIsFollowing(profile.isFollowing || false);
		setLocalHasPendingRequest(profile.hasPendingRequest || false);
	}, [profile.isFollowing, profile.hasPendingRequest]);

	// DEBUG: Adicione estes logs temporariamente para verificar os dados
	useEffect(() => {
		console.log("=== DEBUG PROFILE HEADER ===");
		console.log("profile.isFollowing:", profile.isFollowing);
		console.log("profile.hasPendingRequest:", profile.hasPendingRequest);
		console.log("localIsFollowing:", localIsFollowing);
		console.log("localHasPendingRequest:", localHasPendingRequest);
		console.log("profile.follow_requests_received:", profile.follow_requests_received);
		console.log("session?.user?.id:", session?.user?.id);
		console.log("============================");
	}, [profile, localIsFollowing, localHasPendingRequest, session]);

	const handleFollow = async () => {
		if (!session?.user?.id) return;

		try {
			const result = await followMutation.mutateAsync({
				followingId: profile.id,
				followerId: session.user.id,
			});

			// Verifica se houve erro
			if (result.error) {
				toast({
					title: "Erro",
					description: result.error,
					variant: "error",
				});
				return;
			}

			// Atualiza os estados locais
			setLocalIsFollowing(result.isFollowing ?? false);
			setLocalHasPendingRequest(result.hasPendingRequest ?? false);

			toast({
				title: result.message,
				variant: "default",
			});
		} catch (error) {
			console.error("Erro no handleFollow:", error);
			toast({
				title: `Erro ao seguir @${profile?.nickname}`,
				description: "Tente novamente mais tarde",
				variant: "error",
			});
		}
	};

	const getFollowButtonContent = () => {
		if (followMutation.isPending) {
			return (
				<>
					<Loader className="h-4 w-4 animate-spin" />
					Carregando...
				</>
			);
		}

		if (localIsFollowing) {
			return (
				<>
					<UserCheck className="h-4 w-4" />
					Seguindo
				</>
			);
		}

		if (localHasPendingRequest) {
			return (
				<>
					<Clock className="h-4 w-4" />
					Solicitado
				</>
			);
		}

		return (
			<>
				<UserPlus className="h-4 w-4" />
				Seguir
			</>
		);
	};

	const getFollowButtonVariant = () => {
		if (localIsFollowing) return "secondary";
		if (localHasPendingRequest) return "outline";
		return "default";
	};

	return (
		<Card className="mb-6">
			<CardContent className="p-4 sm:p-6">
				<div className="flex flex-col items-center text-center">
					<Avatar className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded shadow">
						<AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
						<AvatarFallback className="text-2xl sm:text-3xl bg-gradient-to-r from-green-700 to-green-600 text-white rounded-2xl">
							{profile.name.charAt(0)}
						</AvatarFallback>
					</Avatar>

					<h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 mt-4 dark:text-white">
						{profile.name}
					</h1>
					<h2 className="text-orange-600 dark:text-gray-300 text-lg sm:text-xl font-bold mb-2 break-all">
						@{profile.nickname}
					</h2>

					<p className="text-muted-foreground mb-3 max-w-xs sm:max-w-md text-sm dark:text-gray-400">
						{profile.description}
					</p>

					{profile.website && (
						<a
							href={profile.website}
							className="text-blue-600 dark:text-white hover:underline mb-4 break-words text-sm sm:text-base"
							target="_blank"
							rel="noopener noreferrer"
						>
							{profile.website}
						</a>
					)}

					<ProfileSocialLinks profile={profile} />

					<div className="flex flex-wrap justify-center items-center gap-2 mb-5">
						{session?.user?.id && session.user.id !== profile.id && (
							<>
								<Button
									variant={getFollowButtonVariant()}
									onClick={handleFollow}
									disabled={followMutation.isPending}
									className="px-3 py-1 text-sm font-medium flex items-center gap-1"
								>
									{getFollowButtonContent()}
								</Button>

								<BlockUserButton
									sessionUser={{
										id: session.user.id,
										nickname: session.user.nickname ?? "",
									}}
									profileFound={{
										id: profile.id,
										nickname: profile.nickname ?? "",
									}}
									onBlockSuccess={() => {}}
								/>
							</>
						)}
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full max-w-2xl">
						<div className="text-center">
							<div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
								{profile.questions_received?.filter((q: any) => q.question_answered).length || 0}
							</div>
							<div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
								respondidas
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
								{profile.questions_received?.length || 0}
							</div>
							<div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">recebidas</div>
						</div>
						<div className="text-center">
							<div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
								{profile.questions_sent?.length || 0}
							</div>
							<div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">enviadas</div>
						</div>
						<div className="text-center">
							<div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
								{profile.followers?.length || 0}
							</div>
							<div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
								seguidores
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white">
								{profile.following?.length || 0}
							</div>
							<div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">seguindo</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
