import ApplicationLayout from 'layouts/application';

const CleanLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ApplicationLayout>
    <section
      aria-labelledby="primary-heading"
      className="flex h-screen min-w-0 flex-1 flex-col bg-navy-400"
    >
      <div className="relative h-full overflow-y-auto rounded-tl-3xl bg-white p-12">{children}</div>
    </section>
  </ApplicationLayout>
);

export default CleanLayout;
