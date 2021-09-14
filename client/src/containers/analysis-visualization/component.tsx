import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import LayerControl from './layer-control';
import ModeControl from './mode-control';
import AnalysisChart from './analysis-chart';
import AnalysisMap from './analysis-map';
import AnalysisFilters from './analysis-filters';

const impactFactors = [{ id: '1', name: 'Rice', 2021: 342, 2022: 632, 2023: 1332 }];

const AnalysisVisualization = () => {
  const { visualizationMode } = useAppSelector(analysis);

  return (
    <section className="relative flex flex-col flex-1 sm:h-screen-minus-header md:h-full bg-gray-50 lg:order-last">
      <div className="absolute left-12 top-6 z-10 flex gap-2">
        <LayerControl />
        <AnalysisFilters />
      </div>

      <ModeControl />

      {visualizationMode === 'map' && <AnalysisMap />}

      {visualizationMode === 'table' && (
        <div className="flex flex-col p-6 pl-12 mt-16 left-12 overflow-x-hidden">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        Commodity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        2021
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        2022
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                      >
                        2023
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {impactFactors.map((impactFactor) => (
                      <tr key={impactFactor.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {impactFactor.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {impactFactor['2021']}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {impactFactor['2022']}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
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

      {visualizationMode === 'chart' && (
        <div className="flex flex-col p-6 pl-12 mt-16 left-12 overflow-x-hidden">
          <div className="-my-2 sm:-mx-6">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <AnalysisChart />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AnalysisVisualization;
