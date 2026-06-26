/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

import { QueryResponse } from '../../UseCase';
import { IQuery } from './IQuery';
export interface IQueryBus {
	ask(query: IQuery): Promise<QueryResponse>;
}
