import * as faker from 'faker';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';
import { UpdateUserDTO } from 'modules/users/dto/update.user.dto';

export const E2E_CONFIG: {
  users: {
    signUp: { email: string; password: string };
    signIn: { username: string; password: string };
    basic: {
      aa: Partial<CreateUserDTO> & { username: string; password: string };
      bb: Partial<CreateUserDTO> & { username: string };
    };
    updated: {
      bb: () => Partial<UpdateUserDTO>;
    };
  };
} = {
  users: {
    signUp: { email: 'test@example.com', password: 'Password123!' },
    signIn: { username: 'test@example.com', password: 'Password123!' },
    basic: {
      aa: {
        username: 'aa@example.com',
        password: 'aaUserpassword1!',
      },
      bb: {
        username: 'bb@example.com',
        password: 'bbUserpassword1!',
      },
    },
    updated: {
      bb: () => ({
        fname: faker.name.firstName(),
        lname: faker.name.lastName(),
        displayName: `${faker.name.title()} ${faker.name.firstName()} ${faker.name.firstName()}`,
      }),
    },
  },
};
