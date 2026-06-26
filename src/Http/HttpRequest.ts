import type { NextApiRequest } from 'next';
import { IParameters } from '../Query/Parameters';
import { HttpFile } from './HttpFile';
export interface HttpRequest {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	url: string; // Full URL or path string
	headers: Record<string, string | string[] | undefined>;
	query: Record<string, any>;
	params: Record<string, any>;
	cookies: Record<string, any>;
	body: any;
	files?: HttpFile[];
}

export interface AuthenticatedHttpRequest<TUser = unknown>
	extends NextApiRequest {
	user?: TUser;
	parameter?: IParameters;
}
