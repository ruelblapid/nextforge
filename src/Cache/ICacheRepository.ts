import { IStore } from './IStore';
/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
export interface ICacheRepository extends IStore {
	forever(key: string, value: unknown): void;
	remember(key: string, expireAt: number, callback?: Function): unknown;
	set(key: string, value: unknown, expireAt?: number): void;
	get(key: string): unknown | undefined;
	forget(key: string): void;
	flush(): void;
	destroy(): void;
	keys(name: string): unknown | undefined;
}

export interface CacheItem {
	_id?: string;
	key: string;
	value: unknown;
	expireAt?: number;
}
