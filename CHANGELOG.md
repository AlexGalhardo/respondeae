# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added

- `AGENTS.md`/`CLAUDE.md` na raiz e documentação em `docs/` focada em dar contexto para agentes de IA.
- Pasta `setups/` com scripts de setup local (Windows/Unix × SQLite/Postgres/Postgres+Docker).
- Pasta `infra/` centralizando Docker/docker-compose (antes na raiz).
- `prisma/schema.sqlite.prisma`, schema espelhado para desenvolvimento local sem Postgres.
- Conventional Commits obrigatório via commitlint no hook `commit-msg`.

### Changed

- Bun 1.4.2 como package manager oficial (`packageManager`/`engines` no `package.json`).
- Todas as dependências passaram a usar versão exata pinada (sem `latest`, sem `^` desnecessário).

### Fixed

- `biome.json` estava no schema da versão 1.8.3 enquanto o Biome instalado é 2.5.1, quebrando o hook `pre-commit` (`bun run format`); migrado para o schema correto.
- `css.parser.tailwindDirectives` habilitado no Biome para `app/globals.css` formatar sem erro.

### Known issues

- `lib/auth.ts` lê `CLOUDFLARE_TURNSTILE_SECRET_KEY`, mas o env real é `CLOUDFLARE_TURNSTILE_SECRET` — login por credenciais falha silenciosamente em produção. Ver `docs/auth.md`. Correção planejada para a fase de revisão de lógica/OWASP (checkpoint, `TODO.md`).
- `NEXT_PUBLIC_ABACATEPAY_API_KEY` é exposta no client (`NEXT_PUBLIC_*`). Ver `docs/payments-pix.md`.

## [1.0.0] - 2026-09-23

Primeira versão com versionamento formal. Ponto de partida do histórico deste changelog — o histórico anterior de commits não seguia Conventional Commits.
