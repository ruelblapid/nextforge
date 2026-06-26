/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
import { ICommand } from './Interfaces/ICommand';
import { ICommandHandler } from './Interfaces/ICommandHandler';
import { CommandNotRegisteredError } from './CommandNotRegisteredError';
import { Resolver } from '../Container/Types';
export class CommandHandlers {
	constructor(private resolver: Resolver) {}

	public async get(command: ICommand): Promise<ICommandHandler<ICommand>> {
		const commandHandler = await this.resolver.resolve(command);

		if (!commandHandler) {
			throw new CommandNotRegisteredError(command);
		}

		return commandHandler as ICommandHandler<ICommand>;
	}
}
