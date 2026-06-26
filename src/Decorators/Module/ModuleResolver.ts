import {
	Container,
	ControllerDefinition,
	ProviderDefinition,
} from '../../Container';
import { moduleRegistry } from '.';
export class ModuleResolver {
	private readonly loaded = new Set<Function>();
	constructor(private container: Container) {}

	public resolve(...modules: Function[]): void {
		for (const module of modules) {
			this._loadModule(module);
		}
	}

	private _loadModule(module: Function): void {
		if (this.loaded.has(module)) {
			return;
		}

		this.loaded.add(module);

		const metadata = moduleRegistry.get(module);

		if (!metadata) {
			throw new Error(`Module not found: ${module.name}`);
		}

		for (const imported of metadata.imports ?? []) {
			this._loadModule(imported);
		}

		for (const provider of (metadata.providers ??
			[]) as ProviderDefinition<any>[]) {
			if (provider.singleton) {
				this.container.singleton(provider.token, provider.factory);
			} else {
				this.container.transient(provider.token, provider.factory);
			}
		}

		for (const controller of (metadata.controllers ??
			[]) as ControllerDefinition<any>[]) {
			this.container.transient(controller.token, controller.factory);
		}
	}
}
