import ApplicationLayout from 'layouts/application';

const CleanLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ApplicationLayout>
    <section
      aria-labelledby="primary-heading"
      className="flex flex-col flex-1 h-screen min-w-0 bg-primary"
    >
      <div className="relative h-full p-12 overflow-y-auto bg-white rounded-tl-3xl">{children}</div>
    </section>
  </ApplicationLayout>
);

export default CleanLayout;
