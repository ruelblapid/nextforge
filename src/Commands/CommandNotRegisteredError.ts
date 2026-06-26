/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
import { ICommand } from './Interfaces/ICommand';

export class CommandNotRegisteredError extends Error {
	constructor(command: ICommand) {
		super(
			`The command <${command.constructor.name}> hasn't a command handler associated`
		);
	}
}
