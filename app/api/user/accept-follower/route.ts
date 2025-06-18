import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma-client";

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
		}

		const { requestId } = await request.json();

		if (!requestId) {
			return NextResponse.json({ message: "ID do pedido é obrigatório" }, { status: 400 });
		}

		// Verificar se o pedido existe e pertence ao usuário logado
		const followRequest = await prisma.followRequest.findFirst({
			where: {
				id: requestId,
				receiverId: session.user.id,
			},
		});

		if (!followRequest) {
			return NextResponse.json({ message: "Pedido não encontrado" }, { status: 404 });
		}

		// Verificar se já não são seguidores
		const existingFollower = await prisma.follower.findFirst({
			where: {
				followerId: followRequest.senderId,
				followingId: session.user.id,
			},
		});

		if (existingFollower) {
			// Remove o pedido se já são seguidores
			await prisma.followRequest.delete({
				where: { id: requestId },
			});

			return NextResponse.json({ message: "Usuário já é seguidor" }, { status: 400 });
		}

		// Usar transação para criar o relacionamento de seguidor e remover o pedido
		await prisma.$transaction([
			// Criar o relacionamento de seguidor
			prisma.follower.create({
				data: {
					followerId: followRequest.senderId,
					followingId: session.user.id,
				},
			}),
			// Remover o pedido de seguidor
			prisma.followRequest.delete({
				where: { id: requestId },
			}),
		]);

		return NextResponse.json({
			message: "Seguidor aceito com sucesso",
		});
	} catch (error) {
		console.error("Erro ao aceitar seguidor:", error);
		return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
	}
}
