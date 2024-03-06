'use client';

import Link from 'next/link';

import { DataTableColumnHeader } from './column-header';

import { Badge } from '@/components/ui/badge';

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
            href={`/eudr/suppliers/${row.original.id}`}
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
    accessorKey: 'baseLineVolume',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Baseline Volume" />,
    cell: ({ row }) => {
      // todo: format number
      return <span>{row.getValue('baseLineVolume')}</span>;
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
    accessorKey: 'ttp',
    header: ({ column }) => <DataTableColumnHeader column={column} title="TTP" />,
    cell: ({ row }) => {
      const ttp = row.getValue('ttp');
      return <span>{`${Number.isNaN(ttp) ? '-' : `${ttp}%`}`}</span>;
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Countries" />,
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
