import { faker } from "@faker-js/faker";
import { SeedQuestionInterface, SeedQuestionStateType, SeedUserInterface } from "../helpers/seed-interfaces.helper";
import { SeedHelpers } from "../helpers/seed-helpers.helper";

export class SeedQuestionFactory {
	private static getQuestionText(): string {
		return faker.lorem.sentence({ min: 8, max: 20 }) + "?";
	}

	private static getAnswerText(): string {
		return faker.lorem.sentences({ min: 2, max: 5 });
	}

	private static generateUserInteractions(users: SeedUserInterface[]): {
		likedByUsers: string[];
		dislikedByUsers: string[];
	} {
		const numLikes = faker.number.int({ min: 0, max: 999 });
		const numDislikes = faker.number.int({ min: 0, max: 199 });

		const likedByUsers: string[] = [];
		const dislikedByUsers: string[] = [];

		for (let i = 0; i < numLikes; i++) {
			const randomUser = faker.helpers.arrayElement(users);
			if (!likedByUsers.includes(randomUser.nickname)) {
				likedByUsers.push(randomUser.nickname);
			}
		}

		for (let i = 0; i < numDislikes; i++) {
			const randomUser = faker.helpers.arrayElement(users);
			if (!dislikedByUsers.includes(randomUser.nickname)) {
				dislikedByUsers.push(randomUser.nickname);
			}
		}

		return { likedByUsers, dislikedByUsers };
	}

	static create(
		ownerUser: SeedUserInterface,
		askerUser: SeedUserInterface,
		webhookId: string,
		amount: number,
		state: SeedQuestionStateType,
		users: SeedUserInterface[],
	): Omit<SeedQuestionInterface, "id"> {
		const isAnswered = state === "answered";
		const isWaiting = state === "waiting";
		const isRefused = state === "refused";
		const isExpired = state === "expired";

		const { likedByUsers, dislikedByUsers } = this.generateUserInteractions(users);

		return {
			is_seed: true,
			question_text: this.getQuestionText(),
			answer_text: isAnswered ? this.getAnswerText() : null,
			answered_at: isAnswered ? SeedHelpers.generateCreatedAt() : null,
			amount_paid: amount,
			asker_want_answer_to_be_private: faker.datatype.boolean({ probability: 0.2 }),
			asker_sent_anonymous_question: faker.datatype.boolean({ probability: 0.4 }),
			owner_user_nickname: ownerUser.nickname,
			asked_by_user_nickname: askerUser.nickname,
			question_is_awaiting_answer: isWaiting,
			question_answered: isAnswered,
			question_answer_was_recused: isRefused,
			question_answer_was_expired: isExpired,
			liked_by_users: JSON.stringify(likedByUsers),
			desliked_by_users: JSON.stringify(dislikedByUsers),
			webhook_id: webhookId,
			created_at: SeedHelpers.generateCreatedAt(),
			deleted_at: isAnswered && SeedHelpers.shouldDelete() ? faker.date.recent() : null,
		};
	}
}
