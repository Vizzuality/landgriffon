import { Toaster } from 'react-hot-toast';
import LandgriffonLogo from 'containers/logo/component';

const AuthenticationLayout: React.FC = ({ children }) => (
  <div className="min-h-screen bg-primary flex flex-col py-12 sm:px-6 lg:px-8">
    <div className="text-center lg:text-left">
      <LandgriffonLogo />
    </div>
    <div className="flex-1 flex flex-col justify-center pt-12">{children}</div>
    <Toaster position="bottom-center" />
  </div>
);

export default AuthenticationLayout;
