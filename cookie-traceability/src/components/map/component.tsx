import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import DeckGL from '@deck.gl/react/typed';
import { FlowmapLayer, FlowmapLayerPickingInfo, PickingType } from '@flowmap.gl/layers';
import { Map as ReactMapGl, ViewState as ViewportProps } from 'react-map-gl';

const fetchData = async () => axios.get('/data/map_flow.json').then((res) => res.data);

const Map: React.FC = () => {
  const [viewState, setViewState] = useState<ViewportProps>();
  const { data, isLoading } = useQuery(['map-flow'], fetchData, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  console.log(data);

  return (
    <div className="w-full h-[760px]">
      <DeckGL width="100%" height="100%" initialViewState={viewState}></DeckGL>
    </div>
  );
};

export default Map;
