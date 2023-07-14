import type { User } from 'types';

const getUserFullName = (user: User, replaceByEmail = false) => {
  if (!user) return '';
  const { fname, lname, email } = user;
  if (fname) {
    return `${fname}${` ${lname}` || ''}`;
  }
  if (replaceByEmail) return email;
  return '';
};

export default getUserFullName;
