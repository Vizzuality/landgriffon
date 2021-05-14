import { EntityRepository, ILike, Repository } from 'typeorm';
import { User } from 'modules/users/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /**
   * Select one user by email address.
   *
   * We treat email addresses as login usernames in this context, so we perform
   * the lookup case-insensitively.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email: ILike(email.toLowerCase()) });
  }
}
