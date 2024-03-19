import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { FeatureCollection, Geometry } from 'geojson';
import type { Supplier as SupplierRow } from '@/containers/analysis-eudr/supplier-list-table/table';
import type { MaterialTreeItem, OriginRegion, Supplier } from '@/types';
import type { UseQueryOptions } from '@tanstack/react-query';

interface EUDRParams {
  producerIds?: string[];
  originIds?: string[];
  materialIds?: string[];
  geoRegionIds?: string[];
}

export const useEUDRSuppliers = <T = Supplier[]>(
  params?: EUDRParams,
  options: UseQueryOptions<Supplier[], unknown, T> = {},
) => {
  return useQuery(
    ['eudr-suppliers', params],
    () =>
      apiService
        .request<{ data: Supplier[] }>({
          method: 'GET',
          url: '/eudr/suppliers',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...options,
    },
  );
};

export const usePlotGeometries = (
  params?: EUDRParams,
  options?: UseQueryOptions<FeatureCollection<Geometry, { id: string }>>,
) => {
  return useQuery(
    ['eudr-geo-features-collection', params],
    () =>
      apiService
        .request<{ geojson: FeatureCollection<Geometry, { id: string }> }>({
          method: 'GET',
          url: '/eudr/geo-features/collection',
          params,
        })
        .then((response) => response.data.geojson),
    {
      ...options,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );
};

export const useEUDRMaterialsTree = <T = MaterialTreeItem[]>(
  params?: EUDRParams,
  options: UseQueryOptions<MaterialTreeItem[], unknown, T> = {},
) => {
  return useQuery(
    ['eudr-materials', params],
    () =>
      apiService
        .request<{ data: MaterialTreeItem[] }>({
          method: 'GET',
          url: '/eudr/materials',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...options,
    },
  );
};

export const useEUDRAdminRegionsTree = <T = OriginRegion[]>(
  params: EUDRParams,
  options: UseQueryOptions<OriginRegion[], unknown, T> = {},
) => {
  const query = useQuery(
    ['eudr-admin-regions', params],
    () =>
      apiService
        .request<{ data: OriginRegion[] }>({
          method: 'GET',
          url: '/eudr/admin-regions',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...options,
    },
  );

  return query;
};

export const useEUDRPlotsTree = <T = OriginRegion[]>(
  params: EUDRParams,
  options: UseQueryOptions<OriginRegion[], unknown, T> = {},
) => {
  const query = useQuery(
    ['eudr-geo-regions', params],
    () =>
      apiService
        .request<{ data: OriginRegion[] }>({
          method: 'GET',
          url: '/eudr/geo-regions',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...options,
    },
  );

  return query;
};

interface Alert {
  alertDate: {
    value: string;
  };
}

export const useEUDRAlertDates = <T = Alert[]>(
  params?: { producersIds: string[]; originsId: string[]; materialsId: string[] },
  options: UseQueryOptions<Alert[], unknown, T> = {},
) => {
  return useQuery(
    ['eudr-dates', params],
    () =>
      apiService
        .request({
          method: 'GET',
          url: '/eudr/dates',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...options,
    },
  );
};

interface EUDRData {
  table: SupplierRow[];
  breakDown: [];
}

export const useEUDRData = <T = unknown>(
  params?: {
    startAlertDate: string;
    endAlertDate: string;
    producerIds?: string[];
    materialIds?: string[];
    originIds?: string[];
    geoRegionIds?: string[];
  },
  options: UseQueryOptions<EUDRData, unknown, T> = {},
) => {
  return useQuery(
    ['eudr-table', params],
    () =>
      apiService
        .request<EUDRData>({
          method: 'GET',
          url: '/eudr/dashboard',
          params,
        })
        .then(({ data }) => data),
    {
      ...options,
    },
  );
};

export interface SupplierDetail {
  name: string;
  address: string;
  companyId: string;
  sourcingInformation: {
    materialName: string;
    hsCode: string;
    country: {
      name: string;
      isoA3: string;
    };
    totalArea: number;
    totalVolume: number;
    byVolume: [
      {
        plotName: string;
        year: number;
        percentage: number;
        volume: number;
      },
    ];
    byArea: [
      {
        plotName: string;
        percentage: number;
        area: number;
        geoRegionId: string;
      },
    ];
  };
  alerts: {
    startAlertDate: string;
    endAlertDate: string;
    totalAlerts: number;
    totalCarbonRemovals: number;
    values: [
      {
        alertDate: string;
        plots: [
          {
            plotName: string;
            alertCount: number;
          },
        ];
      },
    ];
  };
}

export const useEUDRSupplier = <T = SupplierDetail>(
  supplierId: string,
  params?: { startAlertDate: string; endAlertDate: string },
  options: UseQueryOptions<SupplierDetail, unknown, T> = {},
) => {
  return useQuery(
    ['eudr-supplier', supplierId, params],
    () =>
      apiService
        .request<SupplierDetail>({
          method: 'GET',
          url: `/eudr/dashboard/detail/${supplierId}`,
          params,
        })
        .then(({ data: responseData }) => responseData),
    {
      ...options,
    },
  );
};
