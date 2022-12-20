import { useMemo, useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import numeral from 'numeral';

import { INGREDIENTS, RANKING_COLORS, NUMERAL_FORMAT } from '../../constants';

import type { Ingredient, IngredientPayload } from 'types';
import type { CountryTradingRanking, RankingProps } from './types';

const fetchTopTradeFlows = async () =>
  axios.get('/data/top_trade_flows.json').then((res) => res.data);

const Ranking: React.FC<RankingProps> = ({ ingredientId }) => {
  const ingredient = useMemo<Ingredient>(
    () => INGREDIENTS.find((i) => i.id === ingredientId) || INGREDIENTS[0],
    [ingredientId],
  );
  const { data, isLoading } = useQuery<IngredientPayload>(
    ['top-trade-flows', ingredientId],
    fetchTopTradeFlows,
    {
      enabled: !!ingredient,
    },
  );
  const countryTradingRanking = useMemo<CountryTradingRanking>(() => {
    if (data) {
      const result = data[ingredient.rankingKey]
        .map(({ Exporter, Importer, Value }) => ({
          exporter: Exporter,
          importer: Importer,
          volume: Value,
          percentage: 0,
        }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);

      // Percentages are calculated based on the first item in the array
      return result.map((item) => ({
        ...item,
        percentage: Math.ceil((item.volume / result[0].volume) * 100),
      }));
    }
    return [];
  }, [data, ingredient]);

  return (
    <div className="my-10">
      {isLoading && <p>Loading...</p>}
      {countryTradingRanking.length > 0 && (
        <ul className="max-w-[790px] mx-auto space-y-2">
          {countryTradingRanking.map(({ exporter, importer, percentage, volume }, index) => (
            <li
              className="cursor-pointer hover:bg-[#ECE7C9] p-4 rounded-xl"
              key={`ranking-item-${exporter}-${importer}`}
            >
              <div className="border-t border-[#C2BFAA]">
                <div
                  className="flex items-center h-2 px-2 leading-none text-white rounded-r-full p font-display"
                  style={{ backgroundColor: RANKING_COLORS[index], width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium font-display">
                  {exporter} &rarr; {importer}
                </div>
                <div>{numeral(volume).format(NUMERAL_FORMAT)} tonnes</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Ranking;
