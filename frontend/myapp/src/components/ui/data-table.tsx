'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
  Column,
  Row,
} from '@tanstack/react-table';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import { cn } from '@/libs/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CommonIcon } from '@/components/icons';
import { CommonIconNames, IconColors } from '@/components/icons/types';

interface ColumnMeta {
  className?: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showPagination?: boolean;
  itemsPerPage?: number;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
  className?: string;
  /** Optional per-row class names (e.g. muted styling for inactive rows). */
  getRowClassName?: (row: Row<TData>) => string | undefined;
}

// Sort indicator component
function SortIndicator<TData>({ column }: { column: Column<TData> }) {
  if (!column.getCanSort()) {
    return null;
  }

  const isSorted = column.getIsSorted();
  const isSortedAsc = column.getIsSorted() === 'asc';

  return (
    <CommonIcon
      width={12}
      height={12}
      name={CommonIconNames.ARROW_DOWN_ICON}
      fill={isSorted ? IconColors.BLACK_COLOR_ICON : IconColors.GRAY_COLOR_ICON}
      className={`ml-1 transition-transform ${isSorted && isSortedAsc ? 'rotate-180' : ''}
       ${!isSorted ? 'opacity-50' : ''
    }`}
    />
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showPagination = false,
  itemsPerPage = 10,
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
  searchValue = '',
  className = '',
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const intl = useIntl();
  const [sorting, setSorting] = useState<SortingState>([]);
  const RECORDS_ICON_SIZE = 24;
  const [globalFilter, setGlobalFilter] = useState(searchValue);
  const t = (id: string, defaultMessage: string = '') =>
    intl.formatMessage({ id, defaultMessage });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(showPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    ...(showPagination
      ? {
          initialState: {
            pagination: {
              pageSize: itemsPerPage,
            },
          },
        }
      : {}),
    // Keep defaults; specific columns can define custom sortingFn in their definitions
  });
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`space-y-4 mb-0 ${className}`}>
      {/* Search Input */}
      {showSearch && (
        <div className="flex items-center py-4">
          <input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={event => handleSearchChange(event.target.value)}
            className="max-w-sm px-3 py-2 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Table */}
      <div className=" border border-l-0 border-r-0 overflow-hidden mb-0">
        <Table className={`w-full ${table.getRowModel().rows?.length === 0 ? 'min-h-[calc(100vh-274px)]' : ''}`}>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                  const isRightAligned = (meta?.className || '').includes('text-right');

                  return (
                    <TableHead
                      key={header.id}
                      className={`${header.column.getCanSort()
                        ? 'cursor-pointer hover:bg-gray-50 select-none text-sm'
                        : ''} ${meta?.className || ''} whitespace-nowrap`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className={`flex items-center w-full ${isRightAligned
                        ? 'justify-end text-right'
                        : ''} whitespace-nowrap`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        <SortIndicator column={header.column} />
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length
              ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'border-b border-gray-100 hover:bg-gray-100 h-12 whitespace-nowrap',
                        getRowClassName?.(row),
                      )}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as ColumnMeta | undefined;

                        return (
                          <TableCell
                            key={cell.id}
                            className={meta?.className || ''}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )
              : (
                  <TableRow className="text-center border-0">
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center border-0"
                    >
                      <div className="w-full flex flex-col justify-center items-center
                      gap-4 text-center py-8 text-gray-500"
                      >
                        <div className="bg-gray-100 p-4 rounded-md">
                          <CommonIcon
                            width={RECORDS_ICON_SIZE}
                            height={RECORDS_ICON_SIZE}
                            name={CommonIconNames.FILE_ICON}
                            fill={IconColors.GRAY_COLOR_ICON}
                          />
                        </div>
                        {t('common.data-table.message.noRecordsFound', 'No Records Found')}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between space-x-2 p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length}
            {' '}
            of
            {' '}
            {table.getFilteredRowModel().rows.length}
            {' '}
            row(s).
          </div>
          <div className="space-x-2">
            <button
              className="px-3 py-2 text-sm font-medium text-green-500
               bg-white border border-green-300 rounded-md hover:bg-gray-50 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              className="px-3 py-2 text-sm font-medium text-green-500
               bg-white border border-green-300 rounded-md hover:bg-gray-50 cursor-pointer
               disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
