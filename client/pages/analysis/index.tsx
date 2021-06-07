import Link from 'next/link';
import { useRouter } from 'next/router';
import ApplicationLayout from 'layouts/application';
import Breadcrumb from 'components/breadcrumb';
import Map from 'components/map';
import { LinkAnchor } from 'components/button';
import Scenarios from 'containers/scenarios';
import ScenarioForm from 'containers/scenarios/form';

import type { Page } from 'components/breadcrumb/types';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

let pages: Page[] = [];

const AnalysisPage: React.FC = () => {
  const { query } = useRouter();
  const { scenarios } = query;

  let CurrentPage;

  /**
   * List scenarios
   */
  pages = [];
  CurrentPage = () => (
    <>
      <h1 className="text-lg font-medium">Scenarios</h1>
      <p>Select an scenario to analyse</p>
      <Scenarios />
      <LinkAnchor href="/analysis?scenarios=new" shallow>Create scenario</LinkAnchor>
    </>
  );

  /**
  * Create scenario
  */
  if (scenarios && scenarios === 'new') {
    pages = [
      { name: 'New scenario', href: '/analysis?scenarios=new', current: true },
    ];
    CurrentPage = () => (
      <>
        <h1>Create new scenario</h1>
        <ScenarioForm />
        <Link href="/analysis" shallow>
          <a>
            Cancel
          </a>
        </Link>
      </>
    );
  }

  /**
  * Edit scenario
  */
  if (scenarios && scenarios === 'edit') {
    pages = [
      { name: 'Edit scenario', href: '/analysis?scenarios=edit', current: true },
    ];
    CurrentPage = () => (
      <>
        <h1>Edit scenario</h1>
        <Link href="/analysis" shallow>
          <a>
            Cancel
          </a>
        </Link>
      </>
    );
  }

  return (
    <ApplicationLayout>
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex xl:overflow-hidden">
          {/* Analysis map */}
          <section className="min-w-0 flex-1 h-full flex flex-col overflow-hidden lg:order-last">
            <Map
              mapboxApiAccessToken={MAPBOX_API_TOKEN}
              mapStyle="mapbox://styles/landgriffon/ckmdaj5gy08yx17me92nudkjd"
            />
          </section>

          {/* Analysis content */}
          <section className="hidden lg:block lg:flex-shrink-0 lg:order-first">
            <div className="h-full relative flex flex-col w-96 border-r border-gray-200 bg-white p-6">
              <div className="pb-10">
                <Breadcrumb pages={pages} />
              </div>
              <CurrentPage />
            </div>
          </section>
        </div>
      </main>
    </ApplicationLayout>
  );
};

export default AnalysisPage;
