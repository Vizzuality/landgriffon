import Sidebar from 'containers/sidebar';
import HeaderMobile from 'containers/mobile-header';
import { Toaster } from 'react-hot-toast';

type ApplicationLayoutProps = {
  children: React.ReactNode;
};

const ApplicationLayout: React.FC<ApplicationLayoutProps> = (props: ApplicationLayoutProps) => {
  const { children } = props;

  return (
    <div className="h-full lg:min-h-screen flex">
      {/* Navigation */}
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile top navigation */}
        <HeaderMobile />
        <main className="flex-1 flex overflow-hidden">
          {/* Content */}
          {children}
        </main>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
};

export default ApplicationLayout;
