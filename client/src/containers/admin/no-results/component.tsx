const AdminNoResults: React.FC = () => (
  <div className="absolute w-full p-4 text-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 md:max-w-xs">
    <p className="mb-3 text-sm font-medium">No results</p>
    <p className="mb-8 text-gray-500 text-md">Please try a different search text and/or filters</p>
  </div>
);

export default AdminNoResults;
