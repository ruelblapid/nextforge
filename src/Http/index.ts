import { CORE_DI_SYMBOLS } from '../Container/Tokens';
import {
	Container,
	ControllerDefinition,
	CommandDefinition,
	QueryDefinition,
} from '../Container';
import { Token } from '../Container/Types';
import ApiException from '../Exceptions/ApiException';
import { HttpAdapter } from './HttpAdapter';
import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';
import { Middleware, MiddlewareMeta } from './Middleware';
import { parameterRegistry, ParamMetadata } from '../Decorators/Parameters';
import { UnexpectedError } from '../UseCase/DataError';
import UnAuthorizedException from '../Exceptions/UnAuthorizedException';
import SessionExpiredException from '../Exceptions/SessionExpiredException';
import ValidationException from '../Exceptions/ValidationException';
import {
	RouteMetadata,
	routeRegistry,
	controllerRegistry,
} from '../Decorators/Route';
import { BaseDto } from '../BaseDto';
import { QueryParameters, QueryParser } from '../Query';
import { validateQuery, QueryValidationException } from '../Query/Validator';

export class HttpRequestEngine {
	private initialized = false;
	private globalMiddlewareTokens: MiddlewareMeta[] = [];
	private routesRegistry: RouteMetadata[] = [];
	private _adapter: HttpAdapter | null = null;

	constructor(private container: Container) {}

	public registerMiddlewares(globalMiddleware: MiddlewareMeta[]): void {
		if (this.initialized) return;
		this.globalMiddlewareTokens = globalMiddleware;
		this.initialized = true;
	}

	public registerCommands(commands: CommandDefinition<any>[]): this {
		for (const command of commands) {
			this.container.transient(command.token, command.factory);
		}
		return this;
	}

	public registerQueries(queries: QueryDefinition<any>[]): this {
		for (const query of queries) {
			this.container.transient(query.token, query.factory);
		}
		return this;
	}

	public registerControllers(controllers: ControllerDefinition<any>[]): this {
		for (const definition of controllers) {
			const metadata = controllerRegistry.get(definition.controllerClass);
			const routes: RouteMetadata[] = routeRegistry.get(
				definition.controllerClass
			);
			if (routes) {
				for (const route of routes) {
					const prefix = metadata.path.replace(/^\/|\/$/g, '');
					const path = route.path.replace(/^\/|\/$/g, '');
					this.routesRegistry.push({
						...route,
						path: `/${[prefix, path].filter(Boolean).join('/')}`,
						controllerClass: definition.controllerClass,
						controllerToken: definition.token,
					});
				}
			}
			if (definition.factory) {
				this.container.transient(definition.token, definition.factory);
			}
		}
		return this;
	}

	public async provide<T>(token: Token<T>): Promise<T> {
		return this.container.resolve<T>(token);
	}

	public async onHandleApiRequest(
		nativeReq: any,
		_nativeRes?: any
	): Promise<any> {
		const adapter = await this.resolveAdapter();
		const req = await adapter.parseRequest(nativeReq);
		try {
			const route = this.matchRoute(req);
			if (!route) throw new ApiException('Route not found.');
			req.params = this.extractParams(route.path, req.url);
			const args = await this.resolveMethodArguments(req, route);
			return await this.executePipeline(nativeReq, req, route, args);
		} catch (error) {
			console.log('[nextforge HttpRequestEngine]', error);
			return adapter.sendResponse(
				nativeReq,
				this.handleException(error, req)
			);
		}
	}

	public async onHandleRequest(
		nativeReq: any,
		nativeRes?: any
	): Promise<any> {
		const adapter = await this.resolveAdapter();
		const req = await adapter.parseRequest(nativeReq);

		const permissionService = await this.container.resolve(
			CORE_DI_SYMBOLS.IPermissionService
		);
		if (
			permissionService
				.getPermissions()
				.isNotProtectedUrl({ method: req.method, url: req.url })
		) {
			return adapter.sendNextResponse(nativeRes, {
				status: 200,
				headers: { ...nativeReq.headers },
			});
		}

		try {
			const response = await this.executePipeline(nativeReq, req);
			if (response?.isLeft?.()) {
				const data = response.getLeft();
				return adapter.sendNextResponseRedirect(
					this.buildRedirectUrl(400, data.message, req)
				);
			}
			return response;
		} catch (error) {
			const { body } = this.handleException(error, req);
			return adapter.sendNextResponseRedirect(
				this.buildRedirectUrl(body.code, body.message, req)
			);
		}
	}

	private async resolveAdapter(): Promise<HttpAdapter> {
		if (!this._adapter) {
			this._adapter = await this.container.resolve<HttpAdapter>(
				CORE_DI_SYMBOLS.HttpAdapter
			);
		}
		return this._adapter;
	}

	private matchRoute(req: HttpRequest): RouteMetadata | undefined {
		const rawUrl = req.url.split('?')[0];
		return this.routesRegistry.find((route) => {
			if (route.requestMethod !== req.method) return false;
			const pattern = route.path
				.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
				.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '([^/]+)');
			return new RegExp(`^${pattern}$`).test(rawUrl);
		});
	}

	private extractParams(
		routePath: string,
		incomingUrl: string
	): Record<string, string> {
		const paramNames: string[] = [];
		const nameMatcher = /:([a-zA-Z0-9_]+)/g;
		let m: RegExpExecArray | null;
		while ((m = nameMatcher.exec(routePath)) !== null) {
			paramNames.push(m[1]);
		}

		const pattern = routePath
			.replace(/\//g, '\\/')
			.replace(/:[a-zA-Z0-9_]+/g, '([^\\/]+)');
		const values = new RegExp(`^${pattern}$`).exec(incomingUrl);
		if (!values) return {};

		return Object.fromEntries(
			paramNames.map((name, i) => [name, values[i + 1]])
		);
	}

	private async resolveMethodArguments(
		req: HttpRequest,
		route: RouteMetadata
	): Promise<any[]> {
		const allParams: ParamMetadata[] =
			parameterRegistry.get(route.controllerClass.prototype) ?? [];
		const params = allParams.filter(
			(p) => p.methodName === route.methodName
		);
		const args: any[] = [];
		for (const param of params) {
			args[param.index] = this.resolveArg(param, req);
		}
		return args;
	}

	private resolveArg(param: ParamMetadata, req: HttpRequest): any {
		switch (param.type) {
			case 'PARAM': {
				const value = param.name
					? req.params[param.name as string]
					: req.params;
				if (param.dto && value) {
					param.dto.validate({ [param.name as string]: value });
				}
				return value;
			}
			case 'QUERY':
				return param.name ? req.query[param.name as string] : req.query;
			case 'HEADER':
				return param.name
					? req.headers[(param.name as string).toLowerCase()]
					: req.headers;
			case 'BODY': {
				if (param.name && typeof param.name === 'function') {
					return (param.name as typeof BaseDto).validate(req.body);
				}
				return req.body;
			}
			case 'FILES':
			case 'CUSTOM':
				return param.factory ? param.factory(req) : undefined;
			default:
				return undefined;
		}
	}

	private async runMiddlewares(
		nativeReq: any,
		req: HttpRequest
	): Promise<void> {
		for (const meta of this.globalMiddlewareTokens) {
			const middleware = await this.container.resolve<Middleware>(
				meta.token
			);
			const response = await middleware.use(req);
			if (!response) continue;

			if (response.isLeft()) {
				throw new ApiException(
					(response.getLeft() as UnexpectedError).message
				);
			}

			// NOTE: do NOT mutate `nativeReq.headers` here. Setting headers on a
			// NextRequest inside middleware corrupts the forwarded request and
			// strips ALL cookies, so server components see an empty cookie jar
			// and `getUser()` returns undefined. The page resolves the user from
			// the auth cookie on its own, so forwarding it via header is
			// unnecessary.
		}
	}

	private async buildGetParameters(
		req: HttpRequest,
		route: RouteMetadata
	): Promise<any> {
		const authService = await this.container.resolve(
			CORE_DI_SYMBOLS.IAuthenticationService
		);
		const user = await authService.getUser();

		const query: Map<string, unknown> = req.query
			? QueryParser.parse(req.query)
			: new Map();

		if (!query.has('sort')) query.set('sort', ['-created_at']);

		if (!query.has('route'))
			query.set('route', {
				name: route.methodName,
				path: req.url,
				parameter: req.params,
			});

		validateQuery(route.controllerClass, route.methodName, query);

		query.set('user', user);
		query.set(
			'route',
			new Map<string, any>([
				['name', route.methodName],
				['path', route.path],
				['parameters', req.query],
			])
		);

		return new QueryParameters().parse(query);
	}

	private async executePipeline(
		nativeReq: any,
		req: HttpRequest,
		route?: RouteMetadata,
		methodArgs: any[] = []
	): Promise<any> {
		const adapter = await this.resolveAdapter();
		await this.runMiddlewares(nativeReq, req);

		if (!route) {
			return adapter.sendNextResponse(nativeReq, {
				status: 200,
				headers: { ...nativeReq.headers },
			});
		}

		if (route.requestMethod === 'GET') {
			methodArgs.push(await this.buildGetParameters(req, route));
		}

		const controller = await this.container.resolve<any>(
			route.controllerToken ?? route.controllerClass
		);
		const response = await controller[route.methodName](...methodArgs);

		return this.mapResponseToHttp(nativeReq, adapter, response);
	}

	private mapResponseToHttp(
		nativeReq: any,
		adapter: HttpAdapter,
		response: any
	): any {
		if (response.isRight()) {
			return adapter.sendResponse(nativeReq, {
				status: 200,
				headers: { ...nativeReq.headers },
				body: response.getRight(),
			});
		}

		const data = response.getLeft();
		const body: Record<string, any> = {};
		let code = 400;

		switch (data.kind) {
			case 'NoRecordFoundError':
				code = 200;
				body.data = [];
				body.message = data.message;
				break;
			case 'ValidationError':
				code = 422;
				body.message = data.message;
				body.errors = data.errors;
				break;
			default:
				body.message = data.message;
				if (data.kind === 'UnexpectedError') {
					console.log('[nextforge Query Error]', data.error);
				}
		}

		body.code = code;
		return adapter.sendResponse(nativeReq, {
			status: code,
			headers: { 'Content-Type': 'application/json' },
			body,
		});
	}

	private buildRedirectUrl(
		code: number,
		message: string,
		req: HttpRequest
	): URL {
		const host = (req.headers['host'] as string) || 'localhost:3000';
		const protocol = host.startsWith('localhost') ? 'http://' : 'https://';
		const url = new URL('/error', `${protocol}${host}`);
		url.searchParams.set('code', code.toString());
		url.searchParams.set('message', message);
		return url;
	}

	private handleException(error: any, _req?: HttpRequest): HttpResponse {
		if (error instanceof QueryValidationException) {
			return {
				status: 422,
				headers: { 'Content-Type': 'application/json' },
				body: error.toResponse(),
			};
		}
		if (error instanceof ValidationException) {
			return {
				status: 422,
				headers: { 'Content-Type': 'application/json' },
				body: {
					message: error.getMessage(),
					code: 422,
					errors: error.getErrors(),
				},
			};
		}
		if (error instanceof ApiException) {
			return {
				status: error.getCode(),
				headers: { 'Content-Type': 'application/json' },
				body: { message: error.getMessage(), code: error.getCode() },
			};
		}
		if (error instanceof SessionExpiredException) {
			return {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
				body: { message: error.message, code: 401 },
			};
		}
		if (error instanceof UnAuthorizedException) {
			return {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
				body: { message: error.message, code: 403 },
			};
		}
		if (error?.message === 'ForbiddenExceptionTriggered') {
			return {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
				body: { message: 'Forbidden access denied', code: 403 },
			};
		}
		return {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
			body: {
				message: error?.message ?? 'Internal Server Error',
				code: 500,
			},
		};
	}
}
