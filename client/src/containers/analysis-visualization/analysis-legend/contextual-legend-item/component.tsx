import { useCallback, useMemo } from 'react';

import { useAppDispatch } from 'store/hooks';
import { setLayer } from 'store/features/analysis/map';
import { NUMBER_FORMAT } from 'utils/number-format';
import LegendItem from 'components/legend/item';
import LegendTypeBasic from 'components/legend/types/basic';
import LegendTypeCategorical from 'components/legend/types/categorical';
import LegendTypeChoropleth from 'components/legend/types/choropleth';
import LegendTypeGradient from 'components/legend/types/gradient';
import { useContextualLayer } from 'hooks/layers/contextual';
import useContextualLayers from 'hooks/layers/getContextualLayers';

import type { Layer } from 'types';

interface ContextualLegendItemProps {
  layer: Layer;
}

const ContextualLegendItem = ({ layer }: ContextualLegendItemProps) => {
  const dispatch = useAppDispatch();

  const { isFetching: areLayersLoading } = useContextualLayers();
  const { isLoading: isLoadingData } = useContextualLayer(layer.id);

  const handleOpacity = useCallback(
    (opacity: number) => {
      if (opacity === layer.opacity) return;
      dispatch(setLayer({ id: layer.id, layer: { opacity } }));
    },
    [dispatch, layer],
  );

  const Legend = useMemo(() => {
    if (!layer.metadata) return null;
    const props = {
      items: layer.metadata.legend.items.map((item) => ({
        ...item,
        label:
          item.label ||
          `${!Number.isNaN(item.value) ? NUMBER_FORMAT(item.value as number) : item.value}`,
      })),
    };
    switch (layer.metadata.legend.type) {
      case 'basic':
        return <LegendTypeBasic {...props} />;
      case 'category':
        return <LegendTypeCategorical {...props} />;
      case 'range':
      case 'choropleth':
        return <LegendTypeChoropleth min={layer.metadata.legend.min} {...props} />;
      case 'gradient':
        return <LegendTypeGradient {...props} />;
      default:
        return null;
    }
  }, [layer.metadata]);

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
      id={layer.id}
      isLoading={areLayersLoading || isLoadingData}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      name={layer.metadata!.legend.name}
      info={layer.metadata?.description}
      opacity={layer.opacity}
      {...layer.metadata?.legend}
      onChangeOpacity={handleOpacity}
      onHideLayer={handleHideLayer}
    >
      {Legend}
    </LegendItem>
  );
};

export default ContextualLegendItem;
