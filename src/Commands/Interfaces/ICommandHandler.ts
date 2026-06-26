/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
import { CommandResponse } from '../../UseCase';
import { ICommand } from './ICommand';

export interface ICommandHandler<T extends ICommand> {
	handle(command: T): Promise<CommandResponse>;
}
