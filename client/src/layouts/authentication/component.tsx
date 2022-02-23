import LandgriffonLogo from 'containers/logo/component';

const AuthenticationLayout: React.FC = ({ children }) => (
  <div className="min-h-screen bg-green-700 flex flex-col py-12 sm:px-6 lg:px-8">
    <div className="text-center lg:text-left">
      <LandgriffonLogo />
    </div>
    <div className="flex-1 flex flex-col justify-center pt-12">{children}</div>
  </div>
);

export default AuthenticationLayout;
