import { AddNoteToBudgetCommand } from './add-note.command';
import { FunctionHandler, FunctionContext} from '@ngfi/functions';
import { AddNoteToBudgetResult } from './add-note.result';

export class AddNoteToBudgetHandler
  extends FunctionHandler<AddNoteToBudgetCommand, AddNoteToBudgetResult>
{
 async execute(
    command: AddNoteToBudgetCommand,
    context: FunctionContext,
    tools: {getRepository: (collection: string) => any}
  ): Promise<AddNoteToBudgetResult> 
  {
    const { budgetId, content, createdBy } = command;

    if (!budgetId) {
      throw new Error('Budget ID is required.');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Note content cannot be empty.');
    }

    const repo = tools.getRepository('budget');

    const noteId = await repo.addNote({
      budgetId,
      content,
      createdBy,
      createdAt: Date.now()
    });

    return new AddNoteToBudgetResult(true, noteId);
  }
}
