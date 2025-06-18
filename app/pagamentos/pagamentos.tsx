"use client";

import LoadingScreen from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
	getUserQuestionsAnsweredPaymentDetails,
	getUserQuestionsSentPaymentDetails,
} from "@/lib/repositories/questions.repository";
import { DollarSign, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PaymentData {
	paymentToWithdraw: number;
	paymentAwaitingAnswer: number;
	paymentSentAnsweredQuestions?: number;
	paymentWithdrawHistory: Array<{
		id: string;
		amount_withdraw: number;
		created_at: Date;
		send_to_pix_key: string;
	}>;
	questionsToPayAmount: any[];
}

export default function PagamentosClient() {
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("respondidas");
	const [paymentDataAnswered, setPaymentDataAnswered] = useState<PaymentData | null>(null);
	const [paymentDataSent, setPaymentDataSent] = useState<PaymentData | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

	const router = useRouter();
	const { data: session, status, update } = useSession();

	useEffect(() => {
		if (status !== "loading" && !session) {
			router.push("/entrar");
		}
	}, [session, status, router]);

	const fetchData = async () => {
		if (session?.user?.nickname) {
			try {
				setLoading(true);
				await update();
				const [answered, sent] = await Promise.all([
					getUserQuestionsAnsweredPaymentDetails(session.user.nickname),
					getUserQuestionsSentPaymentDetails(session.user.nickname),
				]);
				setPaymentDataAnswered(answered);
				setPaymentDataSent(sent);
			} catch (error) {
				console.error("Erro ao carregar dados de pagamento:", error);
				toast({
					title: "Erro ao carregar dados",
					description: "Não foi possível carregar os dados de pagamento.",
					variant: "error",
				});
			} finally {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		fetchData();
	}, [session?.user?.nickname]);

	if (loading) return <LoadingScreen />;

	const currentData = activeTab === "respondidas" ? paymentDataAnswered : paymentDataSent;

	if (!currentData) {
		return (
			<main className="p-4 lg:p-6">
				<div className="text-center">
					<p className="text-muted-foreground">Erro ao carregar dados de pagamento</p>
				</div>
			</main>
		);
	}

	const formatCurrency = (value: number) => (value / 100).toFixed(2);

	const formatDate = (date: Date) =>
		new Date(date).toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	const handleWithdraw = async () => {
		if (!session?.user?.nickname || !currentData.paymentToWithdraw || isProcessingWithdraw) return;

		setIsProcessingWithdraw(true);

		try {
			const response = await fetch("/api/payments/withdraw", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: session.user.id,
					nickname: session.user.nickname,
					amount: currentData.paymentToWithdraw,
					sentToPixKey: session.user.pix_key,
					questions: currentData.questionsToPayAmount,
				}),
			});

			const result = await response.json();

			if (result.success) {
				toast({
					title: "Saque realizado com sucesso",
					description: `Valor de R$ ${formatCurrency(currentData.paymentToWithdraw)} será enviado para sua chave PIX.`,
					variant: "success",
				});
				setIsDialogOpen(false);

				await fetchData();
			} else {
				throw new Error(result.error || "Erro desconhecido");
			}
		} catch (error) {
			console.error("Erro ao realizar saque:", error);
			toast({
				title: "Erro ao realizar saque",
				description: "Por favor, tente novamente mais tarde.",
				variant: "error",
			});
		} finally {
			setIsProcessingWithdraw(false);
		}
	};

	const SaqueButton = () => {
		const hasPixKey = Boolean(session?.user?.pix_key);
		const pixKey = session?.user?.pix_key ?? "";
		const canWithdraw = currentData.paymentToWithdraw >= 10000;

		return canWithdraw ? (
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogTrigger asChild>
					<Button
						size="lg"
						className="bg-green-600 hover:bg-green-700 text-white dark:bg-foreground dark:text-background dark:hover:bg-green-500"
						disabled={isProcessingWithdraw}
					>
						{isProcessingWithdraw ? "Processando..." : "Sacar Dinheiro"}
					</Button>
				</DialogTrigger>
				<DialogContent>
					{!hasPixKey ? (
						<>
							<DialogHeader>
								<DialogTitle className="text-2xl font-bold">Chave Pix não configurada</DialogTitle>
								<DialogDescription className="mt-2 text-base">
									Você precisa configurar sua chave Pix na sua conta antes de poder sacar.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button onClick={() => setIsDialogOpen(false)}>Entendi</Button>
							</DialogFooter>
						</>
					) : (
						<>
							<DialogHeader>
								<DialogTitle>
									<span className="text-3xl font-bold mb-12">
										Sacar R$ {formatCurrency(currentData.paymentToWithdraw)}
									</span>
								</DialogTitle>
								<DialogDescription>
									<span className="mt-3 mb-3 text-2xl">
										Confirme o saque nessa Chave PIX configurada na sua conta:
										<br />
										<br />
										<strong className="text-blue-600 break-all dark:text-white">{pixKey}</strong>
									</span>
								</DialogDescription>
							</DialogHeader>

							<DialogFooter>
								<Button
									type="button"
									onClick={handleWithdraw}
									className="bg-green-500 text-white hover:bg-green-800 font-bold px-6 py-6 text-2xl mt-6 w-full"
									disabled={isProcessingWithdraw}
								>
									{isProcessingWithdraw ? "Processando Saque..." : "Confirmar Saque Nessa Chave PIX"}
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>
		) : (
			<Button size="lg" disabled className="bg-green-600 text-white opacity-50 cursor-not-allowed">
				Sacar Dinheiro
			</Button>
		);
	};

	return (
		<main className="p-4 lg:p-6">
			<Tabs defaultValue="respondidas" className="w-full" onValueChange={(value) => setActiveTab(value)}>
				<TabsList className="flex flex-wrap justify-between gap-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
					<TabsTrigger
						value="respondidas"
						className="flex-1 text-xs sm:text-sm py-2 px-2 rounded-md text-center font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:opacity-70 dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=inactive]:bg-neutral-700 dark:data-[state=inactive]:text-neutral-300"
					>
						Perguntas Respondidas
					</TabsTrigger>
					<TabsTrigger
						value="enviadas"
						className="flex-1 text-xs sm:text-sm py-2 px-2 rounded-md text-center font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=inactive]:opacity-70 dark:data-[state=active]:bg-white dark:data-[state=active]:text-black dark:data-[state=inactive]:bg-neutral-700 dark:data-[state=inactive]:text-neutral-300"
					>
						Perguntas Enviadas
					</TabsTrigger>
				</TabsList>

				<TabsContent value="respondidas" className="space-y-6 mt-4">
					<Card className="bg-green-50 dark:bg-muted border-green-200 dark:border-border">
						<CardContent className="p-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-green-600 dark:bg-foreground rounded-full flex items-center justify-center">
										<DollarSign className="h-6 w-6 text-white dark:text-background" />
									</div>
									<div>
										<p className="text-3xl font-bold text-green-600 dark:text-foreground">
											R$ {formatCurrency(currentData.paymentToWithdraw)}
										</p>
										{currentData.paymentToWithdraw >= 10000 ? (
											<>
												<p className="text-sm font-bold text-green-700 dark:text-muted-foreground">
													Pronto Para Sacar
												</p>
												<p className="text-sm text-muted-foreground mt-1">
													Valor das perguntas que você respondeu e foram aprovadas
												</p>
											</>
										) : (
											<p className="text-sm font-bold text-red-600 dark:text-red-400 mt-2">
												Você precisa acumular pelo menos R$ 100 para poder sacar o dinheiro
											</p>
										)}
									</div>
								</div>
								<div className="sm:ml-auto w-full sm:w-auto">
									<SaqueButton />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-orange-50 dark:bg-muted border-orange-200 dark:border-border">
						<CardContent className="p-6">
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-orange-600 dark:bg-muted-foreground rounded-full flex items-center justify-center">
									<Clock className="h-6 w-6 text-white dark:text-background" />
								</div>
								<div>
									<p className="text-3xl font-bold text-orange-600 dark:text-foreground">
										R$ {formatCurrency(currentData.paymentAwaitingAnswer)}
									</p>
									<p className="text-sm text-orange-700 dark:text-muted-foreground font-bold">
										Valor Pendente Para Responder
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Valor das perguntas aguardando sua resposta
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<h2 className="text-xl font-bold text-foreground mb-4">Histórico de Transações</h2>
							<div className="space-y-4">
								{currentData.paymentWithdrawHistory.length === 0 ? (
									<div className="text-center py-8">
										<p className="text-muted-foreground">Nenhuma transação encontrada</p>
									</div>
								) : (
									currentData.paymentWithdrawHistory.map((withdraw) => (
										<div
											key={withdraw.id}
											className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
										>
											<div>
												<p className="text-2xl text-foreground">Saque realizado</p>
												<p className="text-muted-foreground">
													{formatDate(withdraw.created_at)}
												</p>
												<p className="text-orange-500 font-bold">
													PIX: {withdraw.send_to_pix_key}
												</p>
											</div>
											<p className="font-bold text-green-600 dark:text-foreground">
												R$ {formatCurrency(withdraw.amount_withdraw)}
											</p>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="enviadas" className="space-y-6 mt-4">
					<Card className="bg-blue-50 dark:bg-muted border-blue-200 dark:border-border">
						<CardContent className="p-6">
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-blue-600 dark:bg-foreground rounded-full flex items-center justify-center">
									<DollarSign className="h-6 w-6 text-white dark:text-background" />
								</div>
								<div>
									<p className="text-3xl font-bold text-blue-600 dark:text-foreground">
										R$ {formatCurrency(currentData.paymentSentAnsweredQuestions ?? 0)}
									</p>
									<p className="text-sm text-blue-700 dark:text-muted-foreground">
										Valor total que você pagou para fazer perguntas e foram respondidas
										adequadamente.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-orange-50 dark:bg-muted border-orange-200 dark:border-border">
						<CardContent className="p-6">
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-orange-600 dark:bg-muted-foreground rounded-full flex items-center justify-center">
									<Clock className="h-6 w-6 text-white dark:text-background" />
								</div>
								<div>
									<p className="text-3xl font-bold text-orange-600 dark:text-foreground">
										R$ {formatCurrency(currentData.paymentAwaitingAnswer)}
									</p>
									<p className="text-sm text-orange-700 dark:text-muted-foreground">
										Valor total que você pagou fazendo perguntas que ainda estão esperando resposta.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-green-50 dark:bg-muted border-green-200 dark:border-border">
						<CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-green-600 dark:bg-foreground rounded-full flex items-center justify-center">
									<DollarSign className="h-6 w-6 text-white dark:text-background" />
								</div>
								<div>
									<p className="text-3xl font-bold text-green-600 dark:text-foreground">
										R$ {formatCurrency(currentData.paymentToWithdraw)}
									</p>
									{currentData.paymentToWithdraw >= 10000 ? (
										<>
											<p className="text-sm text-green-700 dark:text-muted-foreground mt-1">
												Perguntas pagas que você enviou e foram expiradas ou recusadas a
												responder, você pode sacar a partir de R$ 100
											</p>
										</>
									) : (
										<p className="text-sm font-bold text-red-600 dark:text-red-400 mt-2">
											Você precisa acumular pelo menos R$ 100 para poder sacar o dinheiro
										</p>
									)}
								</div>
							</div>
							<div className="sm:ml-auto w-full sm:w-auto">
								<SaqueButton />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<h2 className="text-xl font-bold text-foreground mb-4">Histórico de Transações</h2>
							<div className="space-y-4">
								{currentData.paymentWithdrawHistory.length === 0 ? (
									<div className="text-center py-8">
										<p className="text-muted-foreground">Nenhuma transação encontrada</p>
									</div>
								) : (
									currentData.paymentWithdrawHistory.map((withdraw) => (
										<div
											key={withdraw.id}
											className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
										>
											<div>
												<p className="text-2xl text-foreground">Saque realizado</p>
												<p className="text-muted-foreground">
													{formatDate(withdraw.created_at)}
												</p>
												<p className="text-orange-500 font-bold">
													PIX: {withdraw.send_to_pix_key}
												</p>
											</div>
											<p className="font-bold text-green-600 dark:text-foreground">
												R$ {formatCurrency(withdraw.amount_withdraw)}
											</p>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</main>
	);
}
