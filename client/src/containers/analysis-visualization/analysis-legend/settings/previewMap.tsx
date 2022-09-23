import type { HTMLAttributes } from 'react';
import { useMemo } from 'react';
import classNames from 'classnames';
import Map from 'components/map';
import type { Layer } from 'types';
import { useH3Data } from 'hooks/h3-data';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';

interface PreviewMapProps extends Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
  selectedLayerId?: Layer['id'];
}

const BASE_LAYER_PROPS = {
  getHexagon: (d) => d.h,
  getFillColor: (d) => d.c,
  getLineColor: (d) => d.c,
};

const PreviewMap = ({ selectedLayerId, className }: PreviewMapProps) => {
  const {
    data: { data },
  } = useH3Data(selectedLayerId);

  const h3Layer = useMemo(() => {
    return new H3HexagonLayer({
      ...BASE_LAYER_PROPS,
      data,
    });
  }, [data]);

  return (
    <div className={classNames('relative', className)}>
      <Map initialViewState={{ minZoom: 0, zoom: 0 }} layers={[h3Layer]} mapStyle="terrain"></Map>
    </div>
  );
};

export default PreviewMap;
