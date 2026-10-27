import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useT } from '@/hooks/use-t';

import InventoryLineItemsForm, {
  type InventoryLineItemRow,
} from '@/components/admin/InventoryLineItemsForm';
import { useAdminFormDrawer } from '@/components/admin/useAdminFormDrawer';
import { matchesSearchQuery, useAdminTableFilters } from '@/components/admin/useAdminTableFilters';
import CommercePageState from '@/components/commerce/CommercePageState';
import { DataTable } from '@/components/ui/DataTable';
import FieldError from '@/components/ui/FieldError';
import FormDrawer from '@/components/ui/FormDrawer';
import PageShell from '@/components/ui/PageShell';
import PageToolbar from '@/components/ui/PageToolbar';
import { actionColumn, dateColumn } from '@/components/ui/data-table-columns';
import { adminInputClass, adminLabelClass } from '@/components/admin/admin-form-styles';
import { formatMoney } from '@/libs/format-money';
import { printSaleInvoice } from '@/libs/print-invoice';
import { getProductStockTotal } from '@/libs/product-stock';
import { listCustomers } from '@/services/customers';
import type { Customer, Product, Sale } from '@/models';
import { listProducts } from '@/services/products';
import { cancelSale, createSale, deleteSale, listSales } from '@/services/sales';
import StatusBadge from '@/components/commerce/StatusBadge';

function buildDefaultLines(products: Product[]): InventoryLineItemRow[] {
  if (products.length === 0) {
    return [];
  }

  const first = products[0];

  return [{
    productId: first.id,
    quantity: 1,
    unitPrice: Number.parseFloat(String(first.price)),
  }];
}

export default function AdminSalesPage() {
  const { t } = useT();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<InventoryLineItemRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filters = useAdminTableFilters();

  const resetFormFields = useCallback(() => {
    setFormError(null);
    setCustomerId('');
    setLines(buildDefaultLines(products));
  }, [products]);

  const drawer = useAdminFormDrawer({ onReset: resetFormFields });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [salesResult, productsResult, customersResult] = await Promise.all([
      listSales(),
      listProducts(),
      listCustomers(),
    ]);

    if (customersResult.ok) {
      setCustomers(customersResult.data);
    }

    if (!salesResult.ok) {
      setError(salesResult.error.message);
      setLoading(false);

      return;
    }

    setSales(salesResult.data);

    if (productsResult.ok) {
      setProducts(productsResult.data);
      setLines(prev => (prev.length > 0 ? prev : buildDefaultLines(productsResult.data)));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async () => {
    if (lines.length === 0) {
      setFormError(t('admin.saleFormRequired', 'At least one line item is required'));

      return;
    }

    // Mirror the server rule so the admin gets feedback before the round trip.
    for (const line of lines) {
      const product = products.find(p => p.id === line.productId);

      if (product?.type === 'goods' && line.quantity > getProductStockTotal(product)) {
        setFormError(t('admin.saleOverStock', 'Not enough stock for {name} (available: {n})', {
          name: product.name,
          n: getProductStockTotal(product),
        }));

        return;
      }
    }

    setSubmitting(true);
    setFormError(null);

    const result = await createSale({
      items: lines,
      customerId: customerId ? Number.parseInt(customerId, 10) : undefined,
    });

    if (!result.ok) {
      setFormError(result.error.message);
      setSubmitting(false);

      return;
    }

    setSubmitting(false);
    drawer.close();
    resetFormFields();
    await load();
  };

  const handleCancel = useCallback(async (id: number) => {
    if (!window.confirm(t('admin.confirmCancel', 'Cancel this sale? Stock will be adjusted back.'))) {
      return;
    }

    const result = await cancelSale(id);

    if (!result.ok) {
      setError(result.error.message);

      return;
    }

    await load();
  }, [load, t]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm(t('admin.confirmDelete', 'Delete this item?'))) {
      return;
    }

    const result = await deleteSale(id);

    if (!result.ok) {
      setError(result.error.message);

      return;
    }

    await load();
  }, [load, t]);

  const filteredSales = useMemo(() => sales.filter(sale =>
    matchesSearchQuery(filters.draftSearch, [sale.id]),
  ), [sales, filters.draftSearch]);

  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      accessorKey: 'id',
      header: t('admin.saleNumberHeader', 'Sale #'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {t('admin.saleNumber', 'Sale #{id}', { id: row.original.id })}
        </span>
      ),
    },
    {
      id: 'customer',
      accessorFn: row => row.customer?.name ?? '',
      header: t('admin.customer', 'Customer'),
      enableSorting: true,
      cell: ({ row }) => row.original.customer?.name ?? t('admin.walkIn', 'Walk-in customer'),
    },
    {
      accessorKey: 'totalAmount',
      header: t('common.total', 'Total'),
      enableSorting: true,
      cell: ({ row }) => formatMoney(row.original.totalAmount),
    },
    {
      id: 'itemCount',
      accessorFn: row => row.items?.length ?? 0,
      header: t('admin.lineItems', 'Line items'),
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-gray-500">
          {row.original.items?.length ?? 0}
        </span>
      ),
    },
    {
      id: 'status',
      accessorFn: row => row.status ?? 'completed',
      header: t('admin.status', 'Status'),
      enableSorting: true,
      cell: ({ row }) => (
        <StatusBadge
          label={row.original.status === 'cancelled' ? t('admin.cancelled', 'Cancelled') : t('admin.completed', 'Completed')}
          tone={row.original.status === 'cancelled' ? 'danger' : 'success'}
        />
      ),
    },
    dateColumn<Sale>(
      row => row.soldAt,
      {
        id: 'soldAt',
        header: t('common.date', 'Date'),
        enableSorting: true,
      },
    ),
    {
      id: 'invoice',
      header: '',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => printSaleInvoice(row.original)}
          className="text-sm font-medium text-[#428475] hover:underline"
        >
          {t('admin.printInvoice', 'Print invoice')}
        </button>
      ),
    },
    {
      id: 'cancel',
      header: '',
      cell: ({ row }) => row.original.status === 'cancelled'
        ? null
        : (
            <button
              type="button"
              onClick={() => void handleCancel(row.original.id)}
              className="text-sm font-medium text-amber-700 hover:underline"
            >
              {t('admin.cancel', 'Cancel')}
            </button>
          ),
    },
    actionColumn<Sale>({
      onDelete: sale => void handleDelete(sale.id),
      deleteLabel: t('admin.delete', 'Delete'),
    }),
  ], [t, handleDelete, handleCancel]);

  return (
    <CommercePageState
      loading={loading}
      error={error}
      onRetry={load}
      empty={!loading && !error && sales.length === 0 && !drawer.open}
      emptyMessage={t('admin.sales.empty', 'No POS sales recorded yet.')}
    >
      <PageShell
        maxWidth="full"
        hint={t('admin.sales.hint', 'Record in-store sales with line items; total is computed server-side.')}
        toolbar={(
          <PageToolbar
            showSearch
            searchValue={filters.draftSearch}
            onSearchChange={filters.setDraftSearch}
            showFilters={false}
            primaryLabel={t('admin.addSale', 'Record sale')}
            onPrimaryClick={drawer.openCreate}
            primaryHidden={drawer.open || products.length === 0}
          />
        )}
      >
        <FormDrawer
          open={drawer.open}
          onOpenChange={drawer.handleOpenChange}
          title={t('admin.newSale', 'New sale')}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={t('admin.save', 'Save')}
          cancelLabel={t('admin.cancel', 'Cancel')}
          size="lg"
        >
          <div>
            <label className={adminLabelClass}>
              {t('admin.customer', 'Customer (optional)')}
            </label>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              className={adminInputClass}
            >
              <option value="">{t('admin.walkIn', 'Walk-in customer')}</option>
              {customers.map(customer => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <InventoryLineItemsForm
            items={lines}
            products={products}
            onChange={setLines}
            showStock
          />
          <FieldError msg={formError} variant="form" />
        </FormDrawer>

        <DataTable
          columns={columns}
          data={filteredSales}
          showPagination
          itemsPerPage={10}
          emptyMessage={t('admin.sales.tableEmpty', 'No sales match your filters.')}
        />
      </PageShell>
    </CommercePageState>
  );
}
