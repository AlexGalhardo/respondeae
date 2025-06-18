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

		// Remover o pedido de seguidor
		await prisma.followRequest.delete({
			where: { id: requestId },
		});

		return NextResponse.json({
			message: "Pedido rejeitado com sucesso",
		});
	} catch (error) {
		console.error("Erro ao rejeitar pedido:", error);
		return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
	}
}
