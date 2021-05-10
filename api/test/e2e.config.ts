import * as faker from 'faker';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';
import { UpdateUserDTO } from 'modules/users/dto/update.user.dto';

export const E2E_CONFIG: {
  users: {
    basic: {
      aa: Partial<CreateUserDTO> & { username: string };
      bb: Partial<CreateUserDTO> & { username: string };
    };
    updated: {
      bb: () => Partial<UpdateUserDTO>;
    };
  };
} = {
  users: {
    basic: {
      aa: {
        username: 'aa@example.com',
        password: 'aauserpassword',
      },
      bb: {
        username: 'bb@example.com',
        password: 'bbuserpassword',
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
