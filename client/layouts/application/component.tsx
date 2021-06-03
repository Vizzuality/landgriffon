import { useState } from 'react';
import Sidebar from 'containers/sidebar';
import HeaderMobile from 'containers/header/mobile';

const ApplicationLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Sidebar setMobileMenuOpen={setMobileMenuOpen} isMobileMenuOpen={mobileMenuOpen} />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile top navigation */}
        <HeaderMobile setMobileMenuOpen={setMobileMenuOpen} />

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex xl:overflow-hidden">
            {/* Primary column */}
            <section
              aria-labelledby="primary-heading"
              className="min-w-0 flex-1 h-full flex flex-col overflow-hidden lg:order-last"
            >
              <h1 id="primary-heading" className="sr-only">
                Account
              </h1>
              {/* Your content */}
              The map
            </section>

            {/* Secondary column (hidden on smaller screens) */}
            <aside className="hidden lg:block lg:flex-shrink-0 lg:order-first">
              <div className="h-full relative flex flex-col w-96 border-r border-gray-200 bg-white">
                {/* Your content */}
                <h1>Scenarios</h1>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicationLayout;
