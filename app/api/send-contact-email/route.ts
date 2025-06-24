import { ContactEmail } from "@/emails/contact-email";
import TelegramLog from "@/lib/telegram-logger";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_e26UwkM2_FeAy6n5Zr1NKf9sWrrt89a2F");

export const contactSchema = z.object({
	name: z
		.string()
		.min(4, "Nome deve ter pelo menos 4 caracteres")
		.max(24, "Nome deve ter no máximo 24 caracteres")
		.trim(),
	email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
	subject: z.enum(["suporte", "pagamentos", "conta", "sugestao", "outro"], {
		errorMap: () => ({ message: "Assunto inválido" }),
	}),
	message: z.string().min(32, "Mensagem deve ter pelo menos 32 caracteres").trim(),
});

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const validationResult = contactSchema.safeParse(body);

		if (!validationResult.success) {
			const errors = validationResult.error.errors.map((error) => ({
				field: error.path[0],
				message: error.message,
			}));

			return NextResponse.json(
				{
					error: "Dados inválidos",
					details: errors,
				},
				{ status: 400 },
			);
		}

		const { name, email, subject, message } = validationResult.data;

		const { data, error } = await resend.emails.send({
			from: "onboarding@resend.dev",
			to: ["aleexgvieira@gmail.com"],
			subject: `Respondeae.com.br Contato - ${email} -${subject}`,
			react: ContactEmail({ name, email, subject, message }),
		});

		if (error) {
			await TelegramLog.error(`Error sending email via Resend: ${JSON.stringify(error)}`);
			return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
		}

		await TelegramLog.info(
			`Contact Message: \n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
		);

		return NextResponse.json({ success: true, data });
	} catch (error: any) {
		await TelegramLog.error(`Error in contact API: ${error?.message}`);
		return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
	}
}
