import axios from 'axios';

type SubscriberContact = {
  email: string;
  name?: string;
  company?: string;
  form: 'methodology' | 'newsletter' | 'contact';
  newsletter?: 'Yes' | 'No';
};

const SCRIPT_URL =
  'https://docs.google.com/forms/u/0/d/e/1FAIpQLScDKrOAmTYsarPJOt1dw7V7HXg-VJvZYjtfCmCwBPcquGXSSA/formResponse';

export const saveContactToSubscribersSpreadsheet = async (data: SubscriberContact) => {
  const docData = new FormData();
  docData.append('entry.1389554217', data.email);
  docData.append('entry.1442491647', data.name);
  docData.append('entry.1779120400', data.company);
  docData.append('entry.204130736', data.form);
  docData.append('entry.1734344997', data.newsletter || 'No');

  // TO-DO: solve CORS issue with google forms
  return (
    axios
      .post(SCRIPT_URL, docData)
      // .then((response) => console.log(response))
      .catch((error) => console.error(error))
  );
};

export default saveContactToSubscribersSpreadsheet;
