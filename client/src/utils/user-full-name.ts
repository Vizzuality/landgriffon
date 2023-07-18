import type { User } from 'types';

const getUserFullName = (user: User, options?: { replaceByEmail?: boolean }) => {
  if (!user) return '';
  const { fname, lname, email } = user;
  let name = '';
  if (fname) {
    name = fname;
  }
  if (lname) {
    name = name ? `${name} ${lname}` : lname;
  }
  if (!name && options?.replaceByEmail) return email;
  return name;
};

export default getUserFullName;
