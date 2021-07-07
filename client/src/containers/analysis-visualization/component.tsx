import { useAppSelector } from 'store/hooks';
import { visualizationMode } from 'store/features/analysis';
import Map from 'components/map';
import ModeControl from './mode-control';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

const impactFactors = [{ id: '1', name: 'Rice', 2021: 342, 2022: 632, 2023: 1332 }];

const AnalysisVisualization = () => {
  const currentMode = useAppSelector(visualizationMode);

  return (
    <section className="min-w-0 flex-1 h-full flex flex-col overflow-hidden lg:order-last bg-white">
      {/* Vis selector: map, table or chart */}
      <ModeControl />

      {currentMode === 'map' && (
        <Map
          mapboxApiAccessToken={MAPBOX_API_TOKEN}
          mapStyle="mapbox://styles/landgriffon/ckmdaj5gy08yx17me92nudkjd"
        />
      )}

      {currentMode === 'table' && (
        <div className="flex flex-col p-6 mt-16">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Commodity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        2021
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        2022
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        2023
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {impactFactors.map((impactFactor) => (
                      <tr key={impactFactor.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {impactFactor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {impactFactor['2021']}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {impactFactor['2022']}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {impactFactor['2023']}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AnalysisVisualization;
