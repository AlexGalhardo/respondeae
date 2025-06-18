// Implementação simples de rate limiter usando Map
// Em produção, seria melhor usar Redis ou outro armazenamento distribuído

type RateLimitRecord = {
	count: number;
	resetAt: number;
};

export class RateLimiter {
	private store: Map<string, RateLimitRecord>;
	private maxRequests: number;
	private windowMs: number;

	constructor(maxRequests: number, windowMs: number) {
		this.store = new Map();
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
	}

	async check(key: string): Promise<{ success: boolean; remaining: number; resetAt: number }> {
		const now = Date.now();

		// Limpar registros expirados
		this.cleanExpired();

		// Obter ou criar registro
		let record = this.store.get(key);

		if (!record) {
			record = {
				count: 0,
				resetAt: now + this.windowMs,
			};
			this.store.set(key, record);
		}

		// Verificar se o tempo expirou e resetar se necessário
		if (now > record.resetAt) {
			record.count = 0;
			record.resetAt = now + this.windowMs;
		}

		// Incrementar contador
		record.count += 1;

		// Verificar se excedeu o limite
		const success = record.count <= this.maxRequests;
		const remaining = Math.max(0, this.maxRequests - record.count);

		return {
			success,
			remaining,
			resetAt: record.resetAt,
		};
	}

	private cleanExpired(): void {
		const now = Date.now();
		for (const [key, record] of this.store.entries()) {
			if (now > record.resetAt) {
				this.store.delete(key);
			}
		}
	}
}
