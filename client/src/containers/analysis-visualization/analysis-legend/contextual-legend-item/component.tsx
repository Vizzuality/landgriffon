import { useCallback, useMemo } from 'react';

import { useAppDispatch } from 'store/hooks';
import { setLayer } from 'store/features/analysis/map';

import LegendItem from 'components/legend/item';
import type { Layer } from 'types';
import LegendTypeBasic from 'components/legend/types/basic';
import LegendTypeCategorical from 'components/legend/types/categorical';
import LegendTypeChoropleth from 'components/legend/types/choropleth';
import LegendTypeGradient from 'components/legend/types/gradient';
import { useContextualLayer } from 'hooks/layers/contextual';

interface ContextualLegendItemProps {
  layer: Layer;
}

const ContextualLegendItem: React.FC<ContextualLegendItemProps> = ({ layer }) => {
  const dispatch = useAppDispatch();

  const { isLoading } = useContextualLayer(layer.id);

  const handleActive = useCallback(
    (active) => {
      dispatch(setLayer({ id: layer.id, layer: { active } }));
    },
    [dispatch, layer],
  );

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
        label: item.label || `${item.value}`,
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

  return (
    <LegendItem
      isLoading={isLoading}
      name="Baseline water stress"
      info={layer.metadata.description}
      opacity={layer.opacity}
      {...layer.metadata.legend}
      onChangeOpacity={handleOpacity}
      onActiveChange={handleActive}
      active={layer.active}
    >
      {Legend}
    </LegendItem>
  );
};

export default ContextualLegendItem;
