/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
import { IQuery } from './Interfaces/IQuery';
import { IQueryBus } from './Interfaces/IQueryBus';
import { QueryResponse } from '../UseCase';
import { QueryHandlers } from './QueryHandlers';

export class InMemoryQueryBus implements IQueryBus {
	constructor(private queryHandlersInformation: QueryHandlers) {}

	async ask(query: IQuery): Promise<QueryResponse> {
		const handler = await this.queryHandlersInformation.get(query);

		return await handler.handle(query);
	}
}
