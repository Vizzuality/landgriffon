import type { UseQueryResult } from '@tanstack/react-query';
import type { Layer } from 'types';

export type PreviewStatus = UseQueryResult['status'];

export interface CategoryLayerProps {
  layer: Layer;
  onChange: (id: Layer['id'], layer: Partial<Layer>) => void;
  onPreviewChange: (id: Layer['id'], active: boolean) => void;
  isPreviewActive: boolean;
  previewStatus: PreviewStatus;
}
