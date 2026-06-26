/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

export interface HttpResponse {
	status: number;
	headers: Record<string, string>;
	body?: any;
}
