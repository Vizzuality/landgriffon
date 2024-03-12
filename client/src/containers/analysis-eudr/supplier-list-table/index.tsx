import SuppliersListTable from './table';

const SupplierListTable = (): JSX.Element => {
  return (
    <section className="space-y-4 rounded-xl border border-gray-100 p-7 shadow-md">
      <header>
        <span className="text-xs text-gray-400">All commodities</span>
        <h3>Suppliers List</h3>
      </header>
      <div className="overflow-hidden rounded-tl-lg rounded-tr-lg">
        <SuppliersListTable />
      </div>
    </section>
  );
};

export default SupplierListTable;
