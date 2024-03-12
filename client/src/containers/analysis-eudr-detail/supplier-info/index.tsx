import { useParams } from 'next/navigation';

import { useEUDRSupplier } from '@/hooks/eudr';
import { useAppSelector } from '@/store/hooks';
import { eudrDetail } from '@/store/features/eudr-detail';

const SupplierInfo = (): JSX.Element => {
  const { supplierId }: { supplierId: string } = useParams();
  const {
    filters: { dates },
  } = useAppSelector(eudrDetail);
  const { data } = useEUDRSupplier(supplierId, {
    startAlertDate: dates.from,
    endAlertDate: dates.to,
  });

  return (
    <div className="flex flex-col space-y-4">
      <h3>Supplier information</h3>
      <div className="flex space-x-4">
        <div className="flex flex-col rounded-[20px] bg-gray-50 p-5 text-gray-900">
          <h4 className="text-2xs uppercase">Supplier ID</h4>
          <span>{data?.companyId || '-'}</span>
        </div>
        <div className="flex grow flex-col rounded-[20px] bg-gray-50 p-5 text-gray-900">
          <h4 className="text-2xs uppercase">Address</h4>
          <span>{data?.address || '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default SupplierInfo;
