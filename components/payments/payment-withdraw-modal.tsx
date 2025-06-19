"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, validatePixKey } from "@/lib/utils/payment-utils";

interface WithdrawModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	amount: number;
	pixKey: string | null | undefined;
	onConfirmWithdraw: () => void;
	isProcessing?: boolean;
}

export function PaymentWithdrawModal({
	isOpen,
	onOpenChange,
	amount,
	pixKey,
	onConfirmWithdraw,
	isProcessing = false,
}: WithdrawModalProps) {
	const hasValidPixKey = validatePixKey(pixKey);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				{!hasValidPixKey ? (
					<>
						<DialogHeader>
							<DialogTitle className="text-2xl font-bold">Chave Pix não configurada</DialogTitle>
							<DialogDescription className="mt-2 text-base">
								Você precisa configurar sua chave Pix na sua conta antes de poder sacar.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button onClick={() => onOpenChange(false)}>Entendi</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>
								<span className="text-3xl font-bold mb-12">Sacar R$ {formatCurrency(amount)}</span>
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
								onClick={onConfirmWithdraw}
								className="bg-green-500 text-white hover:bg-green-800 font-bold px-6 py-6 text-2xl mt-6 w-full"
								disabled={isProcessing}
							>
								{isProcessing ? "Processando Saque..." : "Confirmar Saque Nessa Chave PIX"}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
