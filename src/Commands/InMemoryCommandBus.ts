/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
import { ICommand } from './Interfaces/ICommand';
import { ICommandBus } from './Interfaces/ICommandBus';
import { CommandResponse } from '../UseCase';
import { CommandHandlers } from './CommandHandlers';
export class InMemoryCommandBus implements ICommandBus {
	constructor(private commandHandlers: CommandHandlers) {}

	async dispatch(command: ICommand): Promise<CommandResponse> {
		const handler = await this.commandHandlers.get(command);

		return await handler.handle(command);
	}
}
