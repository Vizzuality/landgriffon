import Link from 'next/link';

import { DataTableColumnHeader } from './column-header';

import { Badge } from '@/components/ui/badge';
import { BIG_NUMBER_FORMAT } from 'utils/number-format';

import type { Supplier } from '.';
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'supplierName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier Name" />,
    cell: ({ row }) => {
      return (
        <div className="max-w-[190px] overflow-hidden text-ellipsis">
          <Link
            href={`/eudr/suppliers/${row.original.supplierId}`}
            className="whitespace-nowrap underline underline-offset-2 hover:text-navy-400 hover:decoration-navy-400"
          >
            {row.getValue('supplierName')}
          </Link>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'companyId',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'baselineVolume',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Baseline Volume" />,
    cell: ({ row }) => {
      // todo: format number
      return (
        <div className="flex justify-center">
          <span>{BIG_NUMBER_FORMAT(row.getValue('baselineVolume'))}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'dfs',
    header: ({ column }) => <DataTableColumnHeader column={column} title="DFS" />,
    cell: ({ row }) => {
      const dfs = row.getValue('dfs');
      return <span>{`${Number.isNaN(dfs) ? '-' : `${dfs}%`}`}</span>;
    },
  },
  {
    accessorKey: 'sda',
    header: ({ column }) => <DataTableColumnHeader column={column} title="SDA" />,
    cell: ({ row }) => {
      const sda = row.getValue('sda');
      return <span>{`${Number.isNaN(sda) ? '-' : `${sda}%`}`}</span>;
    },
  },
  {
    accessorKey: 'tpl',
    header: ({ column }) => <DataTableColumnHeader column={column} title="TPL" />,
    cell: ({ row }) => {
      const tpl = row.getValue('tpl');
      return <span>{`${Number.isNaN(tpl) ? '-' : `${tpl}%`}`}</span>;
    },
  },
  {
    accessorKey: 'materials',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Commodities" />,
    cell: ({ row }) => {
      return (
        <div className="flex min-w-[175px] flex-wrap gap-2">
          {row.original.materials.map(({ name, id }) => (
            <Badge
              key={id}
              className="text-nowrap rounded-lg bg-navy-50 px-[6px] py-[5px] text-blue-400 hover:bg-inherit"
            >
              {name}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'origins',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Origins" />,
    cell: ({ row }) => {
      return (
        <div className="flex min-w-[175px] flex-wrap gap-2">
          {row.original.origins.map(({ name, id }) => (
            <Badge
              key={id}
              className="text-nowrap rounded-lg bg-navy-50 px-[6px] py-[5px] text-blue-400 hover:bg-inherit"
            >
              {name}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
];

export default columns;
