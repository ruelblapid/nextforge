import { describe, expect, it, vi } from 'vitest';
import { Container, createToken } from '../src';

describe('Container', () => {
	it('resolves a singleton once', async () => {
		const container = new Container();
		const token = createToken<{ id: number }>('Thing');
		let calls = 0;
		container.singleton(token, () => {
			calls++;
			return { id: 1 };
		});

		const a = await container.resolve(token);
		const b = await container.resolve(token);

		expect(a).toBe(b);
		expect(calls).toBe(1);
	});

	it('throws on circular dependency', async () => {
		vi.stubEnv('NODE_ENV', 'development');
		try {
			const container = new Container();
			const tokenA = createToken<unknown>('A');
			const tokenB = createToken<unknown>('B');

			container.transient(tokenA, (resolver) => resolver.resolve(tokenB));
			container.transient(tokenB, (resolver) => resolver.resolve(tokenA));

			await expect(container.resolve(tokenA)).rejects.toThrow(
				/Circular dependency/
			);
		} finally {
			vi.unstubAllEnvs();
		}
	});
});
