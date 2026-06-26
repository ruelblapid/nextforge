import { QueryResponse } from '../../UseCase';
import { HttpRequest } from '../HttpRequest';
export interface MiddlewareMeta {
	token: any;
}
export interface Middleware {
	use(req: HttpRequest): void | Promise<QueryResponse>;
}
