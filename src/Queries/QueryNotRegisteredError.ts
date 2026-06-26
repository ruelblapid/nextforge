/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
import { IQuery } from './Interfaces/IQuery';

export class QueryNotRegisteredError extends Error {
	constructor(query: IQuery) {
		super(
			`The query <${query.constructor.name}> hasn't a query handler associated`
		);
	}
}
