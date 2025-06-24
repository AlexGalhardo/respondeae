"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function TermosDeUsoClient() {
	return (
		<main className="p-4 lg:p-6">
			<Card className="border-none">
				<CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
					<p className="text-muted-foreground mb-6">Última atualização: 21 de Junho de 2025</p>

					<h2 className="text-xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
					<p className="mb-6">
						Ao acessar e utilizar os serviços da plataforma do <strong>RespondeAê</strong>{" "}
						(https://respondeae.com.br), você concorda com os presentes Termos de Uso.
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
						um ambiente saudável na plataforma. Dado a necessidade do uso da plataforma com o passar do
						tempo, esses valores podem ser aumentados ou diminuidos caso necessário.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">4. Pagamentos</h2>
					<p className="mb-6">
						Será cobrada uma taxa de cada pergunta realizada, para que possamos manter e melhorar os
						serviços da plataforma. A taxa por pergunta varia por valor da pergunta, sendo:
					</p>
					<ul className="list-disc pl-6 mb-6">
						<li>50% quando o valor da pergunta é R$ 20 5 ou menos.</li>
						<li>30% quando o valor da pergunta é acima de R$ 5 reais.</li>
						<li>
							Exemplo 1: João pagou R$ 5 reais para fazer uma pergunta a Ana. A taxa desse valor será 50%,
							logo, R$ 2,50 reais. Caso Ana venha responder corretamente essa pergunta, ela receberá R$
							2,50 reais.
						</li>
						<li>
							Exemplo 2: Pedro pagou R$ 10 reais para fazer uma pergunta a Maria. A taxa desse valor será
							30%, logo, R$ 3 reais. Caso Maria venha responder corretamente essa pergunta, ela receberá
							R$ 7 reais.
						</li>
					</ul>

					<h2 className="text-xl font-bold text-foreground mb-4">5. Privacidade e Minha Conta</h2>
					<p className="mb-6">
						Usuários podem configurar seu perfil para exibir ou ocultar suas respostas publicamente,
						curtidas e descurtidas em suas respostas, fazer perguntas privadas, privar seu perfil apenas
						para seguidores, entre outras preferências que ajudam a preservar sua privacidade.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">6. Validade das Perguntas</h2>
					<p className="mb-6">
						Cada pergunta enviada tem uma validade individual de <strong>7 dias corridos</strong> para ser
						respondida. Após esse prazo, a pergunta é considerada expirada e não poderá mais ser respondida.
						O valor pago pela pergunta será automaticamente devolvido à conta do pagador.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">7. Regras de Conduta e Conteúdo Proibido</h2>
					<p className="mb-6">
						Não é permitido publicar ou enviar conteúdo ilegal, ofensivo, difamatório, obsceno, com violação
						de direitos autorais, spam ou assédio. Os usuários são responsáveis por todo o conteúdo que
						publicarem e pelo uso adequado da plataforma. Nos damos o direito de remover qualquer pergunta
						ou resposta, e banir usuários que violem essas regras.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">8. Sistema de Reports e Penalidades</h2>
					<p className="mb-4">
						Cada pergunta e resposta pode ser reportada tanto pela pessoa que recebeu a pergunta quando pela
						pessoa que recebeu a resposta. Dado um número considerável de reports no dia, semana ou mês, o
						autor da pergunta ou da resposta poderá ser penalizado.
					</p>
					<p className="mb-4">As penalidades são aplicadas da seguinte forma:</p>
					<ul className="list-disc pl-6 mb-6">
						<li>1ª ocorrência: bloqueio de acesso a conta por 30 dias</li>
						<li>2ª ocorrência: bloqueio de acesso a conta por 180 dias</li>
						<li>3ª ocorrência: exclusão permanente da conta</li>
					</ul>

					<h2 className="text-xl font-bold text-foreground mb-4">9. Pagamentos e Reembolsos</h2>
					<p className="mb-6">
						Os pagamentos são processados exclusivamente via PIX. Só é possível receber o valor de uma
						pergunta quando ela for respondida de maneira adequada. Reembolsos automáticos ocorrem em caso
						de perguntas expiradas ou que foram recusadas a serem respondidas por quem recebeu a pergunta.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">10. Limitação de Responsabilidade</h2>
					<p className="mb-6">
						O RespondeAê não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais
						relacionados ao uso da plataforma. As perguntas e respostas feita pelos usuários é de
						responsabilidade exclusiva de quem o publica. Contamos com a colaboração da comunidade para
						manter um ambiente saudável e produtivo.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">11. Modificações nos Termos</h2>
					<p className="mb-6">
						Estes termos podem ser alterados a qualquer momento. Recomendamos que o usuário revise esta
						página periodicamente. Alterações entram em vigor imediatamente após a publicação.
					</p>

					<h2 className="text-xl font-bold text-foreground mb-4">12. Contato</h2>
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
