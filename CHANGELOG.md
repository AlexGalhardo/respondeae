# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Security

- **Saque**: `POST /api/payments/withdraw` não tinha login e aceitava `userId`, valor e chave PIX do body, permitindo sacar o saldo de qualquer usuário para qualquer chave. Agora o saque usa a sessão, calcula o valor no servidor, paga a chave cadastrada do próprio usuário e roda em transação que impede sacar a mesma pergunta duas vezes. A rota foi removida.
- **Criação de pergunta**: o valor pago vinha do body (pagar R$ 2 e registrar R$ 1.000 inflava saque e reembolso) e o autor também. Agora o valor é o do webhook pago, o autor é o usuário da sessão, e o limite diário é conferido.
- **8 rotas de pergunta/seguir** (responder, apagar, recusar, reportar, curtir, descurtir, expirar, seguir) não checavam sessão e confiavam no `nickname` do body. Agora exigem login e usam a sessão. Expirar pergunta também confere o prazo e o estado no servidor.
- **Chave da AbacatePay exposta**: era `NEXT_PUBLIC_*` e importada por componente client, então ia para o bundle público. Agora é server-only (`ABACATEPAY_API_KEY`, `ABACATEPAY_WEBHOOK_SECRET`). **A chave de produção precisa ser rotacionada.**
- `simulate-payment` só responde em modo de teste; o webhook recusa tudo se o secret não estiver configurado; a página pública `/pix-test` foi removida.
- **Cron** (`/api/cronjob`, que apaga contas antigas) era público. Agora exige `CRON_SECRET`.
- Server Actions de dados de pagamento aceitavam qualquer `nickname`, e as de aceitar/rejeitar seguidor aceitavam qualquer solicitação. Agora são restritas ao usuário da sessão.
- Hash de senha com bcrypt custo 12 em todos os fluxos (cadastro e reset usavam 10).
- Vulnerabilidades transitivas corrigidas via `overrides` (`effect`, `baseline-browser-mapping`, `mysql2`). `bun audit`: 26 → 1, e essa única, `deepmerge-ts`, só existe no CLI do Prisma e está ignorada com justificativa. O job de auditoria do CI agora bloqueia.

### Added

- CI/CD com GitHub Actions: `ci.yml` (lint, format, typecheck, `bun audit`, unit, integração, build + smoke, todos bloqueantes), `e2e.yml` (Playwright) e `deploy.yml` (Vercel, só após CI verde em `main`). Ver `docs/deployment.md`.
- `lib/session.ts` (`getSessionUser`) e services testados para regras que movem dinheiro: `withdraw.service`, `question-create.service`, `question-expiry.service`.
- Testes de integração para saque (incluindo concorrência), criação de pergunta, expiração e autorização do cron. Teste e2e de regressão para renderização única do layout. O e2e de cadastro, antes `fixme`, agora passa.
- `.editorconfig` na raiz (tab, largura 4, LF; YAML e `package.json` com espaços) e `.gitattributes` fixando LF.
- Skills de agentes vendorizadas em `.claude/skills/` (impeccable, ponytail, addyosmani/agent-skills, graphify, frontend-design), com agentes em `.claude/agents/` e checklists em `.claude/references/`; origem e commits em `.claude/skills/SOURCES.md`. `.graphifyignore` para o knowledge graph.
- Fase final no `PLAN.md`: auditoria de segurança da aplicação inteira contra o OWASP Top Ten.
- Testes unitários (`lib/`), integração (`tests/integration/`), smoke (`tests/smoke/`) e e2e com Playwright (`tests/e2e/`).
- `AGENTS.md`/`CLAUDE.md` na raiz e documentação em `docs/` focada em dar contexto para agentes de IA.
- Pasta `setups/` com scripts de setup local (Windows/Unix × SQLite/Postgres/Postgres+Docker) e `infra/` com Docker/docker-compose.
- Conventional Commits obrigatório via commitlint no hook `commit-msg`.

### Changed

- **Prisma 6 → 7.10.0** com driver adapters (`@prisma/adapter-pg`; `@prisma/adapter-libsql` para SQLite local), `prisma.config.ts`, client gerado em `prisma/generated/` e uma única instância compartilhada. Rode `bun run prisma:generate` após instalar. `SQLITE_DATABASE_URL` deixou de existir: use `DATABASE_URL="file:./dev.db"`.
- `@react-email/components` 0.0.41 → 1.0.12.
- `typescript.ignoreBuildErrors` removido: o build volta a checar tipos (0 erros). Lint com 0 erros em todo o código (antes só `app/` era verificado).
- Server Actions usam `updateTag` (Next 16) no lugar de `revalidateTag` com um argumento.
- Biome lê o `.editorconfig` e formata também `tests/` e configs da raiz.
- `TODO.md` renomeado para `PLAN.md`.
- Bun 1.4.2 como package manager oficial; dependências com versão exata pinada.

### Removed

- `framer-motion` (girava um ícone que já girava com `animate-spin`, dobrando a velocidade do spinner).
- `@prisma/extension-accelerate` (sem efeito com `DATABASE_URL` Postgres comum).
- 30 componentes shadcn e 28 dependências sem nenhum import; o CLI `vercel` como devDependency (chamado pinado no workflow); código morto (`actions/question-actions.ts`, `lib/create-pix-payment.ts`, `lib/rate-limiter.ts` não usado, rota vazia `report-answer`).

### Fixed

- O layout raiz renderizava cada página duas vezes (uma árvore por breakpoint): ids duplicados, efeitos e chamadas de API em dobro, erro de hidratação.
- Formulários com Zod 4 (cadastro, contato, dados da conta) quebravam lendo `ZodError.errors`; agora usam `.issues`. Cadastro novo redireciona para `/minha-conta` (antes caía em `/feed` por um redirecionamento concorrente).
- Login por senha e formulário de contato falhavam em produção: o servidor lia `CLOUDFLARE_TURNSTILE_SECRET_KEY` (inexistente) e o client dependia de `NEXT_PUBLIC_NODE_ENV` (nunca definido).
- Toasts de perfil, pergunta, pagamento e ranking nunca apareciam (usavam uma cópia do store que o `<Toaster>` não escuta).
- Rotas desconectavam o client Prisma compartilhado ao fim de cada requisição.
- `biome.json` no schema errado quebrava o hook `pre-commit`.

### Known issues

- Troca de senha não pede a senha atual, e não há rate limit efetivo em login/cadastro (o limitador em memória não funcionaria em serverless). Ambos dependem de decisão: ver `PLAN.md`, Fase 11.
- "Reportar resposta" e "sacar perguntas não respondidas" chamam rotas que não existem (`/api/question/report-answer` era um arquivo vazio; `/api/withdraw/unanswered` nunca existiu).
- Seed não roda no SQLite (`createMany({ skipDuplicates })` não é suportado lá).
- Erro de hidratação no botão de tema (`Moon`/`Sun` dependem do tema, que só é conhecido no client).

## [1.0.0] - 2026-09-23

Primeira versão com versionamento formal. Ponto de partida do histórico deste changelog — o histórico anterior de commits não seguia Conventional Commits.
