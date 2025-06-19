"use server";

import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma-client";

export async function unfollowUser(followingId: string) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			throw new Error("Usuário não autenticado");
		}

		// Remove o relacionamento de seguir
		await prisma.follower.deleteMany({
			where: {
				followerId: session.user.id,
				followingId: followingId,
			},
		});

		// Revalidate cache para atualizar a sessão
		revalidateTag("user-session");

		return { success: true };
	} catch (error) {
		console.error("Erro ao deixar de seguir:", error);
		throw error;
	}
}
