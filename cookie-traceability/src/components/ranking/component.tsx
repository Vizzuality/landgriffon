import { useMemo, useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import groupBy from 'lodash/groupBy';
import numeral from 'numeral';

import { INGREDIENTS, RANKING_COLORS, NUMERAL_FORMAT } from '../../constants';

import type { Ingredient, IngredientPayload } from 'types';
import type { CountryTradingRanking, RankingProps } from './types';

const fetchCocoaTrading = async (dataPath: string) => axios.get(dataPath).then((res) => res.data);

const Ranking: React.FC<RankingProps> = ({ ingredientId }) => {
  const currentCountry = useState<string | null>(null);
  const ingredient = useMemo<Ingredient>(
    () => INGREDIENTS.find((i) => i.id === ingredientId) || INGREDIENTS[0],
    [ingredientId],
  );
  const { data, isLoading } = useQuery<IngredientPayload>(
    ['cocoa-trading', ingredientId],
    fetchCocoaTrading.bind(this, ingredient?.dataPath),
    {
      enabled: !!ingredient,
    },
  );
  const countryTradingRanking = useMemo<CountryTradingRanking>(() => {
    if (data) {
      const exporters = groupBy(data, 'Exporter');
      const result = Object.keys(exporters)
        .map((key) => ({
          country: key,
          total: exporters[key][0].Exporter_val_t,
          percentage: 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Percentages are calculated based on the first item in the array
      return result.map((item) => ({
        ...item,
        percentage: Math.ceil((item.total / result[0].total) * 100),
      }));
    }
    return [];
  }, [data]);

  return (
    <div className="my-10">
      {isLoading && <p>Loading...</p>}
      {countryTradingRanking.length > 0 && (
        <ul className="max-w-[790px] mx-auto space-y-2">
          {countryTradingRanking.map(({ country, percentage, total }, index) => (
            <li
              className="cursor-pointer hover:bg-[#ECE7C9] p-4 rounded-xl"
              key={`ranking-item-${country}`}
            >
              <div className="border-t border-[#C2BFAA]">
                <div
                  className="flex items-center h-2 px-2 leading-none text-white rounded-r-full p font-display"
                  style={{ backgroundColor: RANKING_COLORS[index], width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium font-display">{country}</div>
                <div>{numeral(total).format(NUMERAL_FORMAT)} tonnes</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Ranking;
