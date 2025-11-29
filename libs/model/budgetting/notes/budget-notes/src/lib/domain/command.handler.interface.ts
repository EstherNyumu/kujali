export interface ICommandHandler<TCommand> {
  execute(command: TCommand): Promise<void>;
}