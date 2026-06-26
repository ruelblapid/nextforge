import { describe, expect, it } from 'vitest';
import {
	Container,
	CommandHandlers,
	InMemoryCommandBus,
	Either,
} from '../src';
import type { ICommand, ICommandHandler, CommandResponse } from '../src';

class PingCommand implements ICommand<PingCommand> {
	name = 'PingCommand';
	key = Symbol.for('PingCommand');
	constructor(public message: string) {}
}

class PingCommandHandler implements ICommandHandler<PingCommand> {
	async handle(command: PingCommand): Promise<CommandResponse> {
		return Either.right({
			success: true,
			data: { echo: command.message },
			timestamp: new Date().toISOString(),
		});
	}
}

describe('InMemoryCommandBus', () => {
	it('dispatches a command to its registered handler', async () => {
		const container = new Container();
		const token = new PingCommand('');
		container.transient(token, async () => new PingCommandHandler());

		const bus = new InMemoryCommandBus(new CommandHandlers(container));
		const response = await bus.dispatch(new PingCommand('hello'));

		expect(response.isRight()).toBe(true);
		expect(response.getRight().data).toEqual({ echo: 'hello' });
	});
});
