import { Factory, Resolver, Token } from './Types';

interface Registration<T> {
	factory?: Factory<T>;
	singleton: boolean;
	instance?: T;
}

export class Container implements Resolver {
	private readonly registrations = new Map<symbol, Registration<unknown>>();

	public singleton<T>(token: Token<T>, factory: Factory<T>): void {
		this.registrations.set(token.key, {
			factory,
			singleton: true,
		});
	}

	public transient<T>(token: Token<T>, factory: Factory<T>): void {
		this.registrations.set(token.key, {
			factory,
			singleton: false,
		});
	}

	public async resolve<T>(token: Token<T>): Promise<T> {
		return this.resolveWithChain(token, new Set<symbol>());
	}

	// `chain` tracks only the tokens being resolved along *this* dependency
	// path. Tracking it as shared container state (a single `resolving` Set)
	// caused false "circular dependency" errors: two unrelated concurrent
	// resolutions of the same token (e.g. two requests each resolving
	// HttpAdapter — common, and especially frequent during dev hot-reload
	// bursts) would race on that shared Set and trip the cycle guard even
	// though neither was actually circular. Threading a fresh chain per
	// top-level call keeps concurrent resolutions independent while still
	// catching real cycles within a single chain.
	private async resolveWithChain<T>(
		token: Token<T>,
		chain: Set<symbol>
	): Promise<T> {
		const registration = this.registrations.get(token.key);

		if (!registration) {
			console.log(`Token not registered: ${token.name}`);
			if (process.env.NODE_ENV == 'development') {
				throw new Error(`Token not registered: ${token.name}`);
			} else {
				throw new Error(
					'Something went wrong while processing your request. If it keeps happening, please reach out to support.'
				);
			}
		}

		if (chain.has(token.key)) {
			console.log(`Circular dependency detected: ${token.name}`);
			if (process.env.NODE_ENV == 'development') {
				throw new Error(`Circular dependency detected: ${token.name}`);
			} else {
				throw new Error(
					'Something went wrong while processing your request. If it keeps happening, please reach out to support.'
				);
			}
		}

		const nextChain = new Set(chain);
		nextChain.add(token.key);
		const scopedResolver: Resolver = {
			resolve: (nextToken) =>
				this.resolveWithChain(nextToken, nextChain),
		};

		if (registration.singleton) {
			if (!registration.instance) {
				// Cache the in-flight promise (not just the awaited result)
				// so concurrent resolutions of the same not-yet-resolved
				// singleton share one factory call instead of racing to
				// construct duplicate instances.
				registration.instance = registration.factory(
					scopedResolver
				) as Promise<unknown>;
			}

			return registration.instance as T;
		}

		return (await registration.factory(scopedResolver)) as T;
	}
}

export interface ModuleContainer {
	load(container: Container): Promise<void>;
}
export interface ProviderDefinition<T> {
	token: Token<T>;
	factory?: Factory<T>;
	singleton?: boolean;
}

export interface ControllerDefinition<T> {
	token: Token<T>;
	factory?: Factory<T>;
	controllerClass: new (...args: any[]) => T;
}

export interface CommandDefinition<T> {
	token: Token<T>;
	factory?: Factory<T>;
}

export interface QueryDefinition<T> {
	token: Token<T>;
	factory?: Factory<T>;
}
