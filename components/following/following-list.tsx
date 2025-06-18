"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FollowingUserInterface } from "@/types/FollowingUserInterface";
import { FollowingUserCard } from "./following-user-card";

interface FollowingListProps {
	following: FollowingUserInterface[];
	onUnfollow: (followingId: string) => void;
}

export function FollowingList({ following, onUnfollow }: FollowingListProps) {
	if (following.length === 0) {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<p className="text-muted-foreground">Você não está seguindo ninguém ainda.</p>
					<p className="text-sm text-muted-foreground mt-2">
						Comece a seguir pessoas para ver suas atividades no seu feed!
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{following.map((user) => (
				<FollowingUserCard key={user.id} user={user} onUnfollow={onUnfollow} />
			))}
		</div>
	);
}
