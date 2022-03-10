import { useState } from 'react';
import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import Alerts, { AlertsItemProps } from 'components/alerts';
import { Transition } from '@headlessui/react';
import UserDataForm from 'containers/user-profile-forms/component';
import UserPasswordForm from 'containers/user-profile-forms';

const UserProfile: React.FC = () => {
  const [alert, setAlert] = useState<AlertsItemProps>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  return (
    <ApplicationLayout>
      <Head>
        <title>UserProfile - Landgriffon</title>
      </Head>

      <div className="flex-col">
        <h1 className="mt-6 ml-6">My profile</h1>

        <UserDataForm
          alert={(msg: AlertsItemProps) => setAlert(msg)}
          showAlert={(val: boolean) => setShowAlert(val)}
        ></UserDataForm>

        <UserPasswordForm
          alert={(msg: AlertsItemProps) => setAlert(msg)}
          showAlert={(val: boolean) => setShowAlert(val)}
        ></UserPasswordForm>

        <div className="ml-6">
          <Transition
            show={showAlert}
            enter="transition-opacity ease-in-out duration-700 delay-1000"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in-out duration-700 delay-1000"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Alerts items={alert} />
          </Transition>
        </div>
      </div>
    </ApplicationLayout>
  );
};

export default UserProfile;
