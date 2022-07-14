import ApplicationLayout from 'layouts/application';

const CleanLayout: React.FC = ({ children }) => (
  <ApplicationLayout>
    <section
      aria-labelledby="primary-heading"
      className="min-w-0 flex-1 h-screen flex flex-col overflow-y-auto bg-primary"
    >
      <div className="relative rounded-tl-3xl bg-white min-h-full p-12">{children}</div>
    </section>
  </ApplicationLayout>
);

export default CleanLayout;
