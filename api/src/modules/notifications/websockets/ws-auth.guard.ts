import { Injectable, Logger } from '@nestjs/common';
import { AuthenticationService } from 'modules/authentication/authentication.service';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { DataSource } from 'typeorm';
import { User } from 'modules/users/user.entity';

/**
 * @description As of today, NestJS doesnt treat websockets as first class citizens, meaning that the useful
 * guard decorators that we have for HTTPS request wont work for webscokets gatewau, so we need to implement something hand crafter
 * but trying to follow the same pattern as the HTTP guards.
 *
 * @note: Chek https://github.com/nestjs/nest/issues/882
 */

@Injectable()
export class WsAuthGuard {
  logger: Logger = new Logger(WsAuthGuard.name);

  constructor(
    private readonly auth: AuthenticationService,
    private readonly datasource: DataSource,
  ) {}

  async verifyUser(client: Socket): Promise<User> {
    const { token } = client.handshake?.auth;
    if (!token) {
      throw new WsException('Unauthorized');
    }
    try {
      const { sub } = this.auth.verifyToken(token as string);
      const user: User = await this.datasource
        .getRepository(User)
        .findOneOrFail({ where: { email: sub } });
      return user;
    } catch (e) {
      throw new WsException('Unauthorized');
    }
  }
}
