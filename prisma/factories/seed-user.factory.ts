import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";
import slugify from "slugify";
import { SeedUniqueTracker } from "../helpers/seed-unique-tracker.helper";
import { SeedHelpers } from "../helpers/seed-helpers.helper";
import { SeedUserInterface } from "../helpers/seed-interfaces.helper";

export class SeedUserFactory {
	constructor(private readonly uniqueTracker: SeedUniqueTracker) {}

	async createAdminUser(): Promise<Omit<SeedUserInterface, "id">> {
		return {
			is_admin: true,
			is_seed: true,
			name: "ADM",
			nickname: "admin",
			email: "admin@gmail.com",
			password: await hash("adminBR@123", 10),
			description: "",
			website: null,
			pix_key: null,
			avatar_url: null,
			twitter: null,
			instagram: null,
			youtube: null,
			tiktok: null,
			linkedin: null,
			github: null,
			facebook: null,
			twitch: null,
			api_key: SeedHelpers.generateApiKey(),
			privacy_accept_anonymous_questions: false,
			privacy_show_anonymous_questions_public: false,
			privacy_show_questions_answered_only_to_followers: false,
			privacy_show_value_received_from_answering_question: false,
			privacy_show_date_questions_was_answered: false,
			privacy_show_total_followers_public: false,
			privacy_show_total_questions_sent_public: false,
			privacy_show_likes_each_answer_public: false,
			privacy_show_dislikes_each_answer_public: false,
			privacy_show_total_likes_all_answers_public: false,
			privacy_show_total_questions_received_public: false,
			privacy_show_total_questions_answered_public: false,
		};
	}

	async createOfficialUser(): Promise<Omit<SeedUserInterface, "id">> {
		return {
			name: "RespondeAê Perfil Oficial",
			is_seed: true,
			nickname: "respondeae",
			email: "respondeae@gmail.com",
			password: await hash("respondeaeoficialBR@123", 10),
			description: "Perfil oficial do RespondeAe",
			website: faker.datatype.boolean() ? faker.internet.url() : null,
			pix_key: faker.datatype.boolean() ? faker.internet.email() : null,
			avatar_url: "https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct",
			twitter: null,
			instagram: "https://instagram.com/respondeaeoficial",
			youtube: null,
			tiktok: null,
			linkedin: null,
			github: null,
			facebook: null,
			twitch: null,
			api_key: SeedHelpers.generateApiKey(),
			privacy_accept_anonymous_questions: true,
			privacy_show_anonymous_questions_public: true,
			privacy_show_questions_answered_only_to_followers: true,
			privacy_show_value_received_from_answering_question: true,
			privacy_show_date_questions_was_answered: true,
			privacy_show_total_followers_public: true,
			privacy_show_total_questions_sent_public: true,
			privacy_show_likes_each_answer_public: true,
			privacy_show_dislikes_each_answer_public: true,
			privacy_show_total_likes_all_answers_public: true,
			privacy_show_total_questions_received_public: true,
			privacy_show_total_questions_answered_public: true,
		};
	}

	async createRandomUser(): Promise<Omit<SeedUserInterface, "id">> {
		let nickname: string;
		let email: string;
		let attempts = 0;
		const maxAttempts = 100;

		do {
			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			const name = `${firstName} ${lastName}`;

			nickname = slugify(name, { lower: true, strict: true }).replace(/[-\s]/g, "");

			if (attempts > 10) {
				nickname += faker.number.int({ min: 1, max: 9999 });
			}

			email = `${nickname}@gmail.com`;
			attempts++;

			if (attempts >= maxAttempts) {
				nickname = faker.internet.userName().toLowerCase() + faker.number.int({ min: 1000, max: 9999 });
				email = `${nickname}@gmail.com`;
				break;
			}
		} while (this.uniqueTracker.isNicknameUsed(nickname) || this.uniqueTracker.isEmailUsed(email));

		this.uniqueTracker.addNickname(nickname);
		this.uniqueTracker.addEmail(email);

		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;

		return {
			is_seed: true,
			name: fullName,
			nickname,
			email,
			password: await hash("senhaBR@123", 10),
			description: faker.lorem.sentence(),
			website: faker.datatype.boolean() ? faker.internet.url() : null,
			pix_key: `${nickname}@gmail.com`,
			avatar_url: faker.image.avatar(),
			twitter: SeedHelpers.generateSocialMediaUrl("twitter", nickname),
			instagram: SeedHelpers.generateSocialMediaUrl("instagram", nickname),
			youtube: SeedHelpers.generateSocialMediaUrl("youtube", nickname),
			tiktok: SeedHelpers.generateSocialMediaUrl("tiktok", nickname),
			linkedin: SeedHelpers.generateSocialMediaUrl("linkedin", nickname),
			github: SeedHelpers.generateSocialMediaUrl("github", nickname),
			facebook: SeedHelpers.generateSocialMediaUrl("facebook", nickname),
			twitch: SeedHelpers.generateSocialMediaUrl("twitch", nickname),
			api_key: SeedHelpers.generateApiKey(),
			privacy_accept_anonymous_questions: true,
			privacy_show_anonymous_questions_public: true,
			privacy_show_questions_answered_only_to_followers: true,
			privacy_show_value_received_from_answering_question: true,
			privacy_show_date_questions_was_answered: true,
			privacy_show_total_followers_public: true,
			privacy_show_total_questions_sent_public: true,
			privacy_show_likes_each_answer_public: true,
			privacy_show_dislikes_each_answer_public: true,
			privacy_show_total_likes_all_answers_public: true,
			privacy_show_total_questions_received_public: true,
			privacy_show_total_questions_answered_public: true,
			created_at: Math.random() < 0.75 ? faker.date.past() : faker.date.recent(),
			deleted_at: SeedHelpers.shouldDelete() ? faker.date.recent() : null,
			banned_until: SeedHelpers.shouldBan() ? faker.date.future() : null,
		};
	}
}
