import Head from 'next/head';
import { useCallback, useState } from 'react';

import Hero from 'components/hero';
import IngredientButton from 'components/ingredient-button';
import Map from 'components/map';
import Ranking from 'components/ranking';

import { INGREDIENTS } from '../constants';

import type { Ingredient } from '../types';

const Home: React.FC = () => {
  const [ingredient, setIngredient] = useState<string>(INGREDIENTS[0].id);

  const handleSetIngredient = useCallback(
    ({ id }: { id: Ingredient['id'] }) => setIngredient(id),
    [],
  );

  return (
    <div className="flex flex-col min-h-screen bg-hero-pattern">
      <Head>
        <title>Landgriffon | Cookie ingredient traceability</title>
        <meta name="description" content="Where does my cookie from? Top 5 trade flow countries" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="relative pb-10 text-secondary">
        <Hero />

        <div id="ingredients" className="relative z-10 pt-10 space-y-6 max-w-[1200px] mx-auto px-4">
          <p className="text-sm text-center">Average chocolate cookie ingredients</p>
          <ul className="grid grid-cols-4 gap-2 list-none xl:gap-6">
            {INGREDIENTS.map(({ id, name }) => (
              <li key={`ingredient-button-${id}`}>
                <IngredientButton
                  id={id}
                  current={ingredient}
                  onClick={handleSetIngredient.bind(this, { id })}
                >
                  {name}
                </IngredientButton>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main className="flex-1 px-4 bg-secondary py-14">
        <div className="">
          <h2 className="text-xl font-extrabold text-center uppercase xl:text-4xl font-display text-gray-dark">
            Top 5 trade flows countries
          </h2>
          <Ranking ingredientId={ingredient} />
        </div>
        <div className="hidden lg:block">
          <Map ingredientId={ingredient} />
        </div>
      </main>

      <footer className="px-4 text-center bg-gray-dark text-secondary py-14 space-y-7">
        <p className="text-2xl font-extrabold leading-7 uppercase xl:text-7xl font-display">
          Turn supply chain
          <br /> knowledge into
          <br /> sustainable action.
        </p>
        <a
          href="https://landgriffon.com"
          title="Landgriffon website"
          className="inline-block px-5 py-3 text-center border border-secondary"
        >
          Go to Landgriffon
        </a>
      </footer>
    </div>
  );
};

export default Home;
