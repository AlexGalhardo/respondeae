import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma-client";
import { z } from "zod";

export const personalInfoSchema = z.object({
	name: z
		.string()
		.min(4, "O nome deve ter pelo menos 4 caracteres")
		.max(24, "O nome deve ter no máximo 24 caracteres"),
	website: z
		.string()
		.optional()
		.refine((val) => !val || val.startsWith("https://"), {
			message: "O website deve começar com https://",
		}),
	description: z
		.string()
		.optional()
		.refine((val) => !val || (val.length >= 32 && val.length <= 256), {
			message: "A descrição deve ter entre 32 e 256 caracteres",
		}),
});

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
		}

		const body = await req.json();

		const parsed = personalInfoSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{
					errors: parsed.error.errors.map((err) => ({
						path: err.path.join("."),
						message: err.message,
					})),
				},
				{ status: 400 },
			);
		}

		const { name, website, description } = parsed.data;

		const updatedUser = await prisma.user.update({
			where: {
				id: session.user.id,
			},
			data: {
				name: name.trim(),
				website: website ?? null,
				description: description ?? null,
				updated_at: new Date(),
			},
		});

		return NextResponse.json(
			{
				message: "Meu Perfil atualizado com sucesso",
				user: {
					id: updatedUser.id,
					name: updatedUser.name,
					website: updatedUser.website,
					description: updatedUser.description,
				},
			},
			{ status: 200 },
		);
	} catch (error: any) {
		return NextResponse.json({ error: error?.message ?? "Erro interno do servidor" }, { status: 500 });
	}
}
