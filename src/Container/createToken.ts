import { Token } from './Types';
export function createToken<T>(name: string): Token<T> {
	return {
		name,
		key: Symbol.for(name),
	};
}
