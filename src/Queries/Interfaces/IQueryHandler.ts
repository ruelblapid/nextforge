/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
import { QueryResponse } from '../../UseCase';
import { IQuery } from './IQuery';
export interface IQueryHandler<Q extends IQuery> {
	handle(query: Q): Promise<QueryResponse>;
}
