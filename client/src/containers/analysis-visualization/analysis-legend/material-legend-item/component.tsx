import { useCallback, useMemo } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';
import { analysisFilters } from 'store/features/analysis';

import LegendTypeChoropleth from 'components/legend/types/choropleth';
import type { LegendItem as LegendItemsProps } from 'types';
import type { Legend } from 'types';
import LegendItem from 'components/legend/item';
import { useH3MaterialData } from 'hooks/h3-data';
import { NUMBER_FORMAT } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';
import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import { useMaterial, useMaterials } from 'hooks/materials';
import { setFilter } from 'store/features/analysis/filters';
import type { TreeSelectOption } from 'components/tree-select/types';

const LAYER_ID = 'material';

const MaterialLayer = () => {
  const dispatch = useAppDispatch();
  const { indicator, materialId, origins, suppliers, locationTypes } =
    useAppSelector(analysisFilters);

  const originIds = useMemo(() => origins.map(({ value }) => value), [origins]);
  const supplierIds = useMemo(() => suppliers.map(({ value }) => value), [suppliers]);
  const locationTypeIds = useMemo(() => locationTypes.map(({ value }) => value), [locationTypes]);

  const {
    layers: { [LAYER_ID]: layer },
  } = useAppSelector(analysisMap);
  const handleOpacity = useCallback(
    (opacity: number) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { opacity } }));
    },
    [dispatch],
  );

  const { isFetching, isSuccess, data, isError, error } = useH3MaterialData(undefined, {
    onSuccess: (data) => {
      dispatch(
        setLayer({
          id: LAYER_ID,
          layer: {
            metadata: {
              legend: {
                id: `${LAYER_ID}-${indicator.value}`,
                type: 'basic',
                name: `${material.metadata.name}`,
                unit: data.metadata.unit,
                min: !!data.metadata.quantiles.length && NUMBER_FORMAT(data.metadata.quantiles[0]),
                items: data.metadata.quantiles.slice(1).map(
                  (v, index): LegendItemsProps => ({
                    value: NUMBER_FORMAT(v),
                    color: COLOR_RAMPS[LAYER_ID][index],
                  }),
                ),
              },
            },
          },
        }),
      );
    },
  });

  const { data: materials } = useMaterials({
    select: (response) => response.data,
  });

  const { data: material } = useMaterial(materialId);

  const legendItems = useMemo<Legend['items']>(
    () =>
      layer.metadata?.legend?.items?.map((item) => ({
        ...item,
        label: item.label || `${item.value}`,
      })) || [],
    [layer.metadata?.legend.items],
  );

  const materialOptions = useMemo(
    () => materials.map((material) => ({ label: material.name, value: material.id })),
    [materials],
  );

  const handleMaterialChange = useCallback(
    (material: TreeSelectOption) => {
      dispatch(setFilter({ id: 'materialId', value: material?.value }));
    },
    [dispatch],
  );

  const Selector = useMemo(() => {
    const current = materialOptions.find((material) => material.value === materialId);

    return (
      <Materials
        withSourcingLocations
        originIds={originIds}
        supplierIds={supplierIds}
        locationTypes={locationTypeIds}
        current={current ?? null}
        onChange={handleMaterialChange}
      />
    );
  }, [handleMaterialChange, locationTypeIds, materialId, materialOptions, originIds, supplierIds]);

  return (
    <LegendItem
      name={layer.active ? Selector : 'Material Production'}
      info={material?.metadata.name}
      {...data?.metadata?.legend}
      unit={data?.metadata?.unit}
      showToolbar
      opacity={layer.opacity}
      onChangeOpacity={handleOpacity}
      isLoading={isFetching}
      main
    >
      {isSuccess && (
        <LegendTypeChoropleth
          className="text-sm text-gray-500"
          min={data.metadata.legend?.min}
          items={legendItems}
        />
      )}
      {isError && error.response?.status === 404 && (
        <div className="text-sm text-red-500">No data found for this parameters</div>
      )}
    </LegendItem>
  );
};

export default MaterialLayer;
