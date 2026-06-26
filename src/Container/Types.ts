export interface Token<T> {
	readonly key: symbol;
	readonly name: string;
}
export interface Resolver {
	resolve<T>(token: Token<T>): Promise<T>;
}
export type Factory<T> = (resolver: Resolver) => T;
