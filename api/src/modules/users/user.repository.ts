import { DataSource, ILike, Repository } from 'typeorm';
import { User } from 'modules/users/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  /**
   * Select one user by email address.
   *
   * We treat email addresses as login usernames in this context, so we perform
   * the lookup case-insensitively.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email: ILike(email.toLowerCase()) } });
  }
}
