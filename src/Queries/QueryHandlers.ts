/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
import { IQuery } from './Interfaces/IQuery';
import { IQueryHandler } from './Interfaces/IQueryHandler';
import { QueryNotRegisteredError } from './QueryNotRegisteredError';
import { Resolver } from '../Container/Types';
export class QueryHandlers {
	constructor(private resolver: Resolver) {}

	public async get(query: IQuery): Promise<IQueryHandler<IQuery>> {
		const queryHandler = await this.resolver.resolve(query);

		if (!queryHandler) {
			throw new QueryNotRegisteredError(query);
		}
		return queryHandler as IQueryHandler<IQuery>;
	}
}
