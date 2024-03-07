import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { AdminRegionsTreesParams } from '@/hooks/admin-regions';
import type { MaterialTreeItem, OriginRegion, Supplier } from '@/types';
import type { UseQueryOptions } from '@tanstack/react-query';

export const useEUDRSuppliers = <T = Supplier[]>(
  params?: { producersIds: string[]; originsId: string[]; materialsId: string[] },
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

export const usePlotGeometries = <T = Supplier[]>(
  params?: {
    producersIds: string[];
    originsId: string[];
    materialsId: string[];
    geoRegionIds: string[];
  },
  options: UseQueryOptions<Supplier[], unknown, T> = {},
) => {
  return useQuery(
    ['eudr-geo-features-collection', params],
    () =>
      apiService
        .request<{ geojson }>({
          method: 'GET',
          url: '/eudr/geo-features/collection',
          params,
        })
        .then((response) => response.data.geojson),
    {
      ...options,
    },
  );
};

export const useEUDRMaterialsTree = <T = MaterialTreeItem[]>(
  params?: { producersIds: string[]; originsId: string[]; materialsId: string[] },
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
  params: AdminRegionsTreesParams,
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
  params: AdminRegionsTreesParams,
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
