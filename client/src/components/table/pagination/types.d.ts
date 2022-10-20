export type PaginationProps = {
  /** Classnames to be applied */
  className?: string;
  /**
   * Whether data is currently being loaded. Will cause pagination to freeze its current state.
   * Defaults to `false`.
   * */
  isLoading?: boolean;
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items/records */
  totalItems: number;
  /** Callback for when the user chooses a page */
  onPageChange?: (page: number) => void;
  /** Number of items per page */
  pageSize: number;
  /** Array of sizes available to change the number of items per page */
  availableSizes?: number[];
  /** Callback for when the user chooses a page size */
  onChangePageSize?: (pageSize: number) => void;
};
