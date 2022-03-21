import { DownloadIcon } from '@heroicons/react/solid';

import Button from 'components/button';

const AdminNoDataAndUpload: React.FC = () => (
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:max-w-xs p-4 text-center">
    <p className="text-sm font-medium mb-3">You haven&apos;t uploaded data yet</p>
    <p className="text-md text-gray-500 mb-8">
      Please download the Excel Template and fill it with your data.
    </p>
    <Button theme="secondary" onClick={() => console.info('Download Template: click')}>
      <a
        className="flex"
        href="/files/data-template.xlsx"
        target="_blank"
        rel="noopener noreferrer"
      >
        <DownloadIcon className="w-5 h-5 mr-2" aria-hidden="true" />
        Excel Template
      </a>
    </Button>
  </div>
);

export default AdminNoDataAndUpload;
