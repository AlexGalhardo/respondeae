"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Mail, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { contactSchema } from "@/app/api/send-contact-email/route";

export default function ContatoClient() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [errors, setErrors] = useState({
		name: false,
		email: false,
		subject: false,
		message: false,
	});
	const [loading, setLoading] = useState(false);

	const validateForm = () => {
		const validationResult = contactSchema.safeParse(formData);

		if (validationResult.success) {
			setErrors({
				name: false,
				email: false,
				subject: false,
				message: false,
			});
			return true;
		}

		// Mapear erros do Zod para o estado de errors
		const newErrors = {
			name: false,
			email: false,
			subject: false,
			message: false,
		};

		validationResult.error.errors.forEach((error) => {
			const field = error.path[0] as keyof typeof newErrors;
			if (field) {
				newErrors[field] = true;
			}
		});

		setErrors(newErrors);
		return false;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);

		try {
			const response = await fetch("/api/send-contact-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				toast({
					title: "Mensagem enviada com sucesso",
					variant: "success",
				});
				setFormData({
					name: "",
					email: "",
					subject: "",
					message: "",
				});
				return;
			}

			const errorData = await response.json();
			toast({
				title: "Erro ao enviar mensagem",
				description: errorData.error || "Por favor, tente novamente mais tarde.",
				variant: "error",
			});
		} catch (error: any) {
			toast({
				title: "Erro ao enviar mensagem",
				description: "Por favor, tente novamente mais tarde.",
				variant: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (value: string) => {
		setFormData((prev) => ({ ...prev, subject: value }));
	};

	return (
		<main className="p-4 lg:p-6">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-8 dark:text-white p-8 rounded-lg">
					<h2 className="text-3xl font-bold text-foreground mb-4">Entre em contato</h2>
					<p className="text-lg text-muted-foreground">
						Tem alguma dúvida? Encontrou algum problema? Envie nos uma mensagem e retornaremos o mais breve
						possível.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card>
						<CardContent className="p-6 text-center">
							<div className="flex justify-center mb-4">
								<MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-lg font-bold text-foreground mb-2">Endereço</h3>
							<p className="text-sm text-muted-foreground">
								Rua das Perguntas, 123
								<br />
								São Paulo, SP - 01234-567
							</p>
							<p className="text-sm text-muted-foreground mt-3">CNPJ 12.345.678/0001-90</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6 text-center">
							<div className="flex justify-center mb-4">
								<div className="flex space-x-2">
									<Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
								</div>
							</div>
							<h3 className="text-lg font-bold text-foreground mb-2">E-mail</h3>
							<p className="text-sm text-muted-foreground mb-2">suporte@respondeae.com.br</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6 text-center">
							<div className="flex justify-center mb-4">
								<Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-lg font-bold text-foreground mb-2">Atendimento</h3>
							<p className="text-sm text-muted-foreground">Respondemos em até 3 dias úteis</p>
						</CardContent>
					</Card>
				</div>

				{/* Contact Form - Full Width */}
				<Card>
					<CardContent className="p-6">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="name">Seu Nome</Label>
									<Input
										id="name"
										name="name"
										placeholder="Digite seu nome"
										value={formData.name}
										onChange={handleChange}
										className={`${errors.name ? "border-red-500" : ""}`}
									/>
									{errors.name && (
										<p className="text-red-500 text-sm">Nome deve ter entre 4 e 24 caracteres</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Seu Email</Label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="seuemail@email.com"
										value={formData.email}
										onChange={handleChange}
										className={`${errors.email ? "border-red-500" : ""}`}
									/>
									{errors.email && <p className="text-red-500 text-sm">Email inválido</p>}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="subject">Assunto</Label>
								<Select value={formData.subject} onValueChange={handleSelectChange}>
									<SelectTrigger className={`${errors.subject ? "border-red-500" : ""}`}>
										<SelectValue placeholder="Selecione um tópico" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="suporte">Problemas Técnicos</SelectItem>
										<SelectItem value="pagamentos">Problemas com Pagamentos</SelectItem>
										<SelectItem value="conta">Problemas com Conta</SelectItem>
										<SelectItem value="sugestao">Sugestões & Feedbacks</SelectItem>
										<SelectItem value="outro">Outros</SelectItem>
									</SelectContent>
								</Select>
								{errors.subject && <p className="text-red-500 text-sm">Selecione um assunto válido</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="message">Mensagem</Label>
								<Textarea
									id="message"
									name="message"
									placeholder="Digite sua mensagem"
									rows={6}
									value={formData.message}
									onChange={handleChange}
									className={`${errors.message ? "border-red-500" : ""}`}
								/>
								{errors.message && (
									<p className="text-red-500 text-sm">A mensagem deve ter pelo menos 32 caracteres</p>
								)}
								<div className="flex justify-between items-center">
									<p className="text-sm text-muted-foreground">
										Caracteres: {formData.message.length}/32 mínimo
									</p>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full bg-green-600 hover:bg-green-700 text-white"
								disabled={loading}
							>
								{loading ? "Enviando Mensagem..." : "Enviar Mensagem"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
