export type ApiSortDirection = 'asc' | 'desc';
export interface ApiSortParams {
  orderBy: string;
  order: ApiSortDirection;
}
