export interface FollowingUserInterface {
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
