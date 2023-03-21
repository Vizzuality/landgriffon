import type { MapboxLayerProps } from 'components/map/layers/types';
import type { Layer } from '@deck.gl/core/typed';
import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
import type { Layer as LGLayer } from 'types';

export interface LayerSettings {
  opacity: number;
  visibility: boolean;
  onHoverLayer: (
    pickingInfo: Parameters<H3HexagonLayerProps['onHover']>[0],
    metadata: LGLayer['metadata'],
    evt?: Parameters<H3HexagonLayerProps['onHover']>[1],
  ) => void;
}

export type LayerProps<S> = {
  id?: string;
  beforeId?: string;
  zIndex?: number;
  settings?: Partial<S>;
};

export type MapboxLayerProps<T> = Partial<Omit<T, 'id'>> & {
  type: typeof Layer;
};

export type DeckLayerProps<T, S> = LayerProps<S> &
  T & {
    type: typeof Layer;
  };
