import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { AuthenticationService } from 'modules/authentication/authentication.service';

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
    await this.authenticationService.createUser({
      email,
      password,
    });
  }
}
