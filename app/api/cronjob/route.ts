import TelegramLog from "@/lib/telegram-logger";
import { prisma } from "@/prisma/prisma-client";
import { subDays } from "date-fns";

async function deleteOldUsers(): Promise<number> {
	const thirtyDaysAgo = subDays(new Date(), 30);

	const usersToDelete = await prisma.user.findMany({
		where: {
			deleted_at: {
				not: null,
				lt: thirtyDaysAgo,
			},
		},
	});

	if (usersToDelete.length === 0) return 0;

	const deletedAccountsData = usersToDelete.map((user) => ({
		user_id_was: user.id,
		name: user.name,
		nickname: user.nickname,
		email: user.email,
		is_seed: user.is_seed,
		account_was_created_at: user.created_at,
	}));

	await prisma.deletedAccount.createMany({
		data: deletedAccountsData,
	});

	await prisma.user.deleteMany({
		where: {
			id: {
				in: usersToDelete.map((u) => u.id),
			},
		},
	});

	return usersToDelete.length;
}

export async function GET(request: Request) {
	const now = new Date();
	const formattedNow = now.toLocaleString("pt-BR");

	const resetResult = await prisma.user.updateMany({
		data: {
			public_questions_remaining_today: 10,
			anonymous_questions_remaining_today: 1,
		},
	});

	const deletedCount = await deleteOldUsers();

	await TelegramLog.info(
		`🕒 Cronjob executado em ${formattedNow}\n🔁 Contadores resetados para ${resetResult.count} usuários.\n🗑️ Usuários deletados após 30 dias: ${deletedCount}`,
	);

	return new Response("OK");
}
