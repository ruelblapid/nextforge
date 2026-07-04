/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
export interface ITaggedCache {
	remember(
		key: string,
		expireAt: number,
		callback: Function
	): Promise<unknown>;
	forever(key: string, value: unknown): void;
	set(key: string, value: unknown, expireAt?: number): void;
	get(key: string): unknown | undefined;
	forget(key: string): void;
	flush(): Promise<void>;
	destroy(): void;
	keys(name: string): unknown | undefined;
}
