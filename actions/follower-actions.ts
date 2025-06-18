"use server";

import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma-client";

export async function removeFollower(followerId: string) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			throw new Error("Usuário não autenticado");
		}

		// Remove o relacionamento de seguidor
		await prisma.follower.deleteMany({
			where: {
				followerId: followerId,
				followingId: session.user.id,
			},
		});

		revalidateTag("user-session");

		return { success: true };
	} catch (error) {
		console.error("Erro ao remover seguidor:", error);
		throw error;
	}
}

export async function acceptFollowRequest(requestId: string) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			throw new Error("Usuário não autenticado");
		}

		// Buscar a solicitação
		const request = await prisma.followRequest.findUnique({
			where: { id: requestId },
		});

		if (!request) {
			throw new Error("Solicitação não encontrada");
		}

		// Criar o relacionamento de seguidor
		await prisma.follower.create({
			data: {
				followerId: request.senderId,
				followingId: request.receiverId,
			},
		});

		// Remover a solicitação
		await prisma.followRequest.delete({
			where: { id: requestId },
		});

		revalidateTag("user-session");
		revalidateTag("follow-requests");

		return { success: true };
	} catch (error) {
		console.error("Erro ao aceitar solicitação:", error);
		throw error;
	}
}

export async function rejectFollowRequest(requestId: string) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			throw new Error("Usuário não autenticado");
		}

		// Remover a solicitação
		await prisma.followRequest.delete({
			where: { id: requestId },
		});

		revalidateTag("follow-requests");

		return { success: true };
	} catch (error) {
		console.error("Erro ao rejeitar solicitação:", error);
		throw error;
	}
}
