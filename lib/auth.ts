import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCredentials, createUser, getUserByEmail, reactiveDeletedAccount } from "./repositories/users.repository";
import slugify from "slugify";
import { QuestionInterface } from "./interfaces";

declare module "next-auth" {
	interface Session {
		user: {
			github: any;
			id: string;
			avatar_url?: string | null;
			name?: string | null;
			nickname?: string | null;
			email?: string | null;
			description?: string | null;
			website?: string | null;

			public_questions_remaining_today?: number;
			anonymous_questions_remaining_today?: number;

			pix_key?: string | null;

			twitter?: string | null;
			instagram?: string | null;
			youtube?: string | null;
			tiktok?: string | null;
			linkedin?: string | null;
			twitch?: string | null;
			facebook?: string | null;

			api_key?: string;

			privacy_accept_anonymous_questions?: boolean;
			privacy_show_anonymous_questions_public?: boolean;
			privacy_show_questions_answered_only_to_followers?: boolean;
			privacy_show_value_received_from_answering_question?: boolean;
			privacy_show_date_questions_was_answered?: boolean;
			privacy_show_total_followers_public?: boolean;
			privacy_show_total_questions_sent_public?: boolean;
			privacy_show_likes_each_answer_public?: boolean;
			privacy_show_dislikes_each_answer_public?: boolean;
			privacy_show_total_likes_all_answers_public?: boolean;
			privacy_show_total_questions_received_public?: boolean;
			privacy_show_total_questions_answered_public?: boolean;

			questions_received?: QuestionInterface[];
			questions_sent?: QuestionInterface[];

			followers: any[];
			following: any[];
			blocked_users: any[];
			blocked_by_users: any[];

			created_at?: Date | null;
			updated_at?: Date | null;
			deleted_at?: Date | null;
		};
	}

	interface JWT {
		id?: string;
		name?: string | null;
		nickname?: string | null;
		email?: string | null;
		description?: string | null;
		website?: string | null;

		public_questions_remaining_today?: number;
		anonymous_questions_remaining_today?: number;

		pix_key?: string | null;
		avatar_url?: string | null;

		twitter?: string | null;
		instagram?: string | null;
		youtube?: string | null;
		tiktok?: string | null;
		linkedin?: string | null;
		twitch?: string | null;
		facebook?: string | null;

		api_key?: string;

		privacy_accept_anonymous_questions?: boolean;
		privacy_show_anonymous_questions_public?: boolean;
		privacy_show_questions_answered_only_to_followers?: boolean;
		privacy_show_value_received_from_answering_question?: boolean;
		privacy_show_date_questions_was_answered?: boolean;
		privacy_show_total_followers_public?: boolean;
		privacy_show_total_questions_sent_public?: boolean;
		privacy_show_likes_each_answer_public?: boolean;
		privacy_show_total_likes_all_answers_public?: boolean;
		privacy_show_total_questions_received_public?: boolean;
		privacy_show_total_questions_answered_public?: boolean;

		following?: string[];
		followers?: string[];

		created_at?: Date | null;
		updated_at?: Date | null;
		deleted_at?: Date | null;
	}
}

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		}),
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const user = await verifyCredentials(credentials.email, credentials.password);
					if (user && user.id) {
						if (user.deleted_at) await reactiveDeletedAccount(user.id);

						return {
							id: user.id,
							name: user.name ?? null,
							email: user.email ?? null,
						};
					}
					return null;
				} catch (error: any) {
					if (error instanceof Error && error.message === "no_password") {
						throw new Error(
							"This user does not have a registered password. Entre com sua conta Google e crie sua senha",
						);
					}
					return null;
				}
			},
		}),
	],
	pages: {
		signIn: "/entrar",
		signOut: "/entrar",
		error: "/entrar",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id as string;
			}

			const dbUser = await getUserByEmail(token.email as string);

			if (session.user && dbUser) {
				if (dbUser.deleted_at) await reactiveDeletedAccount(dbUser.id);

				session.user.id = dbUser?.id;
				session.user.avatar_url = dbUser?.avatar_url;
				session.user.name = dbUser?.name;
				session.user.nickname = dbUser?.nickname;
				session.user.email = dbUser?.email;
				session.user.description = dbUser?.description;
				session.user.website = dbUser?.website;

				session.user.public_questions_remaining_today = dbUser?.public_questions_remaining_today;
				session.user.anonymous_questions_remaining_today = dbUser?.anonymous_questions_remaining_today;

				session.user.pix_key = dbUser?.pix_key;

				session.user.twitter = dbUser?.twitter;
				session.user.instagram = dbUser?.instagram;
				session.user.youtube = dbUser?.youtube;
				session.user.tiktok = dbUser?.tiktok;
				session.user.linkedin = dbUser?.linkedin;
				session.user.twitch = dbUser?.twitch;
				session.user.facebook = dbUser?.facebook;
				session.user.github = dbUser?.github;

				session.user.api_key = dbUser?.api_key;

				session.user.privacy_accept_anonymous_questions = dbUser?.privacy_accept_anonymous_questions;
				session.user.privacy_show_anonymous_questions_public = dbUser?.privacy_show_anonymous_questions_public;
				session.user.privacy_show_questions_answered_only_to_followers =
					dbUser?.privacy_show_questions_answered_only_to_followers;
				session.user.privacy_show_value_received_from_answering_question =
					dbUser?.privacy_show_value_received_from_answering_question;
				session.user.privacy_show_date_questions_was_answered =
					dbUser?.privacy_show_date_questions_was_answered;
				session.user.privacy_show_total_followers_public = dbUser?.privacy_show_total_followers_public;
				session.user.privacy_show_total_questions_sent_public =
					dbUser?.privacy_show_total_questions_sent_public;
				session.user.privacy_show_likes_each_answer_public = dbUser?.privacy_show_likes_each_answer_public;
				session.user.privacy_show_dislikes_each_answer_public =
					dbUser?.privacy_show_dislikes_each_answer_public;

				session.user.privacy_show_total_likes_all_answers_public =
					dbUser?.privacy_show_total_likes_all_answers_public;
				session.user.privacy_show_total_questions_received_public =
					dbUser?.privacy_show_total_questions_received_public;
				session.user.privacy_show_total_questions_answered_public =
					dbUser?.privacy_show_total_questions_answered_public;

				session.user.questions_received = dbUser?.questions_received?.map((q: any) => ({
					...q,
					owner: q.owner ?? null,
				}));
				session.user.questions_sent = dbUser?.questions_sent?.map((q: any) => ({
					...q,
					asked_by: q.asked_by ?? null,
				}));

				session.user.followers = dbUser?.followers ?? [];
				session.user.following = dbUser?.following ?? [];
				session.user.blocked_users = dbUser?.blocked_users ?? [];
				session.user.blocked_by_users = dbUser?.blocked_by_users ?? [];

				console.log("session.user.blocked_users -> ", session.user.blocked_users);

				session.user.created_at = dbUser?.created_at;
				session.user.updated_at = dbUser?.updated_at;
				session.user.deleted_at = dbUser?.deleted_at;
			}

			return session;
		},
		async jwt({ token, user, account, profile }) {
			if (user) {
				token.id = user.id;
			}

			if (account?.provider === "google" && token.email) {
				try {
					let dbUser = await getUserByEmail(token.email as string);

					dbUser ??= {
						...(await createUser(
							token.name as string,
							(token.nickname as string) ??
								slugify(token?.name as string, { lower: true, strict: true }).replace(/-/g, ""),
							token.email as string,
							`${slugify(token?.name as string, { lower: true, strict: true }).replace(/-/g, "")}_${token.email as string}`,
							profile && (profile as any).picture ? ((profile as any).picture as string) : undefined,
						)),
						is_seed: false,
						is_admin: false,
						privacy_is_private_profile: false,
						banned_first_time: false,
						banned_second_time: false,
						banned_reason: null,
						banned_until: null,
						password: null,
						followers: [],
						following: [],
						questions_received: [],
						questions_sent: [],
						confirm_email_token: null,
						confirm_email_token_expires_at: null,
						confirmed_email: false,
						blocked_users: [],
						blocked_by_users: [],
					};

					token.id = dbUser?.id;
					token.name = dbUser?.name;
					token.nickname = dbUser?.nickname;
					token.email = dbUser?.email;
					token.description = dbUser?.description;
					token.website = dbUser?.website;

					token.public_questions_remaining_today = dbUser?.public_questions_remaining_today;
					token.anonymous_questions_remaining_today = dbUser?.anonymous_questions_remaining_today;

					token.pix_key = dbUser?.pix_key;
					token.avatar_url = dbUser?.avatar_url ?? (profile as any)?.picture;

					token.twitter = dbUser?.twitter;
					token.instagram = dbUser?.instagram;
					token.youtube = dbUser?.youtube;
					token.tiktok = dbUser?.tiktok;
					token.linkedin = dbUser?.linkedin;
					token.twitch = dbUser?.twitch;
					token.facebook = dbUser?.facebook;
					token.github = dbUser?.github;

					token.api_key = dbUser?.api_key;

					token.privacy_accept_anonymous_questions = dbUser?.privacy_accept_anonymous_questions;
					token.privacy_show_anonymous_questions_public = dbUser?.privacy_show_anonymous_questions_public;
					token.privacy_show_questions_answered_only_to_followers =
						dbUser?.privacy_show_questions_answered_only_to_followers;
					token.privacy_show_value_received_from_answering_question =
						dbUser?.privacy_show_value_received_from_answering_question;
					token.privacy_show_date_questions_was_answered = dbUser?.privacy_show_date_questions_was_answered;

					token.privacy_show_total_followers_public = dbUser?.privacy_show_total_followers_public;
					token.privacy_show_total_questions_sent_public = dbUser?.privacy_show_total_questions_sent_public;
					token.privacy_show_likes_each_answer_public = dbUser?.privacy_show_likes_each_answer_public;

					token.privacy_show_total_likes_all_answers_public =
						dbUser?.privacy_show_total_likes_all_answers_public;
					token.privacy_show_total_questions_received_public =
						dbUser?.privacy_show_total_questions_received_public;
					token.privacy_show_total_questions_answered_public =
						dbUser?.privacy_show_total_questions_answered_public;

					token.questions_received = dbUser?.questions_received;
					token.questions_sent = dbUser?.questions_sent;

					token.followers = dbUser?.followers?.map((f: any) => f.follower?.nickname) ?? [];
					token.following = dbUser?.following?.map((f: any) => f.following?.nickname) ?? [];

					token.created_at = dbUser?.created_at;
					token.updated_at = dbUser?.updated_at;
					token.deleted_at = dbUser?.deleted_at;
				} catch (error) {
					console.error("Google login error:", error);
					throw new Error("google_signup_required");
				}
			}

			return token;
		},
	},
};
