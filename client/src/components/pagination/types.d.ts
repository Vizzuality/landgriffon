export type PaginationProps = {
  /** Classnames to be applied */
  className?: string;
  /**
   * Whether data is currently being loaded. Will cause pagination to freeze its current state.
   * Defaults to `false`.
   * */
  isLoading?: boolean;
  /** Number of items being displayed */
  numItems: number;
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items/records */
  totalItems: number;
  /** Number of Number buttons to display. defaults to 8 */
  numNumberButtons?: number;
  /** Callback for when the user chooses a page */
  onPageClick?: (page: number) => void;
  /** Whether to show the 'X out of Y entries' text */
  showSummary?: boolean;
};
