import Sidebar from 'containers/sidebar';
import HeaderMobile from 'containers/header/mobile';

type ApplicationLayoutProps = {
  children: React.ReactNode
};

const ApplicationLayout: React.FC<ApplicationLayoutProps> = (props: ApplicationLayoutProps) => {
  const { children } = props;

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Navigation */}
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile top navigation */}
        <HeaderMobile />

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default ApplicationLayout;
