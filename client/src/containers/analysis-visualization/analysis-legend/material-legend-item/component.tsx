import { useCallback, useMemo } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';
import { analysisFilters } from 'store/features/analysis';
import LegendTypeChoropleth from 'components/legend/types/choropleth';
import LegendItem from 'components/legend/item';
import { NUMBER_FORMAT } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';
import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import { useMaterial } from 'hooks/materials';
import { setFilter } from 'store/features/analysis/filters';
import useH3MaterialData from 'hooks/h3-data/material';

import type { TreeSelectOption } from 'components/tree-select/types';
import type { Legend, LegendItem as LegendItemsProps } from 'types';

const LAYER_ID = 'material';

const MaterialLayer = () => {
  const dispatch = useAppDispatch();
  const { indicator, materialId } = useAppSelector(analysisFilters);

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

  const { data: material } = useMaterial(materialId);

  const legendItems = useMemo<Legend['items']>(
    () =>
      layer.metadata?.legend?.items?.map((item) => ({
        ...item,
        label: item.label || `${item.value}`,
      })) || [],
    [layer.metadata?.legend.items],
  );

  const handleMaterialChange = useCallback(
    (material: TreeSelectOption) => {
      dispatch(setFilter({ id: 'materialId', value: material?.value }));
    },
    [dispatch],
  );

  const Selector = useMemo(() => {
    return (
      <div>
        <div>Material Production</div>
        <Materials
          current={material ? { label: material.name, value: material.id } : null}
          onChange={handleMaterialChange}
        />
      </div>
    );
  }, [handleMaterialChange, material]);

  const onToggleLayer = useCallback(
    (active: boolean) => {
      dispatch(setLayer({ id: layer.id, layer: { active } }));
    },
    [dispatch, layer.id],
  );

  const handleHideLayer = useCallback(() => {
    dispatch(setLayer({ id: layer.id, layer: { visible: false } }));
  }, [dispatch, layer.id]);

  return (
    <LegendItem
      isActive={layer.active}
      onToggle={onToggleLayer}
      name={Selector}
      info={material?.metadata?.name}
      {...data?.metadata?.legend}
      unit={data?.metadata?.unit}
      showToolbar
      opacity={layer.opacity}
      onChangeOpacity={handleOpacity}
      isLoading={isFetching}
      onHideLayer={handleHideLayer}
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
