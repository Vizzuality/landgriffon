import { useParams } from 'next/navigation';
import Flag from 'react-world-flags';

import SupplierSourcingInfoChart from './chart';

import { useEUDRSupplier } from '@/hooks/eudr';
import { useAppSelector } from '@/store/hooks';
import { eudrDetail } from '@/store/features/eudr-detail';
import { Separator } from '@/components/ui/separator';

const SupplierSourcingInfo = (): JSX.Element => {
  const { supplierId }: { supplierId: string } = useParams();
  const {
    filters: { dates },
  } = useAppSelector(eudrDetail);
  const { data } = useEUDRSupplier(
    supplierId,
    {
      startAlertDate: dates.from,
      endAlertDate: dates.to,
    },
    {
      select: (data) => ({
        ...data?.sourcingInformation,
        totalCarbonRemovals: data?.alerts.totalCarbonRemovals,
      }),
    },
  );

  return (
    <div className="flex flex-col space-y-4">
      <h3>Sourcing information</h3>
      <div className="flex space-x-4">
        <div className="flex flex-col rounded-[20px] bg-gray-50 p-5 text-gray-900">
          <h4 className="text-2xs uppercase">HS code</h4>
          <span>{data?.hsCode || '-'}</span>
        </div>
        <div className="flex grow flex-col rounded-[20px] bg-gray-50 p-5 text-gray-900">
          <h4 className="text-2xs uppercase">Commodity sourced from plot</h4>
          <span>{data?.materialName || '-'}</span>
        </div>
        <div className="flex flex-col rounded-[20px] bg-gray-50 p-5 text-gray-900">
          <h4 className="text-2xs uppercase">Country prod.</h4>
          <span>{data?.country?.name || '-'}</span>
          <Flag code={data?.country?.isoA3} className="h-[24px] w-[32px] rounded-md" />
        </div>
      </div>
      <div className="flex flex-col space-y-5 rounded-[20px] bg-gray-50 p-5 text-gray-900">
        <div className="flex space-x-4">
          <div>
            <h4 className="text-2xs uppercase">Sourcing volume</h4>
            <span>
              {data?.totalVolume
                ? `${Intl.NumberFormat(undefined, { style: 'unit', unit: 'kilogram' }).format(
                    data.totalVolume,
                  )}`
                : '-'}
            </span>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div>
            <h4 className="text-2xs uppercase">Sourcing area</h4>
            <span>
              {data?.totalArea ? `${Intl.NumberFormat(undefined).format(data.totalArea)} Kha` : '-'}
            </span>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div>
            <h4 className="text-2xs uppercase">Carbon removal</h4>
            <span>
              {!isNaN(data?.totalCarbonRemovals)
                ? `${Intl.NumberFormat(undefined, { style: 'unit', unit: 'kilogram' }).format(
                    data.totalCarbonRemovals,
                  )}`
                : '-'}
            </span>
          </div>
        </div>

        <SupplierSourcingInfoChart />
      </div>
    </div>
  );
};

export default SupplierSourcingInfo;
