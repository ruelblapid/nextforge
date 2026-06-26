/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
import { CommandResponse } from '../../UseCase';
import { ICommand } from './ICommand';
export interface ICommandBus {
	dispatch(command: ICommand): Promise<CommandResponse>;
}
