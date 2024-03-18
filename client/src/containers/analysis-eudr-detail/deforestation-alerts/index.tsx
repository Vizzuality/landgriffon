import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import { BellRing } from 'lucide-react';

import DeforestationAlertsChart from './chart';

import { useEUDRSupplier } from '@/hooks/eudr';
import { eudrDetail } from '@/store/features/eudr-detail';
import { useAppSelector } from '@/store/hooks';
import InfoModal from '@/components/legend/item/info-modal';

const dateFormatter = (date: string) => format(new UTCDate(date), "do 'of' MMMM yyyy");

const DeforestationAlerts = (): JSX.Element => {
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
      select: (data) => data?.alerts,
    },
  );

  return (
    <section className="space-y-4 rounded-xl border border-gray-100 p-7 shadow-md">
      <div className="flex items-center space-x-2">
        <h4 className="font-medium">Deforestation alerts detected within the smallholders</h4>
        <InfoModal
          info={{
            title: 'Deforestation alerts detected within the smallholders',
            description:
              'Number of near-real-time forest disturbances per plot for the selected supplier, based on RADD alerts generated using Sentinel-1’s cloud-penetrating radar sensors. Deforestation alerts conform to the EUDR definition following the WHISP methodology by FAO and WRI, providing robust monitoring of forest changes.',
          }}
        />
      </div>
      {data?.totalAlerts > 0 && (
        <div className="rounded-xl bg-orange-100 px-6 py-4 text-xs">
          There were <span className="font-bold">{data?.totalAlerts}</span> deforestation alerts
          reported for the supplier between the{' '}
          <span className="font-bold">{dateFormatter(data.startAlertDate)}</span> and the{' '}
          <div className="flex items-center space-x-2">
            <span className="font-bold">{dateFormatter(data.endAlertDate)}</span>.
            <BellRing className="h-5 w-5 fill-black" />
          </div>
        </div>
      )}
      <DeforestationAlertsChart />
    </section>
  );
};

export default DeforestationAlerts;
