import { IsUUID } from 'class-validator';

export class UserAccountValidationDTO {
  /**
   * Unique activation token generated during user signup flow.
   */
  @IsUUID(4)
  validationToken!: string;

  /**
   * Subject of the activation flow: in this case, the user's UUID.
   */
  @IsUUID(4)
  sub!: string;
}
