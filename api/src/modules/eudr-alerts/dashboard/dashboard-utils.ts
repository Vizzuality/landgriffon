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
