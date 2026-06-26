import { HttpRequest } from '../../Http/HttpRequest';
import { Token } from '../../Container/Types';
export interface ControllerMetadata {
	path: string;
}

export interface RouteMetadata {
	path: string;
	requestMethod: HttpRequest['method'];
	methodName: string;
	controllerClass?: any;
	controllerToken?: Token<any>;
}

export const controllerRegistry = new Map<Function, ControllerMetadata>();
export const routeRegistry = new Map<Function, RouteMetadata[]>();
export function Controller(path: string) {
	return function (target: Function) {
		controllerRegistry.set(target, {
			path,
		});
	};
}

export function createMappingDecorator(method: RouteMetadata['requestMethod']) {
	return (path: string = ''): any => {
		return function (target: object, propertyKey: string) {
			const controllerClass = target.constructor;
			const routes = routeRegistry.get(controllerClass) ?? [];

			routes.push({
				path,
				requestMethod: method,
				methodName: propertyKey as string,
				controllerClass: controllerClass,
			});

			routeRegistry.set(controllerClass, routes);
		};
	};
}

export const Get = createMappingDecorator('GET');
export const Post = createMappingDecorator('POST');
export const Put = createMappingDecorator('PUT');
export const Patch = createMappingDecorator('PATCH');
export const Delete = createMappingDecorator('DELETE');
