import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import sortBy from 'lodash-es/sortBy';

import { themeColors } from 'utils/colors';

import type { FC } from 'react';
import type { ResultChartData, ChartCellProps } from './types';

const ChartCell: FC<ChartCellProps> = ({ data }) => {
  const parsedData: ResultChartData[] = sortBy(
    data.map((d) => ({
      year: d.year,
      value: !d.isProjected ? d.value : null,
      comparedScenarioValue: !d.isProjected ? d.comparedScenarioValue : null,
      projectedValue: d.isProjected ? d.value : null,
      comparedScenarioValueProjected: d.isProjected ? d.comparedScenarioValue : null,
    })),
    'year',
  );
  const nonProjectedData = parsedData.filter((d) => d.value);
  const nonProjectedComparedScenarioData = parsedData.filter((d) => d.comparedScenarioValue);
  const lastNonProjectedYear = nonProjectedData[nonProjectedData.length - 1]?.year;
  const lastNonProjectedComparedScenarioYear =
    nonProjectedComparedScenarioData[nonProjectedComparedScenarioData.length - 1]?.year;
  const resultData: ResultChartData[] = parsedData.map((d) => ({
    ...d,
    projectedValue: d.year === lastNonProjectedYear ? d.value : d.projectedValue,
    comparedScenarioValueProjected:
      d.year === lastNonProjectedComparedScenarioYear
        ? d.comparedScenarioValue
        : d.comparedScenarioValueProjected,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart width={200} height={60} data={resultData}>
        <YAxis hide />
        <XAxis dataKey="year" hide />
        <Line
          activeDot={false}
          dataKey="comparedScenarioValueProjected"
          dot={false}
          stroke={themeColors.gray[300]}
          strokeDasharray="4 2"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          activeDot={false}
          dataKey="comparedScenarioValue"
          dot={false}
          stroke={themeColors.gray[300]}
          strokeWidth={2}
          type="monotone"
        />
        <Line
          activeDot={false}
          dataKey="projectedValue"
          dot={false}
          stroke={themeColors.gray[900]}
          strokeDasharray="4 2"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          activeDot={false}
          dataKey="value"
          dot={false}
          stroke={themeColors.gray[900]}
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartCell;
