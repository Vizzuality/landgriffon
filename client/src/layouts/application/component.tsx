import Sidebar from 'containers/sidebar';
// import HeaderMobile from 'containers/mobile-header';
import { Toaster } from 'react-hot-toast';

const ApplicationLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="h-full min-w-[1024px] min-h-screen flex">
      {/* Navigation */}
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top navigation */}
        {/* <HeaderMobile /> */}
        <main className="flex flex-1 overflow-hidden">
          {/* Content */}
          {children}
        </main>
      </div>
      <Toaster position="bottom-center" containerClassName="test-toast-message text-sm" />
    </div>
  );
};

export default ApplicationLayout;
