"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Loader2, Check, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/hooks/use-toast";
import { passwordSchema } from "../api/user/update-password/route";
import { personalInfoSchema } from "../api/user/update-personal-info/route";
import { socialMediaSchema } from "../api/user/update-social-medias/route";
import { UploadButton } from "../../lib/uploadthing";
import { pixSchema } from "../api/user/update-pix/route";
import BlockedUsersCard from "./blocked-users-card";

export default function MinhaContaClient() {
	const router = useRouter();
	const { data: session, status } = useSession();

	useEffect(() => {
		if (status === "loading") return;
		if (!session) {
			router.push("/entrar");
		}
	}, [session, status, router]);

	const { toast } = useToast();

	const [loadingProfileInfo, setLoadingProfileInfo] = useState(false);
	const [loadingSocial, setLoadingSocial] = useState(false);
	const [loadingPix, setLoadingPix] = useState(false);
	const [loadingPassword, setLoadingPassword] = useState(false);
	const [loadingPrivacySettings, setLoadingPrivacySettings] = useState(false);
	const [loadingDeleteAccount, setLoadingDeleteAccount] = useState(false);

	const [accountStartDelete, setAccountStartDelete] = useState(false);

	const [errorUploadAvatarUrl, setErrorUploadAvatarUrl] = useState("");
	const [errorUsername, setErrorUsername] = useState(false);
	const [errorWebsite, setErrorWebsite] = useState(false);
	const [errorDescription, setErrorDescription] = useState(false);
	const [errorUpdatingPersonalInfo, setErrorUpdatingPersonalInfo] = useState("");

	const [errorPix, setErrorPix] = useState("");
	const [errorPassword, setErrorPassword] = useState<string>("");

	const [avatarUrl, setAvatarUrl] = useState("");
	const [name, setName] = useState("");
	const [nickname, setNickname] = useState("");
	const [website, setWebsite] = useState("");
	const [description, setDescription] = useState("");
	const [pixKey, setPixKey] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [instagram, setInstagram] = useState("");
	const [facebook, setFacebook] = useState("");
	const [youtube, setYoutube] = useState("");
	const [twitter, setTwitter] = useState("");
	const [tiktok, setTiktok] = useState("");
	const [linkedin, setLinkedin] = useState("");
	const [twitch, setTwitch] = useState("");

	const [acceptAnonymousQuestions, setAcceptAnonymousQuestions] = useState(true);
	const [showQuestionsAnonymousAnsweredPublic, setShowQuestionsAnonymousAnsweredPublic] = useState(false);
	const [showTotalQuestionsReceived, setShowTotalQuestionsReceived] = useState(true);
	const [showTotalQuestionsAnswered, setShowTotalQuestionsAnswered] = useState(true);
	const [showTotalQuestionSent, setShowQuestionsSent] = useState(true);
	const [showAnsweredToFollowersOnly, setShowAnsweredToFollowersOnly] = useState(false);
	const [showPaymentAmountEachQuestion, setShowPaymentAmountEachQuestion] = useState(true);
	const [showAnswerDate, setShowAnswerDate] = useState(true);
	const [showFollowersCount, setShowFollowersCount] = useState(true);
	const [showIndividualLikes, setShowIndividualLikes] = useState(true);
	const [showIndividualDislikes, setShowIndividualDislikes] = useState(false);
	const [showTotalLikes, setShowTotalLikes] = useState(true);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);

	useEffect(() => {
		if (newPassword.length > 0) {
			setPasswordCriteria({
				length: newPassword.length >= 8,
				uppercase: /[A-Z]/.test(newPassword),
				lowercase: /[a-z]/.test(newPassword),
				number: /[0-9]/.test(newPassword),
				special: /[^A-Za-z0-9]/.test(newPassword),
			});
		} else {
			setPasswordCriteria({
				length: false,
				uppercase: false,
				lowercase: false,
				number: false,
				special: false,
			});
		}
	}, [newPassword]);

	const [passwordCriteria, setPasswordCriteria] = useState({
		length: false,
		uppercase: false,
		lowercase: false,
		number: false,
		special: false,
	});

	const CriteriaItem = ({ met, text }: { met: boolean; text: string }) => (
		<div className="flex items-center space-x-2">
			{met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
			<span className={`text-sm ${met ? "text-green-500" : "text-gray-400"}`}>{text}</span>
		</div>
	);

	useEffect(() => {
		if (session?.user) {
			const user = session.user;

			setAvatarUrl(user?.avatar_url ?? "");
			setName(user.name ?? "");
			setNickname(user.nickname ?? "");
			setWebsite(user.website ?? "");
			setDescription(user.description ?? "");
			setPixKey(user.pix_key ?? "");

			setInstagram(user?.instagram ?? "");
			setFacebook(user.facebook ?? "");
			setYoutube(user.youtube ?? "");
			setTwitter(user.twitter ?? "");
			setTiktok(user.tiktok ?? "");
			setLinkedin(user.linkedin ?? "");
			setTwitch(user.twitch ?? "");

			setAcceptAnonymousQuestions(user.privacy_accept_anonymous_questions ?? true);
			setShowQuestionsAnonymousAnsweredPublic(user.privacy_show_anonymous_questions_public ?? false);
			setShowTotalQuestionsReceived(user.privacy_show_total_questions_received_public ?? true);
			setShowTotalQuestionsAnswered(user.privacy_show_total_questions_answered_public ?? true);
			setShowQuestionsSent(user.privacy_show_total_questions_sent_public ?? true);
			setShowAnsweredToFollowersOnly(user.privacy_show_questions_answered_only_to_followers ?? false);
			setShowPaymentAmountEachQuestion(user.privacy_show_value_received_from_answering_question ?? true);
			setShowAnswerDate(user.privacy_show_date_questions_was_answered ?? true);
			setShowFollowersCount(user.privacy_show_total_followers_public ?? true);
			setShowIndividualLikes(user.privacy_show_likes_each_answer_public ?? true);
			setShowIndividualDislikes(user.privacy_show_dislikes_each_answer_public ?? false);
			setShowTotalLikes(user.privacy_show_total_likes_all_answers_public ?? true);
		}
	}, [session]);

	const handleSavePersonalInfo = async (event?: React.FormEvent) => {
		event?.preventDefault();

		try {
			setLoadingProfileInfo(true);
			setErrorUsername(false);
			setErrorWebsite(false);
			setErrorDescription(false);

			const validatedData = personalInfoSchema.parse({
				name,
				website: website || undefined,
				description: description || undefined,
			});

			const response = await fetch("/api/user/update-personal-info", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(validatedData),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro ao atualizar informações pessoais",
					description: data?.error ?? "Erro ao atualizar informações pessoais",
					variant: "error",
				});
				setErrorUpdatingPersonalInfo(data.error ?? "Erro ao atualizar informações pessoais");
			}

			toast({
				title: "Informações pessoais atualizadas com sucesso!",
				variant: "success",
			});
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				error.errors.forEach((err) => {
					const field = err.path[0];
					if (field === "name") setErrorUsername(true);
					if (field === "website") setErrorWebsite(true);
					if (field === "description") setErrorDescription(true);
				});

				const firstError = error.errors[0];

				toast({
					title: "Erro ao atualizar informações pessoais.",
					description: firstError.message,
					variant: "error",
				});
			} else {
				toast({
					title: "Erro ao atualizar informações pessoais.",
					description: error?.message,
					variant: "error",
				});
			}
		} finally {
			setLoadingProfileInfo(false);
		}
	};

	const handleSavePixKey = async (event?: React.FormEvent) => {
		event?.preventDefault();

		try {
			setLoadingPix(true);

			const validatedData = pixSchema.parse({
				pixKey: pixKey,
			});

			const response = await fetch("/api/user/update-pix", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(validatedData),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro ao atualizar chave PIX",
					description:
						"Formato de chave PIX inválido. Use CPF, CNPJ, email, telefone ou chave aleatória válidos.",
					variant: "error",
				});
				setErrorPix(data.error ?? "Erro ao atualizar chave PIX");
			}

			toast({
				title: "Chave PIX atualizada com sucesso!",
				variant: "success",
			});
			setErrorPix("");
		} catch (error: any) {
			toast({
				title: "Erro ao atualizar chave PIX",
				description:
					"Formato de chave PIX inválido. Use CPF, CNPJ, email, telefone ou chave aleatória válidos.",
				variant: "error",
			});
			setErrorPix("Formato de chave PIX inválido. Use CPF, CNPJ, email, telefone ou chave aleatória válidos.");
		} finally {
			setLoadingPix(false);
		}
	};

	const handleSaveSocialMedia = async (event?: React.FormEvent) => {
		event?.preventDefault();

		try {
			setLoadingSocial(true);

			const validatedData = socialMediaSchema.parse({
				instagram: instagram || undefined,
				facebook: facebook || undefined,
				youtube: youtube || undefined,
				twitter: twitter || undefined,
				tiktok: tiktok || undefined,
				linkedin: linkedin || undefined,
				twitch: twitch || undefined,
			});

			const response = await fetch("/api/user/update-social-medias", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(validatedData),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro ao atualizar redes sociais!",
					description: data?.error ?? "Erro ao atualizar redes sociais",
					variant: "error",
				});
			}

			toast({
				title: "Redes sociais atualizadas com sucesso!",
				variant: "success",
			});
		} catch (error: any) {
			console.error("Erro ao atualizar redes sociais:", error);

			if (error instanceof z.ZodError) {
				const firstError = error.errors[0];
				toast({
					title: "Erro ao atualizar redes sociais",
					description: firstError.message,
					variant: "error",
				});
			} else {
				toast({
					title: "Erro ao atualizar redes sociais",
					description: error?.message,
					variant: "error",
				});
			}
		} finally {
			setLoadingSocial(false);
		}
	};

	const handleSavePrivacySettings = async (event?: React.FormEvent) => {
		event?.preventDefault();

		try {
			setLoadingPrivacySettings(true);

			const response = await fetch("/api/user/update-privacy-settings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					acceptAnonymousQuestions,
					showQuestionsAnonymousAnsweredPublic,
					showTotalQuestionsReceived,
					showTotalQuestionsAnswered,
					showTotalQuestionSent,
					showAnsweredToFollowersOnly,
					showPaymentAmountEachQuestion,
					showAnswerDate,
					showFollowersCount,
					showIndividualLikes,
					showIndividualDislikes,
					showTotalLikes,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: data?.error ?? "Erro ao atualizar configurações de privacidade",
					variant: "error",
				});
			}

			toast({
				title: "Configurações de privacidade atualizadas com sucesso!",
				variant: "success",
			});
		} catch (error) {
			toast({
				title: "Erro ao atualizar configurações de privacidade",
				variant: "error",
			});
		} finally {
			setLoadingPrivacySettings(false);
		}
	};

	const handleChangePassword = async (event?: React.FormEvent) => {
		event?.preventDefault();

		try {
			setLoadingPassword(true);

			const validatedData = passwordSchema.parse({
				newPassword,
				confirmPassword,
			});

			const response = await fetch("/api/user/update-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					newPassword: validatedData.newPassword,
					confirmPassword: validatedData.confirmPassword,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro ao atualizar senha",
					description: data.error ?? "Erro ao atualizar senha",
					variant: "error",
				});
				setErrorPassword(data.error ?? "Erro ao atualizar senha");
			} else {
				toast({
					title: "Sua senha foi atualizada com sucesso.",
					variant: "success",
				});
				setNewPassword("");
				setConfirmPassword("");
				setShowPasswordCriteria(false);
			}
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				const firstError = error.errors[0];
				toast({
					title: "Erro ao atualizar senha",
					description: firstError.message,
					variant: "error",
				});
				setErrorPassword(firstError?.message);
			} else {
				toast({
					title: "Erro ao atualizar senha",
					description: error?.message,
					variant: "error",
				});
				setErrorPassword(error?.message);
			}
		} finally {
			setLoadingPassword(false);
		}
	};

	const handleDeleteAccount = async (event?: React.FormEvent) => {
		event?.preventDefault();
		setIsDeleteModalOpen(true);
		try {
			setLoadingDeleteAccount(true);

			const response = await fetch("/api/user/delete-account", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: session?.user?.id,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro ao deletar conta",
					description: data.error ?? "Erro ao deletar conta",
					variant: "error",
				});
			} else {
				toast({
					title: "Conta foi posta em processo de exclusão.",
					description:
						"Sua conta foi desativada. Se durante 30 dias, ela não for reativada novamente, todos os dados serão deletados. Você será redirecionado em 10 segundos.",
					variant: "success",
				});

				setAccountStartDelete(true);

				setTimeout(() => {
					signOut({ callbackUrl: "/feed" });
				}, 10000);
			}
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				const firstError = error.errors[0];
				toast({
					title: "Erro ao deletar conta",
					description: firstError.message,
					variant: "error",
				});
			} else {
				toast({
					title: "Erro ao deletar conta",
					description: error?.message,
					variant: "error",
				});
			}
		} finally {
			setLoadingDeleteAccount(false);
		}
	};

	if (status === "loading") {
		return <LoadingScreen />;
	}

	if (!session) {
		router.push("/entrar");
	}

	return (
		<>
			<main className="p-4 lg:p-6">
				<div className="space-y-6">
					<form onSubmit={handleSavePersonalInfo}>
						<Card>
							<CardHeader>
								<CardTitle>Informações Pessoais</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="avatar">Avatar</Label>
									<div className="flex items-center gap-4">
										<div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
											{session?.user?.avatar_url ? (
												<img
													src={avatarUrl?.length > 0 ? avatarUrl : session?.user?.avatar_url}
													alt="Avatar"
													className="w-full h-full object-cover"
												/>
											) : (
												<Upload className="h-6 w-6 text-gray-500" />
											)}
										</div>
										<UploadButton
											appearance={{
												button: "ut-ready:bg-green-500 ut-uploading:cursor-not-allowed rounded-r-none bg-green-500 bg-none after:bg-orange-400",
												container: "w-max flex-row rounded-md border-cyan-300",
												allowedContent:
													"flex h-8 flex-col items-center justify-center px-2 text-black",
											}}
											endpoint="imageUploader"
											onClientUploadComplete={(res) => {
												setAvatarUrl(res[0]?.serverData.avatar_url as string);
												setErrorUploadAvatarUrl("");
												toast({
													title: "Avatar atualizado com sucesso!",
													variant: "success",
												});
											}}
											onUploadError={(error: Error) => {
												setErrorUploadAvatarUrl(
													"Ocorreu um erro ao fazer o upload da imagem. Por favor, tente novamente.",
												);
											}}
										/>
										{errorUploadAvatarUrl && (
											<p className="font-bold text-red-600">{errorUploadAvatarUrl}</p>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="name">
										Nome <small className="text-gray-400">(obrigatório)</small>
									</Label>
									<Input
										id="name"
										type="text"
										maxLength={32}
										minLength={4}
										placeholder="Seu Nome Completo"
										value={name}
										onChange={(e) => {
											const capitalizedName = e.target.value
												.split(" ")
												.map(
													(word) =>
														word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
												)
												.join(" ");
											setName(capitalizedName);
										}}
										required
									/>
									<p className="text-sm text-gray-500">Entre 4 e 24 caracteres</p>
									{errorUsername && <p className="font-bold text-red-600">Nome inválido</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="nickname">Nickname</Label>
									<Input
										id="nickname"
										value={`@${nickname}`}
										disabled
										className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
									/>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										O nickname não pode ser alterado
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										value={session?.user?.email ?? ""}
										disabled
										className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
									/>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										O email não pode ser alterado
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="website">
										Website <small className="text-gray-400">(opcional)</small>
									</Label>
									<Input
										id="website"
										value={website}
										onChange={(e) => setWebsite(e.target.value)}
										placeholder="https://seusite.com"
									/>
									<p className="text-sm text-gray-500">Deve começar com https://</p>
									{errorWebsite && <p className="font-bold text-red-600">Website inválido</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">
										Descrição do Meu Perfil <small className="text-gray-400">(opcional)</small>
									</Label>
									<Textarea
										id="description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Conte um pouco sobre você..."
										className="min-h-[100px]"
									/>
									<div className="flex justify-between text-sm text-gray-500">
										<small>Mínimo: 32 caracteres | Máximo: 256 caracteres</small>
										<small
											className={
												description.length > 256
													? "text-red-500"
													: description.length > 0 && description.length < 32
														? "text-orange-500"
														: ""
											}
										>
											{description.length}/256
										</small>
									</div>
									{errorDescription && (
										<p className="font-bold text-red-600">
											A descrição deve ter entre 32 e 256 caracteres.
										</p>
									)}
								</div>

								<Button
									type="submit"
									disabled={loadingProfileInfo}
									className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 dark:from-gray-200 dark:to-gray-100 dark:hover:from-gray-300 dark:hover:to-gray-200 text-white dark:text-black"
								>
									{loadingProfileInfo ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Atualizando...
										</>
									) : (
										"Atualizar Informações Pessoais"
									)}
								</Button>

								{errorUpdatingPersonalInfo && (
									<p className="font-bold text-red-600">{errorUpdatingPersonalInfo}</p>
								)}
							</CardContent>
						</Card>
					</form>

					<Card>
						<CardHeader>
							<CardTitle>Dados de Pagamento</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="pix-key">
									Chave PIX{" "}
									<small className="text-gray-400">(necessário para receber pagamentos)</small>
								</Label>
								<p className="text-sm text-orange-600 font-medium">
									⚠️ Importante: É necessário inserir sua chave PIX para receber os pagamentos.
								</p>
								<Input
									id="pix-key"
									value={pixKey}
									minLength={11}
									maxLength={128}
									onChange={(e) => setPixKey(e.target.value)}
									placeholder="Digite sua chave PIX (CPF, email, telefone ou chave aleatória)"
									required
								/>
							</div>

							<Button
								onClick={handleSavePixKey}
								disabled={loadingPix}
								className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 dark:from-gray-200 dark:to-gray-100 dark:hover:from-gray-300 dark:hover:to-gray-200 text-white dark:text-black"
							>
								{loadingPix ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Atualizando...
									</>
								) : (
									"Atualizar Chave PIX"
								)}
							</Button>
							{errorPix && <p className="text-sm text-red-600 font-bold mt-2">{errorPix}</p>}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Redes Sociais</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="instagram">
									Instagram <small className="text-gray-400">(opcional)</small>
								</Label>
								<Input
									id="instagram"
									minLength={1}
									maxLength={30}
									placeholder="seuusuario"
									value={instagram.replace("https://instagram.com/", "")}
									onChange={(e) => {
										const raw = e.target.value;
										const sanitized = raw
											.toLowerCase()
											.replace(/[^a-z0-9._]/g, "")
											.replace(/\.+$/, ""); // não termina com ponto
										setInstagram(`https://instagram.com/${sanitized}`);
									}}
								/>
								<p className="text-sm text-gray-500">
									{instagram || "https://instagram.com/seuusuario"}
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="facebook">
									Facebook <small className="text-gray-400">(opcional)</small>
								</Label>
								<Input
									id="facebook"
									minLength={5}
									maxLength={50}
									placeholder="seuusuario"
									value={facebook.replace("https://facebook.com/", "")}
									onChange={(e) => {
										const raw = e.target.value;
										const sanitized = raw.toLowerCase().replace(/[^a-z0-9.]/g, "");
										setFacebook(`https://facebook.com/${sanitized}`);
									}}
								/>
								<p className="text-sm text-gray-500">{facebook || "https://facebook.com/seuusuario"}</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="youtube">
									YouTube <small className="text-gray-400">(opcional)</small>
								</Label>
								<Input
									id="youtube"
									minLength={3}
									maxLength={30}
									placeholder="@seucanal"
									value={youtube.replace("https://youtube.com/@", "")}
									onChange={(e) => {
										const raw = e.target.value;
										const sanitized = raw.toLowerCase().replace(/[^a-z0-9._-]/g, "");
										setYoutube(`https://youtube.com/@${sanitized}`);
									}}
								/>
								<p className="text-sm text-gray-500">{youtube || "https://youtube.com/@seucanal"}</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="twitter">
									Twitter <small className="text-gray-400">(opcional)</small>
								</Label>
								<Input
									id="twitter"
									minLength={4}
									maxLength={15}
									placeholder="seuusuario"
									value={twitter.replace("https://twitter.com/", "")}
									onChange={(e) => {
										const raw = e.target.value;
										const sanitized = raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
										setTwitter(`https://twitter.com/${sanitized}`);
									}}
								/>
								<p className="text-sm text-gray-500">{twitter || "https://twitter.com/seuusuario"}</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="tiktok">
									TikTok <small className="text-gray-400">(opcional)</small>
								</Label>
								<Input
									id="tiktok"
									minLength={2}
									maxLength={24}
									placeholder="@seuusuario"
									value={tiktok.replace("https://tiktok.com/@", "")}
									onChange={(e) => {
										const raw = e.target.value;
										const sanitized = raw
											.toLowerCase()
											.replace(/[^a-z0-9._]/g, "")
											.replace(/^[^a-z0-9]+/, ""); // começa com letra ou número
										setTiktok(`https://tiktok.com/@${sanitized}`);
									}}
								/>
								<p className="text-sm text-gray-500">{tiktok || "https://tiktok.com/@seuusuario"}</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="linkedin">
									LinkedIn <small className="text-gray-400">(opcional)</small>
								</Label>
								<Input
									id="linkedin"
									minLength={5}
									maxLength={30}
									placeholder="seuusuario"
									value={linkedin.replace("https://linkedin.com/in/", "")}
									onChange={(e) => {
										const raw = e.target.value;
										let sanitized = raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
										sanitized = sanitized.replace(/^-+|-+$/g, "");
										setLinkedin(`https://linkedin.com/in/${sanitized}`);
									}}
								/>
								<p className="text-sm text-gray-500">
									{linkedin || "https://linkedin.com/in/seuusuario"}
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="twitch">
									Twitch <small className="text-gray-400">(opcional)</small>
								</Label>
								<Input
									id="twitch"
									minLength={4}
									maxLength={25}
									placeholder="seuusuario"
									value={twitch.replace("https://twitch.tv/", "")}
									onChange={(e) => {
										const raw = e.target.value;
										const sanitized = raw
											.toLowerCase()
											.replace(/[^a-z0-9_]/g, "")
											.replace(/^[0-9]+/, "");
										setTwitch(`https://twitch.tv/${sanitized}`);
									}}
								/>
								<p className="text-sm text-gray-500">{twitch || "https://twitch.tv/seuusuario"}</p>
							</div>

							<Button
								onClick={handleSaveSocialMedia}
								disabled={loadingSocial}
								className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 dark:from-gray-200 dark:to-gray-100 dark:hover:from-gray-300 dark:hover:to-gray-200 text-white dark:text-black"
							>
								{loadingSocial ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Atualizando...
									</>
								) : (
									"Atualizar Redes Sociais"
								)}
							</Button>
						</CardContent>
					</Card>

					<form onSubmit={handleChangePassword}>
						<Card>
							<CardHeader>
								<CardTitle>Alterar Senha</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="new-password">Nova Senha</Label>
									<Input
										id="new-password"
										type="password"
										value={newPassword}
										onChange={(e) => {
											const value = e.target.value;
											setNewPassword(value);
											setShowPasswordCriteria(value.length > 0);
										}}
										placeholder="Mínimo 8 caracteres"
										required
									/>
								</div>

								{showPasswordCriteria && (
									<div className="rounded-md px-3">
										<p className="text-sm text-gray-600 mb-2">Sua senha deve conter:</p>
										<div className="space-y-1">
											<CriteriaItem
												met={passwordCriteria.length}
												text="Pelo menos 8 caracteres"
											/>
											<CriteriaItem
												met={passwordCriteria.uppercase}
												text="Pelo menos 1 letra maiúscula (A-Z)"
											/>
											<CriteriaItem
												met={passwordCriteria.lowercase}
												text="Pelo menos 1 letra minúscula (a-z)"
											/>
											<CriteriaItem
												met={passwordCriteria.number}
												text="Pelo menos 1 número (0-9)"
											/>
											<CriteriaItem
												met={passwordCriteria.special}
												text="Pelo menos 1 caractere especial (!@#$...)"
											/>
										</div>
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
									<Input
										id="confirm-password"
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="Repita a nova senha"
										required
									/>
								</div>

								<Button
									type="submit"
									disabled={loadingPassword}
									className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 dark:from-gray-200 dark:to-gray-100 dark:hover:from-gray-300 dark:hover:to-gray-200 text-white dark:text-black"
								>
									{loadingPassword ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Atualizando...
										</>
									) : (
										"Atualizar Senha"
									)}
								</Button>

								{errorPassword && <p className="text-sm text-red-600 mt-2">{errorPassword}</p>}
							</CardContent>
						</Card>
					</form>

					<Card>
						<CardHeader>
							<CardTitle>Configurações de Privacidade</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Aceitar perguntas anônimas</Label>
									<p className="text-sm text-gray-500">
										Permitir que pessoas façam perguntas sem se identificar
									</p>
								</div>
								<Switch
									checked={acceptAnonymousQuestions}
									onCheckedChange={setAcceptAnonymousQuestions}
								/>
							</div>

							{acceptAnonymousQuestions && (
								<div className="flex items-center justify-between pl-4 border-l-2 border-green-200">
									<div className="space-y-0.5">
										<Label>Mostrar perguntas anônimas respondidas publicamente</Label>
										<p className="text-sm text-gray-500">
											Exibir suas respostas a perguntas anônimas no seu perfil público
										</p>
									</div>
									<Switch
										checked={showQuestionsAnonymousAnsweredPublic}
										onCheckedChange={setShowQuestionsAnonymousAnsweredPublic}
									/>
								</div>
							)}

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar perguntas respondidas apenas para seguidores</Label>
									<p className="text-sm text-gray-500">
										Apenas seus seguidores poderão ver suas respostas
									</p>
								</div>
								<Switch
									checked={showAnsweredToFollowersOnly}
									onCheckedChange={setShowAnsweredToFollowersOnly}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar valor recebido para responder pergunta</Label>
									<p className="text-sm text-gray-500">
										Exibir quanto você recebeu R$ por cada resposta (se o usuario que enviou a
										pergunta não quis mostrar o valor que ele pagou, essas respostas não exibirão o
										valor pago)
									</p>
								</div>
								<Switch
									checked={showPaymentAmountEachQuestion}
									onCheckedChange={setShowPaymentAmountEachQuestion}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar data que pergunta foi respondida</Label>
									<p className="text-sm text-gray-500">Exibir quando você respondeu cada pergunta</p>
								</div>
								<Switch checked={showAnswerDate} onCheckedChange={setShowAnswerDate} />
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar total de seguidores publicamente</Label>
									<p className="text-sm text-gray-500">Exibir o número de seguidores no seu perfil</p>
								</div>
								<Switch checked={showFollowersCount} onCheckedChange={setShowFollowersCount} />
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar total de perguntas enviadas publicamente</Label>
									<p className="text-sm text-gray-500">
										Exibir o número total de perguntas que você enviou
									</p>
								</div>
								<Switch checked={showTotalQuestionSent} onCheckedChange={setShowQuestionsSent} />
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar total de curtidas nas respostas individuais publicamente</Label>
									<p className="text-sm text-gray-500">Exibir curtidas em cada resposta individual</p>
								</div>
								<Switch checked={showIndividualLikes} onCheckedChange={setShowIndividualLikes} />
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar total de descurtidas nas respostas individuais publicamente</Label>
									<p className="text-sm text-gray-500">
										Exibir descurtidas em cada resposta individual
									</p>
								</div>
								<Switch checked={showIndividualDislikes} onCheckedChange={setShowIndividualDislikes} />
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar total de curtidas em todas suas respostas publicamente</Label>
									<p className="text-sm text-gray-500">
										Exibir o número total de curtidas em todas as respostas que você já respondeu
									</p>
								</div>
								<Switch checked={showTotalLikes} onCheckedChange={setShowTotalLikes} />
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar total de perguntas que você já recebeu publicamente</Label>
									<p className="text-sm text-gray-500">
										Exibir o número total de perguntas que você recebeu
									</p>
								</div>
								<Switch
									checked={showTotalQuestionsReceived}
									onCheckedChange={setShowTotalQuestionsReceived}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Mostrar total de perguntas que você já respondeu publicamente</Label>
									<p className="text-sm text-gray-500">
										Exibir o número total de perguntas que você respondeu
									</p>
								</div>
								<Switch
									checked={showTotalQuestionsAnswered}
									onCheckedChange={setShowTotalQuestionsAnswered}
								/>
							</div>

							<Button
								onClick={handleSavePrivacySettings}
								disabled={loadingPrivacySettings}
								className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 dark:from-gray-200 dark:to-gray-100 dark:hover:from-gray-300 dark:hover:to-gray-200 text-white dark:text-black"
							>
								{loadingPrivacySettings ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Atualizando...
									</>
								) : (
									"Atualizar Configurações de Privacidade"
								)}
							</Button>
						</CardContent>
					</Card>

					<BlockedUsersCard />

					<Card className="border-red-200">
						<CardHeader>
							<CardTitle className="mb-6">Excluir Conta</CardTitle>
							<CardDescription className="mt-6">
								Sua conta será desativada por 30 dias corridos antes de ser excluída permanentemente.
								Você pode reativar sua conta durante esse período se desejar, entrando na sua conta
								novamente. Após esse período, todos os dados relacionados à sua conta serão deletados.
								Não se preocupe, será aberto um modal para você confirmar exclusão clicando nesse botão.
							</CardDescription>
						</CardHeader>
						<CardContent className="">
							<Button
								variant="destructive"
								onClick={() => setIsDeleteModalOpen(true)}
								className="w-full bg-red-600 hover:bg-red-700"
							>
								Excluir Conta
							</Button>
						</CardContent>
					</Card>
				</div>

				<Dialog open={isDeleteModalOpen} onOpenChange={accountStartDelete ? () => {} : setIsDeleteModalOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="text-red-600">Excluir Conta</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<p className="text-gray-700 leading-relaxed dark:text-white">
								{accountStartDelete
									? "Sua conta foi desativada. Se durante 30 dias, ela não for reativada novamente, todos os dados serão deletados. Você será redirecionado em 10 segundos."
									: "Sua conta será desativada por 30 dias corridos antes de ser excluída permanentemente. Você pode reativar sua conta durante esse período se desejar, entrando na sua conta novamente. Após esse período, todos os dados relacionados à sua conta serão deletados."}
							</p>

							<div className="flex gap-2 justify-end">
								{!accountStartDelete && !loadingDeleteAccount && (
									<Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
										Cancelar
									</Button>
								)}
								{!accountStartDelete && (
									<Button
										onClick={handleDeleteAccount}
										disabled={loadingDeleteAccount}
										className="bg-red-500 hover:bg-red-800 text-white"
									>
										{loadingDeleteAccount ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Processando...
											</>
										) : (
											"Confirmar Exclusão"
										)}
									</Button>
								)}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</main>
		</>
	);
}
