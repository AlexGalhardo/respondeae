"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, UserMinus, UserX } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import LoadingScreen from "@/components/loading-screen";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/functions";
import Link from "next/link";

export default function SeguidoresPage() {
	const router = useRouter();
	const { data: session, status, update } = useSession();

	useEffect(() => {
		if (status !== "loading" && !session) {
			router.push("/");
		}
	}, [session, status, router]);

	const [followRequests, setFollowRequests] = useState<any[]>([]);
	const [isLoadingFollowRequests, setIsLoadingFollowRequests] = useState(false);
	const [isRemovingFollower, setIsRemovingFollower] = useState<string | null>(null);
	const [followers, setFollowers] = useState<any[]>([]);

	const fetchFollowRequests = async () => {
		setIsLoadingFollowRequests(true);
		try {
			const response = await fetch("/api/user/follow-requests");
			if (response.ok) {
				const data = await response.json();
				setFollowRequests(data.followRequests);
			}
		} catch (error) {
			console.error("Erro ao buscar pedidos de seguidor:", error);
		} finally {
			setIsLoadingFollowRequests(false);
		}
	};

	const handleAcceptFollower = async (requestId: string) => {
		try {
			const response = await fetch("/api/user/accept-follower", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ requestId }),
			});

			if (response.ok) {
				setFollowRequests((prev) => prev.filter((req) => req.id !== requestId));
				toast({
					title: "Seguidor aceito",
					variant: "success",
				});
			} else {
				toast({
					title: "Erro ao aceitar seguidor",
					variant: "error",
				});
			}
		} catch (error) {
			toast({
				title: "Erro ao aceitar seguidor",
				variant: "error",
			});
		}
	};

	const handleRejectFollower = async (requestId: string) => {
		try {
			const response = await fetch("/api/user/reject-follower", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ requestId }),
			});

			if (response.ok) {
				setFollowRequests((prev) => prev.filter((req) => req.id !== requestId));
				toast({
					title: "Seguidor Negado",
					variant: "success",
				});
			} else {
				toast({
					title: "Erro ao rejeitar seguidor",
					variant: "error",
				});
			}
		} catch (error) {
			toast({
				title: "Erro ao rejeitar seguidor",
				variant: "error",
			});
		}
	};

	const handleRemoveFollower = async (followerId: string, followerName: string) => {
		setIsRemovingFollower(followerId);

		try {
			const response = await fetch("/api/user/remove-follower", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ followerId }),
			});

			if (response.ok) {
				// Remove da lista local
				setFollowers((prev) => prev.filter((follower) => follower.follower.id !== followerId));

				toast({
					title: `${followerName} foi removido dos seus seguidores`,
					variant: "success",
				});
			} else {
				toast({
					title: "Erro ao remover seguidor",
					variant: "error",
				});
			}
		} catch (error) {
			toast({
				title: "Erro ao remover seguidor",
				variant: "error",
			});
		} finally {
			setIsRemovingFollower(null);
		}
	};

	useEffect(() => {
		if (session?.user?.followers) {
			setFollowers(session.user.followers);
		}
	}, [session]);

	useEffect(() => {
		fetchFollowRequests();
	}, []);

	if (status === "loading") return <LoadingScreen />;

	if (!session) {
		router.push("/");
		return null;
	}

	return (
		<main className="p-4 lg:p-6">
			<Tabs defaultValue="followers" className="w-full">
				<TabsList className="flex flex-wrap justify-between gap-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
					<TabsTrigger
						value="followers"
						className="flex-1 text-[0.7rem] sm:text-xs py-2 px-2 rounded-md text-center font-medium transition-all duration-200
						data-[state=active]:bg-white data-[state=active]:shadow-sm
						data-[state=inactive]:opacity-70
						dark:data-[state=active]:bg-white dark:data-[state=active]:text-black
						dark:data-[state=inactive]:bg-neutral-700 dark:data-[state=inactive]:text-neutral-300"
					>
						Seus Seguidores ({followers.length})
					</TabsTrigger>
					<TabsTrigger
						value="requests"
						className="flex-1 text-[0.7rem] sm:text-xs py-2 px-2 rounded-md text-center font-medium transition-all duration-200
						data-[state=active]:bg-white data-[state=active]:shadow-sm
						data-[state=inactive]:opacity-70
						dark:data-[state=active]:bg-white dark:data-[state=active]:text-black
						dark:data-[state=inactive]:bg-neutral-700 dark:data-[state=inactive]:text-neutral-300"
					>
						Solicitações Para Te Seguir ({followRequests.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="followers" className="space-y-3 mt-4">
					{followers.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<p className="text-base">Você ainda não tem seguidores.</p>
						</div>
					) : (
						<div className="space-y-4">
							{followers.map((follower: any) => (
								<Card
									key={follower?.id}
									className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800"
								>
									<CardContent className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
													<AvatarImage
														src={follower?.follower?.avatar_url}
														alt={follower?.follower?.name}
													/>
													<AvatarFallback className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
														{getInitials(follower?.follower?.name)}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-bold text-foreground">
														{follower?.follower?.name}
													</p>
													<Link
														href={`/${follower?.follower?.nickname}`}
														className="text-sm font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 truncate"
													>
														@{follower?.follower?.nickname}
													</Link>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
												onClick={() =>
													handleRemoveFollower(follower.follower.id, follower.follower.name)
												}
												disabled={isRemovingFollower === follower.follower.id}
											>
												<UserMinus className="h-4 w-4 mr-1" />
												{isRemovingFollower === follower.follower.id
													? "Removendo..."
													: "Remover Seguidor"}
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="requests" className="space-y-3 mt-4">
					{isLoadingFollowRequests ? (
						<div className="text-center py-12 text-gray-500">Carregando pedidos...</div>
					) : followRequests.length === 0 ? (
						<div className="text-center py-12 text-gray-500">Nenhum pedido para seguir.</div>
					) : (
						<div className="space-y-4">
							{followRequests.map((request) => (
								<Card
									key={request.id}
									className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800"
								>
									<CardContent className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
													<AvatarImage
														src={request.sender.avatar_url}
														alt={request.sender.name}
													/>
													<AvatarFallback className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
														{getInitials(request.sender.name)}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<p className="font-bold text-foreground">{request.sender.name}</p>
													<Link
														href={`/${request.sender.nickname}`}
														className="text-sm font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 truncate"
													>
														@{request.sender.nickname}
													</Link>
													{request.sender.description && (
														<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
															{request.sender.description}
														</p>
													)}
													<span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
														{formatDate(
															typeof request.created_at === "string"
																? request.created_at
																: request.created_at.toISOString(),
														)}
													</span>
												</div>
											</div>
											<div className="flex gap-2 ml-3">
												<Button
													onClick={() => handleAcceptFollower(request.id)}
													size="sm"
													className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
												>
													<UserCheck className="h-4 w-4 mr-1" />
													Aceitar
												</Button>
												<Button
													onClick={() => handleRejectFollower(request.id)}
													variant="outline"
													size="sm"
													className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
												>
													<UserX className="h-4 w-4 mr-1" />
													Rejeitar
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</main>
	);
}
