"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function TermosDeUsoClient() {
	return (
		<main className="p-4 lg:p-6">
			<Card className="border-none">
				<CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
					<p className="text-muted-foreground mb-6">Última atualização: 15 de junho de 2025</p>

					<h2 className="text-xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
					<p className="mb-6">
						Ao acessar e utilizar o <strong>RespondeAê</strong> (https://respondeae.com.br), você concorda
						com os presentes Termos de Uso. Se não concordar com qualquer parte destes termos, recomendamos
						que não utilize nossos serviços.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">2. Descrição do Serviço</h2>
					<p className="mb-6">
						O RespondeAê é uma plataforma onde os usuários podem fazer perguntas pagas para outras pessoas e
						receber respostas. As perguntas devem ter valor mínimo de R$2,00, com pagamento via PIX, e os
						valores sugeridos são: R$2, R$5, R$10, R$20, R$50 ou outro valor inteiro definido pelo usuário.
						Ao responder de forma adequada, o autor da resposta recebe o valor pago.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">3. Limites de Uso Diário</h2>
					<p className="mb-6">
						Cada usuário pode realizar até <strong>10 perguntas públicas</strong> e{" "}
						<strong>1 pergunta anônima</strong> por dia. Essa limitação visa prevenir abusos, spam e manter
						um ambiente saudável na plataforma.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">4. Privacidade e Minha Conta</h2>
					<p className="mb-6">
						Usuários podem configurar seu perfil para exibir ou ocultar suas respostas publicamente,
						permitir ou recusar perguntas específicas, responder de forma privada, entre outras preferências
						que ajudam a preservar sua privacidade.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">5. Validade das Perguntas</h2>
					<p className="mb-6">
						Cada pergunta tem validade de <strong>7 dias corridos</strong> para ser respondida. Após esse
						prazo, a pergunta é considerada expirada e não poderá mais ser respondida. O valor pago será
						automaticamente devolvido à conta do pagador.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">6. Regras de Conduta e Conteúdo Proibido</h2>
					<p className="mb-6">
						Não é permitido publicar ou enviar conteúdo ilegal, ofensivo, difamatório, obsceno, com violação
						de direitos autorais, spam ou assédio. Os usuários são responsáveis por todo o conteúdo que
						publicarem e pelo uso adequado da plataforma.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">7. Sistema de Reports e Penalidades</h2>
					<p className="mb-4">Uma conta será bloqueada caso atinja os seguintes limites de denúncias:</p>
					<ul className="list-disc pl-6 mb-4">
						<li>Mais de 10 reports em um único dia</li>
						<li>Mais de 30 reports em uma semana</li>
						<li>Mais de 50 reports em um mês</li>
					</ul>
					<p className="mb-4">As penalidades são aplicadas da seguinte forma:</p>
					<ul className="list-disc pl-6 mb-6">
						<li>1ª ocorrência: bloqueio por 30 dias</li>
						<li>2ª ocorrência: bloqueio por 180 dias</li>
						<li>3ª ocorrência: exclusão permanente da conta</li>
					</ul>

					<h2 className="text-xl font-bold text-foreground mb-4">8. Pagamentos e Reembolsos</h2>
					<p className="mb-6">
						Os pagamentos são processados exclusivamente via PIX. Só é possível receber o valor de uma
						pergunta quando ela for respondida de maneira adequada. Reembolsos automáticos ocorrem em caso
						de perguntas expiradas. Reembolsos manuais são analisados caso a caso pela equipe do RespondeAê.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">9. Limitação de Responsabilidade</h2>
					<p className="mb-6">
						O RespondeAê não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais
						relacionados ao uso da plataforma. O conteúdo gerado pelos usuários é de responsabilidade
						exclusiva de quem o publica.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">10. Modificações nos Termos</h2>
					<p className="mb-6">
						Estes termos podem ser alterados a qualquer momento. Recomendamos que o usuário revise esta
						página periodicamente. Alterações entram em vigor imediatamente após a publicação.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">11. Contato</h2>
					<p className="mb-4">
						Em caso de dúvidas, sugestões ou problemas relacionados a estes Termos de Uso, entre em contato
						com nossa equipe de suporte através do e-mail:{" "}
						<a href="mailto:suporte@respondeae.com.br" className="text-blue-600 underline">
							suporte@respondeae.com.br
						</a>
						.
					</p>
				</CardContent>
			</Card>
		</main>
	);
}
