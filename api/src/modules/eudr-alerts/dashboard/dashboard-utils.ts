import { AlertsOutput } from '../dto/alerts-output.dto';

interface VolumeAndPlotByYear {
  year: number;
  volume: string;
  plotName?: string;
  geoRegionId?: string | null;
}

export interface AggregatedVoumeAndPlotByYear extends VolumeAndPlotByYear {
  percentage?: number;
}

export const aggregateAndCalculatePercentage = (
  records: any[],
): AggregatedVoumeAndPlotByYear[] => {
  const withGeoRegion: VolumeAndPlotByYear[] = records.filter(
    (record: VolumeAndPlotByYear) => record.geoRegionId !== null,
  );

  // Group and aggregate records for unknown GeoRegions
  const withoutGeoRegion: VolumeAndPlotByYear[] = records
    .filter((record: VolumeAndPlotByYear) => record.geoRegionId === null)
    .reduce<VolumeAndPlotByYear[]>(
      (acc: VolumeAndPlotByYear[], { year, volume }) => {
        const existingYearRecord: VolumeAndPlotByYear | undefined = acc.find(
          (record: VolumeAndPlotByYear) => record.year === year,
        );
        if (existingYearRecord) {
          existingYearRecord.volume = (
            parseFloat(existingYearRecord.volume) + parseFloat(volume)
          ).toString();
        } else {
          acc.push({ year, volume, plotName: 'Unknown', geoRegionId: null });
        }
        return acc;
      },
      [],
    );

  // Merge records with known and unknown GeoRegions
  const combinedRecords: VolumeAndPlotByYear[] = [
    ...withGeoRegion,
    ...withoutGeoRegion,
  ];

  // Calculate total volume per year
  const yearTotals: { [key: number]: number } = combinedRecords.reduce<{
    [key: number]: number;
  }>((acc: { [p: number]: number }, { year, volume }) => {
    acc[year] = (acc[year] || 0) + parseFloat(volume);
    return acc;
  }, {});

  return combinedRecords.map((record: VolumeAndPlotByYear) => ({
    ...record,
    percentage: (parseFloat(record.volume) / yearTotals[record.year]) * 100,
  }));
};

export const groupAlertsByDate = (
  alerts: AlertsOutput[],
  geoRegionMap: Map<string, any>,
): any[] => {
  const alertsByDate: any = alerts.reduce((acc: any, cur: AlertsOutput) => {
    const date: string = cur.alertDate.value.toString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({
      plotName: geoRegionMap.get(cur.geoRegionId)?.plotName,
      geoRegionId: cur.geoRegionId,
      alertCount: cur.alertCount,
    });
    return acc;
  }, {});
  return Object.keys(alertsByDate).map((key) => ({
    alertDate: key,
    plots: alertsByDate[key],
  }));
};

export const groupAndFillAlertsByMonth = (
  alerts: AlertsOutput[],
  geoRegionMap: Map<string, any>,
  startDate: Date,
  endDate: Date,
): any[] => {
  const alertsByMonth: any = alerts.reduce((acc: any, cur: AlertsOutput) => {
    const date = new Date(cur.alertDate.value);
    const yearMonthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;

    if (!acc[yearMonthKey]) {
      acc[yearMonthKey] = [];
    }

    acc[yearMonthKey].push({
      geoRegionId: cur.geoRegionId,
      plotName: geoRegionMap.get(cur.geoRegionId)?.plotName || 'Unknown',
      alertCount: cur.alertCount,
    });

    return acc;
  }, {});

  const allGeoRegions = Array.from(geoRegionMap.keys());

  const start = new Date(startDate);
  const end = new Date(endDate);
  const filledMonths: any[] = [];

  for (
    let month = new Date(start);
    month <= end;
    month.setMonth(month.getMonth() + 1)
  ) {
    const yearMonthKey = `${month.getFullYear()}-${(month.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    const monthAlerts = alertsByMonth[yearMonthKey] || [];

    const alertsMap = new Map(
      monthAlerts.map((alert: any) => [alert.geoRegionId, alert]),
    );

    const monthPlots = allGeoRegions.map((geoRegionId) => {
      return (
        alertsMap.get(geoRegionId) || {
          geoRegionId: geoRegionId,
          plotName: geoRegionMap.get(geoRegionId)?.plotName || 'Unknown',
          alertCount: 0,
        }
      );
    });

    filledMonths.push({
      alertDate: yearMonthKey,
      plots: monthPlots,
    });
  }

  return filledMonths.sort((a, b) => a.alertDate.localeCompare(b.alertDate));
};

export const findNonAlertedGeoRegions = (
  geoRegionMapBySupplier: Record<string, string[]>,
  alertMap: any,
): Record<string, string[]> => {
  const missingGeoRegionIds: Record<string, string[]> = {} as Record<
    string,
    string[]
  >;

  Object.entries(geoRegionMapBySupplier).forEach(
    ([supplierId, geoRegionIds]) => {
      const alertGeoRegions =
        alertMap.get(supplierId)?.geoRegionIdSet || new Set<string>();
      const missingIds = geoRegionIds.filter(
        (geoRegionId) => !alertGeoRegions.has(geoRegionId),
      );

      if (missingIds.length > 0) {
        missingGeoRegionIds[supplierId] = missingIds;
      }
    },
  );

  return missingGeoRegionIds;
};