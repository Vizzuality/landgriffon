import Map from 'components/map';
import Legend from 'components/map/legend';
import LegendItem from 'components/map/legend/item';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

export type AnalysisMapProps = {};

const AnalysisMap: React.FC<AnalysisMapProps> = () => {
  const mockedLayers = [{
    id: 'choropleth-example-1',
    name: 'Choropleth example',
    icon: null,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    type: 'choropleth',
    legendConfig: {
      items: [
        {
          value: '0',
          color: '#FFFFFF',
        },
        {
          color: '#C0F09C',
          value: '1',
        },
        {
          color: '#E3DA64',
          value: '2',
        },
        {
          color: '#D16638',
          value: '3',
        },
        {
          color: '#BA2D2F',
          value: '6',
        },
        {
          color: '#A11F4A',
          value: '12',
        },
        {
          color: '#730D6F',
          value: '24',
        },
        {
          color: '#0D0437',
          value: '48',
        },
      ]
    }
  }];

  const legendItems = mockedLayers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    ...(layer.legendConfig || {}),
  }));

  return (
    <>
      <Map
        mapboxApiAccessToken={MAPBOX_API_TOKEN}
        mapStyle="mapbox://styles/landgriffon/ckmdaj5gy08yx17me92nudkjd"
      />
      <Legend className="absolute z-10 bottom-10 right-10 w-72" maxHeight={400} onChangeOrder={() => {}}>
        {legendItems.map((i) => {
          const { items } = i;
          return (
            <LegendItem key={i.id} {...i}>
              <LegendTypeChoropleth className="text-sm text-gray-300" items={items} />
            </LegendItem>
          );
        })}
      </Legend>
    </>
  );
};

export default AnalysisMap;
