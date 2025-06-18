"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/loading-screen";
import { toast } from "sonner";

interface FollowingUser {
	id: string;
	followerId: string;
	followingId: string;
	created_at: string;
	updated_at: string;
	following: {
		id: string;
		name: string;
		nickname: string;
		email: string;
		avatar_url: string | null;
		description: string | null;
		website: string | null;
		twitter: string | null;
		instagram: string | null;
		youtube: string | null;
		tiktok: string | null;
		linkedin: string | null;
		twitch: string | null;
		facebook: string | null;
		github: string | null;
		created_at: string;
	};
}

export default function SeguindoPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [following, setFollowing] = useState<FollowingUser[]>([]);
	const [isUnfollowing, setIsUnfollowing] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "loading" && !session) {
			router.push("/");
		}
	}, [session, status, router]);

	useEffect(() => {
		if (session?.user?.following) {
			setFollowing(session.user.following);
		}
	}, [session]);

	const handleUnfollow = async (followingId: string, userName: string) => {
		setIsUnfollowing(followingId);

		try {
			const response = await fetch("/api/user/unfollow", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ followingId }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Erro ao deixar de seguir");
			}

			// Remove da lista local
			setFollowing((prev) => prev.filter((user) => user.following.id !== followingId));

			toast.success(`Você deixou de seguir ${userName}`);
		} catch (error) {
			console.error("Erro ao deixar de seguir:", error);
			toast.error(error instanceof Error ? error.message : "Erro ao deixar de seguir");
		} finally {
			setIsUnfollowing(null);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR");
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	if (status === "loading") return <LoadingScreen />;

	if (!session) {
		router.push("/");
		return null;
	}

	return (
		<main className="p-4 lg:p-6">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-4">
					Você está seguindo {following.length} pessoas
				</h2>
				<div className="space-y-4">
					{following.map((user) => (
						<Card key={user.id}>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<Avatar className="h-12 w-12">
											{user.following.avatar_url && (
												<AvatarImage
													src={user.following.avatar_url}
													alt={user.following.name}
												/>
											)}
											<AvatarFallback className="bg-muted text-foreground font-bold">
												{getInitials(user.following.name)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<p className="font-bold text-foreground">{user.following.name}</p>
											<a
												href={`/${user.following.nickname}`}
												target="_blank"
												className="text-blue-600 text-sm underline hover:text-blue-800 transition-colors"
											>
												@{user.following.nickname}
											</a>
										</div>
									</div>
									<Button
										variant="outline"
										size="sm"
										className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
										onClick={() => handleUnfollow(user.following.id, user.following.name)}
										disabled={isUnfollowing === user.following.id}
									>
										<UserMinus className="h-4 w-4 mr-1" />
										{isUnfollowing === user.following.id ? "Deixando..." : "Deixar de Seguir"}
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{following.length === 0 && (
					<Card>
						<CardContent className="p-8 text-center">
							<p className="text-muted-foreground">Você não está seguindo ninguém ainda.</p>
							<p className="text-sm text-muted-foreground mt-2">
								Comece a seguir pessoas para ver suas atividades no seu feed!
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</main>
	);
}
