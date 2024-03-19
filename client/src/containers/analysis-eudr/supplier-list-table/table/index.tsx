import {
  flexRender,
  getCoreRowModel,
  // getFacetedRowModel,
  // getFacetedUniqueValues,
  // getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

import columns from './columns';
import { DataTablePagination, PAGINATION_SIZES } from './pagination';

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useEUDRData } from '@/hooks/eudr';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { eudr, setTotalSuppliers } from '@/store/features/eudr';

import type {
  // ColumnFiltersState,
  SortingState,
  // VisibilityState
} from '@tanstack/react-table';

export interface Supplier {
  supplierId: number;
  supplierName: string;
  companyId: string;
  baselineVolume: number;
  dfs: number;
  sda: number;
  tpl: number;
  materials: {
    name: string;
    id: string;
  }[];
  origins: {
    name: string;
    id: string;
  }[];
}

const SuppliersListTable = (): JSX.Element => {
  const dispatch = useAppDispatch();
  // const [rowSelection, setRowSelection] = useState({});
  // const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  // const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const {
    filters: { dates, suppliers, origins, materials, plots },
  } = useAppSelector(eudr);

  const { data, isFetching } = useEUDRData(
    {
      startAlertDate: dates.from,
      endAlertDate: dates.to,
      producerIds: suppliers?.map(({ value }) => value),
      materialIds: materials?.map(({ value }) => value),
      originIds: origins?.map(({ value }) => value),
      geoRegionIds: plots?.map(({ value }) => value),
    },
    {
      select: (data) => data?.table,
      onSuccess: (data) => {
        dispatch(setTotalSuppliers(data?.length || 0));
      },
    },
  );

  const table = useReactTable({
    data: data,
    columns,
    initialState: {
      pagination: {
        pageSize: PAGINATION_SIZES[0],
      },
    },
    state: {
      sorting,
      // columnVisibility,
      // rowSelection,
      // columnFilters,
    },
    enableRowSelection: true,
    // onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    // onColumnFiltersChange: setColumnFilters,
    // onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    // getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // getFacetedRowModel: getFacetedRowModel(),
    // getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <>
      {!data?.length && isFetching && (
        <div className="flex h-[175px] items-center justify-center text-gray-300">
          Fetching data...
        </div>
      )}
      {!data?.length && !isFetching && (
        <div className="flex h-[175px] items-center justify-center text-gray-300">
          No data available
        </div>
      )}
      {data?.length && (
        <div className="space-y-4">
          <Table>
            <TableHeader className="overflow-hidden rounded-tl-2xl rounded-tr-2xl">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className=" !border-b-0 bg-gray-50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="border-b-gray-100 hover:bg-navy-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <DataTablePagination table={table} />
        </div>
      )}
    </>
  );
};

export default SuppliersListTable;
