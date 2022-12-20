import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { feature } from 'topojson-client';
import { geoPath, geoMercator } from 'd3-geo';
import { v4 as uuidv4 } from 'uuid';

import type { GeometryCollection } from 'topojson-specification';

const fetchCountries = async () => axios.get('/data/updated_countries-50m.json');

const WIDTH = 1000;
const HEIGHT = 600;
const projection = geoMercator().translate([WIDTH / 2, HEIGHT / 2]);
const countryPath = geoPath().projection(projection);

const Map: React.FC = () => {
  const elementRef = useRef<SVGSVGElement>(null);
  const { data, isLoading } = useQuery(['countries'], fetchCountries, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const countries = useMemo(() => {
    if (data?.data) {
      return feature(data.data, data.data.objects.countries as GeometryCollection).features.map(
        (feature) => ({
          ...feature,
          uuid: uuidv4(),
        }),
      );
    }
    return [];
  }, [data]);

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {countries && (
        <svg
          width={WIDTH}
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          ref={elementRef}
          className="mx-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {countries.map((country) => (
            <path
              key={country.uuid}
              d={countryPath(country) as string}
              className="stroke-primary fill-none"
            />
          ))}
        </svg>
      )}
    </div>
  );
};

export default Map;
