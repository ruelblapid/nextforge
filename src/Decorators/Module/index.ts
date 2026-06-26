import {
	ControllerDefinition,
	ProviderDefinition,
} from '../../Container';
export interface ModuleMetadata {
	imports?: Function[];
	providers?: ProviderDefinition<any>[] | Function[];
	controllers?: ControllerDefinition<any>[] | Function[];
}
export const moduleRegistry = new Map<Function, ModuleMetadata>();
export function Module(metadata: ModuleMetadata): ClassDecorator {
	return (target) => {
		moduleRegistry.set(target, metadata);
	};
}
