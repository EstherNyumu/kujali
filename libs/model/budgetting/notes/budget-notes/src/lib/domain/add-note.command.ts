export class AddNoteToBudgetCommand {
  constructor(
    public budgetId: string,
    public content: string,
    public createdBy: string
  ) {}
}