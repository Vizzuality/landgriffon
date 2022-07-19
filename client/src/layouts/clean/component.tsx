import ApplicationLayout from 'layouts/application';

const CleanLayout: React.FC = ({ children }) => (
  <ApplicationLayout>
    <section
      aria-labelledby="primary-heading"
      className="min-w-0 flex-1 h-screen flex flex-col bg-primary"
    >
      <div className="relative rounded-tl-3xl bg-white h-full p-12 overflow-y-auto">{children}</div>
    </section>
  </ApplicationLayout>
);

export default CleanLayout;
