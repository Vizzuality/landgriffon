import { Command, Positional } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';
import { AuthenticationService } from 'modules/authentication/authentication.service';
import { validate } from 'class-validator';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';
import { ROLES } from 'modules/authorization/roles/roles.enum';

@Injectable()
export class UserCommand {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Command({
    command: 'create:user <email> <password>',
    describe: 'create a user',
  })
  async create(
    @Positional({
      name: 'email',
      describe: 'the email',
      type: 'string',
    })
    email: string,
    @Positional({
      name: 'password',
      describe: 'the password',
      type: 'string',
    })
    password: string,
  ): Promise<void> {
    const newUser: CreateUserDTO = new CreateUserDTO();
    newUser.email = email;
    newUser.password = password;

    validate(newUser).then((errors: any) => {
      const logger: Logger = new Logger();
      if (errors.length > 0) {
        logger.error(`Validation errors:`);
        for (const error of errors) {
          logger.error(`Property: ${error.property}`);
          for (const [key, value] of Object.entries(error.constraints)) {
            logger.error(`${key} : ${value}`);
          }
        }
        process.exit(1);
      }
    });

    await this.authenticationService.createUser({
      email,
      password,
      roles: [ROLES.ADMIN],
    });
  }
}
