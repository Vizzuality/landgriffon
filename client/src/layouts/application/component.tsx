import Sidebar from 'containers/sidebar';
import HeaderMobile from 'containers/mobile-header';

type ApplicationLayoutProps = {
  children: React.ReactNode;
};

const ApplicationLayout: React.FC<ApplicationLayoutProps> = (props: ApplicationLayoutProps) => {
  const { children } = props;

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Navigation */}
      <Sidebar />

      <div className="pl-0 flex-1 min-w-0 flex flex-col lg:pl-28">
        {/* Mobile top navigation */}
        <HeaderMobile />

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default ApplicationLayout;
