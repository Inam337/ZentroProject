import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
  type Column,
} from '@tanstack/react-table';
import { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { RbIcon } from '@/components/icons/common/RbIcon';
import { IconColors } from '@/components/icons/types/RbIcon.types';

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
  /** Optional footer row(s) - e.g. totals row for reports */
  footer?: React.ReactNode;
}

// Sort indicator component
function SortIndicator<TData>({ column }: { column: Column<TData> }) {
  if (!column.getCanSort()) {
    return null;
  }

  const isSorted = column.getIsSorted();
  const isSortedAsc = column.getIsSorted() === 'asc';

  return (
    <RbIcon
      name="arrowDown"
      size={12}
      color={isSorted ? IconColors.BLACK_COLOR_ICON : IconColors.GRAY_COLOR_ICON}
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
  footer,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const RECORDS_ICON_SIZE = 24;
  const [globalFilter, setGlobalFilter] = useState(searchValue);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: itemsPerPage,
      },
    },
    // Keep defaults; specific columns can define custom sortingFn in their definitions
  });
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const isFullHeight = className.includes('h-full');
  const hasStickyFooter = footer != null;

  return (
    <div
      className={`mb-0 ${className} ${isFullHeight ? 'h-full flex flex-col' : ''}
       ${hasStickyFooter ? 'flex flex-col min-h-0' : ''} ${!isFullHeight && !hasStickyFooter ? 'space-y-4' : ''}`}
    >
      {/* Search Input */}
      {showSearch && (
        <div className="flex items-center py-4 shrink-0">
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
      <div
        className={`border-r-0 overflow-hidden mb-0 ${isFullHeight
          ? 'h-full flex flex-col flex-1 min-h-0'
          : ''} ${hasStickyFooter ? 'flex-1 min-h-0 overflow-auto' : ''}`}
      >
        <div className={isFullHeight && !hasStickyFooter ? 'flex-1 overflow-auto min-h-0' : ''}>
          <Table
            className={`w-full ${table.getRowModel().rows?.length === 0
            && !hasStickyFooter
              ? 'max-h-[calc(100vh-274px)]'
              : ''}`}
          >
            <TableHeader className="bg-gray-100 z-auto">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                    const isRightAligned = (meta?.className || '').includes('text-right');
                    const isCenterAligned = (meta?.className || '').includes('text-center');

                    return (
                      <TableHead
                        key={header.id}
                        className={`${header.column.getCanSort()
                          ? 'cursor-pointer hover:bg-gray-50 select-none text-sm'
                          : ''} ${meta?.className || ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className={`flex items-center w-full ${isRightAligned
                          ? 'justify-end text-right'
                          : isCenterAligned
                            ? 'justify-center text-center'
                            : ''}`}
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
                        className="border-b border-gray-100 hover:bg-gray-100
                         h-12 whitespace-nowrap"
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
                            <RbIcon
                              name="file"
                              size={RECORDS_ICON_SIZE}
                              color={IconColors.GRAY_COLOR_ICON}
                            />
                          </div>
                          No Records Found
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
            {footer != null
              ? (
                  <TableFooter
                    className={`border-t border-gray-200 ${hasStickyFooter
                      ? 'sticky bottom-0 z-10 bg-white shadow-[0_-1px_0_0_rgba(0,0,0,0.1)]'
                      : ''}`}
                  >
                    {footer}
                  </TableFooter>
                )
              : null}
          </Table>
        </div>
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
