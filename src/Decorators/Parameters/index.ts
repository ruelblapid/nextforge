import { HttpRequest } from '../../Http/HttpRequest';
import { BaseDto } from '../../BaseDto';
type DtoConstructor = typeof BaseDto & (new () => any);
export type ParamType =
	| 'PARAM'
	| 'QUERY'
	| 'BODY'
	| 'HEADER'
	| 'CUSTOM'
	| 'FILES';

export interface ParamMetadata {
	index: number;
	type: ParamType;
	name?: string | DtoConstructor;
	methodName: string;
	dto?: DtoConstructor;
	pipes?: any[];
	factory?: (req: HttpRequest) => any;
}

export const parameterRegistry = new Map<Function, ParamMetadata[]>();

function createParamDecorator(type: ParamType) {
	return (name?: string, DtoClass?: DtoConstructor): ParameterDecorator => {
		return (target, propertyKey, parameterIndex) => {
			if (!propertyKey) return;
			const controllerClassMethod = target.constructor.prototype;
			let existingParams: ParamMetadata[] = parameterRegistry.get(
				controllerClassMethod
			);

			const meta: ParamMetadata = {
				index: parameterIndex,
				type,
				name,
				methodName: propertyKey as string,
				dto: DtoClass,
				pipes: [],
			};

			if (!existingParams) {
				parameterRegistry.set(controllerClassMethod, [meta]);
			} else {
				existingParams.push(meta);
			}
		};
	};
}
export const Param = createParamDecorator('PARAM');
export const Query = createParamDecorator('QUERY');
export const Header = createParamDecorator('HEADER');

export const Body = (DtoClass?: DtoConstructor): ParameterDecorator => {
	return (target, propertyKey, parameterIndex) => {
		if (!propertyKey) return;
		const controllerClassMethod = target.constructor.prototype;
		let existingParams: ParamMetadata[] = parameterRegistry.get(
			controllerClassMethod
		);

		const meta: ParamMetadata = {
			index: parameterIndex,
			type: 'BODY',
			name: DtoClass,
			methodName: propertyKey as string,
			dto: DtoClass,
			pipes: [],
		};

		if (!existingParams) {
			parameterRegistry.set(controllerClassMethod, [meta]);
		} else {
			existingParams.push(meta);
		}
	};
};

export const Files = (): ParameterDecorator => {
	return (target, propertyKey, parameterIndex) => {
		if (!propertyKey) return;
		const controllerClassMethod = target.constructor.prototype;
		let existingParams: ParamMetadata[] = parameterRegistry.get(
			controllerClassMethod
		);

		const meta: ParamMetadata = {
			index: parameterIndex,
			type: 'FILES',
			methodName: propertyKey as string,
			pipes: [],
			factory: (req: HttpRequest) => req.files ?? [],
		};

		if (!existingParams) {
			parameterRegistry.set(controllerClassMethod, [meta]);
		} else {
			existingParams.push(meta);
		}
	};
};
