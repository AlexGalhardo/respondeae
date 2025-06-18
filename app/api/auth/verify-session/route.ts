// app/api/auth/verify-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/repositories/users.repository";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Sessão não encontrada ou expirada" }, { status: 401 });
		}

		// Aqui você pode adicionar verificações adicionais
		// como verificar se o usuário ainda existe no banco de dados
		const user = await getUserById(session.user.id);
		if (!user) {
			return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
		}

		return NextResponse.json({
			user: session.user,
			expires: session.expires,
		});
	} catch (error) {
		console.error("Erro ao verificar sessão:", error);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
