import type { MapboxLayerProps } from 'components/map/layers/types';
import type { Layer } from '@deck.gl/core/typed';

export interface LayerSettings {
  opacity: number;
  visibility: boolean;
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

export type DeckLayerProps<T, S> = LayerProps<S> & T;
