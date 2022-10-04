import { Command, Positional } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';
import { AuthenticationService } from 'modules/authentication/authentication.service';
import { SignUpDto } from 'modules/authentication/dto/sign-up.dto';
import { validate } from 'class-validator';

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
    const newUser: SignUpDto = new SignUpDto();
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
    });
  }
}
