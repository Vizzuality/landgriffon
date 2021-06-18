import { useCallback } from 'react';
import { ChartPieIcon, MapIcon, TableIcon } from '@heroicons/react/outline';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { visualizationMode, setVisualizationMode } from 'store/features/analysis';
import Map from 'components/map';
import classNames from 'classnames';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

const impactFactors = [
  { id: '1', name: 'Rice', 2021: 342, 2022: 632, 2023: 1332 },
]

const AnalysisVisualization = () => {
  const currentMode = useAppSelector(visualizationMode);
  const dispatch = useAppDispatch();

  const handleChange = useCallback((event) => {
    const selectedMode = event.currentTarget.dataset.mode;
    dispatch(setVisualizationMode(selectedMode));
  }, []);

  return (
    <section className="min-w-0 flex-1 h-full flex flex-col overflow-hidden lg:order-last bg-white">
      {/* Vis selector: map, table or chart */}
      <div className="absolute right-6 top-6 z-10 inline-flex shadow-sm rounded-md">
        <button
          type="button"
          data-mode="map"
          className={classNames(
            'relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500',
            { 'z-10 outline-none ring-1 ring-indigo-500 border-indigo-500': currentMode === 'map' }
          )}
          onClick={handleChange}
        >
          <MapIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          data-mode="table"
          className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          onClick={handleChange}
        >
          <TableIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          data-mode="chart"
          className="-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          onClick={handleChange}
        >
          <ChartPieIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{impactFactor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{impactFactor['2021']}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{impactFactor['2022']}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{impactFactor['2023']}</td>
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
  )
};

export default AnalysisVisualization;
