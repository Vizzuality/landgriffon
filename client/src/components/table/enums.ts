export enum DataType {
  Boolean = 'boolean',
  Date = 'date',
  Number = 'number',
  Object = 'object',
  String = 'string',
  LineChart = 'line-chart',
}
/**
 * We can't extend enums, so we're re-declaring `ka-table`'s one,
 * with our extra items. It's unlikely they'll change it anyways, maybe just to
 * augment it, because it'd break existing code everywhere.
 *
 * https://github.com/komarovalexander/ka-table/blob/master/src/lib/enums.ts#L93
 */
export enum SortingMode {
  None = 'none',
  Single = 'single',
  SingleTripleState = 'singleTripleState',
  SingleRemote = 'singleRemote',
  SingleTripleStateRemote = 'singleTripleStateRemote',
  MultipleRemote = 'multipleRemote',
  MultipleTripleStateRemote = 'multipleTripleStateRemote',
  Api = 'api',
}

export enum ApiSortingDirection {
  Ascending = 'asc',
  Descending = 'desc',
}
