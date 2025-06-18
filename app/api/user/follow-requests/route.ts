// app/api/user/follow-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma-client";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
		}

		// Buscar pedidos de seguidor recebidos pelo usuário logado
		const followRequests = await prisma.followRequest.findMany({
			where: {
				receiverId: session.user.id,
			},
			include: {
				sender: {
					select: {
						id: true,
						name: true,
						nickname: true,
						avatar_url: true,
						description: true,
					},
				},
			},
			orderBy: {
				created_at: "desc",
			},
		});

		return NextResponse.json({
			followRequests,
			count: followRequests.length,
		});
	} catch (error) {
		console.error("Erro ao buscar pedidos de seguidor:", error);
		return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
	}
}
