import Header from 'containers/header';
import Footer from 'containers/footer';

type ApplicationLayoutProps = {
  children: React.ReactNode;
};

const ApplicationLayout: React.FC<ApplicationLayoutProps> = (props: ApplicationLayoutProps) => {
  const { children } = props;

  return (
    <div className="h-full lg:min-h-screen">
      <Header />

      <main>
        {/* Content */}
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default ApplicationLayout;
