import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/pt_BR";
import { hash } from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

const arrayQuestions = [
	{
		question: "Qual é a sua opinião sobre educação financeira nas escolas?",
		answer: "Acredito que a educação financeira é essencial desde cedo. Ensina responsabilidade e planejamento.",
	},
	{
		question: "Como você lida com situações de estresse no trabalho?",
		answer: "Procuro manter a calma, respirar fundo e focar em resolver uma coisa de cada vez.",
	},
	{
		question: "Quais livros mudaram sua forma de pensar?",
		answer: "O livro 'O Poder do Hábito' me fez repensar como pequenas atitudes diárias moldam nossa vida.",
	},
	{
		question: "Como manter um relacionamento saudável a longo prazo?",
		answer: "Um relacionamento saudável exige diálogo, respeito e tempo de qualidade juntos.",
	},
	{
		question: "Quais hábitos você considera essenciais para o sucesso?",
		answer: "Disciplina, consistência e aprender com os erros são hábitos fundamentais.",
	},
	{
		question: "Como começar a investir com pouco dinheiro?",
		answer: "Comece estudando e investindo valores pequenos em fundos de baixo risco.",
	},
	{
		question: "O que te motiva a continuar nos momentos difíceis?",
		answer: "Lembrar do motivo pelo qual comecei me ajuda a seguir em frente.",
	},
	{
		question: "Como conciliar vida pessoal e carreira profissional?",
		answer: "É uma questão de equilíbrio. Priorizar tarefas e saber dizer 'não' ajuda bastante.",
	},
	{
		question: "Qual foi o maior desafio que você já enfrentou?",
		answer: "Perder alguém que amava foi o mais difícil, mas me ensinou a dar valor ao presente.",
	},
	{
		question: "Quais são as suas metas para os próximos 5 anos?",
		answer: "Minhas metas incluem terminar a faculdade, aprender um novo idioma e abrir um negócio.",
	},
	{
		question: "Como desenvolver autoconfiança?",
		answer: "Autoconfiança vem da prática. Celebre pequenas vitórias e aprenda com os fracassos.",
	},
	{
		question: "Qual a importância da gratidão no dia a dia?",
		answer: "A gratidão muda nossa perspectiva e nos ajuda a valorizar o que temos.",
	},
	{
		question: "Como manter a motivação para exercitar-se?",
		answer: "Encontre uma atividade que goste e estabeleça metas pequenas e alcançáveis.",
	},
	{
		question: "Qual conselho daria para alguém começando a carreira?",
		answer: "Seja curioso, peça feedback constantemente e invista em seu desenvolvimento pessoal.",
	},
	{
		question: "Como lidar com críticas construtivas?",
		answer: "Vejo críticas como oportunidades de crescimento. Escuto com mente aberta e analiso o que posso melhorar.",
	},
	{
		question: "Qual a melhor forma de aprender algo novo?",
		answer: "Combine teoria com prática, seja consistente e não tenha medo de cometer erros.",
	},
	{
		question: "Como organizar melhor o tempo?",
		answer: "Uso listas de prioridades e blocos de tempo focado. Elimino distrações desnecessárias.",
	},
	{
		question: "O que faria se tivesse um ano sabático?",
		answer: "Viajaria para conhecer novas culturas, aprenderia uma habilidade nova e faria trabalho voluntário.",
	},
	{
		question: "Como superar o medo do fracasso?",
		answer: "Entendo que o fracasso faz parte do aprendizado. Cada erro me aproxima do acerto.",
	},
	{
		question: "Qual a importância de ter um mentor?",
		answer: "Um mentor oferece perspectiva, experiência e acelera nosso desenvolvimento pessoal e profissional.",
	},
	{
		question: "Como manter amizades verdadeiras?",
		answer: "Amizades precisam de tempo, honestidade e presença nos momentos importantes.",
	},
	{
		question: "Qual sua filosofia de vida?",
		answer: "Vivo cada dia tentando ser melhor que ontem e contribuir positivamente para quem está ao meu redor.",
	},
	{
		question: "Como lidar com mudanças inesperadas?",
		answer: "Aceito que mudanças fazem parte da vida e procuro me adaptar mantendo o foco no que posso controlar.",
	},
	{
		question: "Qual a importância de sair da zona de conforto?",
		answer: "Sair da zona de conforto é onde acontece o verdadeiro crescimento pessoal e descobrimos nossas capacidades.",
	},
	{
		question: "Como cultivar paciência?",
		answer: "A paciência se desenvolve praticando mindfulness e lembrando que boas coisas levam tempo.",
	},
	{
		question: "Qual o papel da família na sua vida?",
		answer: "A família é minha base de apoio, amor incondicional e onde aprendo valores fundamentais.",
	},
	{
		question: "Como manter o otimismo em tempos difíceis?",
		answer: "Foco nas coisas boas que ainda tenho e lembro que dificuldades são temporárias.",
	},
	{
		question: "Qual a importância de ter hobbies?",
		answer: "Hobbies trazem alegria, reduzem o estresse e nos conectam com nossa criatividade.",
	},
	{
		question: "Como desenvolver inteligência emocional?",
		answer: "Pratico autoconhecimento, escuto ativamente os outros e trabalho na gestão das minhas emoções.",
	},
	{
		question: "O que significa sucesso para você?",
		answer: "Sucesso é encontrar equilíbrio entre realização pessoal, impacto positivo e felicidade genuína.",
	},
];

function generatePixId() {
	return `pix_char_${crypto.randomUUID().replace(/-/g, "")}`;
}

let toggleGender = true;
const usedNicknames = new Set();
const usedAvatars = new Set();

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidLatinName(name: string) {
	return /^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/.test(name);
}

function generateCreatedAt() {
	const rand = Math.random() * 100; // value between 0 and 100

	if (rand < 0.33) {
		return new Date(); // 0.33%
	} else if (rand < 0.66) {
		return faker.date.recent(); // next 0.33%
	} else {
		return faker.date.past(); // remaining 99.34%
	}
}

async function generateRandomUser() {
	let uniqueUser = null;

	while (!uniqueUser) {
		await sleep(200);

		const gender = toggleGender ? "male" : "female";
		toggleGender = !toggleGender;

		try {
			console.log(`🔄 Buscando usuário ${gender} na API...`);
			const res = await fetch(`https://randomuser.me/api/?nat=BR&gender=${gender}`);
			const data = await res.json();

			if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
				console.warn("⚠️ Dados inválidos recebidos da API, tentando novamente...");
				continue;
			}

			const user = data.results[0];
			const name = `${user.name.first} ${user.name.last}`;

			if (!isValidLatinName(name)) {
				console.log(`❌ Nome inválido detectado: "${name}". Ignorando...`);
				continue;
			}

			const nickname = slugify(name, { lower: true, strict: true }).replace(/[-\s]/g, "");
			const avatar_url = user.picture.large;

			if (!usedNicknames.has(nickname) && !usedAvatars.has(avatar_url)) {
				usedNicknames.add(nickname);
				usedAvatars.add(avatar_url);

				uniqueUser = {
					name,
					nickname,
					gender,
					avatar_url,
				};
				console.log(`✅ Usuário único gerado: ${name} (@${nickname})`);
			} else {
				console.log(`🔄 Usuário duplicado encontrado: nickname = ${nickname}, tentando novamente...`);
			}
		} catch (err: any) {
			console.error("❌ Erro ao buscar ou processar dados da API:", err?.message);
		}
	}

	return uniqueUser;
}

async function main() {
	console.log("🌱 Iniciando processo de seed do banco de dados...");
	console.log("📅 Timestamp:", new Date().toISOString());

	console.log("\n🗑️ Limpando tabelas existentes...");
	await prisma.question.deleteMany();
	console.log("✅ Tabela 'question' limpa");

	await prisma.webhookAbacatePay.deleteMany();
	console.log("✅ Tabela 'webhookAbacatePay' limpa");

	await prisma.follower.deleteMany();
	console.log("✅ Tabela 'follower' limpa");

	await prisma.user.deleteMany();
	console.log("✅ Tabela 'user' limpa");

	await prisma.followRequest.deleteMany();
	console.log('✅ Tabela "followRequest" limpa');

	await prisma.deletedAccount.deleteMany();
	console.log("✅ Tabela 'deletedAccount' limpa");

	const users = [];

	console.log("\n👤 Criando usuário de teste...");

	await prisma.user.create({
		data: {
			name: `RespondeAê Perfil Oficial`,
			is_seed: true,
			nickname: "respondeae",
			email: `respondeae@gmail.com`,
			password: await hash("respondeaeoficialBR@123", 10),
			description: "Perfil oficial do RespondeAe",
			website: faker.datatype.boolean() ? faker.internet.url() : null,
			pix_key: faker.datatype.boolean() ? faker.internet.email() : null,
			avatar_url: "https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct",
			twitter: null,
			instagram: faker.helpers.maybe(() => `https://instagram.com/respondeaeoficial`, { probability: 1 }),
			youtube: null,
			tiktok: null,
			linkedin: null,
			github: null,
			facebook: null,
			twitch: null,
			api_key: `api_key_askedly_${faker.string.alphanumeric(16)}`,
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
		},
	});

	await prisma.user.create({
		data: {
			is_admin: true,
			is_seed: true,
			name: `ADM`,
			nickname: "admin",
			email: `admin@gmail.com`,
			password: await hash("adminBR@123", 10),
			description: "",
			website: faker.datatype.boolean() ? faker.internet.url() : null,
			pix_key: faker.datatype.boolean() ? faker.internet.email() : null,
			avatar_url: null,
			twitter: null,
			instagram: null,
			youtube: null,
			tiktok: null,
			linkedin: null,
			github: null,
			facebook: null,
			twitch: null,
			api_key: `api_key_askedly_${faker.string.alphanumeric(16)}`,
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
		},
	});

	console.log("✅ Usuário Respondeae Oficial criado!");

	console.log(`\n👥 Criando ${process.env.SEED_TOTAL_RANDOM_USERS_TO_CREATED} usuários aleatórios...`);

	for (let i = 0; i < Number(process.env.SEED_TOTAL_RANDOM_USERS_TO_CREATED); i++) {
		console.log(`📝 Criando usuário ${i + 1}/${process.env.SEED_TOTAL_RANDOM_USERS_TO_CREATED}...`);

		const { name, nickname, avatar_url } = await generateRandomUser();

		const user = await prisma.user.create({
			data: {
				is_seed: true,
				name: name,
				nickname: nickname,
				email: `${nickname}@gmail.com`,
				password: await hash("senhaBR@123", 10),
				description: faker.lorem.sentence(),
				website: faker.datatype.boolean() ? faker.internet.url() : null,
				pix_key: `${nickname}@gmail.com`,
				avatar_url,
				twitter: faker.helpers.maybe(() => `https://twitter.com/${nickname}`, { probability: 1 }),
				instagram: faker.helpers.maybe(() => `https://instagram.com/${nickname}`, { probability: 1 }),
				youtube: faker.helpers.maybe(() => `https://youtube.com/@${nickname}`, { probability: 1 }),
				tiktok: faker.helpers.maybe(() => `https://tiktok.com/@${nickname}`, { probability: 1 }),
				linkedin: faker.helpers.maybe(() => `https://linkedin.com/in/${nickname}`, { probability: 1 }),
				github: faker.helpers.maybe(() => `https://github.com/${nickname}`, { probability: 1 }),
				facebook: faker.helpers.maybe(() => `https://facebook.com/${nickname}`, { probability: 1 }),
				twitch: faker.helpers.maybe(() => `https://twitch.tv/${nickname}`, { probability: 1 }),
				api_key: `api_key_askedly_${faker.string.alphanumeric(16)}`,
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
				deleted_at:
					Math.random() > 0.9 ? (Math.random() < 0.75 ? faker.date.past() : faker.date.recent()) : null,
				banned_until:
					Math.random() > 0.9 ? (Math.random() < 0.75 ? faker.date.past() : faker.date.recent()) : null,
			},
		});

		users.push(user);

		console.log(
			`✅ Usuário ${i + 1}/${process.env.SEED_TOTAL_RANDOM_USERS_TO_CREATED} criado: ${name} (@${nickname})`,
		);

		if ((i + 1) % 10 === 0) {
			console.log(`🚀 Progresso: ${i + 1}/99 usuários criados (${Math.round(((i + 1) / 99) * 100)}%)`);
		}
	}

	console.log(`✅ Total de ${users.length} usuários criados com sucesso!`);

	console.log(`\n🔗 Criando ${process.env.SEED_TOTAL_FOLLOWERS_RELATIONS} relações de seguidores...`);
	const followers = [];
	const followRelations = new Set<string>();

	while (followers.length < Number(process.env.SEED_TOTAL_FOLLOWERS_RELATIONS)) {
		const followerId = users[faker.number.int({ min: 0, max: users.length - 1 })].id;
		const followingId = users[faker.number.int({ min: 0, max: users.length - 1 })].id;
		const relationKey = `${followerId}-${followingId}`;

		if (followerId !== followingId && !followRelations.has(relationKey)) {
			try {
				const follower = await prisma.follower.create({
					data: {
						followerId,
						followingId,
					},
				});
				followers.push(follower);
				followRelations.add(relationKey);

				const followerUser = users.find((u) => u.id === followerId);
				const followingUser = users.find((u) => u.id === followingId);

				console.log(
					`👥 Relação ${followers.length}/${process.env.SEED_TOTAL_FOLLOWERS_RELATIONS}: @${followerUser?.nickname} seguiu @${followingUser?.nickname}`,
				);

				if (followers.length % 50 === 0) {
					console.log(
						`🚀 Progresso relações: ${followers.length}/${process.env.SEED_TOTAL_FOLLOWERS_RELATIONS} (${Math.round((followers.length / Number(process.env.SEED_TOTAL_FOLLOWERS_RELATIONS)) * 100)}%)`,
					);
				}
			} catch (error) {
				console.log(`⚠️ Erro ao criar relação de seguidor, tentando novamente...`);
				continue;
			}
		}
	}

	console.log(`✅ ${followers.length} relações de seguidores criadas com sucesso!`);

	const questions = [];
	interface Webhook {
		id: string;
		pixId: string;
		status: string;
		amount: number;
		fee: number;
		method: string;
		kind: string;
		eventStatus: string;
		devMode: boolean;
		completeEvent: string;
		createdAt: Date;
		updatedAt: Date | null;
	}

	interface Question {
		id: number;
		questionText: string;
		answerText: string | null;
		answeredAt: Date | null;
		amountPaid: number;
		askerWantAnswerToBePrivate: boolean;
		askerSentAnonymousQuestion: boolean;
		ownerUserId: number;
		askedByUserId: number;
		answerAwaiting: boolean;
		questionAnswered: boolean;
		answerRefused: boolean;
		answerExpired: boolean;
		answerDeletedAt: Date | null;
		likedByUsers: string;
		deslikedByUsers: string;
		reportedOffensiveByUsers: string;
		reportedInadequateByUsers: string;
		createdAt: Date;
		updatedAt: Date;
		pixId: string;
	}

	const webhooks: Webhook[] = [];

	console.log("\n❓ Criando perguntas garantidas para cada usuário (4 estados x 3 perguntas = 12 por usuário)...");
	const questionStates = ["answered", "waiting", "refused", "expired"];
	let totalGuaranteedQuestions = users.length * questionStates.length * 3;
	let currentQuestionCount = 0;

	for (let userIndex = 0; userIndex < users.length; userIndex++) {
		const ownerUser = users[userIndex];
		console.log(`📝 Criando perguntas para usuário ${userIndex + 1}/${users.length}: @${ownerUser.nickname}`);

		for (let stateIndex = 0; stateIndex < questionStates.length; stateIndex++) {
			const state = questionStates[stateIndex];
			console.log(`  📊 Criando 3 perguntas no estado: ${state}`);

			for (let questionIndex = 0; questionIndex < 3; questionIndex++) {
				currentQuestionCount++;

				let askerUser;
				do {
					askerUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
				} while (askerUser.id === ownerUser.id);

				const pixId = generatePixId();
				const amount = faker.number.int({ min: 2, max: 100 }) * 100;
				const webhook_id = faker.string.uuid();

				console.log(
					`    💳 Criando webhook ${currentQuestionCount}/${totalGuaranteedQuestions}: ${pixId} - R$ ${amount / 100}`,
				);

				const webhook = await prisma.webhookAbacatePay.create({
					data: {
						is_seed: true,
						id: webhook_id,
						pix_id: pixId,
						status: faker.helpers.arrayElement(["pending", "paid", "cancelled", "expired"]).toUpperCase(),
						amount: amount,
						fee: Math.floor(amount * 0.05),
						method: "PIX",
						kind: faker.helpers.arrayElement(["payment", "refund"]),
						event_status: faker.helpers.arrayElement(["created", "processing", "completed", "failed"]),
						dev_mode: faker.datatype.boolean({ probability: 0.3 }),
						complete_event: JSON.stringify({
							event_id: faker.string.uuid(),
							timestamp: faker.date.recent().toISOString(),
							data: {
								transaction_id: pixId,
								amount: amount,
								status: "completed",
							},
						}),
					},
				});

				webhooks.push({
					id: webhook.id,
					pixId: webhook.pix_id,
					status: webhook.status,
					amount: webhook.amount,
					fee: webhook.fee,
					method: webhook.method,
					kind: webhook.kind,
					eventStatus: webhook.event_status,
					devMode: webhook.dev_mode,
					completeEvent: webhook.complete_event,
					createdAt: webhook.created_at,
					updatedAt: null,
				});

				const selectedQA = faker.helpers.arrayElement(arrayQuestions);

				let isAnswered = false;
				let isRefused = false;
				let isExpired = false;
				let isWaiting = false;

				switch (state) {
					case "answered":
						isAnswered = true;
						break;
					case "waiting":
						isWaiting = true;
						break;
					case "refused":
						isRefused = true;
						break;
					case "expired":
						isExpired = true;
						break;
				}

				const numLikes = faker.number.int({ min: 5, max: 25 });
				const numDislikes = faker.number.int({ min: 5, max: 25 });
				const numOffensiveReports = faker.number.int({ min: 5, max: 10 });
				const numInadequateReports = faker.number.int({ min: 5, max: 10 });

				const likedByUsers = [];
				const dislikedByUsers = [];
				const reportedOffensiveByUsers = [];
				const reportedInadequateByUsers = [];

				for (let j = 0; j < numLikes; j++) {
					const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
					likedByUsers.push(randomUser.nickname);
				}

				for (let j = 0; j < numDislikes; j++) {
					const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
					dislikedByUsers.push(randomUser.nickname);
				}

				for (let j = 0; j < numOffensiveReports; j++) {
					const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
					reportedOffensiveByUsers.push(randomUser.nickname);
				}

				for (let j = 0; j < numInadequateReports; j++) {
					const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
					reportedInadequateByUsers.push(randomUser.nickname);
				}

				console.log(
					`    ❓ Criando pergunta ${currentQuestionCount}/${totalGuaranteedQuestions}: ${state} - @${askerUser.nickname} → @${ownerUser.nickname}`,
				);

				const question = await prisma.question.create({
					data: {
						is_seed: true,
						question_text: selectedQA.question,
						answer_text: isAnswered ? selectedQA.answer : null,
						answered_at: isAnswered ? faker.date.recent() : null,
						amount_paid: amount,
						asker_want_answer_to_be_private: faker.datatype.boolean({ probability: 0.2 }),
						asker_sent_anonymous_question: Math.random() < 0.4 ? true : false,
						owner_user_nickname: ownerUser.nickname,
						asked_by_user_nickname: askerUser.nickname,
						question_is_awaiting_answer: isWaiting,
						question_answered: isAnswered,
						question_answer_was_recused: isRefused,
						question_answer_was_expired: isExpired,
						liked_by_users: JSON.stringify(likedByUsers),
						desliked_by_users: JSON.stringify(dislikedByUsers),
						webhook_id: webhook.id,
						created_at: generateCreatedAt(),
						deleted_at:
							isAnswered && faker.datatype.boolean({ probability: 0.05 }) ? faker.date.recent() : null,
					},
				});

				questions.push(question);
				console.log(`    ✅ Pergunta criada com sucesso! Total: ${questions.length}`);
			}
		}

		if ((userIndex + 1) % 10 === 0) {
			console.log(
				`🚀 Progresso usuários processados: ${userIndex + 1}/${users.length} (${Math.round(((userIndex + 1) / users.length) * 100)}%)`,
			);
			console.log(`📊 Total de perguntas criadas até agora: ${questions.length}`);
		}
	}

	console.log(`✅ Perguntas garantidas criadas: ${questions.length}`);

	console.log(`\n🎲 Criando ${process.env.SEED_RANDOM_QUESTIONS_TO_CREATE} perguntas adicionais aleatórias...`);

	for (let i = 0; i < Number(process.env.SEED_RANDOM_QUESTIONS_TO_CREATE); i++) {
		console.log(`📝 Criando pergunta adicional ${i + 1}/100...`);

		const ownerUser = users[faker.number.int({ min: 0, max: users.length - 1 })];

		let askerUser;
		do {
			askerUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
		} while (askerUser.id === ownerUser.id);

		const isAnswered = faker.datatype.boolean({ probability: 0.7 });
		const isRefused = !isAnswered && faker.datatype.boolean({ probability: 0.15 });
		const isExpired = !isAnswered && !isRefused && faker.datatype.boolean({ probability: 0.1 });
		const isWaiting = !isAnswered && !isRefused && !isExpired;

		let status = "answered";
		if (isWaiting) status = "waiting";
		if (isRefused) status = "refused";
		if (isExpired) status = "expired";

		const pixId = generatePixId();
		const amount = faker.number.int({ min: 2, max: 100 }) * 100;

		console.log(
			`  💳 Criando webhook adicional ${i + 1}/${process.env.SEED_RANDOM_QUESTIONS_TO_CREATE}: ${pixId} - R$ ${amount / 100}`,
		);

		const webhook = await prisma.webhookAbacatePay.create({
			data: {
				id: faker.string.uuid(),
				pix_id: pixId,
				status: faker.helpers.arrayElement(["pending", "paid", "cancelled", "expired"]).toUpperCase(),
				amount: amount,
				fee: Math.floor(amount * 0.05),
				method: "PIX",
				kind: faker.helpers.arrayElement(["payment", "refund"]),
				event_status: faker.helpers.arrayElement(["created", "processing", "completed", "failed"]),
				dev_mode: faker.datatype.boolean({ probability: 0.3 }),
				complete_event: JSON.stringify({
					event_id: faker.string.uuid(),
					timestamp: faker.date.recent().toISOString(),
					data: {
						transaction_id: pixId,
						amount: amount,
						status: "completed",
					},
				}),
			},
		});

		webhooks.push({
			id: webhook.id,
			pixId: webhook.pix_id,
			status: webhook.status,
			amount: webhook.amount,
			fee: webhook.fee,
			method: webhook.method,
			kind: webhook.kind,
			eventStatus: webhook.event_status,
			devMode: webhook.dev_mode,
			completeEvent: webhook.complete_event,
			createdAt: webhook.created_at,
			updatedAt: null,
		});

		const selectedQA = faker.helpers.arrayElement(arrayQuestions);

		const numLikes = faker.number.int({ min: 5, max: 25 });
		const numDislikes = faker.number.int({ min: 5, max: 25 });
		const numOffensiveReports = faker.number.int({ min: 5, max: 10 });
		const numInadequateReports = faker.number.int({ min: 5, max: 10 });

		const likedByUsers = [];
		const dislikedByUsers = [];
		const reportedOffensiveByUsers = [];
		const reportedInadequateByUsers = [];

		for (let j = 0; j < numLikes; j++) {
			const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
			likedByUsers.push(randomUser.nickname);
		}

		for (let j = 0; j < numDislikes; j++) {
			const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
			dislikedByUsers.push(randomUser.nickname);
		}

		for (let j = 0; j < numOffensiveReports; j++) {
			const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
			reportedOffensiveByUsers.push(randomUser.nickname);
		}

		for (let j = 0; j < numInadequateReports; j++) {
			const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
			reportedInadequateByUsers.push(randomUser.nickname);
		}

		console.log(
			`  ❓ Criando pergunta adicional ${i + 1}/${process.env.SEED_RANDOM_QUESTIONS_TO_CREATE}: ${status} - @${askerUser.nickname} → @${ownerUser.nickname}`,
		);

		const question = await prisma.question.create({
			data: {
				is_seed: true,
				question_text: selectedQA.question,
				answer_text: isAnswered ? selectedQA.answer : null,
				answered_at: isAnswered ? faker.date.recent() : null,
				amount_paid: amount,
				asker_want_answer_to_be_private: faker.datatype.boolean({ probability: 0.2 }),
				asker_sent_anonymous_question: false,
				owner_user_nickname: ownerUser.nickname,
				asked_by_user_nickname: askerUser.nickname,
				question_is_awaiting_answer: isWaiting,
				question_answered: isAnswered,
				question_answer_was_recused: isRefused,
				question_answer_was_expired: isExpired,
				deleted_at: isAnswered && faker.datatype.boolean({ probability: 0.05 }) ? faker.date.recent() : null,
				liked_by_users: JSON.stringify(likedByUsers),
				desliked_by_users: JSON.stringify(dislikedByUsers),
				webhook_id: webhook.id,
				created_at: generateCreatedAt(),
			},
		});

		questions.push(question);
		console.log(
			`  ✅ Pergunta adicional ${i + 1}/${process.env.SEED_RANDOM_QUESTIONS_TO_CREATE} criada! Total geral: ${questions.length}`,
		);

		if ((i + 1) % 50 === 0) {
			console.log(
				`🚀 Progresso perguntas adicionais: ${i + 1}/${process.env.SEED_RANDOM_QUESTIONS_TO_CREATE} (${Math.round(((i + 1) / Number(process.env.SEED_RANDOM_QUESTIONS_TO_CREATE)) * 100)}%)`,
			);
		}
	}

	console.log(`✅ ${webhooks.length} webhooks criados com sucesso!`);
	console.log(`✅ ${questions.length} perguntas criadas com sucesso!`);
	console.log("🎉 Processo de seed do banco de dados concluído com sucesso!");

	console.log("\n" + "=".repeat(60));
	console.log("📊 ESTATÍSTICAS FINAIS DO SEED");
	console.log("=".repeat(60));
	console.log(`📅 Concluído em: ${new Date().toISOString()}`);
	console.log(`👥 Total de usuários criados: ${users.length}`);
	console.log(`🔗 Total de relações de seguidores: ${followers.length}`);
	console.log(`❓ Total de perguntas criadas: ${questions.length}`);
	console.log(`💳 Total de webhooks criados: ${webhooks.length}`);

	const answeredCount = questions.filter((q) => q.question_answered).length;
	const waitingCount = questions.filter((q) => q.question_is_awaiting_answer).length;
	const refusedCount = questions.filter((q) => q.question_answer_was_recused).length;
	const expiredCount = questions.filter((q) => q.question_answer_was_expired).length;

	console.log("\n📈 DISTRIBUIÇÃO DE ESTADOS DAS PERGUNTAS:");
	console.log(
		`✅ Perguntas respondidas: ${answeredCount} (${Math.round((answeredCount / questions.length) * 100)}%)`,
	);
	console.log(`⏳ Perguntas aguardando: ${waitingCount} (${Math.round((waitingCount / questions.length) * 100)}%)`);
	console.log(`❌ Perguntas recusadas: ${refusedCount} (${Math.round((refusedCount / questions.length) * 100)}%)`);
	console.log(`⏰ Perguntas expiradas: ${expiredCount} (${Math.round((expiredCount / questions.length) * 100)}%)`);

	const totalValue = questions.reduce((sum, q) => sum + q.amount_paid, 0);
	console.log(`💰 Valor total das perguntas: R$ ${(totalValue / 100).toFixed(2)}`);

	const usersWithQuestions = [...new Set(questions.map((q) => q.owner_user_nickname))].length;
	const usersWhoAsked = [...new Set(questions.map((q) => q.asked_by_user_nickname))].length;

	console.log("\n👤 ESTATÍSTICAS DE USUÁRIOS:");
	console.log(`📝 Usuários que receberam perguntas: ${usersWithQuestions}/${users.length}`);
	console.log(`❓ Usuários que fizeram perguntas: ${usersWhoAsked}/${users.length}`);

	console.log("\n🔍 VERIFICAÇÃO DE INTEGRIDADE:");
	const questionsWithWebhooks = questions.filter((q) => webhooks?.some((w) => w?.id === q?.webhook_id)).length;
	console.log(`🔗 Perguntas com webhooks vinculados: ${questionsWithWebhooks}/${questions.length}`);

	if (questionsWithWebhooks === questions.length) {
		console.log("✅ Todos os webhooks estão corretamente vinculados às perguntas!");
	} else {
		console.log("⚠️ Alguns webhooks podem não estar vinculados corretamente!");
	}

	console.log("\n" + "=".repeat(60));
	console.log("🎊 SEED FINALIZADO COM SUCESSO! 🎊");
	console.log("=".repeat(60));
}

main()
	.catch((e) => {
		console.error("\n" + "❌".repeat(20));
		console.error("💥 ERRO DURANTE O PROCESSO DE SEED:");
		console.error("❌".repeat(20));
		console.error("🚨 Detalhes do erro:", e);
		console.error("📍 Stack trace:", e.stack);
		console.error("⏰ Timestamp do erro:", new Date().toISOString());
		console.error("❌".repeat(20));
		process.exit(1);
	})
	.finally(async () => {
		console.log("\n🔌 Desconectando do banco de dados...");
		await prisma.$disconnect();
		console.log("✅ Desconexão do banco realizada com sucesso!");
		console.log("👋 Processo finalizado!");
	});
