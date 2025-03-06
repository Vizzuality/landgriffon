export interface IImpactQueryDependency {
  // TODO: Need to figure out how to manage refactored dependencies for each indicator, in each strategy, making sure I get unique dependencies
  //       I can probably do that in the query dependency builder???
  execute(): Promise<any>;
}
